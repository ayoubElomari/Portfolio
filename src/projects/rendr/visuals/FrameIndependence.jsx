import { useReveal } from "./useReveal.js";

import "./style/FrameIndependence.scss";

/* The claim in the prose is random access: ask for any frame and it draws,
   without the ones before it. So the figure is the whole span of a
   composition drawn as a comb, with four arbitrary, non-adjacent positions
   tapped. The unevenness of the four taps is the argument. Frame 400 is the
   one the paragraph names, so it carries the single accent.

   Two structural decisions worth keeping in later figures:

   - It is a band on the page ground, not a plate. `<Frame plain>` in the mdx
     drops the border and fill, because a bordered surface is this page's
     reserved signal for "real engine running here" (guidelines section 4).
   - Geometry is SVG, every label is HTML. An SVG that scales to its
     container scales its own text with it, which put these labels at ~6px on
     a phone. Keeping type in HTML holds it at one size across every width
     while the comb below still stretches freely.

   Line weights are 1px and 2px, never anything between. CSS rounds a 1.5px
   border down to 1px at a device pixel ratio of 1 while SVG renders it
   exactly, so any figure built in CSS rather than SVG would quietly disagree
   with this one. Hierarchy is carried by colour and length instead, and 2px
   is spent only on the accent. */

const AXIS_X0 = 24;
const AXIS_X1 = 656;
const VIEW_W = 680;
const TOTAL_FRAMES = 900;

const TAPS = [12, 187, 400, 802];
const ACCENT_FRAME = 400;

const DEFAULT_LABELS = {
  micro: "COMPOSITION TIMELINE",
  srText:
    "Four non-adjacent frames of a composition, 012, 187, 400 and 802, each " +
    "drawn on its own rather than in sequence.",
};

const frameX = (n) => AXIS_X0 + (n / TOTAL_FRAMES) * (AXIS_X1 - AXIS_X0);

/* Every frame in the composition, as one hairline comb, so the four taps
   read as positions inside something continuous rather than as four
   free-floating boxes. */
const TICKS = Array.from(
  { length: Math.floor((AXIS_X1 - AXIS_X0) / 9) + 1 },
  (_, i) => AXIS_X0 + i * 9,
);

export function FrameIndependence({ labels } = {}) {
  const { ref, revealed } = useReveal();
  const t = { ...DEFAULT_LABELS, ...labels };

  return (
    <figure ref={ref} className={`rendr-fi${revealed ? " is-revealed" : ""}`}>
      <p className="rendr-fi-micro">{t.micro}</p>

      <svg
        className="rendr-fi-comb"
        viewBox={`0 0 ${VIEW_W} 56`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {TICKS.map((x) => (
          <line
            key={`tick-${x}`}
            x1={x}
            y1={17}
            x2={x}
            y2={27}
            stroke="var(--pp-whisper)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {TAPS.map((n) => {
          const x = frameX(n);
          const accent = n === ACCENT_FRAME;
          const stroke = accent ? "var(--pp-accent)" : "var(--pp-body)";
          const width = accent ? 2 : 1;
          return (
            <g key={n}>
              <line
                x1={x}
                y1={11}
                x2={x}
                y2={33}
                stroke={stroke}
                strokeWidth={width}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={x}
                y1={37}
                x2={x}
                y2={54}
                stroke={stroke}
                strokeWidth={width}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
      </svg>

      <p className="rendr-fi-marks">
        {TAPS.map((n) => (
          <span
            key={n}
            className={`rendr-fi-frame${n === ACCENT_FRAME ? " is-accent" : ""}`}
            style={{ left: `${(frameX(n) / VIEW_W) * 100}%` }}
          >
            {String(n).padStart(3, "0")}
          </span>
        ))}
      </p>

      <span className="rendr-fi-sr">{t.srText}</span>
    </figure>
  );
}

export default FrameIndependence;
