import { useCallback, useEffect, useRef, useState } from "react";
import {
  JumpIcon,
  PauseIcon,
  PlayIcon,
  StepBackIcon,
  StepForwardIcon,
} from "./Icons.jsx";
import { useLabels } from "../labels.js";

/**
 * Play, step, jump, scrub, and the readout — shared by every demo on the page.
 *
 * The layout rule that drives it: **the buttons and the readout stay on one line,
 * at every width.** They were wrapping onto separate rows on a phone, which reads
 * as two unrelated control strips rather than one transport. So the buttons and
 * the readout are a single non-wrapping row and the scrubber takes its own row
 * below when there isn't room beside them.
 *
 * The readout is tabular-figures and fixed-width per field, so the numbers don't
 * jitter the layout as they count.
 */
export default function Transport({
  playing,
  onPlayPause,
  onScrub,
  frame,
  total,
  fps,
  ready,
  stats,
  rate,
  onRate,
  onStep,
  subscribeFrame,
  marksEvery = 0,
}) {
  const pad = String(Math.max(total - 1, 0)).length;
  const t = useLabels();
  const playLabel = playing ? t.pause : t.play;

  /**
   * The readout and the scrubber follow every frame; the rest of the editor does
   * not.
   *
   * `subscribeFrame` fires on each rendered frame and these write straight to the
   * DOM, so a running composition updates its numbers at the composition's real
   * rate without re-rendering anything. React's copy of `frame` is deliberately
   * coalesced (see `useRendrWeb`), which is right for the JSON panel and the lane
   * highlights and much too slow for a counter somebody is watching tick.
   */
  const frameRef = useRef(null);
  const timeRef = useRef(null);
  const rangeRef = useRef(null);
  const liveFrame = useRef(frame);

  /**
   * Whether the reader is holding the scrubber right now.
   *
   * This used to test `document.activeElement === rangeRef.current`, and focus is
   * the wrong signal: a range input **keeps** focus after the pointer is
   * released, so the scrubber stopped following playback from the first time it
   * was touched until something else was clicked. It looked like the playhead had
   * frozen. Pointer state is the actual question being asked — is a drag in
   * progress — and it ends when the drag does.
   */
  const dragging = useRef(false);
  const releaseTimer = useRef(0);
  const endDrag = useCallback(() => {
    clearTimeout(releaseTimer.current);
    /* A short grace period after release. Without it the very next frame event
       snaps the thumb back to wherever playback had reached while the reader was
       dragging, which reads as the control fighting them. */
    releaseTimer.current = setTimeout(() => {
      dragging.current = false;
      rangeRef.current?.blur();
    }, 350);
  }, []);

  useEffect(() => () => clearTimeout(releaseTimer.current), []);

  const streamed = useRef(false);
  useEffect(() => {
    if (!subscribeFrame) return undefined;
    return subscribeFrame(({ frame: f, timecode: tc }) => {
      streamed.current = true;
      liveFrame.current = f;
      if (frameRef.current) {
        frameRef.current.textContent = String(f).padStart(pad, "0");
      }
      if (timeRef.current) timeRef.current.textContent = tc;
      if (rangeRef.current && !dragging.current) {
        rangeRef.current.value = String(f);
      }
    });
  }, [subscribeFrame, pad]);

  /* Seeds the readout before the first frame event and never competes with it
     afterwards — a seek emits an event too, so the stream is the only writer
     once it has started. See the same note in Timeline. */
  useEffect(() => {
    if (streamed.current) return;
    liveFrame.current = frame;
    if (frameRef.current) {
      frameRef.current.textContent = String(frame).padStart(pad, "0");
    }
    if (timeRef.current) timeRef.current.textContent = timecode(frame, fps);
    if (rangeRef.current && !dragging.current) {
      rangeRef.current.value = String(frame);
    }
  }, [frame, fps, pad]);

  const step = (delta) =>
    onStep ? onStep(delta) : onScrub(liveFrame.current + delta);

  return (
    <div className="rt-transport">
      <div className="rt-row">
        <button
          type="button"
          className="rt-play"
          onClick={onPlayPause}
          disabled={!ready}
          aria-label={playLabel}
          title={playLabel}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <button
          type="button"
          className="rt-btn"
          onClick={() => step(-1)}
          disabled={!ready}
          aria-label={t.prevFrame}
          title={t.prevFrame}
        >
          <StepBackIcon />
        </button>
        <button
          type="button"
          className="rt-btn"
          onClick={() => step(1)}
          disabled={!ready}
          aria-label={t.nextFrame}
          title={t.nextFrame}
        >
          <StepForwardIcon />
        </button>
        <button
          type="button"
          className="rt-btn"
          onClick={() => onScrub(Math.floor(Math.random() * total))}
          disabled={!ready}
          aria-label={t.jumpFrame}
          title={t.jumpTitle}
        >
          <JumpIcon />
        </button>

        <output className="rt-readout">
          {/* Written to directly on every frame — see the subscription above. */}
          {/* Empty on purpose: these carry a per-frame channel, so rendering a
              value into them would have React overwrite the live one with its
              coalesced copy on every commit. The effects below seed and correct
              them; nothing else writes here. */}
          <span className="rt-frame" ref={frameRef} />
          <span className="rt-total">/{String(total).padStart(pad, "0")}</span>
          <span className="rt-time" ref={timeRef} />
        </output>

        {onRate && <RateToggle rate={rate} onRate={onRate} disabled={!ready} />}
        {stats && <FrameCost stats={stats} />}
      </div>

      <span className="rt-range-wrap">
        {marksEvery > 0 && (
          /* Group-of-pictures boundaries. Honest because the clip was encoded here
             with a fixed keyframe interval — see DEMOS.md. */
          <span className="rt-marks" aria-hidden="true">
            {Array.from(
              { length: Math.floor(total / marksEvery) + 1 },
              (_, i) => (
                <span
                  key={i}
                  className="rt-mark"
                  style={{ left: `${((i * marksEvery) / total) * 100}%` }}
                />
              ),
            )}
          </span>
        )}
        <input
          className="rt-range"
          type="range"
          min={0}
          max={Math.max(0, total - 1)}
          ref={rangeRef}
          defaultValue={frame}
          disabled={!ready}
          onPointerDown={() => {
            clearTimeout(releaseTimer.current);
            dragging.current = true;
          }}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={() => {
            dragging.current = true;
            endDrag();
          }}
          onChange={(e) => onScrub(Number(e.target.value))}
          aria-label={t.frameAria}
        />
      </span>
    </div>
  );
}

