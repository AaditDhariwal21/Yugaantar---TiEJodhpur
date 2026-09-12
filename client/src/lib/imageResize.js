/* Crop/scale and re-encode an image in the browser, before it is uploaded.

   R2 is plain object storage with no transformation layer, so whatever we PUT
   is exactly what the delegate cards will render. Doing the work here rather
   than on the server means:

     - a 4MB phone photo becomes ~60-90KB, so uploads feel instant and the
       site stays fast for visitors on mobile data
     - every avatar is the same square, so the grid never goes ragged
     - nothing large ever reaches Render's free tier

   Everything below is plain canvas — no dependency. */

export const OUTPUT_SIZE = 640; // 2x the largest rendered avatar, for retina

/* Partner logos are not avatars: the tile renders them `object-fit: contain`
   inside a 3:2 box, so they are fitted to a bounding box and never cropped.
   Cropping a wide wordmark to a square would cut the brand in half. These are
   ~2x the largest rendered tile. */
export const LOGO_MAX_W = 600;
export const LOGO_MAX_H = 400;
const QUALITY = 0.85;

export const ACCEPTED = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif";
const MAX_INPUT_BYTES = 25 * 1024 * 1024;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      /* Safari cannot decode HEIC from an iPhone in a canvas, and some AVIFs
         fail on older browsers. Say so, rather than "something went wrong". */
      reject(new Error("That image could not be read. Try a JPEG or PNG."));
    };
    img.src = url;
  });
}

const canEncodeWebp = () => {
  try {
    return document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
};

const toBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode the image."))), type, quality)
  );

/* Centre-crop to a square, then scale to OUTPUT_SIZE.

   `focus` is 0..1 vertically: portraits put the face nearer the top, so the
   default of 0.5 would cut foreheads off. The uploader exposes it as a slider
   for the occasional photo where centre is wrong. */
export async function prepareSquareImage(file, { focus = 0.5 } = {}) {
  if (!file) throw new Error("No file selected.");
  if (!file.type.startsWith("image/")) throw new Error("That file is not an image.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("That image is too large (max 25MB).");

  const img = await loadImage(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  if (!side) throw new Error("That image appears to be empty.");

  const sx = (img.naturalWidth - side) / 2;
  // clamp so the crop window stays inside the source
  const sy = Math.max(0, Math.min(img.naturalHeight - side, (img.naturalHeight - side) * focus));

  /* Never upscale: a 200px source stays 200px rather than being blown up into
     a soft 640px file that is bigger and no sharper. */
  const out = Math.min(OUTPUT_SIZE, side);

  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  /* Flatten onto white so a transparent PNG does not become a black square
     once it is encoded as JPEG. */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, out, out);
  ctx.drawImage(img, sx, sy, side, side, 0, 0, out, out);

  const type = canEncodeWebp() ? "image/webp" : "image/jpeg";
  const blob = await toBlob(canvas, type, QUALITY);

  return {
    blob,
    contentType: type,
    size: blob.size,
    dimension: out,
    previewUrl: URL.createObjectURL(blob),
  };
}

/* Fit inside LOGO_MAX_W x LOGO_MAX_H, preserving aspect ratio.

   The canvas is the size of the SCALED IMAGE, not of the bounding box, so no
   letterboxing is baked into the file — the tile's own `object-fit: contain`
   does the centring, and a logo swapped for a differently-shaped one still
   sits correctly. Flattened onto white to match the tile's white ground, the
   same way the avatar path does. */
export async function prepareLogoImage(file) {
  if (!file) throw new Error("No file selected.");
  if (!file.type.startsWith("image/")) throw new Error("That file is not an image.");
  if (file.size > MAX_INPUT_BYTES) throw new Error("That image is too large (max 25MB).");

  const img = await loadImage(file);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) throw new Error("That image appears to be empty.");

  // never upscale — a small source stays small rather than going soft
  const scale = Math.min(1, LOGO_MAX_W / iw, LOGO_MAX_H / ih);
  const w = Math.max(1, Math.round(iw * scale));
  const h = Math.max(1, Math.round(ih * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, iw, ih, 0, 0, w, h);

  const type = canEncodeWebp() ? "image/webp" : "image/jpeg";
  const blob = await toBlob(canvas, type, QUALITY);

  return {
    blob,
    contentType: type,
    size: blob.size,
    dimension: `${w}×${h}`,
    previewUrl: URL.createObjectURL(blob),
  };
}

export const formatBytes = (n) =>
  n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`;
