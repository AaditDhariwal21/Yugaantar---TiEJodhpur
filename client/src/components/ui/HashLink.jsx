import { useNavigate, useLocation } from "react-router-dom";

/* Anchor links have to work from two places: in-page on `/`, and cross-route
   from `/partnership` back to `/#speakers`. A plain <a> handles the first and
   a router <Link> handles the second, so this picks per case and does the
   smooth scroll itself when we're already on the target route. */
export default function HashLink({ to, children, onNavigate, ...rest }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHash = to.includes("#");
  const [path, hash] = isHash ? to.split("#") : [to, null];
  const targetPath = path === "" ? "/" : path;

  const handle = (e) => {
    if (onNavigate) onNavigate();
    if (!isHash) return; // let the router <a> behave normally below

    e.preventDefault();
    const scrollToHash = () => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (location.pathname === targetPath) {
      scrollToHash();
    } else {
      navigate(targetPath);
      // wait for the route's first paint before looking for the anchor
      requestAnimationFrame(() => requestAnimationFrame(scrollToHash));
    }
  };

  const href = isHash ? `${targetPath === "/" ? "" : targetPath}#${hash}` : to;

  return (
    <a
      href={href}
      onClick={(e) => {
        if (!isHash) {
          if (onNavigate) onNavigate();
          if (!e.metaKey && !e.ctrlKey && e.button === 0) {
            e.preventDefault();
            navigate(to);
          }
          return;
        }
        handle(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
