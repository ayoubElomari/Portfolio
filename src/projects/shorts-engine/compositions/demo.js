import gameplay from "../assets/gameplay-loop.mp4";
import avatar from "../assets/avatar.svg";

/**
 * A fresh, original composition in the current `.rendr.json` format
 * (`rendr-web` v2.1.0), not a replay of anything Shorts Engine actually
 * rendered — the old engine (v1.1.6–v1.3.1) used a genuinely incompatible
 * shape (frame timecodes, an audio timeline, a `RedditPost` plugin type; see
 * `.project-details/shorts-engine/facts/08-rendr-json-migration.md`).
 *
 * ── What it is doing, and why it is shaped this way ───────────────────────
 * A `@components:SourceChip` definition — the translucent tag naming the
 * account a story came from — invoked with the subreddit and the username as
 * parameters. That is the argument of the page in miniature: the shape is
 * authored once, and what changes per invocation — per channel, in the real
 * system — is a handful of parameters.
 *
 * The chip slides up into place, holds while the story opens, and slides up
 * out again, which is where the real channels put it: it establishes the
 * source and then stops taking attention from the read.
 *
 * The captions run underneath it for the whole clip, word-synced, the way the
 * real pipeline worked — one script drove both the on-screen tag and the
 * read.
 *
 * ── The coordinate space is 1280 wide, and TALLER than the output ─────────
 * `resolution` is an output size, not a coordinate system (FORMAT.md §2). The
 * authoring space is always 1280 wide, with the height derived from the ratio:
 * `[1080, 1920]` gives **1280 × 2276**. Every number below is a real
 * coordinate in that space, which is why the type sizes look large.
 *
 * ── Content ───────────────────────────────────────────────────────────────
 * The story is written for this page and is deliberately about this project.
 * No real post, no real account, no real subreddit content. The avatar is
 * original artwork rather than a photograph of anyone (see `assets/avatar.svg`).
 * The background clip is re-encoded for exactly this job: 9:16 already (so
 * `cover` crops nothing), 30fps and 180 frames against a 30fps, 180-frame
 * composition (so one composition frame is one source frame, with no decoding
 * of frames nobody sees), and a keyframe every 15 frames. The source is 60fps
 * with a 120-frame GOP, which made every frame request decode up to two
 * seconds of video ahead of it — see `assets/gameplay.mp4` for the original.
 */

const W = 1280;
const H = 2276;

const SEG = 2; // seconds per card, three cards, 6s total

/* The source chip: the little translucent tag that names the account a story
   came from. Geometry kept as one object because every part of the chip is its
   own element (the format has no nesting — see rendr-web `elements/Element.js`)
   and they only hold together if they share one band. */
const CHIP = {
  x: 300,
  y: 230,
  w: 680,
  h: 170,
  pad: 26,
  avatar: 118,
};

/* Every chip element occupies the SAME box — the whole band — and places its
   own content inside with padding and alignment. That is what makes one shared
   pair of tracks correct for all of them: they translate together, and the clip
   that hides the overflow is the same rectangle for each. */
const CHIP_BOX = {
  position: "absolute",
  left: `${CHIP.x}px`,
  top: `${CHIP.y}px`,
  width: `${CHIP.w}px`,
  height: `${CHIP.h}px`,
  display: "flex",
  alignItems: "flex-start",
  boxSizing: "border-box",
};

/**
 * Slide up into the band, hold, slide up out of it.
 *
 * `overflow: hidden` cannot do this here: it would need a parent, and elements
 * are siblings on the stage. `clip-path` does the same job from inside the
 * element — the inset is animated against the transform so the visible edge
 * stays pinned to the band while the content moves through it. Entering, the
 * element sits a full band-height low and is clipped away from the bottom;
 * leaving, it rises a band-height and is clipped away from the top.
 */
const CHIP_ENTER = "8%";
const CHIP_LEAVE = "88%";

const CHIP_MOTION = {
  transform: {
    keyframes: [
      { at: "0%", value: `translateY(${CHIP.h}px)`, easing: "easeOutCubic" },
      { at: CHIP_ENTER, value: "translateY(0px)" },
      { at: CHIP_LEAVE, value: "translateY(0px)", easing: "easeInCubic" },
      { at: "100%", value: `translateY(-${CHIP.h}px)` },
    ],
  },
  /* Percentages, not pixels — and that is not a preference. The interpolator
     decides a value is a shadow list if it contains `<n>px` and isn't a
     transform (`animation/interpolate.js`, `isShadowList`), so `inset(0px 0px
     170px 0px)` gets parsed as x/y/blur/spread and comes back out mangled. In
     percent it takes the token-list path and interpolates correctly. Every
     chip element is exactly the band, so 100% is the band's height either
     way. */
  clipPath: {
    keyframes: [
      { at: "0%", value: "inset(0% 0% 100% 0%)", easing: "easeOutCubic" },
      { at: CHIP_ENTER, value: "inset(0% 0% 0% 0%)" },
      { at: CHIP_LEAVE, value: "inset(0% 0% 0% 0%)", easing: "easeInCubic" },
      { at: "100%", value: "inset(100% 0% 0% 0%)" },
    ],
  },
};

