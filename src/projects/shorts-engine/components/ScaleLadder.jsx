import "../style/ScaleLadder.scss";

/**
 * The scale claim, which the summary makes twice and the page never shows.
 *
 * "The idea" says it was built to run hundreds of channels; "What ran" says
 * three did. Both are true, and the gap between them is the honest core of the
 * project rather than an embarrassment to bury: the count is a parameter, so
 * the shape at three is the shape at a thousand.
 *
 * The three projected counts are the page's own words further down ("ten
 * channels, a hundred, or a thousand"), not a forecast invented here.
 *
 * ── Why only the first step is drawn solid ────────────────────────────────
 * It is the only one that happened. Drawing all four the same way would read
 * as a claim that it ran at those counts, which is exactly the thing this
 * project did not do. Outline is the visual form of "never built", and the
 * note under the ghosts says so in words as well, because a reader skimming
 * for numbers will read "1,000" before they read any border style.
 */
const RAN = {
  count: "3",
  unit: "channels",
  note: "what actually ran",
};

const PROJECTED = ["10", "100", "1,000"];

export default function ScaleLadder({
  unit = RAN.unit,
  note = RAN.note,
  projectedNote = "identical architecture, never built",
}) {
  return (
    <div className="se-scale">
      <div className="se-scale__real">
        <div className="se-scale__count">{RAN.count}</div>
        <div className="se-scale__unit">{unit}</div>
        <div className="se-scale__note">{note}</div>
      </div>

      <div className="se-scale__projected">
        <div className="se-scale__ghosts">
          {PROJECTED.map((count) => (
            <div className="se-scale__ghost" key={count}>
              <div className="se-scale__count">{count}</div>
            </div>
          ))}
        </div>
        <div className="se-scale__note is-projected">{projectedNote}</div>
      </div>
    </div>
  );
}
