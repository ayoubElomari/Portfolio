import { useEffect, useRef, useState } from "react";

/* Fires once when the element first scrolls into view, then stops observing —
   a reveal that replays every time the reader scrolls back past reads as a
   glitch, not as polish.

   Returns [ref, inView]; attach the ref to whatever should trigger it. */
export default function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}
