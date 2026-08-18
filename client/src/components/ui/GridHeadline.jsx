import { useEffect, useRef } from "react";

/* The hero H1, reproduced from the reference.

   It is not laid-out text: a heavy weight is rasterised to an offscreen canvas,
   quantised onto the same 12px lattice as the graph-paper background behind it,
   and each "on" cell is painted as a square inset by 1px so the grid lines show
   through the glyphs. Phrases cycle, and the swap is a per-cell dissolve with a
   randomised delay rather than a crossfade.

   One type size is shared by every phrase — chosen so the longest one fits — so
   the headline never visibly resizes as it cycles. On narrow viewports each
   phrase stacks onto two lines rather than shrinking to nothing, which is what
   the reference does on phones.

   Accessible text lives on the <h1>'s aria-label — the canvas is aria-hidden. */

const CELL = 12;
const GAP = 1; // the grid line that shows between blocks
const HOLD = 2600; // ms a phrase rests before the next dissolve
const MORPH = 900; // ms the dissolve itself takes

export default function GridHeadline({ phrases, className }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;

    /* Largest size at which EVERY line of EVERY layout fits the width, and the
       tallest layout fits the band. Cap-height lands at roughly 44% of the band
       on the reference; narrow viewports hit the width limit first. */
    const fitSizeAll = (ctx2, layouts) => {
      const maxW = W * 0.88;
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
      const mask = new Uint8Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // average alpha across the cell; >45% coverage turns the cell on
          let sum = 0;
          let n = 0;
          for (let y = r * CELL; y < (r + 1) * CELL; y += 2) {
            for (let x = c * CELL; x < (c + 1) * CELL; x += 2) {
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

    /* One line per phrase if they can be set large enough; otherwise split each
       phrase on its spaces and stack. The choice is made once for all phrases
       so they stay visually consistent as they cycle. */
    const buildMasks = () => {
      const probe = document.createElement("canvas").getContext("2d");
      const upper = phrases.map((p) => p.toUpperCase());
      const oneLine = upper.map((p) => [p]);
      const twoLine = upper.map((p) => p.split(/\s+/).filter(Boolean));

      const sOne = fitSizeAll(probe, oneLine);
      const splittable = twoLine.every((l) => l.length > 1);
      const sTwo = splittable ? fitSizeAll(probe, twoLine) : 0;

      const useTwo = splittable && sTwo > sOne * 1.25;
      const layouts = useTwo ? twoLine : oneLine;
      const size = useTwo ? sTwo : sOne;

      return layouts.map((lines) => rasterise(lines, size));
    };

    let masks = [];
    let idx = 0;
    let from = null;
    let to = null;
    let delays = null;
    let phase = "hold"; // hold | morph
    let t0 = performance.now();
    let raf = 0;

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      cols = Math.ceil(W / CELL);
      rows = Math.ceil(H / CELL);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      masks = buildMasks();
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
          ctx.fillRect(c * CELL, r * CELL, CELL - GAP, CELL - GAP);
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

    const ro = new ResizeObserver(() => {
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

  return (
    <h1 className={className} aria-label={phrases.join(". ")}>
      <span className="gband" ref={wrapRef} aria-hidden="true">
        <span className="glines" />
        <canvas ref={canvasRef} />
      </span>
    </h1>
  );
}
