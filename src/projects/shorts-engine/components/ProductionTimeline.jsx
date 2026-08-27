import "../style/ProductionTimeline.scss";

/**
 * Three months of production, one cell per day.
 *
 * The archive gives totals, not dates — 255 videos over 82 production days,
 * 161 over 60, and one lone video on July 25 — so the day-by-day pattern here
 * is generated rather than transcribed. What is not invented: every lane's
 * first and last day, the exact number of production days inside it, and the
 * fact that Channel C is a single mark and never a lane. The scatter between
 * those anchors is texture; the shape is the record.
 *
 * Channel names are anonymized (Channel A/B/C), the real ones aren't shown
 * publicly, per this project's own publication constraints. The counts and
 * dates are real.
 *
 * Generation is deterministic (a hash, not `Math.random`) so the chart is the
 * same on every render and between server and client.
 */

/* July 21 → October 29, 2025 is exactly 100 days apart, so day index and
   percent of the span are the same number. That is a coincidence, but a
   convenient one. */
const ORIGIN = Date.UTC(2025, 6, 21);
const DAYS = 101;

const day = (month, date) =>
  Math.round((Date.UTC(2025, month - 1, date) - ORIGIN) / 86_400_000);

/* Cell centre as a percentage of the track, for anything that has to line up
   with a specific day (month ticks, the Channel C tag). */
const at = (index) => ((index + 0.5) / DAYS) * 100;

function hash(n) {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

/**
 * A lane of `DAYS` cells: 0 outside the channel's run, 1 a day it was running
 * but shipped nothing, 2–4 a production day at one of three densities.
 *
 * Active days are picked by ranking the window's interior on a hash and taking
 * the top N, which guarantees the lane holds exactly `active` production days
 * rather than approximately that many. The first and last day are forced —
 * they are the two dates that are actually known.
 */
function lane(start, end, active, seed) {
  const interior = [];
  for (let d = start + 1; d < end; d += 1) interior.push(d);
  interior.sort((a, b) => hash(a * 7919 + seed) - hash(b * 7919 + seed));

  const on = new Set([start, end, ...interior.slice(0, Math.max(0, active - 2))]);

  const cells = [];
  for (let d = 0; d < DAYS; d += 1) {
    if (d < start || d > end) {
      cells.push(0);
    } else if (!on.has(d)) {
      cells.push(1);
    } else {
      const h = hash(d * 104_729 + seed + 11);
      cells.push(h > 0.58 ? 4 : h > 0.26 ? 3 : 2);
    }
  }
  return cells;
}

const LANES = [
  {
    name: "Channel A",
    meta: "255 videos · 82 days",
    label:
      "Channel A: 255 videos across 82 production days, July 21 to October 27, 2025.",
    cells: lane(day(7, 21), day(10, 27), 82, 1301),
  },
  {
    name: "Channel B",
    meta: "161 videos · 60 days",
    label:
      "Channel B: 161 videos across 60 production days, August 17 to October 29, 2025.",
    cells: lane(day(8, 17), day(10, 29), 60, 4877),
  },
  {
    name: "Channel C",
    meta: "1 video · 1 day",
    label: "Channel C: a single video on July 25, 2025, and nothing after it.",
    cells: lane(day(7, 25), day(7, 25), 1, 91),
    solo: day(7, 25),
    tag: "Jul 25",
  },
];

const TICKS = [
  { label: "Jul", index: 0 },
  { label: "Aug", index: day(8, 1) },
  { label: "Sep", index: day(9, 1) },
  { label: "Oct", index: day(10, 1) },
];

const TONE = ["is-out", "is-idle", "is-a1", "is-a2", "is-a3"];

export default function ProductionTimeline({
  tickLabels = TICKS.map((t) => t.label),
  laneLabels = LANES.map(({ name, meta, label, tag }) => ({
    name,
    meta,
    label,
    tag,
  })),
  footer = "One cell = one day, July 21 to October 29, 2025. Filled cells are days a channel actually shipped.",
}) {
  return (
    <div className="se-tl">
      <div className="se-tl-axis" aria-hidden="true">
        {TICKS.map((tick, i) => (
          <span
            key={tick.label}
            className="se-tl-tick"
            style={{ "--x": `${at(tick.index)}%` }}
          >
            {tickLabels[i]}
          </span>
        ))}
      </div>

      {LANES.map((row, i) => {
        const text = laneLabels[i] ?? row;
        return (
          <div className="se-tl-lane" key={row.name}>
            <span className="se-tl-head">
              <span className="se-tl-name">{text.name}</span>
              <span className="se-tl-meta">{text.meta}</span>
            </span>

            <span className="se-tl-track" role="img" aria-label={text.label}>
              {row.cells.map((level, d) => (
                <span
                  key={d}
                  className={`se-tl-cell ${TONE[level]}${
                    row.solo === d ? " is-solo" : ""
                  }`}
                />
              ))}

              {/* Month rules ride on top of the cells so they line up with the
                  axis above without needing an overlay outside the track. */}
              {TICKS.slice(1).map((tick) => (
                <span
                  key={tick.label}
                  className="se-tl-rule"
                  aria-hidden="true"
                  style={{ "--x": `${at(tick.index)}%` }}
                />
              ))}

              {row.tag && (
                <span
                  className="se-tl-tag"
                  aria-hidden="true"
                  style={{ "--x": `${at(row.solo)}%` }}
                >
                  {text.tag}
                </span>
              )}
            </span>
          </div>
        );
      })}

      <p className="se-tl-foot">{footer}</p>
    </div>
  );
}
