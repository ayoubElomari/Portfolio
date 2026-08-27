/* The runtime's own timecode writer, so the editor and the picture can never
   disagree about what a frame number means. */
import { timecodeFromFrames as framesToTimecode } from "@rendr-web/util/timecode.js";

/**
 * Every edit the demo allows, as a pure function from one composition to the next.
 *
 * The reader never types raw JSON here. That is a deliberate limit: a free-text
 * editor on a format with typed references and strict timecodes fails within about
 * four keystrokes, and a demo that can be broken by its own audience proves nothing.
 * So the surface is a set of moves that cannot produce an invalid file, and the JSON
 * panel shows the result of each one.
 */

/** Replace one element, returning a new composition. */
export function patchElement(config, index, patch) {
  const timeline = config.timeline.map((el, i) =>
    i === index ? { ...el, ...patch } : el,
  );
  return { ...config, timeline };
}

/** Read a property off an element's own (`&`) style block. */
export function getStyleProp(el, prop) {
  return el?.style?.["&"]?.[prop];
}

/**
 * Write a property into an element's own style block. A property currently driven
 * by keyframes is left alone — overwriting it with a static value would silently
 * delete the animation, which is exactly the kind of "helpful" edit the format's
 * own design refuses to make.
 */
export function setStyleProp(config, index, prop, value) {
  const el = config.timeline[index];
  const own = el.style?.["&"] || {};
  if (isAnimated(own[prop])) return config;
  return patchElement(config, index, {
    style: { ...el.style, "&": { ...own, [prop]: value } },
  });
}

/** True when a style value is a keyframe track rather than a plain value. */
export function isAnimated(value) {
  return Boolean(value && typeof value === "object" && value.keyframes);
}

/** Move or resize an element on the frame axis. */
export function setTiming(config, index, { at, duration }, fps) {
  const patch = {};
  if (at !== undefined) patch.at = framesToTimecode(at, fps);
  if (duration !== undefined)
    patch.duration = framesToTimecode(Math.max(1, duration), fps);
  return patchElement(config, index, patch);
}

/** Drop an element. */
export function removeElement(config, index) {
  return { ...config, timeline: config.timeline.filter((_, i) => i !== index) };
}

/**
 * The style properties the forms expose, in the order they're shown.
 *
 * Five of them, against a format that takes any CSS property, on any selector, with
 * any of them keyframed. The forms say so out loud rather than implying this is the
 * whole surface.
 */
export const STYLE_FIELDS = [
  { prop: "left", label: "x", unit: "px" },
  { prop: "top", label: "y", unit: "px" },
  { prop: "width", label: "width", unit: "px" },
  { prop: "height", label: "height", unit: "px" },
  { prop: "color", label: "colour", kind: "color" },
];

/**
 * A new element, built from the add-element form.
 *
 * It arrives with a complete style block rather than an empty one, because an
 * element with no styling mounts at the top-left corner at browser-default size and
 * reads as a bug. It also arrives with a fade, because every other element in the
 * composition has one and an element that pops reads as broken next to them.
 */
export function makeElement(draft, fps) {
  const { id, type, at, duration } = draft;
  const own = {
    position: "absolute",
    left: `${draft.left}px`,
    top: `${draft.top}px`,
    width: `${draft.width}px`,
    zIndex: 50,
    opacity: {
      keyframes: [
        { at: "0%", value: 0, easing: "easeOutCubic" },
        { at: "20%", value: 1 },
        { at: "84%", value: 1, easing: "easeInCubic" },
        { at: "100%", value: 0 },
      ],
    },
  };

  /* Whatever the picker chose, not "Image or else Text" — that mapping quietly
     turned every video the reader added into a text element. */
  const known = ["Text", "Image", "Video"];
  const element = {
    id: id || "element",
    type: known.includes(type) ? type : "Text",
    at: framesToTimecode(at, fps),
    duration: framesToTimecode(Math.max(1, duration), fps),
    config: {},
    style: { "&": own },
  };

  if (element.type === "Image" || element.type === "Video") {
    own.height = `${draft.height}px`;
    element.config.src = draft.src;
    /* A video element paints into a canvas it makes itself; an image appends an
       <img>. Static child styles bind fine — only animated ones don't. */
    element.style[element.type === "Video" ? "canvas" : "img"] = {
      width: "100%",
      height: "100%",
      objectFit: "contain",
    };
  } else {
    /* A literal, not `@variables:<name>`.
     *
     * A reference is only valid against the variables the *current* file
     * declares, and this form builds an element for whatever file happens to be
     * loaded — which threw `Unknown variables reference "@variables:body"` and
     * took the page down, because the compositions here declare `ui`, not `body`.
     * An editor may not emit a reference it cannot guarantee resolves. */
    own.fontFamily = "Inter, system-ui, sans-serif";
    own.fontSize = `${draft.fontSize}px`;
    own.fontWeight = 500;
    own.color = draft.color;
    element.config.content = draft.content;
  }

  return element;
}

/**
 * The asset keys a composition has loaded, optionally of one kind.
 *
 * A video element needs a video asset; offering it an image is a guaranteed
 * failure the reader would have to diagnose themselves.
 */
