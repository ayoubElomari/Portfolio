/**
 * One colour per element on the timeline, assigned by position.
 *
 * They tint three things at once — the clip on the timeline, the element's block
 * in the JSON panel, and its row in the inspector — which is what makes the
 * panels read as one thing rather than three lists that happen to be adjacent.
 *
 * ── Why these are local, and deliberately not the accent ────────────────────
 *
 * In the original page these came from the project's `theme.js`, alongside its
 * brand purple. That coupling is exactly what this folder exists to remove: a
 * demo you drop into another project should not drag that project's palette with
 * it. So the lane colours live here, and the *accent* — the one colour a host
 * genuinely wants to control — is left to CSS custom properties instead (see
 * `style/README` notes and `--rendr-accent` in the stylesheets).
 *
 * Their job is to be told apart from each other and from whatever accent the host
 * sets, so they are intentionally not variations of one hue. Keep them bright:
 * they sit on a near-black surface. Keep at least eight, so a composition can
 * grow without two lanes colliding.
 *
 * A host that wants its own set can pass `trackColors` to the demos; this is only
 * the default.
 */
export const DEFAULT_TRACK_COLORS = [
  "#ff6b8a", // rose
  "#4fd6ff", // cyan
  "#6ee7a0", // green
  "#ffc44d", // amber
  "#ff8f5c", // orange
  "#8f9dff", // periwinkle
  "#4fe3d1", // teal
  "#ff7ae0", // magenta
];

/**
 * The colour for the element at `index`, wrapping past the end of the palette.
 *
 * `palette` is a parameter rather than a module-level constant so a host can
 * supply its own without this file knowing anything about it.
 */
export function trackColor(index, palette = DEFAULT_TRACK_COLORS) {
  return palette[index % palette.length];
}

export default trackColor;
