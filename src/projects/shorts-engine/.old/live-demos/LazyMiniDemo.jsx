import { Suspense, lazy, useRef } from "react";
import useNearViewport from "./useNearViewport.js";
import "./style/LazyMiniDemo.scss";

/**
 * A mini demo, kept out of the page's initial chunk — same discipline as
 * `LazyBench`, applied to something an order of magnitude cheaper to run.
 *
 * `MiniDemo` itself never gates the runtime behind a click (see the note in that
 * file: its compositions have no video, so there is nothing worth asking
 * permission for). But its *code* — the snippet renderer, the field widgets, the
 * transport — still has no business parsing before the reader has scrolled
 * anywhere near it, and a page with several mini demos would otherwise front-load
 * all of them at once. `lazy()` holds the component itself back; `useNearViewport`
 * decides when that is worth doing, which is also the same signal `MiniDemo`
 * treats as "go" once it exists — one decision, reused for both.
 */
const MiniDemo = lazy(() => import("./MiniDemo.jsx"));

export default function LazyMiniDemo(props) {
  const ref = useRef(null);
  const near = useNearViewport(ref, { margin: "400px" });

  return (
    <div className="rm-lazy-slot" ref={ref}>
      {near ? (
        <Suspense fallback={<MiniSkeleton />}>
          <MiniDemo {...props} />
        </Suspense>
      ) : (
        <MiniSkeleton />
      )}
    </div>
  );
}

/** Holds the space the demo will occupy, so its arrival moves nothing. */
function MiniSkeleton() {
  return <div className="rm-lazy-skeleton" aria-hidden="true" />;
}
