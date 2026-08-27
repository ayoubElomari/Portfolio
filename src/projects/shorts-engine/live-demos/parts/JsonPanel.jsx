import { memo, useEffect, useMemo, useRef } from "react";
import { buildSource, tokenize } from "../jsonSource.js";
import { trackColor } from "../trackColors.js";
import { fill, useLabels } from "../labels.js";

/**
 * The composition, as its own file.
 *
 * Two things are doing the work here. Lines belonging to an element that is on
 * screen at the current frame are lit; lines belonging to the *selected* element
 * carry that element's own colour, the same one its clip has on the timeline. So
 * the file stops being a wall of JSON and becomes a map of what you're looking at.
 *
 * **Why this is split into memoised blocks.** The file is ~450 lines, and during
 * playback the frame changes thirty times a second. Rendering 450 spans on every
 * one of those was the single biggest cost in the demo and it showed up as jank
 * on a phone. Grouping the lines by element means a frame change only re-renders
 * the one or two blocks whose live state actually flipped — everything else is
 * referentially identical and React skips it.
 */
function JsonPanel({ config, frame, windows, selected, onSelect, filename }) {
  const scrollRef = useRef(null);
  const lines = useMemo(() => buildSource(config), [config]);
  const t = useLabels();

  /* Lines grouped into contiguous runs: the head, then one run per element. */
  const blocks = useMemo(() => {
    const out = [];
    lines.forEach((line, i) => {
      const last = out[out.length - 1];
      if (last && last.element === line.element) last.lines.push(line.text);
      /* `start` is the real line number this run begins at, so the gutter counts
         the file rather than counting each block from one. */
      else out.push({ element: line.element, lines: [line.text], start: i + 1 });
    });
    return out;
  }, [lines]);

  /* Bring the selected element's block into view, without yanking the panel
     around while the reader is scrolling it themselves.

     Measured with rects rather than `offsetTop`. `offsetTop` is relative to the
     nearest *positioned* ancestor, and this panel's wrapper is absolute on desktop
     but static on a phone — so the same arithmetic scrolled to the right place on
     a wide screen and to a meaningless offset on a narrow one. Rects are relative
     to the viewport on both. */
  useEffect(() => {
    const panel = scrollRef.current;
    if (!panel || selected === null) return;
    const target = panel.querySelector(`[data-element="${selected}"]`);
    if (!target) return;
    const delta =
      target.getBoundingClientRect().top - panel.getBoundingClientRect().top;
    panel.scrollTo({
      top: Math.max(0, panel.scrollTop + delta - 24),
      behavior: "smooth",
    });
  }, [selected]);

  return (
    <section className="rb-panel rb-json" aria-label={t.jsonAria}>
      <div className="rb-panel-head">
        {/* A filename, not a translated string — it stays the same in every
            language, so it is not in `labels.js`. Supplied by the host, because
            only the host knows what its file is called; when several cuts are
            passed the bench appends the variant name, since each ratio is a
            separately authored file rather than one rescaled. */}
        <span className="rb-panel-title">{filename}</span>
        <span className="rb-panel-meta">
          {fill(t.jsonMeta, { n: config.timeline.length })}
        </span>
      </div>

      <div className="rb-json-scroll" ref={scrollRef} tabIndex={0}>
        <div className="rb-code">
          {blocks.map((block, i) => {
            const w = block.element === null ? null : windows[block.element];
            return (
              <Block
                key={i}
                element={block.element}
                lines={block.lines}
                start={block.start}
                live={Boolean(w) && frame >= w.at && frame < w.end}
                selected={block.element === selected}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

const Block = memo(function Block({
  element,
  lines,
  start,
  live,
  selected,
  onSelect,
}) {
  const isElement = element !== null;
  return (
    <div
      className={
        "rb-block" +
        (isElement ? " rb-block-el" : "") +
        (live ? " is-live" : "") +
        (selected ? " is-selected" : "")
      }
      data-element={isElement ? element : undefined}
      style={isElement ? { "--line-color": trackColor(element) } : undefined}
      onClick={isElement ? () => onSelect(element) : undefined}
    >
      {lines.map((text, i) => (
        <span className="rb-line" key={i}>
          <span className="rb-ln" aria-hidden="true">
            {start + i}
          </span>
          <span className="rb-line-text">
            {tokenize(text).map((token, j) => (
              <span
                key={j}
                className={token.kind ? `rb-t-${token.kind}` : undefined}
              >
                {token.text}
              </span>
            ))}
            {text ? "" : " "}
          </span>
        </span>
      ))}
    </div>
  );
});

export default memo(JsonPanel);
