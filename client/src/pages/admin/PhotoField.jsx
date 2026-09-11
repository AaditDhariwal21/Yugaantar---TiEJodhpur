import { useEffect, useRef, useState } from "react";
import { ACCEPTED, formatBytes } from "../../lib/imageResize";
import { discardUploaded, uploadPhoto } from "../../lib/upload";
import { Btn, Icons, initialOf } from "./ui";
import s from "./admin.module.css";

/* Upload a square avatar.

   The crop happens in the browser (lib/imageResize.js) because R2 has no
   transform layer. `focus` slides the square up or down the source image —
   portraits are usually framed with the face high, and a plain centre crop
   takes the top of the head off. */

export default function PhotoField({ value, valueKey, name, folder, onChange, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [focus, setFocus] = useState(0.5);
  const [pendingFile, setPendingFile] = useState(null);
  const inputRef = useRef(null);
  const previewRef = useRef(null);
  /* The last object THIS field uploaded. The crop slider re-uploads on every
     move, so without this a few nudges would leave a trail of unreferenced
     files in the bucket that nothing ever cleans up. */
  const ownKey = useRef(null);

  // object URLs from the cropper would leak without this
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    []
  );

  async function run(file, focusValue) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadPhoto(file, { folder, focus: focusValue });
      // the one this supersedes is now unreferenced
      if (ownKey.current && ownKey.current !== res.photoKey) discardUploaded(ownKey.current);
      ownKey.current = res.photoKey;

      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      previewRef.current = res.previewUrl;
      setInfo({ size: res.size, dimension: res.dimension });
      onChange({ photoUrl: res.photoUrl, photoKey: res.photoKey });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function onPick(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so picking the same file twice still fires
    if (!file) return;
    setPendingFile(file);
    setFocus(0.5);
    run(file, 0.5);
  }

  const clear = () => {
    /* Only ours to delete. An already-stored photo stays until the record is
       saved without it, so cancelling after "Remove" leaves the original
       intact rather than having deleted it out from under a live card. */
    if (ownKey.current) {
      discardUploaded(ownKey.current);
      ownKey.current = null;
    }
    setPendingFile(null);
    setInfo(null);
    setError(null);
    onChange({ photoUrl: null, photoKey: null });
  };

  return (
    <div className={s.photoField}>
      <div className={s.photoPreview}>
        {value ? (
          <img src={value} alt="" />
        ) : (
          <span className={s.photoInitial} aria-hidden="true">
            {initialOf(name)}
          </span>
        )}
        {uploading && <div className={s.photoBusy}>Uploading…</div>}
      </div>

      <div className={s.photoSide}>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={onPick}
          hidden
          disabled={disabled || uploading}
        />
        <div className={s.photoBtns}>
          <Btn
            kind="ghost"
            icon={Icons.image}
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {value ? "Replace" : "Upload photo"}
          </Btn>
          {value && (
            <Btn kind="ghost" onClick={clear} disabled={disabled || uploading}>
              Remove
            </Btn>
          )}
        </div>

        {/* Only offered once there is a file to re-crop — re-cropping needs
            the original, which we only hold for this session. */}
        {pendingFile && !uploading && (
          <label className={s.focusRow}>
            <span className={s.fieldHint}>Crop position</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={focus}
              onChange={(e) => {
                const f = Number(e.target.value);
                setFocus(f);
                run(pendingFile, f);
              }}
              disabled={disabled}
            />
            <span className={s.focusEnds}>
              <i>top</i>
              <i>bottom</i>
            </span>
          </label>
        )}

        {error && <p className={s.fieldError}>{error}</p>}
        {!error && info && (
          <p className={s.fieldHint}>
            Cropped to {info.dimension}×{info.dimension}, {formatBytes(info.size)}
          </p>
        )}
        {!error && !info && !value && (
          <p className={s.fieldHint}>Square crop, resized and compressed in your browser.</p>
        )}
        {valueKey && !info && <p className={s.fieldHint}>Stored image</p>}
      </div>
    </div>
  );
}
