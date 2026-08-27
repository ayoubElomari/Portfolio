import { Suspense, lazy, useRef } from "react";
import useNearViewport from "./useNearViewport.js";
import "./style/LazyBench.scss";

/**
 * The bench, kept out of the page's initial chunk.
 *
 * Two separate deferrals stack up, and they solve different halves of the same
 * problem:
 *
 *   1. This file `lazy()`s the bench UI — the file panel, timeline, inspector,
 *      icons, the whole editor. None of it is parsed until the demo is near the
 *      viewport.
 *   2. `useRendrWeb` dynamically imports Rendr Web itself (and with it
 *      mp4box.js, ~12,000 lines) only when somebody presses "Run the engine".
 *
 * Before either, all of it sat in the page's first chunk and was parsed before
 * the first paint. The visible symptom was not the demo being slow — it was the
 * *hero* losing its entrance animation on a phone, because the main thread was
 * busy through exactly the frames that animation needed. Work that isn't on the
 * critical path shouldn't be on the critical path.
 *
 * The placeholder reserves the demo's real height, so nothing below it jumps when
 * the chunk lands. That matters more here than usual: this sits directly under
 * the hero, which is where a layout shift is most obvious.
 */
const RendrBench = lazy(() => import("./RendrBench.jsx"));

export default function LazyBench(props) {
  const ref = useRef(null);
  /* Same hook the mini demos use. Its timer fallback is load-bearing rather than
     defensive: IntersectionObserver is suppressed outright in some contexts, and
     without it the demo would simply never appear. */
  const near = useNearViewport(ref, { margin: "600px" });

  return (
    <div className="rb-lazy-slot" ref={ref}>
      {near ? (
        <Suspense fallback={<BenchSkeleton />}>
          <RendrBench {...props} />
        </Suspense>
      ) : (
        <BenchSkeleton />
      )}
    </div>
  );
}

/** Holds the space the bench will occupy, so its arrival moves nothing. */
function BenchSkeleton() {
  return <div className="rb-lazy-skeleton" aria-hidden="true" />;
}
