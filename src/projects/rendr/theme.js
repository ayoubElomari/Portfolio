/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE ONLY FILE THAT DEFINES A COLOUR FOR THIS PROJECT.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  To change the look of the whole Rendr page — hero, article, demos, timeline
 *  clips, everything — edit ACCENT and its three shades below and nothing else.
 *  No component, no stylesheet and no `.mdx` file contains a literal colour.
 *
 *  How it reaches everything: `page.en.mdx` spreads `rendrStyle` into
 *  `meta.style`, which the template applies as inline custom properties on the
 *  page root (`.project-page`). The hero, the article, the full-width demo slot
 *  and every component inside them are descendants of that root, so each one is
 *  reading these exact values through `var(--rendr-*)`.
 *
 *  Timeline lane colours are no longer defined here — they live in
 *  `live-demos/trackColors.js`, which the live-demos kit owns internally. That
 *  keeps the kit droppable into any project without dragging this page's
 *  palette along with it. This file now only owns the one colour a host is
 *  actually meant to control: the accent.
 *
 *  ── Constraint on ACCENT ──────────────────────────────────────────────────
 *  The hero's primary button paints black ink on a solid accent fill, so ACCENT
 *  must stay bright enough to carry black text (aim for 7:1 or better against
 *  black). If you ever want a genuinely dark accent, set `--project-on-accent-
 *  color` to "#fff" in the returned object instead of fighting the contrast.
 *
 *  Current ACCENT (#b98cff) measures ~8.3:1 against black.
 */

/* Four shades of one hue. If you just want "a different purple", change
 * ACCENT first and see how it looks — the other three are supporting roles
 * and usually still work.
 */
const ACCENT = "#b98cff"; // the main colour. Buttons, links, headings, playhead.
const ACCENT_BRIGHT = "#d9c2ff"; // hover states, highlights, the brightest text on a dark plate.
const ACCENT_DEEP = "#6d3fc4"; // pressed states, borders, the darker half of gradients.
const ACCENT_DIM = "#2a1c47"; // tinted surfaces — panel fills, selected rows, track beds.

export const rendrStyle = {
  /* Retints the shared page chrome — hero, rules, headings, article accents. */
  "--project-accent-color": ACCENT,

  /* Read by the live-demos kit and anything else inside this project's own
     folder. */
  "--rendr-accent": ACCENT,
  "--rendr-accent-bright": ACCENT_BRIGHT,
  "--rendr-accent-deep": ACCENT_DEEP,
  "--rendr-accent-dim": ACCENT_DIM,
};

export default rendrStyle;
