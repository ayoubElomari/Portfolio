import { useEffect, useState } from "react";

/**
 * True once the element is near the viewport.
 *
 * Used to hold expensive work back until it is worth starting — loading the
 * editor's chunk, and behind that the runtime. Several demos booting into the
 * same first paint is most of what "laggy on load" means on a phone.
 *
 * **The timer is a correctness requirement, not padding.** `IntersectionObserver`
 * callbacks are suppressed outright in some contexts — a backgrounded tab,
 * certain embeds — and without a fallback the demo would never appear at all.
 * Late is fine; never is not — which is also why this is 8s and not 2.5s: on a
 * page with a tall hero, the demo can genuinely sit outside `margin` at scroll
 * position 0, and the observer just hasn't had a chance to fire yet. A short
 * timer was winning that race on every load, forcing several demos to boot at
 * once regardless of whether the reader had scrolled anywhere near them —
 * the opposite of what this hook is for.
 *
 * Lives in its own file so it isn't a reason to import anything heavier.
 */
export default function useNearViewport(
  ref,
  { margin = "300px", fallbackMs = 8000 } = {},
) {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let settled = false;
    const activate = () => {
      if (settled) return;
      settled = true;
      setNear(true);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) activate();
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    const timer = setTimeout(activate, fallbackMs);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [ref, margin, fallbackMs]);

  return near;
}
