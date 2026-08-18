import { useEffect, useRef } from "react";

/* Ordered-dither canvases, the decorative texture behind the "Who should
   attend" bar and the chips punctuating its lanes.

   Both are drawn small and stretched with `image-rendering: pixelated`, which
   is what gives the chunky pixel look — the reference's field canvas is only
   360×70 for a full-bleed strip. A 4×4 Bayer matrix turns a continuous density
   function into on/off pixels, so the falloff reads as scattered dots rather
   than a smooth gradient. */

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function paint(canvas, w, h, density, color) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(w, h);
  const [r, g, b] = color;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = density(x / (w - 1), y / (h - 1));
      const threshold = (BAYER[y % 4][x % 4] + 0.5) / 16;
      const on = v > threshold;
      const i = (y * w + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = g;
      img.data[i + 2] = b;
      img.data[i + 3] = on ? 255 : 0;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/* Full-bleed background field: dots crowd the left and right edges and thin
   out toward the middle, so the lanes stay legible over it. */
export function DitherField({ className }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    paint(
      c,
      360,
      70,
      (u, v) => {
        const edge = 1 - Math.min(u, 1 - u) * 2; // 1 at edges → 0 mid
        const vertical = 0.6 + 0.4 * Math.abs(v - 0.5) * 2;
        // steep falloff: dense in the outer ~12%, gone by ~30%
        return Math.pow(Math.max(0, edge), 4.2) * vertical * 0.62;
      },
      [228, 0, 43]
    );
  }, []);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

/* Lane chip: a tight spiral, so it reads as a different kind of object among
   the round pills rather than a pill that failed to load. */
export function DitherChip({ className, seed = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    paint(
      c,
      20,
      26,
      (u, v) => {
        const dx = u - 0.5;
        const dy = v - 0.5;
        const rad = Math.sqrt(dx * dx + dy * dy) * 2;
        const ang = Math.atan2(dy, dx);
        const swirl = Math.sin(ang * 3 + rad * 9 - seed * 1.7) * 0.5 + 0.5;
        return swirl * (1.15 - rad * 0.85);
      },
      [228, 0, 43]
    );
  }, [seed]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
