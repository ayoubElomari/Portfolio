import { useCallback, useEffect, useRef, useState } from "react";
import { fill, useLabels } from "../labels.js";

/**
 * The input controls for both demos.
 *
 * Two rules drive everything here.
 *
 * **Numbers are dragged, not typed.** Asking a reader to select a field, delete
 * "1036" and type "800" to see what a value does is asking them to stop playing
 * and start doing data entry — most people won't, and the demo goes unused. So a
 * number is a value you push left or right with the mouse, with steppers either
 * side for precision. Typing still works (double-click) for anyone who wants it.
 *
 * **Text commits late.** Every edit reboots the engine, and rebooting on each
 * keystroke makes the picture strobe while you're mid-word. Text fields hold
 * their own value and hand it over once you've stopped.
 */

/* Pixels of horizontal travel per step. Slow enough to land on a value. */
const DRAG_PER_STEP = 3;

/* How long a text field waits after the last keystroke before committing. */
const TEXT_DEBOUNCE_MS = 260;

/* Continuous controls (drag, colour) commit while moving, but not faster than
   the engine can usefully reboot. */
const LIVE_THROTTLE_MS = 55;

/* ── numbers ─────────────────────────────────────────────────────────────── */

export function NumberDrag({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  suffix = "",
  label,
  disabled,
}) {
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const local = useRef(Number(value) || 0);
  const commit = useThrottled(onChange, LIVE_THROTTLE_MS);
  const t = useLabels();
  const named = label || t.valueFallback;

  const clamp = useCallback(
    (n) => Math.min(max, Math.max(min, n)),
    [min, max],
  );

  const startDrag = useCallback(
    (event) => {
      if (disabled || event.button !== 0) return;
      event.preventDefault();
      const node = event.currentTarget;
      node.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      const startValue = Number(value) || 0;
      local.current = startValue;
      let moved = false;

      const move = (e) => {
        const delta =
          Math.round((e.clientX - startX) / DRAG_PER_STEP) *
          step *
          (e.shiftKey ? 5 : 1);
        if (delta === 0 && !moved) return;
        moved = true;
        const next = clamp(startValue + delta);
        if (next === local.current) return;
        local.current = next;
        commit(next);
      };
      const end = () => {
        node.releasePointerCapture?.(event.pointerId);
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerup", end);
        node.removeEventListener("pointercancel", end);
        /* The throttle may have swallowed the last move. */
        if (moved) onChange(local.current);
      };

      node.addEventListener("pointermove", move);
      node.addEventListener("pointerup", end);
      node.addEventListener("pointercancel", end);
    },
    [value, step, clamp, commit, onChange, disabled],
  );

  const nudge = (direction) => onChange(clamp((Number(value) || 0) + direction * step));

  if (typing) {
    return (
      <span className="rb-num rb-num-typing">
        <input
          type="text"
          inputMode="numeric"
          autoFocus
          value={draft}
          aria-label={label}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const parsed = parseFloat(draft);
            if (!Number.isNaN(parsed)) onChange(clamp(parsed));
            setTyping(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setTyping(false);
          }}
        />
      </span>
    );
  }

  return (
    <span className={"rb-num" + (disabled ? " is-disabled" : "")}>
      <button
        type="button"
        className="rb-num-step"
        onClick={() => nudge(-1)}
        disabled={disabled}
        aria-label={fill(t.valueDown, { label: named })}
        tabIndex={-1}
      >
        −
      </button>
      <span
        className="rb-num-value"
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuenow={Number(value) || 0}
        aria-valuemin={min === -Infinity ? undefined : min}
        aria-valuemax={max === Infinity ? undefined : max}
        onPointerDown={startDrag}
        onDoubleClick={() => {
          if (disabled) return;
          setDraft(String(value ?? ""));
          setTyping(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            nudge(-1);
          }
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            nudge(1);
          }
        }}
        title={t.dragTitle}
      >
        {value}
        {suffix && <em className="rb-num-suffix">{suffix}</em>}
      </span>
      <button
        type="button"
        className="rb-num-step"
        onClick={() => nudge(1)}
        disabled={disabled}
        aria-label={fill(t.valueUp, { label: named })}
        tabIndex={-1}
      >
        +
      </button>
    </span>
  );
}

/* ── text ────────────────────────────────────────────────────────────────── */

/**
 * Holds its own text and hands it over once you stop typing.
 *
 * Deliberately uncontrolled: it seeds from `defaultValue` and never syncs back.
 * A controlled field would need to reconcile the parent's value with keystrokes
 * that haven't been committed yet, and the parent's value *is* our own commit
 * arriving late — so every attempt at that reconciliation fights itself and drops
 * characters. To point one of these at a different value, change its `key` and
 * let React give you a fresh one. Call sites do exactly that.
 */
export function DebouncedText({
  defaultValue,
  onChange,
  placeholder,
  label,
  className,
}) {
  const [draft, setDraft] = useState(defaultValue ?? "");
  const timer = useRef(null);
  const pending = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <input
      type="text"
      className={className}
      value={draft}
      placeholder={placeholder}
      aria-label={label}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        pending.current = true;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          pending.current = false;
          onChange(next);
        }, TEXT_DEBOUNCE_MS);
      }}
      onBlur={() => {
        clearTimeout(timer.current);
        if (pending.current) {
          pending.current = false;
          onChange(draft);
        }
      }}
    />
  );
}

/* ── colour ──────────────────────────────────────────────────────────────── */

export function ColorField({ value, onChange, label }) {
  const commit = useThrottled(onChange, LIVE_THROTTLE_MS);
  return (
    <input
      type="color"
      value={value}
      aria-label={label}
      onChange={(e) => commit(e.target.value)}
      onBlur={(e) => onChange(e.target.value)}
    />
  );
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

/**
 * Leading-edge throttle: fires at once, then at most every `ms`. A colour picker
 * drag emits events far faster than an engine reboot is worth doing, and the
 * difference is invisible.
 */
function useThrottled(fn, ms) {
  const last = useRef(0);
  const fnRef = useRef(fn);
  /* Kept current in an effect rather than assigned during render — a ref write
     during render is exactly the kind of thing that makes a component's output
     depend on when it happened to run. */
  useEffect(() => {
    fnRef.current = fn;
  });
  return useCallback(
    (...args) => {
      const now = performance.now();
      if (now - last.current < ms) return;
      last.current = now;
      fnRef.current(...args);
    },
    [ms],
  );
}
