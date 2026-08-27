import { useEffect, useRef, useState } from "react";

import "./style/ImageMaskEffect.scss";

/* How hard the circle chases the cursor each frame. Lower = longer, lazier
   trail. This is the whole "intentional lag" feel — it's a fixed-rate ease
   toward the pointer, not the browser catching up. */
const FOLLOW = 0.15;

/* Three-state photo reveal:
     idle    — desaturated, dimmed back to almost nothing
     hover   — a spotlight circle trails the cursor, showing the photo under
               the RDR2 grade (see .rdr2-grade / .rdr2-frame in index.css)
     open    — click expands that circle to cover the whole frame — the
               graded look is the destination, not a stop on the way to the
               real photo

   Pointer position is written straight to CSS custom properties from a rAF
   loop — never through React state. Re-rendering four components on every
   mousemove is what made this stutter. Radius is the opposite: it changes
   rarely (hover/open), so it's a plain CSS transition on a registered
   @property, which is why clip-path itself carries no transition. */
function ImageMaskEffect({ imageSrc, alt }) {
  const containerRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const startLoop = useRef(() => {});
  const [isHovering, setIsHovering] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    let raf = 0;

    const tick = () => {
      const c = current.current;
      const t = target.current;
      const k = reduce ? 1 : FOLLOW;
      c.x += (t.x - c.x) * k;
      c.y += (t.y - c.y) * k;
      el.style.setProperty("--mask-x", `${c.x.toFixed(1)}px`);
      el.style.setProperty("--mask-y", `${c.y.toFixed(1)}px`);

      /* Park the loop once it's caught up; the next mousemove restarts it. */
      if (Math.hypot(t.x - c.x, t.y - c.y) > 0.4) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    startLoop.current = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    return () => {
      if (raf) cancelAnimationFrame(raf);
      startLoop.current = () => {};
    };
  }, []);

  const pointerPos = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseEnter = (e) => {
    /* Snap to the cursor on entry, so the circle appears where you are and
       only trails once you start moving. */
    const p = pointerPos(e);
    target.current = p;
    current.current = { ...p };
    const el = containerRef.current;
    el?.style.setProperty("--mask-x", `${p.x}px`);
    el?.style.setProperty("--mask-y", `${p.y}px`);
    setIsHovering(true);
  };

  const handleMouseMove = (e) => {
    target.current = pointerPos(e);
    startLoop.current();
  };

  const toggle = () => setIsOpen((open) => !open);

  return (
    <div
      ref={containerRef}
      className={
        "image-container" +
        (isHovering ? " is-hovering" : "") +
        (isOpen ? " is-open" : "")
      }
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovering(false)}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isOpen}
      aria-label={alt}
    >
      <img className="base-image" src={imageSrc} alt={alt} />

      <div className="reveal-layer is-graded rdr2-frame" aria-hidden="true">
        <img className="reveal-image rdr2-grade" src={imageSrc} alt="" />
      </div>

      <span className="reveal-ring" aria-hidden="true" />
    </div>
  );
}

export default ImageMaskEffect;
