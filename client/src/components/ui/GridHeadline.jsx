import { useEffect, useRef, useState } from "react";

/* The hero H1, reproduced from the reference.

   It is not laid-out text: a heavy weight is rasterised to an offscreen canvas,
   quantised onto the same lattice as the graph-paper background behind it, and
   each "on" cell is painted as a square inset by 1px so the grid lines show
   through the glyphs. Phrases cycle, and the swap is a per-cell dissolve with a
   randomised delay rather than a crossfade.

   One type size is shared by every phrase — chosen so the longest one fits — so
   the headline never visibly resizes as it cycles. On narrow viewports each
   phrase stacks onto two lines rather than shrinking to nothing, which is what
   the reference does on phones.

   The lattice is NOT a fixed 12px. Desktop sets its type at ~150px, which puts
   the cap-height at roughly ten 12px cells — enough to read. A phone only has
   room for ~85px type, and on that same 12px lattice the cap-height is five
   cells, at which point the glyphs stop being letters and become blocks. So the
   cell pitch shrinks with the viewport (see `cellFor`), holding the cap-height
   in a readable 8-12 cells everywhere while desktop stays exactly as it was.
   The pitch is published to CSS as --gh-cell so the graph-paper lines behind
   the canvas stay locked to the same lattice.

   Each phrase can carry a `lead` — the small connector word ("From" / "to")
   rendered above the band and swapped in step with the dissolve, so the full
   tagline reads across the cycle. Setting the connectors in the pixel grid
   instead would roughly double the character count per line.

   Accessible text lives on the <h1>'s aria-label — the canvas is aria-hidden. */

const GAP = 1; // the grid line that shows between blocks
const HOLD = 2600; // ms a phrase rests before the next dissolve
const MORPH = 900; // ms the dissolve itself takes

/* Lattice pitch by band width. 12px from 1024 up is the reference value and is
   deliberately left exactly as it was; below that the pitch drops so the glyphs
   keep roughly the same number of cells across their cap-height — the measured
   range is 8-12 cells at every width, against 4.4 on a 320px phone before. */
const cellFor = (w) => (w >= 1024 ? 12 : w >= 560 ? 8 : 6);

/* Share of the band the longest line may occupy. Phones get more of it — width,
   not height, is what caps the type size there, and .gband fades a narrower
   margin at those sizes so nothing is lost to the edge mask. */
const widthBudgetFor = (w) => (w >= 700 ? 0.88 : 0.94);

