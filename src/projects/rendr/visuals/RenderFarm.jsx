import { useReveal } from "./useReveal.js";

import "./style/RenderFarm.scss";

/* Section 6 argues that a composition can be split across machines, and that
   the split does not have to be even. This figure carries the second, which
   subsumes the first.

   It opens on the same comb of frames the frame independence figure ends on,
   now cut into three runs, so a reader recognises the composition rather than
   meeting three new boxes. That continuity is doing real work: the earlier
   figure already taught that a comb means frames, which is why nothing here
   has to be labelled "frames".

   Run widths are their true share of the 900 frame composition, so the short
   expensive stretch is visibly short. Machine capability is encoded by chip
   height as well as by accent, so it survives a project accent override and a
   reader who cannot separate the hues. The caption names the bigger machine,
   which is what closes the loop on the one chip drawn bigger. */

const RUNS = [
  { start: 1, end: 360, heavy: false },
  { start: 361, end: 500, heavy: true },
  { start: 501, end: 900, heavy: false },
];

const span = (r) => r.end - r.start + 1;

const DEFAULT_LABELS = {
  micro: "COMPOSITION, CUT INTO RANGES",
  orchestrator: "ORCHESTRATOR",
  srText:
    "A composition of 900 frames cut into three ranges of different lengths. " +
    "Each range is rendered at the same time by its own machine, the short " +
    "expensive range going to a visibly larger one, and all three results " +
    "are collected by an orchestrator.",
};

export function RenderFarm({ labels } = {}) {
  const { ref, revealed } = useReveal();
  const t = { ...DEFAULT_LABELS, ...labels };

  return (
    <figure ref={ref} className={`rendr-rf${revealed ? " is-revealed" : ""}`}>
      <p className="rendr-rf-micro">{t.micro}</p>

      <div className="rendr-rf-cols">
        {RUNS.map((r) => (
          <div
            key={r.start}
            className={`rendr-rf-col${r.heavy ? " is-heavy" : ""}`}
            style={{ flexGrow: span(r) }}
          >
            <div className="rendr-rf-comb" />
            <p className="rendr-rf-mark">{String(r.start).padStart(3, "0")}</p>
            <div className="rendr-rf-stem" />
            <div className="rendr-rf-machine" />
            <div className="rendr-rf-drop" />
          </div>
        ))}
      </div>

      <div className="rendr-rf-orchestrator">
        <span>{t.orchestrator}</span>
      </div>

      <span className="rendr-rf-sr">{t.srText}</span>
    </figure>
  );
}

export default RenderFarm;
