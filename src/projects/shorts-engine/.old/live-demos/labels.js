/**
 * Every user-facing string in every demo on this page.
 *
 * ── Why this file exists ──────────────────────────────────────────────────
 * `src/projects/CLAUDE.md` is explicit: a bespoke component must never read the
 * language context or branch on locale itself. It takes its strings as props,
 * and each `page.<locale>.mdx` passes its own set in. That keeps one component
 * serving every language, with the whole translation surface living in the MDX.
 *
 * The bench is the largest localisation job on the page — three panels, an
 * inspector, a timeline, an add-element form and a transport — so the strings
 * are a single **flat** object rather than a nested one. Flat means every
 * component can do `{ ...DEFAULT_LABELS, ...labels }` and be done; a nested
 * shape would need a deep merge in six places, and a half-supplied nested
 * override would silently blank a whole group instead of falling back key by
 * key.
 *
 * The values below are the English set, and they are also the fallback. A
 * locale that forgets a key gets English rather than `undefined` — visible in
 * review, never a crash. `page.en.mdx` still passes its set explicitly, so both
 * locale files read the same way and neither is the privileged one.
 *
 * `{n}`-style placeholders are filled by `fill()` below.
 */

import { createContext, useContext } from "react";

export const DEFAULT_LABELS = {
  /* ── transport, shared by all three demo sizes ───────────────────────── */
  play: "Play",
  pause: "Pause",
  prevFrame: "Previous frame",
  nextFrame: "Next frame",
  jumpFrame: "Jump to any frame",
  jumpTitle: "Any frame, straight there — nothing before it has to be drawn first",
  frameAria: "Frame",
  /* Never "frame time". This is one renderFrame() call in the reader's own
     browser, not the engine's end-to-end figure. See DEMOS.md. */
  rateAria: "Playback speed",
  costTitle:
    "Average time for one renderFrame() call in this page — the layout half of the engine, not its end-to-end frame time",

  /* ── inputs ──────────────────────────────────────────────────────────── */
  dragTitle: "Drag to change · double-click to type",
  valueUp: "{label} up",
  valueDown: "{label} down",
  valueFallback: "value",
  colourFallback: "colour",

  /* ── output settings ─────────────────────────────────────────────────── */
  rowFps: "fps",
  rowRatio: "ratio",
  rowSize: "size",
  fpsChipTitle: "{n} frames per second",

  /* ── the bench: top bar ──────────────────────────────────────────────── */
  barLive: "Live — the engine, running in your browser",
  barFrames: "{n} frames",
  reset: "Reset",
  resetTitle: "Reset the composition to the file as authored",

  /* ── the bench: stage ────────────────────────────────────────────────── */
  stageTitle: "output",
  stageAria: "Rendered frame",
/* The label shown from the instant the button is pressed until the runtime
     starts reporting its own progress — it covers fetching the runtime chunk,
     which on a phone is the longest silent stretch of the whole start-up. */
  stageBooting: "Fetching the renderer…",
  stageFailed: "engine failed to start: {error}",
  /* The gate. `gateNote` says what pressing it costs, because it is a real
     download and a real decoder — the reader should know before, not after. */
  gateStart: "Run the engine",
  gateNote:
    "Boots the real renderer in this tab and loads ~1.8 MB of video. The file, the timeline and the settings are already live — only the picture waits.",

  /* ── the bench: file panel ───────────────────────────────────────────── */
  jsonAria: "Composition source",
  jsonMeta: "{n} elements · read-only",

  /* ── the bench: timeline ─────────────────────────────────────────────── */
  tlLanes: "{n} lanes",
  tlLanesShort: "{n} el",
  tlClipAria: "{name}, frames {at} to {end}",

  /* ── the bench: inspector ────────────────────────────────────────────── */
  insEmptyHint: "Pick a lane on the timeline to edit the element that draws it.",
  insDelete: "Delete this element",
  insDeleteAria: "Delete {name}",
  insDeselect: "Deselect",
  insDeselectTitle: "Deselect (Esc)",
  insExpandsTo: "expands to",
  insExpansion: "{n} elements from one invocation, timing inherited",
  insContent: "content",
  insAsset: "asset",
  insStartsAt: "starts at frame",
  insLasts: "lasts frames",
  insAnimated: "animated",
  insNote:
    "A handful of fields, out of every CSS property the format accepts — on any selector, any of them keyframed. A door, not the API.",
  insNoTextPlaceholder: "(no text — this element is a shape)",

  /* ── the bench: add-element flow ─────────────────────────────────────── */
  addElement: "Add an element",
  addCancel: "Cancel",
  addNew: "New {type}",
  addNoAssets: "No {type} assets loaded",
  addName: "name",
  addToTimeline: "Add to timeline",
  addAuthoringNote:
    "The authoring space is 1280 wide, whatever the output resolution — so x and y are in that space, not in pixels of the finished video.",
  /* Seeded into the new element, so it appears in the reader's own language. */
  addDefaultText: "Written by whoever is reading this",
  addDefaultTextId: "my-text",
  addDefaultImageId: "my-image",
  addDefaultVideoId: "my-video",
  /* The engine's registry names. Capitalised because they are the format's own
     `type` values — a French page still writes `"type": "Text"` in the file. */
  typeText: "Text",
  typeImage: "Image",
  typeVideo: "Video",

  /* ── style fields (the inspector's property list) ────────────────────── */
  fieldX: "x",
  fieldY: "y",
  fieldWidth: "width",
  fieldHeight: "height",
  fieldColour: "colour",
  fieldSize: "size",

  /* ── the bench: caption under the shell ──────────────────────────────── */
  benchCaption: "Change the JSON. The frame changes. That's the entire product.",

  /* ── medium demo ─────────────────────────────────────────────────────── */
  mediumWorking: "Working",
  mediumFrames: "{n} frames",

  /* ── mini demos ──────────────────────────────────────────────────────── */
  miniFramesNote: "{n} frames, same timecodes",
};

