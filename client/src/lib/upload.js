import { adminApi, API_BASE } from "./api";
import { prepareLogoImage, prepareSquareImage } from "./imageResize";

/* Photo upload: crop locally, ask our API to sign a URL, PUT straight to R2.

   The file never passes through the Express server. That keeps Render's free
   tier out of the upload path entirely — no body-size limit to raise, no
   memory spike, no request held open while a photo transfers. */

export async function uploadPhoto(file, { folder = "delegates", focus = 0.5 } = {}) {
  return put(await prepareSquareImage(file, { focus }), folder);
}

/* Same round trip, but fitted to a box instead of cropped to a square — see
   prepareLogoImage. */
export async function uploadLogo(file, { folder = "partners" } = {}) {
  return put(await prepareLogoImage(file), folder);
}

async function put(prepared, folder) {
  const sig = await adminApi("/api/admin/media/sign", {
    method: "POST",
    body: {
      folder,
      contentType: prepared.contentType,
      contentLength: prepared.size,
    },
  });

  let res;
  try {
    /* Plain fetch, not api(): this goes to Cloudflare, and adding our own
       headers here would break the signature the server just computed. */
    res = await fetch(sig.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": prepared.contentType },
      body: prepared.blob,
    });
  } catch {
    throw new Error(
      "Upload was blocked by the browser. Add this site's origin to the bucket's CORS policy in the Cloudflare R2 dashboard."
    );
  }

  if (!res.ok) {
    throw new Error(`Storage rejected the upload (${res.status}).`);
  }

  return {
    photoUrl: sig.publicUrl,
    photoKey: sig.key,
    size: prepared.size,
    dimension: prepared.dimension,
    previewUrl: prepared.previewUrl,
  };
}

/* Fire-and-forget: used when a photo is swapped out before the record is
   saved, so the abandoned object does not linger in the bucket. */
export function discardUploaded(key) {
  if (!key) return;
  adminApi("/api/admin/media/delete", { method: "POST", body: { key } }).catch(() => {
    /* an orphaned object is not worth interrupting the editor for */
  });
}

export { API_BASE };
