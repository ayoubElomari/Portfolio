import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────────────────
   Where a page should be sitting the moment it appears.

   Default is the top. A link can override that by carrying a `scrollTo`
   element id in its router state:

     <Link to="/" state={{ scrollTo: "projects" }}>projects</Link>

   which is how the header, footer and a project's "All work" links land on
   Home and continue down to the showcase.

   Deliberately router state rather than a `#projects` hash: the article
   pages already use real `#heading` anchors for their contents rail, and a
   hash-driven rule here would fire on every rail click and fight the
   scrolling those already do (including the mobile sheet's deliberate
   collapse-then-scroll sequence). State can't collide with them.

   `key` is in the dependency list so clicking the same link twice — or
   clicking "projects" while already on Home — scrolls again instead of
   being treated as no navigation at all. That makes this run on in-page
   `#heading` navigations too, which is why the reset below is gated on the
   pathname actually changing: without that gate, clicking an entry in an
   article's contents rail would jump to the heading and then immediately be
   yanked back to the top of the page.
   ───────────────────────────────────────────────────────────────────────── */
function ScrollRestore() {
  const { pathname, key, state } = useLocation();
  const lastPathname = useRef(null);

  useEffect(() => {
    const changedPage = lastPathname.current !== pathname;
    lastPathname.current = pathname;

    const targetId = state?.scrollTo;

    /* A new page starts at the top. Staying on the same page means something
       else (a contents-rail anchor) owns the scroll position — leave it be. */
    if (changedPage || targetId) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    if (!targetId) return;

    /* The destination page mounted in this same commit, so wait one frame for
       layout to settle before measuring where the target actually is. */
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname, key, state]);

  return null;
}

export default ScrollRestore;
