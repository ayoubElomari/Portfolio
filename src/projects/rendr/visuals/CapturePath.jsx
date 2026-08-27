import { Fragment } from "react";

import { Chevron } from "./Chevron.jsx";
import { useReveal } from "./useReveal.js";

import "./style/CapturePath.scss";

/* Section 4's payoff, and the direct answer to the v1 round trip in section
   2. That figure marked `PNG per frame` as one of two stages the browser
   never needed; this one shows it gone.

   Two rows rather than one pipeline, because this is genuinely a before and
   an after rather than a single flow. They are built to rhyme: both start
   with the browser technology being compared and both end at FFmpeg, so the
   only thing that visibly differs is the middle, which is the whole claim.

   The v1 row steps down the ink scale rather than fading out. Opacity would
   have put a translucent chip over the page ground and gone muddy; a step
   down the scale keeps every edge crisp and still reads as past tense. */

/* `screenshot` and `sharedMemory` are the only two stage names that are
   actual words rather than proper nouns/acronyms (Puppeteer, PNG, FFmpeg,
   CEF), so those are the only two exposed as props — everything else stays
   a literal, unchanged across locales. Defaults match `page.en.mdx`. */
const DEFAULT_LABELS = {
  screenshot: "screenshot",
  sharedMemory: "shared memory",
  srText:
    "Two capture paths compared. In v1 a frame left Puppeteer as a " +
    "screenshot, was encoded to PNG, and only then reached FFmpeg. In v2 it " +
    "goes from CEF into shared memory and straight to FFmpeg, with no image " +
    "encoding between them.",
};

function Row({ version, stages, accent, past }) {
  return (
    <div className={`rendr-cp-row${past ? " is-past" : ""}`}>
      <p className="rendr-cp-version">{version}</p>
      <ol className="rendr-cp-flow">
        {stages.map((label, i) => (
          <Fragment key={label}>
            {i > 0 && (
              <li className="rendr-cp-link" aria-hidden="true">
                <Chevron className="rendr-cp-chevron" />
              </li>
            )}
            <li
              className={`rendr-cp-stage${
                !past && label === accent ? " is-accent" : ""
              }`}
            >
              {label}
            </li>
          </Fragment>
        ))}
      </ol>
    </div>
  );
}

export function CapturePath({ labels } = {}) {
  const { ref, revealed } = useReveal();
  const t = { ...DEFAULT_LABELS, ...labels };

  const v1 = ["Puppeteer", t.screenshot, "PNG", "FFmpeg"];
  const v2 = ["CEF", t.sharedMemory, "FFmpeg"];

  return (
    <figure ref={ref} className={`rendr-cp${revealed ? " is-revealed" : ""}`}>
      <Row version="V1" stages={v1} accent={t.sharedMemory} past />
      <Row version="V2" stages={v2} accent={t.sharedMemory} />

      <span className="rendr-cp-sr">{t.srText}</span>
    </figure>
  );
}

export default CapturePath;
