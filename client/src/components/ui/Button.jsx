import HashLink from "./HashLink";
import s from "./Button.module.css";

export default function Button({
  href,
  variant = "grad",
  children,
  className = "",
  ...rest
}) {
  const cls = `${s.btn} ${s[variant] || ""} ${className}`.trim();
  if (href) {
    return (
      <HashLink to={href} className={cls} {...rest}>
        {children}
      </HashLink>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
