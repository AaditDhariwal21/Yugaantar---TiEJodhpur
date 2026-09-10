import { useNavigate, useLocation } from "react-router-dom";

/* One link component covering the three kinds of destination on this site:

     external   https://…, mailto:, tel:  → plain <a>, never touches the router
     in-page    /#speakers, #experience   → smooth-scrolls, navigating first if
                                            we are on another route
     internal   /partnership              → client-side navigation

   Anything with a scheme (or protocol-relative //) is external. Handing those
   to navigate() would make the router treat them as in-app paths. */

const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

export default function HashLink({ to, children, onNavigate, ...rest }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (EXTERNAL.test(to)) {
    const isWeb = /^(https?:)?\/\//i.test(to);
    return (
      <a
        href={to}
        // new tab for the web, same tab for mailto:/tel: so no blank window is left behind
        {...(isWeb ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onClick={() => onNavigate && onNavigate()}
        {...rest}
      >
        {children}
      </a>
    );
  }

  const isHash = to.includes("#");
  const [path, hash] = isHash ? to.split("#") : [to, null];
  const targetPath = path === "" ? "/" : path;
  const href = isHash ? `${targetPath === "/" ? "" : targetPath}#${hash}` : to;

  const onClick = (e) => {
    if (onNavigate) onNavigate();
    // let the browser handle modified clicks so open-in-new-tab still works
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();

    if (!isHash) {
      navigate(to);
      return;
    }

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

  return (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}