/* Local copy of the engine's own formatting, to avoid importing the whole module
   into a component that only needs a string. */
function timecode(frame, fps) {
  const ms = Math.round((frame / fps) * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const rest = ms % 1000;
  return (
    [h, m, s].map((n) => String(n).padStart(2, "0")).join(":") +
    "." +
    String(rest).padStart(3, "0")
  );
}

/**
 * Average cost of one `renderFrame()`, polled from a ref so that measuring a frame
 * never causes a render of the thing being measured.
 *
 * Labelled "render" and never "frame time": this is the page-side call only. The
 * engine's real figure also covers a compositor frame, a shared-memory copy and a
 * write into FFmpeg, none of which exist in a browser tab.
 */
function FrameCost({ stats }) {
  const [avg, setAvg] = useState(0);
  const t = useLabels();

  useEffect(() => {
    const id = setInterval(() => {
      const next = stats()?.frameCost ?? 0;
      setAvg((current) => (Math.abs(current - next) > 0.02 ? next : current));
    }, 250);
    return () => clearInterval(id);
  }, [stats]);

  if (!avg) return null;

  return (
    <span className="rt-cost" title={t.costTitle}>
      {avg.toFixed(1)}
      <em>ms</em>
    </span>
  );
}

/**
 * Playback speed.
 *
 * Worth having because it is free: the runtime's clock advances by elapsed time,
 * so a rate is a divisor on one number rather than a second code path. It also
 * makes a point the page is otherwise only able to assert — that "play" here is
 * not a video playing, it is the same single verb (ask for a frame) issued on a
 * timer, which is why it can run at any speed without resampling anything.
 */
function RateToggle({ rate, onRate, disabled }) {
  const t = useLabels();
  const on = rate === 2;
  return (
    <button
      type="button"
      className={"rb-chip rt-rate" + (on ? " is-on" : "")}
      onClick={() => onRate(on ? 1 : 2)}
      disabled={disabled}
      aria-pressed={on}
      aria-label={t.rateAria}
      title={t.rateAria}
    >
      2×
    </button>
  );
}
