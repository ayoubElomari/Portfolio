import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useRendrWeb from "./useRendrWeb.js";
/* No `Composition` import needed here at all — unlike the bench, this component
   has no timeline lanes to lay out, so it never has to parse the file itself. */
import { FPS_CHOICES, setFps } from "./edit.js";
import { compactSnippet, getAtPath, withValueAt } from "./snippet.js";
import { ColorField, DebouncedText, NumberDrag } from "./parts/Fields.jsx";
import Transport from "./parts/Transport.jsx";
import { LabelsContext, fill, useLabels, withLabels } from "./labels.js";
import "./style/MiniDemo.scss";

/**
 * The small demos in the article body.
 *
 * Same runtime as the bench above, one idea at a time, and one or two values you
 * can change. The reader sees only the object those values live in — see
 * `snippet.js` for why that is a parent block rather than a crop of the file —
 * but the whole composition is still what gets handed to the runtime on every
 * change, so the thing responding is the real file, not a fragment of one.
 *
 * ── Why this boots itself, unlike the bench ─────────────────────────────────
 *
 * The bench sits behind "Run the engine" because it is genuinely heavy: two or
 * three video sources, several concurrent decoders. This has none — `edits`
 * touches `Text`/keyframe properties, never `assets.media` — and `AssetStore`
 * only imports `VideoSource` (and with it mp4box.js) when a composition actually
 * declares a video asset. A composition with no video asset never requests it.
 * So there is nothing here worth gating behind a click; auto-starting once the
 * reader scrolls near is the whole cost, and `LazyMiniDemo` already held that
 * back until then. If a mini demo is ever given a video composition, gate that
 * one individually rather than changing this file — the decision belongs to the
 * composition, not to the component.
 */
export default function MiniDemo({
  composition,
  edits,
  poster = 0,
  fpsControl = true,
  meter = false,
  keyframeEvery = 0,
  note,
  labels,
}) {
  const t = useMemo(() => withLabels(labels), [labels]);
  const [config, setConfig] = useState(composition);
  const viewportRef = useRef(null);

  const {
    ready,
    error,
    frame,
    subscribeFrame,
    playing,
    rate,
    totalFrames: total,
    fps,
    toggle,
    seek,
    step,
    setRate,
    stats,
  } = useRendrWeb(viewportRef, config, { enabled: true });

  /* Land on `poster` once, the first time the runtime is ready. Every
     composition used here opens on frame 0, which is also the clock's own
     default — so in practice this never fires — but it is kept for a future
     composition that wants a different opening frame, rather than baking that
     assumption into every caller. */
  const seeded = useRef(false);
  useEffect(() => {
    if (ready && !seeded.current) {
      seeded.current = true;
      if (poster !== 0) seek(poster);
    }
  }, [ready, poster, seek]);

  const change = useCallback(
    (path, value) => setConfig((c) => withValueAt(c, path, value)),
    [],
  );

  const onFps = useCallback(
    (next) => {
      const atTime = frame / fps;
      setConfig((c) => setFps(c, next));
      seek(Math.round(atTime * next));
    },
    [fps, frame, seek],
  );

  const { blocks } = useMemo(
    () => compactSnippet(config, edits),
    [config, edits],
  );

  const [resW, resH] = config.settings.resolution;

  return (
    <LabelsContext.Provider value={t}>
    <div className="rendr-mini">
      <div className="rm-code">
        {blocks.map((block, b) => (
          <div className="rm-block" key={b}>
            {b > 0 && (
              <span className="rm-gap" aria-hidden="true">
                ⋯
              </span>
            )}
            {block.labels.length > 0 && (
              <span className="rm-block-label">{block.labels.join(" · ")}</span>
            )}
            {block.rows.map((row, i) =>
              row.kind === "elide" ? (
                <span className="rm-row rm-row-elide" key={i}>
                  <span className="rm-gutter" />
                  <span className="rm-text">{"    …"}</span>
                </span>
              ) : (
                <span
                  className={"rm-row" + (row.edit ? " is-edit" : "")}
                  key={i}
                >
                  <span className="rm-gutter">{row.n}</span>
                  <span className="rm-text">
                    <span className="rm-key">{row.text}</span>
                    {row.edit ? (
                      <Field
                        edit={row.edit}
                        value={getAtPath(config, row.edit.path)}
                        onChange={change}
                      />
                    ) : (
                      <span className="rm-val">{row.value}</span>
                    )}
                    {row.comma}
                  </span>
                </span>
              ),
            )}
          </div>
        ))}
        {note && <p className="rm-note">{note}</p>}
      </div>

      <div className="rm-view">
        <div
          className="rm-stage-viewport"
          ref={viewportRef}
          style={{ aspectRatio: `${resW} / ${resH}` }}
          onClick={() => ready && toggle()}
          role="button"
          tabIndex={0}
          aria-label={playing ? t.pause : t.play}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              toggle();
            }
          }}
        >
          {/* Rendr Web builds and owns its own stage inside this box. */}
          {!ready && !error && <p className="rm-idle" aria-hidden="true" />}
          {error && <p className="rm-error">{error}</p>}
        </div>

        <Transport
          playing={playing}
          onPlayPause={toggle}
          onScrub={seek}
          frame={frame}
          total={total}
          fps={fps}
          ready={ready}
          stats={meter ? stats : null}
          rate={rate}
          onRate={setRate}
          onStep={step}
          subscribeFrame={subscribeFrame}
          marksEvery={keyframeEvery}
        />

        {fpsControl && (
          <div className="rm-fps">
            <span className="rm-fps-label">fps</span>
            {FPS_CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                className={"rm-chip" + (choice === fps ? " is-on" : "")}
                onClick={() => onFps(choice)}
                disabled={!ready}
              >
                {choice}
              </button>
            ))}
            <span className="rm-fps-note">
              {fill(t.miniFramesNote, { n: total })}
            </span>
          </div>
        )}
      </div>
    </div>
    </LabelsContext.Provider>
  );
}

