import s from "./admin.module.css";

/* Small shared pieces for the admin panel. Kept separate from components/ui
   because none of these belong on the public site. */

const svg = (children, size = 16) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const Icons = {
  drag: (p) =>
    svg(
      <>
        <circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none" />
      </>,
      p?.size
    ),
  up: (p) => svg(<path d="M12 19V5M5 12l7-7 7 7" />, p?.size),
  down: (p) => svg(<path d="M12 5v14M19 12l-7 7-7-7" />, p?.size),
  edit: (p) => svg(<path d="M4 20h4l10.5-10.5a2.1 2.1 0 00-3-3L5 17v3zM13.5 6.5l4 4" />, p?.size),
  trash: (p) =>
    svg(<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />, p?.size),
  plus: (p) => svg(<path d="M12 5v14M5 12h14" />, p?.size),
  close: (p) => svg(<path d="M6 6l12 12M18 6L6 18" />, p?.size),
  star: (p) =>
    svg(<path d="M12 3.5l2.6 5.5 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8L12 3.5z" />, p?.size),
  image: (p) =>
    svg(
      <>
        <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
        <circle cx="8.5" cy="10" r="1.8" />
        <path d="M21 16l-5-5-9 8.5" />
      </>,
      p?.size
    ),
  check: (p) => svg(<path d="M4.5 12.5l5 5 10-11" />, p?.size),
};

export function Field({ label, hint, error, children, wide = false }) {
  return (
    <label className={`${s.field} ${wide ? s.fieldWide : ""}`}>
      <span className={s.fieldLabel}>{label}</span>
      {children}
      {error ? (
        <span className={s.fieldError}>{error}</span>
      ) : hint ? (
        <span className={s.fieldHint}>{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ value, onChange, ...rest }) {
  return (
    <input
      className={s.input}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}

export function TextArea({ value, onChange, rows = 3, ...rest }) {
  return (
    <textarea
      className={`${s.input} ${s.textarea}`}
      rows={rows}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}

export function Select({ value, onChange, options, ...rest }) {
  return (
    <select
      className={`${s.input} ${s.select}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Btn({ kind = "ghost", icon: IconCmp, children, ...rest }) {
  return (
    <button type="button" className={`${s.btn} ${s[kind]}`} {...rest}>
      {IconCmp && <IconCmp size={15} />}
      {children}
    </button>
  );
}

/* Non-blocking, unlike window.confirm, and it names what is about to go. */
export function ConfirmBar({ label, onConfirm, onCancel }) {
  return (
    <div className={s.confirm} role="alertdialog" aria-label={label}>
      <span>{label}</span>
      <div className={s.confirmActions}>
        <Btn kind="ghost" onClick={onCancel}>
          Cancel
        </Btn>
        <Btn kind="danger" onClick={onConfirm}>
          Delete
        </Btn>
      </div>
    </div>
  );
}

export const initialOf = (n) =>
  (n || "").replace(/[[\]]/g, "").trim().charAt(0).toUpperCase() || "?";
