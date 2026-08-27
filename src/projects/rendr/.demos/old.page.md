import cover from "./assets/cover.svg";
import { rendrStyle } from "./theme.js";

{/* Not the bench itself: `LazyBench` code-splits it, so neither the editor UI nor
    the engine is in this page's initial chunk. See the note in that file. */}
import { LazyBench, LazyMiniDemo, LazyMediumDemo } from "./live-demos";

import { EASING_NAMES, miniKeyframes } from "./compositions/miniKeyframes.js";
import { mediumVideo } from "./compositions/mediumVideo.js";
import { SHORT_BY_RATIO, DEFAULT_RATIO, POSTER_FRAME } from "./compositions/short.js";

export const meta = {
  slug: "rendr",
  title: "Rendr (test)",
  titlePrefix: "Sandbox",
  subtitle: "Playground copy of the Rendr live demos, for optimization work only.",
  description: "Not a real case study — a working copy of the Rendr demo stack for iterating on performance without touching the live page.",
  cover,
  duration: "Sandbox",
  date: "2026-08-21",
  style: rendrStyle,
};

export const benchLabels = {
  barLive: "Live. This is the engine, running here.",
  benchCaption:
    "A 16-second edit — two clips, a photograph and word-synced captions — as a text file. On the left is the file; on the right is what it draws. Change anything on the left. The ratio chips load a different cut, because nothing in the format reflows.",
};

{/* The medium demo is gated behind the same button as the bench — see the note
    at the top of `live-demos/MediumDemo.jsx` for why this project's copy
    diverges from the kit's own auto-start default. The note names the real
    payload for this composition's one clip, not the bench's two. */}
export const mediumLabels = {
  gateNote:
    "Boots the real renderer in this tab and loads ~1.2 MB of video. The title, the accent and the fps are already live — only the picture waits.",
};

export function HeroDemo() {
  return (
    <LazyBench
      variants={SHORT_BY_RATIO}
      defaultVariant={DEFAULT_RATIO}
      posterFrame={POSTER_FRAME}
      filename="short.rendr.json"
      labels={benchLabels}
    />
  );
}

{/* One property, one curve. The whole point of a mini demo: the reader sees only
    the object these two values live in, but the file handed to the runtime on
    every drag is the real composition, timeline and all. `EASING_NAMES` is
    imported from the runtime's own table (`rendr-web/animation/easings.js`), not
    retyped here — so every option in the dropdown is guaranteed to be a curve
    the interpolator actually implements. */}
export const miniEasingEdits = [
  {
    path: ["timeline", 1, "style", "&", "left", "keyframes", 0, "easing"],
    type: "select",
    label: "easing",
    options: EASING_NAMES,
  },
  {
    path: ["timeline", 1, "style", "&", "left", "keyframes", 1, "value"],
    type: "length",
    label: "destination",
    min: 200,
    max: 1180,
    step: 4,
  },
];

{/* Every line of copy, both colours, and the title's own size — twelve edits,
    but only two parents: every variable below lives directly under
    `variables`, so they render as one block in the snippet (see
    `snippet.js` for why that's a parent block rather than a crop of the
    file), and `timeline[6]` — the title element — gets the other for its
    font size. `ink` reaches every body line (the subtitle and all three
    call-outs); `accent` reaches every tag, the corner marks, and the
    underline. See `compositions/mediumVideo.js` for the full element order
    the timeline index depends on. */}
export const mediumEdits = [
  { path: ["variables", "title"], type: "text", label: "title" },
  { path: ["variables", "kicker"], type: "text", label: "kicker" },
  { path: ["variables", "subtitle"], type: "text", label: "subtitle" },
  { path: ["variables", "beat2Tag"], type: "text", label: "beat 2 tag" },
  { path: ["variables", "beat2Text"], type: "text", label: "beat 2 text" },
  { path: ["variables", "beat3Tag"], type: "text", label: "beat 3 tag" },
  { path: ["variables", "beat3Text"], type: "text", label: "beat 3 text" },
  { path: ["variables", "beat4Tag"], type: "text", label: "beat 4 tag" },
  { path: ["variables", "beat4Text"], type: "text", label: "beat 4 text" },
  { path: ["variables", "accent"], type: "color", label: "accent" },
  { path: ["variables", "ink"], type: "color", label: "ink" },
  {
    path: ["timeline", 6, "style", "&", "fontSize"],
    type: "length",
    label: "title size",
    min: 56,
    max: 116,
    step: 4,
  },
];

# Sandbox

This page runs on `rendr-web`, the shared rendering runtime at
[`src/rendr-web/`](../../rendr-web/CLAUDE.md) — imported here through the
`@rendr-web` alias, not vendored into this folder. The three demos below are
the `live-demos` kit, copied in whole from
`.project-details/rendr/v2/live-demos/`; see
[`live-demos/README.md`](./live-demos/README.md) for how the demo stack works
and how to wire a composition into it.

Three sizes of the same idea live on this page. The bench above argues that a video is a data
structure — three panels, a timeline, the whole format on display. The two below make one point
each.

<Frame
  plain
  bleed="wide"
  label="Mini demo"
  caption="Drag the destination, or swap the easing — the box moves exactly as the file describes, frame by frame. Two of the curves (back, elastic) overshoot past the destination on purpose; an interpolator that clamped to safe values would quietly delete the effect."
>
  <LazyMiniDemo
    composition={miniKeyframes}
    edits={miniEasingEdits}
    note="One element, one property, one curve — the smallest composition that says something true about the format."
  />
</Frame>

::space[32]

<Frame
  plain
  bleed="wide"
  label="Medium demo"
  caption="One render pass, twelve seconds: the six-second clip loops under a title card and three short call-outs, all laid out and composited by the browser on the same frame. Every line of copy is editable, both colours are, and so is the title's own size — every place a value appears moves with it."
>
  <LazyMediumDemo
    composition={mediumVideo}
    edits={mediumEdits}
    note="A player worth watching, its controls, and the handful of lines in the file that are actually doing the arguing."
    labels={mediumLabels}
  />
</Frame>