export default function GridHeadline({ phrases, className, leadClassName }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cell = 12;
    let cols = 0;
    let rows = 0;

    /* Largest size at which EVERY line of EVERY layout fits the width, and the
       tallest layout fits the band. Independent of the lattice — the cell pitch
       is derived from the result, not the other way round. */
    const fitSizeAll = (ctx2, layouts) => {
      const maxW = W * widthBudgetFor(W);
      const family = getComputedStyle(document.body).fontFamily;
      const maxLines = Math.max(...layouts.map((l) => l.length));
      let size = Math.floor((H * 0.9) / maxLines / 1.15);
      const widest = () => {
        ctx2.font = `900 ${size}px ${family}`;
        return Math.max(
          ...layouts.flatMap((lines) => lines.map((l) => ctx2.measureText(l).width))
        );
      };
      while (size > 8 && widest() > maxW) size -= 2;
      return size;
    };

    /* One line per phrase if they can be set large enough; otherwise split each
       phrase on its spaces and stack. The choice is made once for all phrases
       so they stay visually consistent as they cycle. */
    const planType = () => {
      const probe = document.createElement("canvas").getContext("2d");
      const upper = phrases.map((p) => p.text.toUpperCase());
      const oneLine = upper.map((p) => [p]);
      const twoLine = upper.map((p) => p.split(/\s+/).filter(Boolean));

      const sOne = fitSizeAll(probe, oneLine);
      const splittable = twoLine.every((l) => l.length > 1);
      const sTwo = splittable ? fitSizeAll(probe, twoLine) : 0;

      const useTwo = splittable && sTwo > sOne * 1.25;
      return { layouts: useTwo ? twoLine : oneLine, size: useTwo ? sTwo : sOne };
    };

    /* Rasterise one already-sized layout into a cols×rows coverage mask. */
    const rasterise = (lines, size) => {
      const off = document.createElement("canvas");
      off.width = Math.max(1, W);
      off.height = Math.max(1, H);
      const o = off.getContext("2d");

      o.font = `900 ${size}px ${getComputedStyle(document.body).fontFamily}`;
      o.textBaseline = "middle";
      o.textAlign = "center";
      o.clearRect(0, 0, W, H);
      o.fillStyle = "#000";

      const lh = size * 1.02;
      const y0 = H / 2 - ((lines.length - 1) * lh) / 2;
      lines.forEach((l, i) => o.fillText(l, W / 2, y0 + i * lh));

      const img = o.getImageData(0, 0, W, H).data;
      // a fine lattice has few pixels per cell, so sample every one of them
      const step = cell >= 10 ? 2 : 1;
      const mask = new Uint8Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // average alpha across the cell; >45% coverage turns the cell on
          let sum = 0;
          let n = 0;
          for (let y = r * cell; y < (r + 1) * cell; y += step) {
            for (let x = c * cell; x < (c + 1) * cell; x += step) {
              if (x >= W || y >= H) continue;
              sum += img[(y * W + x) * 4 + 3];
              n++;
            }
          }
          mask[r * cols + c] = n && sum / n / 255 > 0.45 ? 1 : 0;
        }
      }
      return mask;
    };

    let masks = [];
    let idx = 0;
    let from = null;
    let to = null;
    let delays = null;
    let phase = "hold"; // hold | morph
    let t0 = performance.now();
    let raf = 0;
    // the band size the current rasterisation was built for
    let laidOutW = 0;
    let laidOutH = 0;

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      laidOutW = W;
      laidOutH = H;

      // the type is sized first; the lattice is then chosen to suit it
      const plan = planType();
      cell = cellFor(W);
      cols = Math.ceil(W / cell);
      rows = Math.ceil(H / cell);

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // keep the graph-paper behind the canvas on the very same lattice
      wrap.style.setProperty("--gh-cell", `${cell}px`);

      masks = plan.layouts.map((lines) => rasterise(lines, plan.size));
      from = masks[idx];
      to = masks[idx];
      delays = new Float32Array(cols * rows);
    };

    const rollDelays = () => {
      // random per-cell offset, biased left-to-right so the dissolve sweeps
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sweep = (c / Math.max(1, cols - 1)) * 0.45;
          delays[r * cols + c] = Math.min(0.95, sweep + Math.random() * 0.5);
        }
      }
    };

    const paint = (progress) => {
      ctx.clearRect(0, 0, W, H);

      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "#E4002B");
      grad.addColorStop(1, "#C20E4D");

      const block = Math.max(1, cell - GAP);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const a = from[i];
          const b = to[i];
          if (!a && !b) continue;

          let alpha;
          if (a === b) {
            alpha = 1;
          } else {
            // each cell runs its own short ramp inside the morph window
            const d = delays[i];
            const local = Math.max(0, Math.min(1, (progress - d) / 0.35));
            alpha = b ? local : 1 - local;
          }
          if (alpha <= 0.01) continue;

          ctx.globalAlpha = alpha;
          ctx.fillStyle = grad;
          ctx.fillRect(c * cell, r * cell, block, block);
        }
      }
      ctx.globalAlpha = 1;
    };

    const frame = (now) => {
      const dt = now - t0;
      if (phase === "hold") {
        paint(1);
        if (!reduced && phrases.length > 1 && dt >= HOLD) {
          idx = (idx + 1) % phrases.length;
          from = to;
          to = masks[idx];
          rollDelays();
          phase = "morph";
          t0 = now;
          // swap the connector as the dissolve starts, not after it
          setActive(idx);
        }
      } else {
        const p = Math.min(1, dt / MORPH);
        paint(p);
        if (p >= 1) {
          from = to;
          phase = "hold";
          t0 = now;
        }
      }
      raf = requestAnimationFrame(frame);
    };

    // fonts must be ready or the raster samples a fallback face
    const boot = () => {
      layout();
      rollDelays();
      t0 = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(frame);
    };

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
    else boot();

    /* A relayout re-rasterises every phrase and re-rolls the dissolve, and on a
       6px lattice that is four times the cells it used to be. Mobile browsers
       fire resizes for chrome that comes and goes, so anything that would not
       move the type size is ignored — a height wobble under 24px shifts the
       fitted size by well under a pixel. A width change always counts. */
    const ro = new ResizeObserver(() => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w === laidOutW && Math.abs(h - laidOutH) < 24) return;

      const keep = idx;
      layout();
      idx = keep;
      from = masks[idx];
      to = masks[idx];
      rollDelays();
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [phrases]);

  // the whole tagline, in order, for screen readers and search
  const label = phrases
    .map((p) => [p.lead, p.text].filter(Boolean).join(" "))
    .join(" ");

  return (
    <h1 className={className} aria-label={label}>
      {phrases[active] && phrases[active].lead && (
        <span className={leadClassName} aria-hidden="true" key={active}>
          {phrases[active].lead}
        </span>
      )}
      <span className="gband" ref={wrapRef} aria-hidden="true">
        <span className="glines" />
        <canvas ref={canvasRef} />
      </span>
    </h1>
  );
}
