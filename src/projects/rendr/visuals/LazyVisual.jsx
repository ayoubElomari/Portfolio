import { Suspense, lazy, useRef, useState } from "react";
import useNearViewport from "../live-demos/useNearViewport.js";
import "./style/LazyVisual.scss";

/**
 * Defers one hand-authored diagram's chunk and mount until the reader scrolls
 * near it — the same discipline `LazyMiniDemo` applies to a Rendr Web demo,
 * extended to the plain SVG/CSS figures in this folder. Individually each one
 * is cheap, but five of them plus three live demos all parsing and mounting
 * on the same first paint is exactly the pile-up `useNearViewport` exists to
 * prevent.
 *
 * `skeleton` selects which `.lv-skeleton--*` rule in LazyVisual.scss reserves
 * the figure's shape, since none of the five share one height.
 */
export default function LazyVisual({ loader, skeleton, ...props }) {
  const [Component] = useState(() => lazy(loader));
  const ref = useRef(null);
  const near = useNearViewport(ref, { margin: "400px" });

  const fallback = (
    <div className={`lv-skeleton lv-skeleton--${skeleton}`} aria-hidden="true" />
  );

  return (
    <span className="lv-slot" ref={ref}>
      {near ? (
        <Suspense fallback={fallback}>
          <Component {...props} />
        </Suspense>
      ) : (
        fallback
      )}
    </span>
  );
}
