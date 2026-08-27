import { Fragment } from "react";

import { Chevron } from "./Chevron.jsx";
import { useReveal } from "./useReveal.js";

import "./style/V1RoundTrip.scss";

/* Section 2 describes two blunt fixes, one for getting video in and one for
   getting frames out. Drawn end to end they turn out to be the same shape:
   a real video file at each end, the browser in the middle, and a conversion
   sitting between the browser and each end.

   That symmetry is the figure. The two accented stages are the two things
   the rest of the article removes, base64 in section 5 and the PNG in
   section 4, so a reader who takes this in has already been handed the shape
   of both later payoffs.

   First figure on the page to need an arrowhead. Frame independence and the
   render farm both showed structure rather than direction; a pipeline is
   direction, so this is where the kit's one chevron gets spent.

   The chip, the arrow and the reveal are shared with the capture path figure
   in section 4, and live in style/_kit.scss and Chevron.jsx. Layout stays
   here: the two figures' rows are different widths and so stand up at
   different breakpoints. */

/* `browser` is the one stage name that's an ordinary word rather than a
   filename or acronym, so it's the only one exposed as a prop. */
const DEFAULT_LABELS = {
  browser: "browser",
  srText:
    "A pipeline running from a source clip to a finished video. The clip is " +
    "converted to base64 text before the browser can use it, and the " +
    "browser's frames are converted to PNG images before they can be " +
    "encoded. The browser sits between the two conversions.",
};

export function V1RoundTrip({ labels } = {}) {
  const { ref, revealed } = useReveal();
  const t = { ...DEFAULT_LABELS, ...labels };

  const stages = [
    { label: "clip.mp4", convert: false },
    { label: "base64", convert: true },
    { label: t.browser, convert: false },
    { label: "PNG per frame", convert: true },
    { label: "video.mp4", convert: false },
  ];

  /* No micro label of its own, unlike the other two figures here: the `Frame`
     above it already reads "The v1 round trip", and a second line saying
     "v1, end to end" underneath it was the same sentence twice. */
  return (
    <figure ref={ref} className={`rendr-v1${revealed ? " is-revealed" : ""}`}>
      <ol className="rendr-v1-flow">
        {stages.map((stage, i) => (
          <Fragment key={stage.label}>
            {i > 0 && (
              <li className="rendr-v1-link" aria-hidden="true">
                <Chevron className="rendr-v1-chevron" />
              </li>
            )}
            <li
              className={`rendr-v1-stage${stage.convert ? " is-convert" : ""}`}
            >
              {stage.label}
            </li>
          </Fragment>
        ))}
      </ol>

      <span className="rendr-v1-sr">{t.srText}</span>
    </figure>
  );
}

export default V1RoundTrip;
