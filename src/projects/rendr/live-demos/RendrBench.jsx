import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useRendrWeb from "./useRendrWeb.js";
/* The leaf modules, not the runtime's barrel: `index.js` re-exports the media
   layer, so importing from it here would pull mp4box into the editor's chunk and
   undo the split that keeps the runtime behind the button. Both of these are
   pure parsing with no dependencies of their own. */
import Composition from "@rendr-web/core/Composition.js";
import { timecodeFromFrames } from "@rendr-web/util/timecode.js";
import {
  addElement,
  makeElement,
  patchElement,
  removeElement,
  resolutionFor,
  setFps,
  setResolution,
  setStyleProp,
  setTiming,
  currentRatio,
  currentResolution,
  ratiosFrom,
} from "./edit.js";
import JsonPanel from "./parts/JsonPanel.jsx";
import Timeline from "./parts/Timeline.jsx";
import Inspector from "./parts/Inspector.jsx";
import OutputSettings from "./parts/OutputSettings.jsx";
import Transport from "./parts/Transport.jsx";
import { PlayIcon, ResetIcon } from "./parts/Icons.jsx";
import { LabelsContext, fill, withLabels } from "./labels.js";
import "./style/RendrBench.scss";

/** The engine's authoring space is always 1280 wide, whatever the output resolution. */
const BASE_W = 1280;

/**
 * A composition's own aspect, as a `{ w, h }` the size chips can resize against.
 *
 * Only reached when there is one cut and therefore no ratio list — changing the
 * output size then has to preserve the shape the file was authored at, rather
 * than snapping it to the nearest entry of a list that does not exist.
 */
function shapeOf(config) {
  const [w = 16, h = 9] = config.settings.resolution || [];
  return { w, h };
}

/** How long the playhead rests on the last frame before looping back. */
const LOOP_HOLD_MS = 700;

/**
 * The bench — the real engine, the real format, and a timeline, in one frame.
 *
 * Nothing on screen is a recording or a re-implementation. The file on the left is
 * handed to the vendored engine as-is; the picture on the right is what that engine
 * drew when it was asked for the frame under the playhead. Asking for a frame is the
 * only verb the engine has, so it is the only verb this UI offers.
 *
 * `labels` carries every user-facing string, supplied by whoever mounted this.
 * Nothing in here reads a language context — see `labels.js`.
 *
 * ── Props ───────────────────────────────────────────────────────────────────
 *
 *   composition   a single composition object. Use this or `variants`.
 *   variants      `{ label: composition }` — several authored cuts of the same
 *                 piece. Ratio chips appear only when there is more than one,
 *                 and switching loads the matching cut rather than rescaling,
 *                 because nothing in the format reflows.
 *   defaultVariant  which key to open on. Defaults to the first.
 *   posterFrame   where the playhead rests before play, and where reset returns.
 *   filename      what the file panel calls the file. The variant name is
 *                 appended when there is more than one.
 *   labels        string overrides; see `labels.js`.
 *
 * The compositions are the host's, deliberately. An earlier version imported
 * three specific `.rendr.json` cuts directly, which made the bench unusable by
 * anything but the page it was written for.
 */
