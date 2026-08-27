import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useRendrWeb from "./useRendrWeb.js";
import { FPS_CHOICES, setFps } from "./edit.js";
import { compactSnippet, getAtPath, withValueAt } from "./snippet.js";
import Transport from "./parts/Transport.jsx";
import { FpsIcon } from "./parts/Icons.jsx";
import { ColorField, DebouncedText, NumberDrag } from "./parts/Fields.jsx";
import { LabelsContext, fill, useLabels, withLabels } from "./labels.js";
import "./style/MediumDemo.scss";

/**
 * The middle size: a player that is actually worth watching, its controls, and a
 * short snippet underneath.
 *
 * The bench has three panels and a timeline because it is arguing that a video is
 * a data structure. A mini demo is four lines and a small square because it is
 * making one point about one field. This is for the beat in between — when the
 * picture itself is the argument and the file is the footnote. Stacked rather
 * than side-by-side, so the frame gets the full width on every screen.
 *
 * ── The one demo here allowed to auto-start with video already loaded ───────
 *
 * Unlike a mini demo, this size exists specifically to carry real footage — see
 * `compositions/mediumVideo.js`. That is one video source, one decoder, auto-
 * started once the reader scrolls near. Compare the bench, which holds two or
 * three sources behind a click. The difference is not a stricter rule broken
 * here; it is the same rule — auto-start what is cheap enough to not need asking
 * — applied to a demo that happens to have exactly one thing to decode instead of
 * several. If a medium demo is ever built with more than one video source, gate
 * it like the bench.
 */
export default function MediumDemo({
  composition,
  edits = [],
  poster = 0,
  note,
  fpsControl = true,
  labels,
}) {
  const t = useMemo(() => withLabels(labels), [labels]);
  const [config, setConfig] = useState(composition);
  const viewportRef = useRef(null);

  const {
    ready,
    error,
    loading,
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

  /* Land on `poster` once, the first time the runtime is ready — see the same
     note in MiniDemo. `mediumVideo.js` exports `POSTER_FRAME = 0`, which is
     also the clock's own default, so this is dormant for the composition
     actually in use today. */
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
    <div className="rendr-medium">
      <div
        className="md-stage-viewport"
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
        {!ready && !error && <span className="md-idle" aria-hidden="true" />}
        {error && <p className="md-error">{error}</p>}

        {/* The runtime's own loading signal — VideoSource reports fetch/demux/
            decode waits through it — not a guess about one. */}
        {loading && (
          <span className="md-loading">
            <span className="md-spinner" aria-hidden="true" />
            {loading}
          </span>
        )}
      </div>

      <Transport
        playing={playing}
        onPlayPause={toggle}
        onScrub={seek}
        frame={frame}
        total={total}
        fps={fps}
        ready={ready}
        stats={stats}
        rate={rate}
        onRate={setRate}
        onStep={step}
        subscribeFrame={subscribeFrame}
      />

      {fpsControl && (
        <div className="md-fps">
          <span className="md-fps-label">
            <FpsIcon />
            fps
          </span>
          {FPS_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              className={"md-chip" + (choice === fps ? " is-on" : "")}
              onClick={() => onFps(choice)}
              disabled={!ready}
            >
              {choice}
            </button>
          ))}
          <span className="md-fps-note">
            {fill(t.mediumFrames, { n: total })}
          </span>
        </div>
      )}

      {blocks.length > 0 && (
        <div className="md-code">
          {blocks.map((block, b) => (
            <div className="md-block" key={b}>
              {b > 0 && (
                <span className="md-gap" aria-hidden="true">
                  ⋯
                </span>
              )}
              {block.rows.map((row, i) =>
                row.kind === "elide" ? (
                  <span className="md-row md-row-elide" key={i}>
                    <span className="md-gutter" />
                    <span className="md-text">{"    …"}</span>
                  </span>
                ) : (
                  <span
                    className={"md-row" + (row.edit ? " is-edit" : "")}
                    key={i}
                  >
                    <span className="md-gutter">{row.n}</span>
                    <span className="md-text">
                      <span className="md-key">{row.text}</span>
                      {row.edit ? (
                        <Field
                          edit={row.edit}
                          value={getAtPath(config, row.edit.path)}
                          onChange={change}
                        />
                      ) : (
                        <span className="md-val">{row.value}</span>
                      )}
                      {row.comma}
                    </span>
                  </span>
                ),
              )}
            </div>
          ))}
        </div>
      )}

      {note && <p className="md-note">{note}</p>}
    </div>
    </LabelsContext.Provider>
  );
}

function Field({ edit, value, onChange }) {
  const t = useLabels();

  if (edit.type === "color") {
    return (
      <span className="md-field">
        <span className="md-quote">&quot;</span>
        <ColorField
          value={String(value)}
          label={edit.label || t.colourFallback}
          onChange={(next) => onChange(edit.path, next)}
        />
        <span className="md-hex">{String(value)}</span>
        <span className="md-quote">&quot;</span>
      </span>
    );
  }

  if (edit.type === "number" || edit.type === "length") {
    const unit =
      edit.type === "length"
        ? String(value).replace(/^-?[\d.]+/, "") || "px"
        : "";
    return (
      <span className="md-field">
        {unit && <span className="md-quote">&quot;</span>}
        <NumberDrag
          value={parseFloat(value) || 0}
          min={edit.min}
          max={edit.max}
          step={edit.step ?? 1}
          suffix={unit}
          label={edit.label || t.valueFallback}
          onChange={(next) =>
            onChange(edit.path, unit ? `${next}${unit}` : next)
          }
        />
        {unit && <span className="md-quote">&quot;</span>}
      </span>
    );
  }

  return (
    <span className="md-field">
      <span className="md-quote">&quot;</span>
      <DebouncedText
        defaultValue={String(value)}
        label={edit.label || t.valueFallback}
        onChange={(next) => onChange(edit.path, next)}
      />
      <span className="md-quote">&quot;</span>
    </span>
  );
}