/**
 * Fill `{name}` placeholders. Deliberately tiny and deliberately not a
 * templating library: the only thing on this page that needs interpolation is a
 * handful of counts and one element name.
 *
 * An unknown key is left in place rather than replaced with an empty string, so
 * a typo shows up as a literal `{n}` on screen instead of vanishing.
 */
export function fill(template, vars) {
  if (!template) return "";
  if (!vars) return template;
  return String(template).replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match,
  );
}

/** Merge a locale's overrides over the English fallback set. */
export function withLabels(labels) {
  return labels ? { ...DEFAULT_LABELS, ...labels } : DEFAULT_LABELS;
}

/* ── how the strings reach the leaves ─────────────────────────────────────
 *
 * A demo root takes `labels` as a prop from its `page.<locale>.mdx` and puts
 * the merged set on this context. Everything below reads it with `useLabels()`.
 *
 * This is threading, not locale detection: nothing here touches `useLanguage()`
 * or looks at the active locale. The MDX file still owns every string. The
 * context exists because a number field buried in the inspector's add-element
 * form is six components below the root, and passing one object down six levels
 * of props — through `Inspector` → `AddForm` → `NumberDrag` — makes every one of
 * those signatures about translation instead of about what it does.
 *
 * Exported as a bare context + hook rather than a wrapper `<LabelsProvider>`
 * component: this file would otherwise export a component alongside plain
 * values, which is the `react-refresh/only-export-components` shape the repo
 * already has enough of.
 */
export const LabelsContext = createContext(DEFAULT_LABELS);

/** The active label set, for any component inside a demo. */
export function useLabels() {
  return useContext(LabelsContext);
}

/** `useLabels()` plus the placeholder filler, which is the usual pairing. */
export function useLabel() {
  const labels = useContext(LabelsContext);
  return (key, vars) => fill(labels[key], vars);
}

export default DEFAULT_LABELS;