const TEXT_LEFT = CHIP.pad + CHIP.avatar + 28;

const SourceChip = {
  parameters: {
    subreddit: { type: "string", required: true },
    user: { type: "string", required: true },
  },
  timeline: [
    {
      id: "chip-plate",
      type: "Text",
      style: {
        "&": {
          ...CHIP_BOX,
          ...CHIP_MOTION,
          borderRadius: `${CHIP.h / 2}px`,
          backgroundColor: "rgba(10, 10, 12, 0.42)",
          border: "2px solid rgba(255, 255, 255, 0.14)",
          backdropFilter: "blur(18px)",
          zIndex: 10,
        },
      },
    },
    {
      id: "chip-avatar",
      type: "Text",
      style: {
        "&": {
          ...CHIP_BOX,
          ...CHIP_MOTION,
          /* A background rather than an `Image`: an `Image` sizes its `<img>`
             to the whole element, and the element here is the band, not the
             circle. The asset is already round-clipped (`assets/avatar.svg`). */
          backgroundImage: `url(${avatar})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${CHIP.avatar}px ${CHIP.avatar}px`,
          backgroundPosition: `${CHIP.pad}px center`,
          zIndex: 11,
        },
      },
    },
    {
      id: "chip-sub",
      type: "Text",
      config: { content: "{{subreddit}}" },
      style: {
        "&": {
          ...CHIP_BOX,
          ...CHIP_MOTION,
          paddingLeft: `${TEXT_LEFT}px`,
          paddingTop: "39px",
          fontFamily: "var(--secondary-font)",
          fontSize: "46px",
          /* Stated, not inherited: without it the line box picks up the page's
             body line-height and the two lines of the chip overlap. */
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: "#ffffff",
          zIndex: 12,
        },
      },
    },
    {
      id: "chip-user",
      type: "Text",
      config: { content: "{{user}}" },
      style: {
        "&": {
          ...CHIP_BOX,
          ...CHIP_MOTION,
          paddingLeft: `${TEXT_LEFT}px`,
          paddingTop: "97px",
          fontFamily: "var(--secondary-font)",
          fontSize: "34px",
          lineHeight: 1,
          color: "rgba(255, 255, 255, 0.62)",
          zIndex: 12,
        },
      },
    },
    {
      /* The verified badge. Parked against the chip's right edge rather than
         trailing the username, because trailing it would mean knowing how wide
         that string renders — and the username is a parameter. This is also the
         one piece of chip chrome wired to `accent`, so the panel's colour
         control still repaints something. */
      id: "chip-check",
      type: "Text",
      config: { content: "✓" },
      style: {
        "&": {
          ...CHIP_BOX,
          ...CHIP_MOTION,
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: `${CHIP.pad + 18}px`,
          zIndex: 12,
        },
        ".rw-text-content": {
          width: "54px",
          height: "54px",
          borderRadius: "50%",
          backgroundColor: "@variables:accent",
          color: "#12100f",
          fontFamily: "var(--secondary-font)",
          fontSize: "34px",
          fontWeight: 700,
          lineHeight: "54px",
          textAlign: "center",
        },
      },
    },
  ],
};

/* One caption element per card, so the read and the card never drift apart.
   Times are seconds from each element's own start (FORMAT.md §4.2), which is
   why all three begin at 0 rather than at their position on the timeline. */

/* How much of the plate is under this word, 0→1. `Caption` writes the number;
   what it means is decided here. */
const ON = "var(--cap-on, 0)";
/* The stroke has to leave as the plate arrives, or a dark word ends up wearing
   a dark outline for the length of the move. */
const OFF = `(1 - ${ON})`;

