import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * The runtime is fetched on demand, not with the page.
 *
 * A static import of `@rendr-web/index.js` would put the whole runtime in the
 * chunk that has to arrive before anything renders, whether or not this instance
 * is even visible yet. Nothing needs it until `enabled` flips, so it is a dynamic
 * import behind the module cache: one fetch across every `useRendrWeb` on the
 * page, free after the first.
 *
 * This is deliberately the *outer* deferral, not the only one. Whether a given
 * composition has video is a second, independent question the runtime answers
 * for itself: `AssetStore` only imports `VideoSource` — and with it mp4box.js, a
 * ~12,000-line demuxer — when a composition actually declares a video asset. So
 * a text-only mini demo booting here never touches mp4box at all, while the
 * bench (which does have video) pays for it once, on top of this fetch. Two
 * separate deferrals solving two separate costs; neither one is a workaround for
 * the other.
 *
 * This must stay inside a function. `import()` at module scope would be resolved
 * eagerly by the bundler and defeat the split.
 */
let runtimeModule = null;
function loadRuntime() {
  runtimeModule ??= import("@rendr-web/index.js").catch((err) => {
    /* Not cached on failure: a chunk that failed on a dropped connection should
       be retryable, and a rejected promise held in the module scope would make
       every later attempt fail instantly with the same stale error. */
    runtimeModule = null;
    throw err;
  });
  return runtimeModule;
}

/**
 * How long the whole start-up may take before it is called a failure.
 *
 * Generous, because it covers a ~218KB chunk, ~1.8MB of media, a demux and a
 * first decode — on a bad connection that is genuinely slow rather than broken.
 * But it is bounded: a spinner with no end is worse than an honest failure,
 * because the reader cannot tell the difference between slow and stuck, and the
 * only thing they can do about either is know which one it is.
 */
const START_TIMEOUT_MS = 30000;

/** Shown when start-up passes the timeout. Phrased as a state, not a stack trace. */
const TIMED_OUT =
  "the renderer didn't finish starting — the connection may have dropped";

/**
 * React's view of a Rendr Web instance.
 *
 * Deliberately thin. The runtime owns the composition, the clock, the assets and
 * the stage; this hook's only jobs are to create one, tear it down, and translate
 * its events into something React can render — carefully.
 *
 * ── The frame does not go through React state at 60fps ─────────────────────
 *
 * That was the single most expensive thing about the previous version: playback
 * called `setFrame` on every frame, which re-rendered an editor containing an
 * 800-line JSON view, sixty times a second. On a phone that is most of the cost
 * of pressing play.
 *
 * So there are two channels, and picking the right one matters:
 *
 *   `frame`            React state. Coalesced to ~UI_HZ while playing, immediate
 *                      when paused or scrubbing. Everything structural reads this
 *                      — the JSON panel, the inspector, the lane highlights.
 *   `subscribeFrame()` every frame, no re-render. For the handful of things that
 *                      genuinely need per-frame accuracy: the timecode readout,
 *                      the playhead, the scrubber position. They write to a DOM
 *                      node through a ref.
 *
 * Paused, the two are identical — so a scrub is exact and every panel follows it.
 * Playing, the picture stays at the composition's real rate while the panels
 * settle at a rate a person can actually read.
 */

/** How often the React tree may re-render while playback is running. */
const UI_HZ = 8;

