import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/* Cloudflare R2 via its S3-compatible API.

   Uploads are PRESIGNED and go browser -> R2 directly. Photos never pass
   through this server, which matters on Render's free tier: no request-body
   limit to raise, no memory spike, no 30s upload blocking the event loop.

   R2 does no image processing, so the browser crops and re-encodes to WebP
   before asking for a URL (see client/src/lib/imageResize.js). By the time we
   sign anything the payload is ~80KB. */

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const BUCKET = process.env.R2_BUCKET;
const PUBLIC_BASE = (process.env.R2_PUBLIC_BASE || "").replace(/\/+$/, "");

export const isR2Configured = () =>
  Boolean(ACCOUNT_ID && BUCKET && PUBLIC_BASE && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);

let client = null;
function s3() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

/* Only these are ever signed. An open admin API that would sign a PUT for any
   content type is an open file-drop for the whole internet; restricting to
   images keeps the blast radius to wasted storage. */
const ALLOWED = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const FOLDERS = new Set(["delegates", "committee"]);

export function buildKey(folder, contentType) {
  const dir = FOLDERS.has(folder) ? folder : "misc";
  const ext = ALLOWED[contentType] || "bin";
  return `${dir}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
}

export function publicUrlFor(key) {
  return `${PUBLIC_BASE}/${key}`;
}

export async function signUpload({ folder, contentType, contentLength }) {
  if (!ALLOWED[contentType]) {
    const err = new Error(`Unsupported image type: ${contentType}`);
    err.status = 422;
    throw err;
  }
  // 8MB ceiling. The browser sends ~80KB; anything near this is a bug or abuse.
  if (contentLength && contentLength > 8 * 1024 * 1024) {
    const err = new Error("Image too large (max 8MB).");
    err.status = 422;
    throw err;
  }

  const key = buildKey(folder, contentType);
  const url = await getSignedUrl(
    s3(),
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      // Photos are content-addressed by a random key, so they never change
      // under the same URL and can be cached hard.
      CacheControl: "public, max-age=31536000, immutable",
    }),
    { expiresIn: 300 }
  );

  return { uploadUrl: url, key, publicUrl: publicUrlFor(key), contentType };
}

/* Best-effort: a failed delete must never block deleting the person record,
   or the admin ends up with a row they cannot remove. */
export async function deleteObject(key) {
  if (!key || !isR2Configured()) return false;
  try {
    await s3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch (err) {
    console.warn("[r2] delete failed for", key, err.message);
    return false;
  }
}
