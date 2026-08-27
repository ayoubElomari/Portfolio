/**
 * Rendr live demos — the three sizes, as importable components.
 *
 * Every one of them takes its composition as a prop. None of them ships a
 * `.rendr.json` of its own, on purpose: a demo that carried authored content
 * would force that content on whoever imported it, which is exactly the coupling
 * this package exists to remove.
 *
 * Import the lazy wrappers unless you have a reason not to — they are the ones
 * that keep the demo off the page's critical path. The bare components are
 * exported too, for a host that already has its own code-splitting.
 *
 *   import { LazyBench, LazyMiniDemo, LazyMediumDemo } from "./live-demos";
 *
 *   <LazyMiniDemo composition={myComposition} edits={[…]} />
 *   <LazyBench variants={{ wide: a, tall: b }} defaultVariant="wide" />
 *
 * See ./README.md for the full prop surface and how `edits` paths work.
 */

/* The lazy wrappers — the default choice. Each one code-splits its component and
   holds it until the reader is near it. */
export { default as LazyBench } from "./LazyBench.jsx";
export { default as LazyMiniDemo } from "./LazyMiniDemo.jsx";
export { default as LazyMediumDemo } from "./LazyMediumDemo.jsx";

/* The components themselves, for a host doing its own splitting. Importing these
   directly puts them in whatever chunk does the importing — which is the thing
   the wrappers above exist to avoid, so reach for these deliberately. */
export { default as RendrBench } from "./RendrBench.jsx";
export { default as MiniDemo } from "./MiniDemo.jsx";
export { default as MediumDemo } from "./MediumDemo.jsx";

/* Strings. Pass a partial object as `labels` to any demo; missing keys fall back
   to the English defaults rather than rendering `undefined`. */
export { DEFAULT_LABELS } from "./labels.js";

/* The lane palette, if a host wants its own. */
export { DEFAULT_TRACK_COLORS, trackColor } from "./trackColors.js";

/* Composition helpers the demos use internally, exported because a host writing
   `edits` or building compositions will want the same vocabulary. */
export {
  FPS_CHOICES,
  RESOLUTIONS,
  currentRatio,
  currentResolution,
  ratiosFrom,
  resolutionFor,
  setFps,
  setResolution,
} from "./edit.js";
