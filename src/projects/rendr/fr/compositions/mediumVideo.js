import backdropUrl from "../../assets/backdrop.mp4";

/**
 * The medium demo's composition: real footage, with type animating over it.
 *
 * Everything here is one render pass. The video is decoded through WebCodecs a
 * group of pictures at a time and painted into a canvas; the title, the rule,
 * the corner marks and every line of type are laid out by the browser on the
 * same frame; the whole thing composites once. That's the argument the page is
 * making, in one picture — a browser is already a compositor, so a renderer
 * built on one gets typography, layout and blending for free rather than
 * having to implement them.
 *
 * Still exactly one video, still just the backdrop for it. The element's own
 * `duration` (12s) is longer than the source clip (6s), so the runtime wraps
 * it — the picture loops without a second file. That fact is stated on
 * screen rather than hidden, because pretending it's twelve seconds of
 * unique footage would be a worse demo than admitting it's six, twice.
 *
 * ── Why the clip is encoded the way it is ──────────────────────────────────
 *
 * `backdrop.mp4` is deliberately **30fps with a keyframe every 4 frames**, and
 * both halves of that matter for playback smoothness rather than for how it
 * looks:
 *
 * `VideoSource` retains only `min(frameCache, MAX_LIVE_FRAMES)` = **4** decoded
 * frames per source — a decoder-liveness ceiling, not a memory one (see
 * `rendr-web/CLAUDE.md`). A group of pictures longer than that window cannot
 * fit in it, so the tail of every group is decoded, thrown away, and then
 * decoded a second time when the playhead reaches it. At a GOP of 8 that meant
 * every group was decoded **twice** and a blocking decode+flush landed on every
 * fourth frame. A GOP of 4 fits the window exactly: every source frame is
 * decoded once, and each stall is half the size.
 *
 * The 30fps half halves the request rate again — at a 60fps composition each
 * source frame covers two composition frames, so a group lasts eight of them.
 * Measured over 240 composition frames: 480 chunk-decodes → **120**, and 60
 * flushes → **30**.
 *
 * If you ever re-encode this clip, keep `-g 4 -bf 0` (B-frames reorder decode
 * order and defeat the window the same way a long GOP does), or this demo gets
 * choppy again for reasons that are invisible in the file.
 *
 * Four beats, back to back, each one fading in and out on its own clock:
 * a title card (claim), then three short call-outs — how it's decoded, the
 * loop disclosed above, and what the editor on the left can actually touch.
 * The title still wipes open with a clip-path rather than a fade — that part
 * is unchanged — but everything here now also has an *out*, not just an in.
 */

export const FPS = 60;

/* The beginning — the title animating in is the thing worth watching. */
export const POSTER_FRAME = 0;

/* A fade shape every beat in this file shares: in over the first ~12%, hold,
   out over the last ~15%. Kept as one function so every beat's timing agrees
   with every other's, and so retiming the whole card is a matter of changing
   the `at`/`duration` pairs below, not re-deriving percentages by hand. */
function fadeInOut() {
  return {
    keyframes: [
      { at: "0%", value: 0, easing: "easeOutQuad" },
      { at: "12%", value: 1 },
      { at: "85%", value: 1 },
      { at: "100%", value: 0, easing: "easeInQuad" },
    ],
  };
}

function riseIn() {
  return {
    keyframes: [
      { at: "0%", value: "translateY(14px)", easing: "easeOutCubic" },
      { at: "18%", value: "translateY(0px)" },
      { at: "100%", value: "translateY(0px)" },
    ],
  };
}

