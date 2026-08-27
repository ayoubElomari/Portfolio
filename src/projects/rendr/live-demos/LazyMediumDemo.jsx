import { Suspense, lazy, useRef } from "react";
import useNearViewport from "./useNearViewport.js";
import "./style/LazyMediumDemo.scss";

/**
 * A medium demo, kept out of the page's initial chunk — the same pattern as
 * `LazyMiniDemo`, for the size that does carry one video source.
 *
 * The component code (player chrome, transport, snippet) is deferred here; the
 * runtime and, if the composition declares one, mp4box.js are deferred separately
 * inside `useRendrWeb` and `AssetStore` once this mounts. See the note at the top
 * of `MediumDemo.jsx` for why a single video source is treated as auto-start
 * weight rather than click-to-run weight, unlike the bench.
 */
const MediumDemo = lazy(() => import("./MediumDemo.jsx"));

export default function LazyMediumDemo(props) {
  const ref = useRef(null);
  const near = useNearViewport(ref, { margin: "500px" });

  return (
    <div className="md-lazy-slot" ref={ref}>
      {near ? (
        <Suspense fallback={<MediumSkeleton />}>
          <MediumDemo {...props} />
        </Suspense>
      ) : (
        <MediumSkeleton />
      )}
    </div>
  );
}

/** Holds the space the demo will occupy, so its arrival moves nothing. */
function MediumSkeleton() {
  return <div className="md-lazy-skeleton" aria-hidden="true" />;
}
