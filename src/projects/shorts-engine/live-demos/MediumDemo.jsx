import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useRendrWeb from "./useRendrWeb.js";
import { FPS_CHOICES, setFps } from "./edit.js";
import { compactSnippet, getAtPath, withValueAt } from "./snippet.js";
import Transport from "./parts/Transport.jsx";
import { FpsIcon, PlayIcon } from "./parts/Icons.jsx";
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
  filename,
  hint,
  gated = false,
  gateNote,
  fpsControl = true,
  labels,
}) {
  const t = useMemo(() => withLabels(labels), [labels]);
  const [config, setConfig] = useState(composition);
  const viewportRef = useRef(null);

  /**
   * The gate. Nothing is fetched and no decoder is created until this flips.
   *
   * The auto-start note above holds for a composition whose only cost is the
   * runtime — but this size can carry a real video source, and a gated demo is
   * the honest default once the click buys a genuine download plus mp4box and
   * a hardware decoder. The file below the stage stays readable the whole
   * time: a composition is data, and reading it never needed a runtime.
   */
  const [started, setStarted] = useState(!gated);

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
  } = useRendrWeb(viewportRef, config, { enabled: started });

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
    {/* `se-demo` is a scope, not decoration. Every project that copies this
        kit ships its own byte-similar `MediumDemo.scss` under the same
        `.md-*` / `.rt-*` class names, and a single-page session can have two
        of them in the document at once — at which point the later stylesheet
        silently restyles the earlier project's demo. This class is what keeps
        this project's edits on this project's demo. See the same warning in
        ./README.md, "Styling". */}
    <div className="rendr-medium se-demo">
      <div
        className="md-stage-viewport"
        ref={viewportRef}
        style={{ aspectRatio: `${resW} / ${resH}` }}
        onClick={() => started && ready && toggle()}
        role={started ? "button" : undefined}
        tabIndex={started ? 0 : -1}
        aria-label={started ? (playing ? t.pause : t.play) : undefined}
        onKeyDown={(e) => {
          if (!started) return;
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        {/* Rendr Web builds and owns its own stage inside this box. */}
        {!ready && !error && <span className="md-idle" aria-hidden="true" />}
        {error && <p className="md-error">{error}</p>}

        {/* Before the engine exists: the one control that starts it, and what
            pressing it actually costs. */}
        {!started && (
          <div className="md-gate">
            <button
              type="button"
              className="md-gate-btn"
              onClick={() => setStarted(true)}
            >
              <PlayIcon />
              {t.gateStart}
            </button>
            {gateNote && <p className="md-gate-note">{gateNote}</p>}
          </div>
        )}

        {/* Booting: the engine's own word for what it is doing, when it has
            one. `stageBooting` covers the gap before the first asset call. */}
        {started && !ready && !error && (
          <p className="md-booting">
            <span className="md-spinner" aria-hidden="true" />
            {loading || t.stageBooting}
          </p>
        )}

        {/* The runtime's own loading signal — VideoSource reports fetch/demux/
            decode waits through it — not a guess about one. Only once `ready`:
            before that the centred boot message above is already carrying the
            same string, and two copies of it read as two different waits. */}
        {ready && loading && (
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
          {/* `total` is 0 until the runtime has parsed the composition, and
              "0 frames" beside live-looking chips reads as broken rather than
              as not-started-yet. */}
          {ready && (
            <span className="md-fps-note">
              {fill(t.mediumFrames, { n: total })}
            </span>
          )}
        </div>
      )}

      {blocks.length > 0 && filename && (
        <div className="md-file">
          <span className="md-file-dot" aria-hidden="true" />
          {filename}
          {hint && <span className="md-file-hint">{hint}</span>}
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
