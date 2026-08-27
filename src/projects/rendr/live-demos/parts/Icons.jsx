/**
 * Inline SVG icons, drawn with `currentColor`.
 *
 * Deliberately not glyphs or emoji. `▶`, `⏸`, `↻`, `‹` and friends render as
 * full-colour emoji on iOS, sit on inconsistent baselines, and change width
 * between platforms — the site already carries a note about needing `&#xFE0E;` to
 * talk one arrow out of it. An SVG is the same everywhere and scales with the
 * button, so none of that applies.
 *
 * Each is a 16×16 box with a 1.6 stroke or a solid fill, sized by the caller.
 */

function Svg({ children, label }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : "true"}
      role={label ? "img" : undefined}
      focusable="false"
    >
      {label && <title>{label}</title>}
      {children}
    </svg>
  );
}

export const PlayIcon = () => (
  <Svg>
    <path d="M4.5 2.8 12.8 8l-8.3 5.2Z" fill="currentColor" strokeWidth="1.4" />
  </Svg>
);

export const PauseIcon = () => (
  <Svg>
    <path d="M5.6 3v10M10.4 3v10" strokeWidth="2" />
  </Svg>
);

export const StepBackIcon = () => (
  <Svg>
    <path d="M11.5 3.4 6 8l5.5 4.6ZM4.2 3.2v9.6" />
  </Svg>
);

export const StepForwardIcon = () => (
  <Svg>
    <path d="M4.5 3.4 10 8l-5.5 4.6ZM11.8 3.2v9.6" />
  </Svg>
);

/** Any frame, straight there — a die, because it lands somewhere arbitrary. */
export const JumpIcon = () => (
  <Svg>
    <rect x="2.6" y="2.6" width="10.8" height="10.8" rx="2.4" />
    <circle cx="5.9" cy="5.9" r="0.95" fill="currentColor" stroke="none" />
    <circle cx="10.1" cy="10.1" r="0.95" fill="currentColor" stroke="none" />
  </Svg>
);

export const ResetIcon = () => (
  <Svg>
    <path d="M13 8a5 5 0 1 1-1.6-3.7" />
    <path d="M13.3 2.4v3.1h-3.1" />
  </Svg>
);

export const TrashIcon = () => (
  <Svg>
    <path d="M2.6 4.2h10.8M6.4 4.2V2.7h3.2v1.5M4 4.2l.6 9a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-9M6.6 6.8v5M9.4 6.8v5" />
  </Svg>
);

export const CloseIcon = () => (
  <Svg>
    <path d="M4 4l8 8M12 4l-8 8" />
  </Svg>
);

export const PlusIcon = () => (
  <Svg>
    <path d="M8 3.2v9.6M3.2 8h9.6" />
  </Svg>
);

/** Frame rate: a strip of film. */
export const FpsIcon = () => (
  <Svg>
    <rect x="2.2" y="4" width="11.6" height="8" rx="1.2" />
    <path d="M5.1 4v8M10.9 4v8" strokeWidth="1.2" />
  </Svg>
);

/** Aspect ratio: a frame being reshaped. */
export const RatioIcon = () => (
  <Svg>
    <rect x="2.2" y="4.4" width="11.6" height="7.2" rx="1.2" />
    <path d="M5.6 4.4v7.2" strokeWidth="1.2" strokeDasharray="1.6 1.6" />
  </Svg>
);

/** Output size: a frame with a corner handle. */
export const SizeIcon = () => (
  <Svg>
    <rect x="2.2" y="3.4" width="11.6" height="9.2" rx="1.2" />
    <path d="M9.4 12.6V9.4h3.2" strokeWidth="1.2" />
  </Svg>
);

export const TextIcon = () => (
  <Svg>
    <path d="M3.4 4.2V3h9.2v1.2M8 3v10M6 13h4" />
  </Svg>
);

export const ImageIcon = () => (
  <Svg>
    <rect x="2.2" y="3.2" width="11.6" height="9.6" rx="1.4" />
    <circle cx="6" cy="6.4" r="1.1" />
    <path d="M2.6 11 6.4 8l3 2.4 2-1.6 2 1.8" />
  </Svg>
);

export const VideoIcon = () => (
  <Svg>
    <rect x="2.2" y="3.6" width="8.6" height="8.8" rx="1.4" />
    <path d="M10.8 7.2l3-1.9v5.4l-3-1.9Z" />
  </Svg>
);
