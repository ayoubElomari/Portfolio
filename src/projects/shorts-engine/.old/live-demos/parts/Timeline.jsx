import { useCallback, useEffect, useRef } from "react";
import { trackColor } from "../trackColors.js";
import { elementLabel } from "../edit.js";
import { fill, useLabels } from "../labels.js";

/**
 * One lane per element, each one a window on the frame axis.
 *
 * This is the clearest statement of the model the whole page is about: an element
 * is a range of frame numbers, and a frame is whichever ranges happen to contain
 * it. Dragging the playhead doesn't scrub a video — it asks the engine for the
 * frame under the cursor, and that frame gets computed from its number when the
 * cursor arrives there.
 *
 * Interaction split, on purpose: the ruler scrubs, the clips select. A single
 * surface doing both means every attempt to select an element also moves the
 * playhead, and every scrub that starts on a clip doesn't scrub at all.
 */
export default function Timeline({
  config,
  windows,
  total,
  frame,
  fps,
  selected,
  onSelect,
  onScrub,
  subscribeFrame,
  variant = "full",
}) {
  const compact = variant === "compact";
  const rulerRef = useRef(null);
  const t = useLabels();

  const frameFromEvent = useCallback(
    (event) => {
      const rect = rulerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return 0;
      const ratio = (event.clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(total - 1, Math.round(ratio * total)));
    },
    [total],
  );

  const startScrub = useCallback(
    (event) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      onScrub(frameFromEvent(event));
    },
    [frameFromEvent, onScrub],
  );

  const moveScrub = useCallback(
    (event) => {
      if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) return;
      onScrub(frameFromEvent(event));
    },
    [frameFromEvent, onScrub],
  );

  /**
   * Second marks, stopping *before* the end.
   *
   * A mark at exactly `total` sits at 100% of the track — past the last frame
   * there is, and at the far edge of a scrollable ruler it added an empty column
   * the width of its label with nothing under it. The last real frame is
   * `total - 1`, so a mark is only meaningful while it lands inside that.
   */
  const seconds = Math.floor((total - 1) / fps);
  const ticks = Array.from({ length: seconds + 1 }, (_, i) => i);

  /**
   * The playhead follows every frame, not React's coalesced copy.
   *
   * `frame` is deliberately throttled for the panels (see `useRendrWeb`), which
   * is right for an 800-line JSON view and wrong for the one element whose whole
   * job is to say where you are: at 8Hz it visibly lurches, and during a long
   * render it looked like it was waiting for playback to finish. Writing the
   * position straight to the node keeps it smooth and still costs no re-render.
   */
  const playheadRef = useRef(null);

  /* Position is written here and **only** here. It used to also be an inline
     `style` from the `frame` prop, and the two fought: the subscription put the
     playhead on the live frame, then React re-rendered with its coalesced copy —
     up to 125ms stale — and moved it back. That is the jitter. A value that has a
     per-frame channel must not also be rendered, or every render is a correction
     to something that was already right. */
  const place = useCallback((f, count) => {
    const node = playheadRef.current;
    if (node) node.style.left = `${(f / Math.max(1, count)) * 100}%`;
  }, []);

  const streamed = useRef(false);
  useEffect(() => {
    if (!subscribeFrame) return undefined;
    return subscribeFrame(({ frame: f, totalFrames }) => {
      streamed.current = true;
      place(f, totalFrames);
    });
  }, [subscribeFrame, place]);

  /**
   * Seeds the first paint, and nothing after it.
   *
   * A seek emits a frame event just as playback does, so the stream already
   * covers every way the position can change — which leaves this effect with
   * exactly one job. Letting it also run on `frame` was the residual jitter:
   * React's copy is up to 125ms stale, so each commit dragged the playhead back
   * to where it had been before moving on. Three backward jumps in sixty samples,
   * which is small enough to look like a rendering glitch rather than a fight
   * over who owns the value.
   */
  useEffect(() => {
    if (!streamed.current) place(frame, total);
  }, [frame, total, place]);

  return (
    <div className={"rb-timeline" + (compact ? " is-compact" : "")}>
      <div className="rb-tl-grid">
        <div className="rb-tl-gutter rb-tl-gutter-head">
          <span className="rb-tl-head-label">
            {fill(compact ? t.tlLanesShort : t.tlLanes, {
              n: config.timeline.length,
            })}
          </span>
        </div>

        <div
          className="rb-tl-ruler"
          ref={rulerRef}
          onPointerDown={startScrub}
          onPointerMove={moveScrub}
          role="slider"
          tabIndex={0}
          aria-label={t.frameAria}
          aria-valuemin={0}
          aria-valuemax={total - 1}
          aria-valuenow={frame}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") onScrub(Math.max(0, frame - 1));
            if (e.key === "ArrowRight") onScrub(Math.min(total - 1, frame + 1));
          }}
        >
          {ticks.map((second) => (
            <span
              key={second}
              className="rb-tl-tick"
              style={{ left: `${((second * fps) / total) * 100}%` }}
            >
              <span className="rb-tl-tick-label">{second}s</span>
            </span>
          ))}
        </div>

        <div className="rb-tl-lanes">
        {config.timeline.map((el, i) => {
          const w = windows[i];
          const on = frame >= w.at && frame < w.end;
          return (
            <div className="rb-tl-row" key={i}>
              <div
                className={
                  "rb-tl-gutter rb-tl-label" +
                  (selected === i ? " is-selected" : "") +
                  (on ? " is-on" : "")
                }
                style={{ "--clip-color": trackColor(i) }}
              >
                <button type="button" onClick={() => onSelect(i)}>
                  <span className="rb-tl-swatch" aria-hidden="true" />
                  <span className="rb-tl-name">{elementLabel(el)}</span>
                </button>
              </div>
              <div className="rb-tl-lane">
                <button
                  type="button"
                  className={
                    "rb-tl-clip" +
                    (on ? " is-on" : "") +
                    (selected === i ? " is-selected" : "")
                  }
                  style={{
                    "--clip-color": trackColor(i),
                    left: `${(w.at / total) * 100}%`,
                    width: `${(w.length / total) * 100}%`,
                  }}
                  onClick={() => onSelect(i)}
                  aria-label={fill(t.tlClipAria, {
                    name: elementLabel(el),
                    at: w.at,
                    end: w.end,
                  })}
                >
                  <span className="rb-tl-clip-name">{elementLabel(el)}</span>
                </button>
              </div>
            </div>
          );
        })}

        </div>

        {/* Drawn over the lanes, never in the way of them. */}
        <div className="rb-tl-overlay" aria-hidden="true">
          <span className="rb-tl-playhead" ref={playheadRef} />
        </div>
      </div>
    </div>
  );
}