function Field({ edit, value, onChange }) {
  const t = useLabels();

  if (edit.type === "select") {
    return (
      <span className="rm-field rm-field-select">
        <span className="rm-quote">&quot;</span>
        <select
          value={String(value)}
          onChange={(e) => onChange(edit.path, e.target.value)}
        >
          {edit.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="rm-quote">&quot;</span>
      </span>
    );
  }

  if (edit.type === "color") {
    return (
      <span className="rm-field rm-field-color">
        <span className="rm-quote">&quot;</span>
        <ColorField
          value={String(value)}
          label={edit.label || t.colourFallback}
          onChange={(next) => onChange(edit.path, next)}
        />
        <span className="rm-hex">{String(value)}</span>
        <span className="rm-quote">&quot;</span>
      </span>
    );
  }

  /* A value with a unit — `"1036px"`. Dragged as a number, written back with its
     unit intact, so the file on screen stays a file you could paste into a repo. */
  if (edit.type === "length") {
    const unit = String(value).replace(/^-?[\d.]+/, "") || "px";
    return (
      <span className="rm-field">
        <span className="rm-quote">&quot;</span>
        <NumberDrag
          value={parseFloat(value) || 0}
          min={edit.min}
          max={edit.max}
          step={edit.step ?? 1}
          suffix={unit}
          label={edit.label || t.valueFallback}
          onChange={(next) => onChange(edit.path, `${next}${unit}`)}
        />
        <span className="rm-quote">&quot;</span>
      </span>
    );
  }

  if (edit.type === "number") {
    return (
      <span className="rm-field">
        <NumberDrag
          value={Number(value)}
          min={edit.min}
          max={edit.max}
          step={edit.step ?? 1}
          label={edit.label || t.valueFallback}
          onChange={(next) => onChange(edit.path, next)}
        />
      </span>
    );
  }

  return (
    <span className="rm-field">
      <span className="rm-quote">&quot;</span>
      <DebouncedText
        className="rm-text-input"
        defaultValue={String(value)}
        label={edit.label || t.valueFallback}
        onChange={(next) => onChange(edit.path, next)}
      />
      <span className="rm-quote">&quot;</span>
    </span>
  );
}
