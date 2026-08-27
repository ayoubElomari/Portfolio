import { useLayoutEffect, useRef, useState } from "react";

/**
 * One-shot scroll-into-view reveal, shared by every hand-authored diagram in
 * this project (see .copy/visual-guidelines.md, section 3, "Motion"). Fires
 * once, never redraws the diagram's own logic, and is a no-op under
 * prefers-reduced-motion or when IntersectionObserver isn't available — in
 * both cases the diagram just renders visible from the start.
 */
export function useReveal() {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(true);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setRevealed(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