export const mediumVideo = {
  rendr: "v2.1.0",
  settings: {
    fps: FPS,
    resolution: [1920, 1080],
  },

  variables: {
    accent: "#b98cff",
    ink: "#ffffff",
    title: "Décodé, pas prétraité",
    kicker: "rendr-web · WebCodecs, en direct",
    subtitle: "Cette vidéo n'a jamais été précuite dans un fichier. Elle se décode en direct, ici même.",

    /* The three call-outs after the title card. Not wired into `edits` in
       `page.fr.mdx` — the curated set stays on the title card's own words —
       but they're ordinary variables, not literals, so they're still one
       edit away from being exposed later. */
    beat2Tag: "Comment",
    beat2Text:
      "Décodée via WebCodecs, un groupe d'images à la fois, peinte directement dans un canvas.",
    beat3Tag: "Honnêtement",
    beat3Text:
      "Un clip de 6 secondes, en boucle. Ce qui tourne, c'est toute la source, deux fois, pas un enregistrement plus long.",
    beat4Tag: "Tout aussi vrai",
    beat4Text: "Changez le titre, la taille, l'accent. Rien ici ne se reconstruit.",
  },

  assets: {
    media: {
      backdrop: { type: "video", src: backdropUrl },
    },
  },

  timeline: [
    {
      id: "backdrop",
      type: "Text",
      at: "00:00:00.000",
      duration: "00:00:12.000",
      config: { content: "" },
      style: {
        "&": {
          position: "absolute",
          inset: "0",
          zIndex: 1,
          background: "#05040a",
        },
      },
    },
    {
      id: "footage",
      type: "Video",
      at: "00:00:00.000",
      /* Longer than the 6s source on purpose — see the file header. The
         runtime maps composition frames to source frames by ratio and wraps,
         so this plays the clip through twice rather than freezing on its
         last frame. */
      duration: "00:00:12.000",
      config: { src: "@assets:backdrop" },
      style: {
        "&": {
          position: "absolute",
          left: "0",
          top: "0",
          width: "1280px",
          height: "720px",
          zIndex: 2,
        },
        canvas: { width: "100%", height: "100%", objectFit: "cover" },
      },
    },
    {
      id: "scrim",
      type: "Text",
      at: "00:00:00.000",
      duration: "00:00:12.000",
      config: { content: "" },
      style: {
        "&": {
          position: "absolute",
          inset: "0",
          zIndex: 3,
          background:
            "linear-gradient(180deg, rgba(5,4,10,0.15) 0%, rgba(5,4,10,0) 34%, rgba(5,4,10,0.9) 100%)",
        },
      },
    },
    /* A pair of viewfinder ticks — the only elements alive for the full 12s.
       They fade in once, before anything reads as "text", so the frame reads
       as something being aimed and focused rather than a caption dropped
       onto a video, and they hold through every beat that follows. */
    {
      id: "corner-tl",
      type: "Text",
      at: "00:00:00.000",
      duration: "00:00:12.000",
      config: { content: "" },
      style: {
        "&": {
          position: "absolute",
          left: "40px",
          top: "40px",
          width: "26px",
          height: "26px",
          zIndex: 4,
          borderTopWidth: "2px",
          borderTopStyle: "solid",
          borderTopColor: "@variables:accent",
          borderLeftWidth: "2px",
          borderLeftStyle: "solid",
          borderLeftColor: "@variables:accent",
          opacity: {
            keyframes: [
              { at: "0%", value: 0, easing: "easeOutQuad" },
              { at: "6%", value: 0.9 },
              { at: "100%", value: 0.9 },
            ],
          },
        },
      },
    },
    {
      id: "corner-br",
      type: "Text",
      at: "00:00:00.000",
      duration: "00:00:12.000",
      config: { content: "" },
      style: {
        "&": {
          position: "absolute",
          right: "40px",
          bottom: "40px",
          width: "26px",
          height: "26px",
          zIndex: 4,
          borderBottomWidth: "2px",
          borderBottomStyle: "solid",
          borderBottomColor: "@variables:accent",
          borderRightWidth: "2px",
          borderRightStyle: "solid",
          borderRightColor: "@variables:accent",
          opacity: {
            keyframes: [
              { at: "0%", value: 0, easing: "easeOutQuad" },
              { at: "6%", value: 0.9 },
              { at: "100%", value: 0.9 },
            ],
          },
        },
      },
    },

    /* ── beat 1 — the title card, 0.2s–4.6s ─────────────────────────────── */
    {
      id: "kicker",
      type: "Text",
      at: "00:00:00.400",
      duration: "00:00:04.200",
      config: { content: "@variables:kicker" },
      style: {
        "&": {
          position: "absolute",
          left: "72px",
          top: "402px",
          width: "1136px",
          zIndex: 5,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "19px",
          fontWeight: 500,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "@variables:accent",
          opacity: fadeInOut(),
          transform: riseIn(),
        },
      },
    },
    {
      id: "title",
      type: "Text",
      at: "00:00:00.200",
      duration: "00:00:04.400",
      config: { content: "@variables:title" },
      style: {
        "&": {
          position: "absolute",
          left: "72px",
          top: "440px",
          width: "1136px",
          zIndex: 6,
          fontFamily: "Akshar, system-ui, sans-serif",
          fontSize: "92px",
          fontWeight: 600,
          lineHeight: "1.05",
          color: "@variables:ink",
          /* A wipe, done with clip-path rather than opacity: the letters arrive
             edge-first instead of fading, which is what makes it read as a title
             card rather than a cross-dissolve. Opacity is left alone through the
             reveal and only used at the very end, to take the card away. */
          clipPath: {
            keyframes: [
              {
                at: "0%",
                value: "inset(0% 100% 0% 0%)",
                easing: "easeInOutQuart",
              },
              { at: "22%", value: "inset(0% 0% 0% 0%)" },
              { at: "100%", value: "inset(0% 0% 0% 0%)" },
            ],
          },
          opacity: {
            keyframes: [
              { at: "0%", value: 1 },
              { at: "88%", value: 1 },
              { at: "100%", value: 0, easing: "easeInQuad" },
            ],
          },
          transform: {
            keyframes: [
              { at: "0%", value: "translateY(18px)", easing: "easeOutQuart" },
              { at: "22%", value: "translateY(0px)" },
              { at: "100%", value: "translateY(0px)" },
            ],
          },
        },
      },
    },
    {
      id: "underline",
      type: "Text",
      at: "00:00:00.700",
      duration: "00:00:03.900",
      config: { content: "" },
      style: {
        "&": {
          position: "absolute",
          left: "72px",
          top: "566px",
          height: "4px",
          zIndex: 7,
          borderRadius: "2px",
          background: "@variables:accent",
          /* Wipes out from under the title, holds, then leaves with the rest
             of the card. */
          width: {
            keyframes: [
              { at: "0%", value: "0px", easing: "easeOutExpo" },
              { at: "26%", value: "180px" },
              { at: "100%", value: "180px" },
            ],
          },
          opacity: {
            keyframes: [
              { at: "0%", value: 1 },
              { at: "88%", value: 1 },
              { at: "100%", value: 0, easing: "easeInQuad" },
            ],
          },
        },
      },
    },
    {
      id: "subtitle",
      type: "Text",
      at: "00:00:01.000",
      duration: "00:00:03.600",
      config: { content: "@variables:subtitle" },
      style: {
        "&": {
          position: "absolute",
          left: "72px",
          top: "596px",
          width: "760px",
          zIndex: 8,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "24px",
          fontWeight: 400,
          lineHeight: "1.4",
          color: "@variables:ink",
          opacity: fadeInOut(),
          transform: riseIn(),
        },
      },
    },

    /* ── beat 2 — how it decodes, 4.6s–7.4s ─────────────────────────────── */
    {
      id: "beat2-tag",
      type: "Text",
      at: "00:00:04.600",
      duration: "00:00:02.800",
      config: { content: "@variables:beat2Tag" },
      style: {
        "&": {
          position: "absolute",
          left: "72px",
          top: "460px",
          width: "1136px",
          zIndex: 5,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "19px",
          fontWeight: 500,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "@variables:accent",
          opacity: fadeInOut(),
          transform: riseIn(),
        },
      },
    },
    {
      id: "beat2-text",
      type: "Text",
      at: "00:00:04.600",
      duration: "00:00:02.800",
      config: { content: "@variables:beat2Text" },
      style: {
        "&": {
          position: "absolute",
          left: "72px",
          top: "500px",
          width: "980px",
          zIndex: 8,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "34px",
          fontWeight: 500,
          lineHeight: "1.3",
          color: "@variables:ink",
          opacity: fadeInOut(),
          transform: riseIn(),
        },
      },
    },

    /* ── beat 3 — the loop, disclosed, 7.4s–10.0s ───────────────────────── */
    {
      id: "beat3-tag",
      type: "Text",
      at: "00:00:07.400",
      duration: "00:00:02.600",
      config: { content: "@variables:beat3Tag" },
      style: {
        "&": {
          position: "absolute",
          left: "72px",
          top: "460px",
          width: "1136px",
          zIndex: 5,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "19px",
          fontWeight: 500,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "@variables:accent",
          opacity: fadeInOut(),
          transform: riseIn(),
        },
      },
    },
    {
      id: "beat3-text",
      type: "Text",
      at: "00:00:07.400",
      duration: "00:00:02.600",
      config: { content: "@variables:beat3Text" },
      style: {
        "&": {
          position: "absolute",
          left: "72px",
          top: "500px",
          width: "980px",
          zIndex: 8,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "34px",
          fontWeight: 500,
          lineHeight: "1.3",
          color: "@variables:ink",
          opacity: fadeInOut(),
          transform: riseIn(),
        },
      },
    },

    /* ── beat 4 — what the editor can touch, 10.0s–12.0s ────────────────── */
    {
      id: "beat4-tag",
      type: "Text",
      at: "00:00:10.000",
      duration: "00:00:02.000",
      config: { content: "@variables:beat4Tag" },
      style: {
        "&": {
          position: "absolute",
          left: "72px",
          top: "460px",
          width: "1136px",
          zIndex: 5,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "19px",
          fontWeight: 500,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "@variables:accent",
          opacity: fadeInOut(),
          transform: riseIn(),
        },
      },
    },
    {
      id: "beat4-text",
      type: "Text",
      at: "00:00:10.000",
      duration: "00:00:02.000",
      config: { content: "@variables:beat4Text" },
      style: {
        "&": {
          position: "absolute",
          left: "72px",
          top: "500px",
          width: "980px",
          zIndex: 8,
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "34px",
          fontWeight: 500,
          lineHeight: "1.3",
          color: "@variables:ink",
          opacity: fadeInOut(),
          transform: riseIn(),
        },
      },
    },
  ],
};

export default mediumVideo;