export default function RendrBench({
  composition,
  variants,
  defaultVariant,
  posterFrame = 0,
  filename = "composition.rendr.json",
  labels,
}) {
  const t = useMemo(() => withLabels(labels), [labels]);

  /* One composition and a set of them are the same thing to everything below;
     normalising here means no other line has to ask which form was passed. */
  const cuts = useMemo(
    () => variants || { default: composition },
    [variants, composition],
  );
  const firstKey = useMemo(() => Object.keys(cuts)[0], [cuts]);
  const ratios = useMemo(() => ratiosFrom(variants || {}), [variants]);

  /**
   * The authored file the current one is a modification of.
   *
   * "The file as written" depends on which cut you are looking at, since each
   * ratio is a separately authored layout — so both the reset button and the
   * dirty check have to follow the swap, not just the composition itself.
   */
  const [variantKey, setVariantKey] = useState(defaultVariant || firstKey);
  const [pristine, setPristine] = useState(() => cuts[defaultVariant || firstKey]);
  const [config, setConfig] = useState(pristine);
  const [selected, setSelected] = useState(null);

  /**
   * The runtime does not start until it is asked for.
   *
   * Running this fetches two mp4s, demuxes both and stands up a WebCodecs
   * decoder; that is a real cost to hand somebody who came to read the page.
   * Holding it behind a button also means the reader chooses when the expensive
   * thing happens. The file, the timeline and every control are readable before
   * this flips — a composition is data, and reading it never needed a runtime.
   */
  const [started, setStarted] = useState(false);

  const viewportRef = useRef(null);

  /**
   * Everything about running the composition now belongs to Rendr Web.
   *
   * This component used to own a frame loop, a play flag, a stage-fit effect, a
   * timecode formatter and the arithmetic for how long a composition is. All of
   * that is runtime concern, not editor concern — an editor should be a JSON
   * editor. What is left here is the file, the selection, and the layout.
   */
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

  /* The one thing the editor still derives from the file: where each element
     sits on the frame axis, for the lanes and the JSON gutter. It comes from the
     runtime's own parser, so the editor and the picture can never disagree about
     what a timecode means. */
  const { windows, parseError } = useMemo(() => {
    /* Parsing is the one place an edit can produce something invalid, and this
       runs during render — an exception here unmounts the whole page rather than
       showing the reader what they broke. Returned as a value rather than pushed
       into state: setting state from inside a memo is a render-phase side effect,
       and this is derived data, which is what a memo is for. */
    try {
      const parsed = new Composition(config);
      return {
        parseError: null,
        windows: parsed.elements.map((spec) => ({
          at: spec.at,
          end: spec.at + spec.duration,
          length: spec.duration,
        })),
      };
    } catch (err) {
      return { parseError: err?.message || String(err), windows: [] };
    }
  }, [config]);

  /* `short.9x16.rendr.json` when there are several cuts, plain `filename` when
     there is one — the variant is part of the file's identity only if more than
     one file exists. */
  const panelFilename = useMemo(() => {
    if (!variants) return filename;
    const dot = filename.indexOf(".");
    const stem = dot === -1 ? filename : filename.slice(0, dot);
    const rest = dot === -1 ? "" : filename.slice(dot);
    return `${stem}.${String(variantKey).replace(/:/g, "x")}${rest}`;
  }, [filename, variants, variantKey]);

  const [resW, resH] = config.settings.resolution;
  const baseH = Math.round(BASE_W / (resW / resH));
  /* The reader's chosen output size, kept across a ratio swap. */
  const resShort = currentResolution(config).short;

  /**
   * Clicking the picture plays it — unless the click was really a text selection.
   *
   * The rendered frame is selectable (see `.rw-stage` in the stylesheet), and a
   * drag-select ends in a `click` on the viewport just like a tap does. Without
   * a guard, highlighting a caption would also toggle playback, which is the
   * worst kind of bug: it does something reasonable, just not the thing asked
   * for. Two tests, both cheap — did the pointer travel, and is there a
   * selection to show for it.
   */
  const pointerStart = useRef(null);

  const onStagePointerDown = useCallback((event) => {
    pointerStart.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onStageClick = useCallback(
    (event) => {
      if (!ready) return;
      const start = pointerStart.current;
      /* A few pixels of travel is a shaky tap, not a drag. */
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) {
        return;
      }
      /* Covers double-click-to-select-a-word, which never moves the pointer. */
      const selection = window.getSelection?.();
      if (selection && !selection.isCollapsed) return;
      toggle();
    },
    [ready, toggle],
  );

  /* ── edits ───────────────────────────────────────────────────────────────── */
  const scrub = useCallback(
    (next) => {
      seek(next);
    },
    [seek],
  );

  const onPatch = useCallback(
    (index, patch) => setConfig((c) => patchElement(c, index, patch)),
    [],
  );
  const onStyle = useCallback(
    (index, prop, value) =>
      setConfig((c) => setStyleProp(c, index, prop, value)),
    [],
  );
  const onTiming = useCallback(
    (index, timing) => setConfig((c) => setTiming(c, index, timing, fps)),
    [fps],
  );
  const onDelete = useCallback((index) => {
    setConfig((c) => removeElement(c, index));
    setSelected(null);
  }, []);
  const onDeselect = useCallback(() => setSelected(null), []);

  /* Clicking the lane you're already on lets go of it, which is what a reader
     reaches for before they find the × . */
  const onSelect = useCallback(
    (index) => setSelected((current) => (current === index ? null : index)),
    [],
  );

  /* Esc anywhere in the page drops the selection. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onAdd = useCallback(
    (draft) => {
      const { config: next, index } = addElement(
        config,
        makeElement(draft, fps),
      );
      setConfig(next);
      setSelected(index);
      /* Land the playhead inside the new element, so it's on screen immediately
         rather than sitting somewhere the reader has to go looking for. */
      seek(draft.at + Math.min(10, Math.floor(draft.duration / 2)));
    },
    [config, fps, seek],
  );

  /* Changing the frame rate keeps the reader where they were in *time*, not on
     the same frame number — frame 232 at 30fps and frame 232 at 60fps are four
     seconds apart. The runtime clamps and re-emits, so seeking before the
     composition has changed under it is safe. */
  const onFps = useCallback(
    (next) => {
      const atTime = frame / fps;
      setConfig((c) => setFps(c, next));
      seek(Math.round(atTime * next));
    },
    [fps, frame, seek],
  );

  /**
   * Changing the ratio loads the cut that was authored for it.
   *
   * The old behaviour — rewrite `settings.resolution` and leave the composition
   * alone — is right for everything else on this bar and wrong for this one
   * control. Placements are absolute pixels in a 1280-wide space and nothing
   * reflows, so asking a wide cut for a vertical frame doesn't restage it, it
   * letterboxes it. Each chip has a real layout behind it (`short.js`), and the
   * reader's other two choices — frame rate and size — are carried across, since
   * those genuinely are output settings and shouldn't reset because the shape did.
   *
   * Edits do not survive the swap: the incoming file is a different file. That's
   * why `pristine` moves with it, so reset means "this cut, as authored".
   */
  const onRatio = useCallback(
    (ratio) => {
      const authored = cuts[ratio.label];
      if (!authored) return;
      /* Built outside any updater: `setPristine` and `setConfig` have to agree on
         one object, and deriving it inside an updater would run that side effect
         twice under StrictMode. */
      const next = setResolution(
        setFps(authored, fps),
        resolutionFor(ratio, resShort),
      );
      setPristine(next);
      setConfig(next);
      setVariantKey(ratio.label);
      setSelected(null);
    },
    [cuts, fps, resShort],
  );

  const onResolution = useCallback(
    (option) =>
      setConfig((c) =>
        setResolution(
          c,
          /* Falls back to the composition's own shape when there is only one
             cut and therefore no ratio list to match against. */
          resolutionFor(currentRatio(c, ratios) || shapeOf(c), option.short),
        ),
      ),
    [ratios],
  );

  const reset = useCallback(() => {
    setConfig(pristine);
    setSelected(null);
    seek(posterFrame);
  }, [pristine, posterFrame, seek]);

  const dirty = config !== pristine;

  return (
    <LabelsContext.Provider value={t}>
    {/* `rendr-bench-test` is what this folder's stylesheet is scoped to. Both
        classes, because the copy in `src/projects/rendr/` ships the same `.rb-*`
        names on every page — see the header of `style/RendrBench.scss`. */}
    <div className="rendr-bench rendr-bench-test">
      <div className="rb-shell">
        <div className="rb-bar">
          <span className="rb-bar-live">
            <span className="rb-bar-dot" aria-hidden="true" />
            {t.barLive}
          </span>
          <span className="rb-bar-spec">
            {resW}×{resH} · {fps}fps · {fill(t.barFrames, { n: total })}
          </span>
          {dirty && (
            <button
              type="button"
              className="rb-btn rb-btn-ghost rb-btn-reset"
              onClick={reset}
              title={t.resetTitle}
              aria-label={t.resetTitle}
            >
              <ResetIcon />
              {t.reset}
            </button>
          )}
        </div>

        <div className="rb-main">
          {/* The inner wrapper is taken out of flow (see the stylesheet) so a long
              composition can't stretch the row — the stage's aspect ratio is what
              sets the height, and the file scrolls inside whatever that gives. */}
          <div className="rb-left">
            <div className="rb-left-inner">
              <JsonPanel
                config={config}
                frame={frame}
                windows={windows}
                selected={selected}
                onSelect={onSelect}
                filename={panelFilename}
              />
              <Inspector
                config={config}
                selected={selected}
                windows={windows}
                fps={fps}
                frame={frame}
                onPatch={onPatch}
                onStyle={onStyle}
                onTiming={onTiming}
                onDelete={onDelete}
                onDeselect={onDeselect}
                onAdd={onAdd}
              />
            </div>
          </div>

          <section className="rb-panel rb-stage-panel" aria-label={t.stageAria}>
            <div className="rb-panel-head">
              <span className="rb-panel-title">{t.stageTitle}</span>
              <span className="rb-panel-meta rb-mono">
                {timecodeFromFrames(frame, fps)}
              </span>
              {/* The transport's readout is a long way down the page on a phone,
                  so the frame you are looking at gets a second home next to the
                  picture. Hidden at desktop width, where the transport is in
                  view anyway — see `.rb-panel-clock` in the stylesheet. */}
              <StageClock subscribeFrame={subscribeFrame} frame={frame} fps={fps} />
            </div>
            <div
              className="rb-stage-viewport"
              ref={viewportRef}
              style={{ aspectRatio: `${BASE_W} / ${baseH}` }}
              onPointerDown={onStagePointerDown}
              onClick={onStageClick}
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

              {/* Before the engine exists: what it is, what it will cost, and the
                  one control that starts it. */}
              {!started && (
                <div className="rb-stage-gate">
                  <button
                    type="button"
                    className="rb-gate-btn"
                    onClick={() => setStarted(true)}
                  >
                    <PlayIcon />
                    {t.gateStart}
                  </button>
                  <p className="rb-gate-note">{t.gateNote}</p>
                </div>
              )}

              {/* Booting: the engine's own word for what it is doing, when it has
                  one. `stageBooting` covers the gap before the first asset call. */}
              {started && !ready && !error && (
                <p className="rb-stage-status">
                  <span className="rb-stage-spinner" aria-hidden="true" />
                  {loading || t.stageBooting}
                </p>
              )}
              {(error || parseError) && (
                <p className="rb-stage-status rb-stage-error">
                  {fill(t.stageFailed, { error: error || parseError })}
                </p>
              )}
            </div>
          </section>
        </div>

        <OutputSettings
          config={config}
          ratios={ratios}
          onFps={onFps}
          onRatio={onRatio}
          onResolution={onResolution}
        />

        <Transport
          playing={playing}
          onPlayPause={toggle}
          onScrub={scrub}
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

        <div className="rb-tl-slot">
          <Timeline
            config={config}
            windows={windows}
            total={total}
            frame={frame}
            fps={fps}
            selected={selected}
            onSelect={onSelect}
            onScrub={scrub}
            subscribeFrame={subscribeFrame}
          />
        </div>
      </div>

      <p className="rb-caption">{t.benchCaption}</p>
    </div>
    </LabelsContext.Provider>
  );
}

/**
 * A live timecode pinned beside the picture, for narrow screens.
 *
 * On a phone the bench stacks into two screens and the transport's readout ends
 * up well below the stage, so while watching you cannot see where you are. This
 * puts the same number next to the frame it describes, and CSS hides it once the
 * transport is on screen anyway.
 *
 * Subscribes rather than taking the coalesced `frame` prop, for the same reason
 * the transport does: a clock that updates eight times a second reads as broken.
 */
function StageClock({ subscribeFrame, frame, fps }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!subscribeFrame) return undefined;
    return subscribeFrame(({ timecode }) => {
      if (ref.current) ref.current.textContent = timecode;
    });
  }, [subscribeFrame]);
  return (
    <span className="rb-panel-meta rb-mono rb-panel-clock" ref={ref}>
      {timecodeFromFrames(frame, fps)}
    </span>
  );
}
