/**
 * The one arrowhead on this page.
 *
 * Open and stroked rather than a filled triangle: a solid head reads heavier
 * than the 1px lines it sits among and would be the only filled mark in any
 * of these figures. Roughly 7px along the diagonal, at 45 degrees, which is
 * the geometry the kit fixes (../.copy/visual-guidelines.md, section 3).
 *
 * It inherits `currentColor`, so the row it sits in decides whether it reads
 * as live or as superseded without this file knowing anything about that.
 */
export function Chevron({ className = "" }) {
  return (
    <svg viewBox="0 0 8 12" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M1.5 1 L6.5 6 L1.5 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Chevron;