export default function useRendrWeb(host, composition, { enabled = true } = {}) {
  const rendrRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [frame, setFrame] = useState(0);
  const [state, setState] = useState({
    playing: false,
    rate: 1,
    loop: true,
    totalFrames: 0,
    fps: 30,
    resolution: [0, 0],
  });

  /* Per-frame subscribers, kept in a ref so adding one never re-renders. */
  const listenersRef = useRef(new Set());
  const subscribeFrame = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  /* The composition is passed on every render; keeping it in a ref lets the
     create-effect depend only on `enabled`, so an edit updates rather than
     rebuilding the runtime. Seeded at construction (so the first create already
     has it) and refreshed in an effect rather than during render. */
  const compositionRef = useRef(composition);
  useEffect(() => {
    compositionRef.current = composition;
  }, [composition]);

  useEffect(() => {
    if (!enabled || !host.current) return undefined;

    let cancelled = false;
    let instance = null;
    let lastUiPush = 0;
    let settled = false;

    const timer = setTimeout(() => {
      if (cancelled || settled) return;
      setError(TIMED_OUT);
    }, START_TIMEOUT_MS);

    loadRuntime()
      .then(({ createRendr }) => {
        /* The effect can be torn down while the chunk is in flight — a fast
           unmount, or StrictMode's double-invoke. Building anyway would leak a
           runtime nothing holds a reference to. */
        if (cancelled || !host.current) return;

        const rendr = createRendr(host.current, compositionRef.current, {
          onFrame: (payload) => {
            for (const listener of listenersRef.current) listener(payload);

            /* Coalesce the React-visible frame. Paused, `playing` is false and
               this is immediate — a scrub must land exactly where it was
               dropped. */
            const now = performance.now();
            if (!rendr.playing || now - lastUiPush >= 1000 / UI_HZ) {
              lastUiPush = now;
              setFrame(payload.frame);
            }
          },
          onState: (next) => setState(next),
          onLoading: ({ loading: isLoading, label }) =>
            setLoading(isLoading ? label : null),
          onError: (err) => setError(err?.message || String(err)),
        });

        instance = rendr;
        rendrRef.current = rendr;
        /* A handle for checking the runtime's own claims from a console —
           decoder counts, frames held, whether an edit reconciled or rebuilt.
           Dev only: it is a debugging affordance, not an API.
           Keyed by `instanceId`, not a single `window.__rendr` — this page can
           and does run several instances at once (the bench, a mini demo, a
           medium demo), and a single global would just be whichever one
           mounted last, silently wrong for the others. */
        if (import.meta.env?.DEV) {
          window.__rendr ??= {};
          window.__rendr[rendr.instanceId] = rendr;
        }
        return rendr.ready().then(() => {
          if (cancelled) return;
          settled = true;
          clearTimeout(timer);
          setReady(true);
          setFrame(rendr.frame);
        });
      })
      .catch((err) => {
        settled = true;
        clearTimeout(timer);
        if (!cancelled) setError(err?.message || String(err));
      });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      rendrRef.current = null;
      setReady(false);
      if (import.meta.env?.DEV && instance) {
        delete window.__rendr?.[instance.instanceId];
      }
      instance?.destroy();
    };
  }, [enabled, host]);

  /* An edit reconciles. This is the whole reason the runtime has `update()`:
     the old version rebooted the engine here, debounced, because rebooting was
     too expensive to do when it was actually asked for. */
  useEffect(() => {
    if (!ready || !rendrRef.current) return;
    rendrRef.current.update(composition).catch(() => {});
  }, [composition, ready]);

  /* Stable identities, so a consumer's `useEffect`/`useCallback` deps don't churn
     every render. Each call reads the ref at call time rather than closing over
     an instance, which is what makes them safe across a teardown. */
  const api = useMemo(
    () => ({
      play: () => rendrRef.current?.play(),
      pause: () => rendrRef.current?.pause(),
      toggle: () => rendrRef.current?.toggle(),
      seek: (f) => rendrRef.current?.seek(f),
      step: (d) => rendrRef.current?.step(d),
      setRate: (r) => rendrRef.current?.setRate(r),
      setLoop: (l) => rendrRef.current?.setLoop(l),
      stats: () => rendrRef.current?.stats() ?? {},
      timecode: (f) => rendrRef.current?.timecode(f) ?? "00:00:00.000",
    }),
    [],
  );

  return {
    rendr: rendrRef,
    ready,
    error,
    loading,
    frame,
    subscribeFrame,
    ...state,
    ...api,
  };
}