const captionStyle = {
  "&": {
    position: "absolute",
    left: "50%",
    top: `${Math.round(H * 0.66)}px`,
    transform: "translate(-50%, -50%)",
    width: "1120px",
    zIndex: 20,
  },
  ".cap-line": {
    /* The marker is positioned against this box — it reads `offsetLeft` /
       `offsetTop` off the word spans, which are relative to the nearest
       positioned ancestor. Without this the plate lands somewhere else
       entirely. */
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.12em 0.24em",
    fontFamily: "var(--primary-font)",
    fontSize: "@variables:captionSize",
    fontWeight: 700,
    lineHeight: 1.06,
    textAlign: "center",
    textTransform: "uppercase",
  },
  ".cap-word": {
    position: "relative",
    zIndex: 1,
    paddingInline: "0.1em",
    borderRadius: "0.1em",
    /* White at rest, near-black under the plate, and every value between —
       the same 0→1 that drives the plate's position drives the ink, so the
       two never disagree about which word is live. */
    color: `color-mix(in srgb, #12100f calc(${ON} * 100%), #ffffff)`,
    /* The real channels ran a heavy stroke so the caption survived any
       background. Same job, done with a shadow stack — faded out by the same
       number, so it is gone exactly when the plate is fully arrived. */
    textShadow: [
      `0 0 26px rgba(0, 0, 0, calc(0.9 * ${OFF}))`,
      `0 5px 0 rgba(0, 0, 0, calc(0.55 * ${OFF}))`,
      `0 -3px 0 rgba(0, 0, 0, calc(0.4 * ${OFF}))`,
    ].join(", "),
  },
  /* The travelling plate. It is taken out of flow so it stops competing with
     the words for space in the flex row — left in flow it shifts the whole
     line sideways as it moves, and the line reads as visibly drifting.
     `Caption` writes its left/top/width/height every frame, interpolated
     between the word it left and the word it is arriving at. */
  ".cap-marker": {
    position: "absolute",
    left: "0px",
    top: "0px",
    zIndex: 0,
    backgroundColor: "@variables:highlight",
    borderRadius: "0.1em",
    willChange: "transform",
  },
};

const caption = (id, at, words) => ({
  id,
  type: "Caption",
  at,
  duration: SEG,
  config: { words, wordsAtOnce: "@variables:wordsAtOnce" },
  style: captionStyle,
});

/* The chip runs once, across the first stretch of the video, the way the real
   channels used it: it says where the story came from and then gets out of the
   way of the read. */
const CHIP_AT = 0;
const CHIP_DURATION = 3.4;

/* The English read, word-timed. `buildComposition` below takes any locale's
   version of these three lines — same word count, same per-word offsets — so
   a translation changes what is said without touching how or when it moves. */
const CAPTIONS_EN = [
  "So[0] I[0.2] let[0.36] a[0.58] bot[0.74] do[1.0] my[1.2] job.[1.38]",
  "It[0] ran[0.2] for[0.42] three[0.6] months[0.84] and[1.12] nobody[1.32] noticed.[1.58]",
  "Then[0] my[0.24] boss[0.44] praised[0.68] me[0.96] for[1.14] the[1.32] extra[1.5] output.[1.72]",
];

/**
 * Build the demo composition from a locale's three caption lines.
 *
 * Everything but the read is fixed: same background, same chip, same
 * timing. `page.<locale>.mdx` supplies only the words.
 */
export function buildComposition(captions) {
  return {
    settings: {
      fps: 30,
      resolution: [1080, 1920],
    },

    variables: {
      accent: "#ff6a3d",
      highlight: "#ff6a3d",
      captionSize: "104px",
      wordsAtOnce: 3,
    },

    components: { SourceChip },

    assets: {
      media: {
        bg: { type: "video", src: gameplay },
      },
    },

    timeline: [
      {
        id: "bg",
        type: "Video",
        at: 0,
        duration: SEG * 3,
        config: { src: "@assets:bg", fit: "cover", position: "center" },
        /* `fit: "cover"` covers the ELEMENT, and an element with no size is not
           a full-frame background — it collapses to the intrinsic size of the
           clip and sits in a corner. The stage rect has to be stated. */
        style: {
          "&": {
            position: "absolute",
            left: "0px",
            top: "0px",
            width: `${W}px`,
            height: `${H}px`,
            zIndex: 0,
          },
        },
      },
      {
        /* Darkens the clip just enough that white captions hold against it,
           heaviest where the captions sit. An empty `Text` with a background is
           the format's own way of making a plate (FORMAT.md §4.2). */
        id: "scrim",
        type: "Text",
        at: 0,
        duration: SEG * 3,
        style: {
          "&": {
            position: "absolute",
            left: "0px",
            top: "0px",
            width: `${W}px`,
            height: `${H}px`,
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 34%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.72) 100%)",
            zIndex: 1,
          },
        },
      },

      {
        id: "chip",
        type: "@components:SourceChip",
        at: CHIP_AT,
        duration: CHIP_DURATION,
        config: { subreddit: "r/stories", user: "u/quietautomator" },
      },

      caption("cap-1", 0, captions[0]),
      caption("cap-2", SEG, captions[1]),
      caption("cap-3", SEG * 2, captions[2]),
    ],
  };
}

export const demoComposition = buildComposition(CAPTIONS_EN);

/* Four values, chosen because each one changes something a reader can see
   immediately and none of them can put the composition into a broken state.
   All four are variables rather than element paths, so one control reaches all
   three cards or all three captions at once. */
export const demoEdits = [
  { path: ["variables", "highlight"], type: "color", label: "highlight" },
  { path: ["variables", "accent"], type: "color", label: "accent" },
  {
    path: ["variables", "captionSize"],
    type: "length",
    label: "captionSize",
    min: 56,
    max: 168,
    step: 2,
  },
  {
    path: ["variables", "wordsAtOnce"],
    type: "number",
    label: "wordsAtOnce",
    min: 1,
    max: 6,
    step: 1,
  },
];
