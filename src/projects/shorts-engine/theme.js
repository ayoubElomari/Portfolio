/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  THE ONLY FILE THAT DEFINES A COLOUR FOR THIS PROJECT.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  `page.<locale>.mdx` spreads `shortsEngineStyle` into `meta.style`, which the
 *  template applies as inline custom properties on the page root
 *  (`.project-page`). Everything below it — hero, article, the bespoke
 *  components, and the live-demo kit — reads these through `var(--…)`.
 *
 *  ── Why the `--rendr-*` block is not optional ─────────────────────────────
 *  `live-demos/` is a copied kit that themes itself entirely off four
 *  `--rendr-accent*` custom properties supplied by its host (see its
 *  README, "Styling"). Nothing defines them by default. Without this file the
 *  demo still runs, but every accented part of it — the play button's fill,
 *  the scrubber, the live frame counter, the edited-row highlight, the JSON
 *  keys — resolves to an empty value and silently loses its colour.
 *
 *  ── Constraint on ACCENT ──────────────────────────────────────────────────
 *  The hero's primary button and the demo's play button both paint dark ink on
 *  a solid accent fill, so ACCENT must stay bright enough to carry it.
 *  #ff6a3d measures ~7.4:1 against black. If it is ever darkened past ~7:1,
 *  set `--project-on-accent-color: "#fff"` here rather than fighting it.
 */

const ACCENT = "#ff6a3d"; // buttons, playhead, links, headings
const ACCENT_BRIGHT = "#ff9670"; // hover, and the brightest text on a dark plate
const ACCENT_DEEP = "#9c3a18"; // borders, pressed states
const ACCENT_DIM = "#2b1712"; // tinted surfaces — panel fills, selected rows

export const shortsEngineStyle = {
  /* Retints the shared page chrome — hero, rules, headings, article accents. */
  "--project-accent-color": ACCENT,

  /* Read by the live-demos kit. */
  "--rendr-accent": ACCENT,
  "--rendr-accent-bright": ACCENT_BRIGHT,
  "--rendr-accent-deep": ACCENT_DEEP,
  "--rendr-accent-dim": ACCENT_DIM,
};

export default shortsEngineStyle;