export function assetKeys(config, kind) {
  const media = config.assets?.media || {};
  return Object.keys(media).filter(
    (key) => !kind || media[key]?.type === kind.toLowerCase(),
  );
}

/**
 * Change the frame rate.
 *
 * Nothing in the composition is touched: every element's placement is a timecode,
 * so the same file at 60fps is the same video with twice as many frames in it.
 * That's the argument for storing time as time and deriving frames from it, and
 * it's visible here — the timeline keeps its shape while the frame count doubles.
 */
export function setFps(config, fps) {
  return { ...config, settings: { ...config.settings, fps } };
}

export const FPS_CHOICES = [24, 30, 60, 120, 240];

/**
 * Output size, as an aspect ratio and a height.
 *
 * Resolution genuinely is only an output setting: the authoring space is always
 * 1280 wide and the engine scales the stage to hit whatever it's asked for, so 8K
 * is the same file as 480p with a different number in one field. That's the honest
 * reason a renderer should treat resolution as output rather than as design.
 *
 * **Aspect ratio is not the same kind of thing, which is why there is no list of
 * ratios in this file.** Every placement in the format is an absolute coordinate,
 * and nothing reflows — so a composition cut for a wide frame does not become a
 * vertical one by changing a number, it becomes a wide composition letterboxed
 * inside a vertical frame. A ratio chip is only meaningful if somebody authored a
 * layout for it.
 *
 * So the chips are **derived from the compositions the host actually supplies**
 * (`ratiosFrom`), not declared here. A host that passes one composition gets no
 * ratio row at all; a host that passes three gets three chips. That removes the
 * failure this used to invite — a hardcoded list drifting out of sync with the
 * cuts behind it, offering a control that quietly produces a worse picture.
 */

/** Greatest common divisor, for reducing 1920×1080 to 16:9. */
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * `{ "wide": composition, ... }` → the ratio chips for those compositions.
 *
 * The label is the key the host chose, so it can say "wide"/"vertical" rather
 * than "16:9" if that reads better in context. `w`/`h` come from each
 * composition's own `settings.resolution`, reduced — they only drive the little
 * proportion swatch on the chip, so they must describe the shape rather than the
 * output size.
 */
export function ratiosFrom(variants) {
  return Object.entries(variants || {}).map(([label, composition]) => {
    const [w = 16, h = 9] = composition?.settings?.resolution || [];
    const divisor = gcd(w, h) || 1;
    return { label, w: w / divisor, h: h / divisor };
  });
}

/** Named by the short side, the way everyone actually says it. */
export const RESOLUTIONS = [
  { label: "480p", short: 480 },
  { label: "720p", short: 720 },
  { label: "1080p", short: 1080 },
  { label: "1440p", short: 1440 },
  { label: "4K", short: 2160 },
  { label: "8K", short: 4320 },
];

/** Even dimensions only — odd ones are a real encoder error, not a rounding nit. */
export function resolutionFor(ratio, short) {
  const landscape = ratio.w >= ratio.h;
  const long = Math.round((short * Math.max(ratio.w, ratio.h)) / Math.min(ratio.w, ratio.h));
  const even = (n) => n + (n % 2);
  return landscape ? [even(long), even(short)] : [even(short), even(long)];
}

export function setResolution(config, resolution) {
  return { ...config, settings: { ...config.settings, resolution } };
}

/**
 * Which of `ratios` a composition is currently closest to.
 *
 * Takes the list rather than reading a module constant, because the list now
 * belongs to the host (see `ratiosFrom`). Returns `null` for an empty list — a
 * single-composition demo has no ratio row, and callers must handle that rather
 * than being handed a fabricated default.
 */
export function currentRatio(config, ratios) {
  if (!ratios?.length) return null;
  const [w, h] = config.settings.resolution;
  const actual = w / h;
  return ratios.reduce((best, ratio) =>
    Math.abs(ratio.w / ratio.h - actual) < Math.abs(best.w / best.h - actual)
      ? ratio
      : best,
  );
}

/** Which of `RESOLUTIONS` a composition is currently on, by its short side. */
export function currentResolution(config) {
  const short = Math.min(...config.settings.resolution);
  return RESOLUTIONS.reduce((best, res) =>
    Math.abs(res.short - short) < Math.abs(best.short - short) ? res : best,
  );
}

/** Append an element and return both the new composition and its index. */
export function addElement(config, element) {
  const timeline = [...config.timeline, element];
  return { config: { ...config, timeline }, index: timeline.length - 1 };
}

/** A label for an element, for the timeline and the editor gutter. */
export function elementLabel(el) {
  if (el.id) return el.id;
  const content = el.config?.content;
  if (content) return content.slice(0, 18);
  return el.type.toLowerCase();
}

/**
 * What an element's `type` says it is, in the reader's terms.
 *
 * A component invocation puts a reference in the type field — `@components:statCard`
 * — and expands to several elements when the engine resolves it. Worth naming as
 * what it is rather than printing the raw reference.
 */
export function elementKind(el) {
  const component = /^@components:(.+)$/.exec(el.type);
  if (component) return { kind: "component", name: component[1] };
  return { kind: el.type.toLowerCase(), name: el.type };
}
