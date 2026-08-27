import { demux } from "./demux.js";
import Samples from "./Samples.js";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  A decoded video, kept as small as it is possible to keep one.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This class is the reason the rewrite exists. The original held decoded frames
 * as `ImageBitmap`s, cached whole groups of them, and built a `VideoDecoder` per
 * group that it never closed. On a desktop that is waste; on a phone it is a
 * crash, and it was.
 *
 * Three decisions, each worth more than any amount of tuning the old one:
 *
 * **1. Frames stay `VideoFrame`s.**
 * A decoder emits `VideoFrame`s in the codec's own layout — 4:2:0, twelve bits a
 * pixel. Converting one to an `ImageBitmap` uploads it as RGBA: 32 bits a pixel,
 * **2.7× larger**, and a GPU texture that garbage collection will not reclaim. A
 * canvas can draw a `VideoFrame` directly, so the conversion bought nothing and
 * cost the difference. At 854×480 that is ~600KB a frame instead of ~1.6MB.
 *
 * **2. One decoder, reused for the life of the source.**
 * A `VideoDecoder` is a handle on a hardware pipeline and platforms allow only a
 * handful at once. It is configured once and flushed between groups, which is a
 * state reset, not a teardown. Nothing here constructs a decoder per group.
 *
 * **3. The cache is small and bounded by the device.**
 * `capabilities.frameCache` frames, LRU, evicted by closing. A renderer showing
 * frame *n* needs frame *n*; the runway is for playback, not for a library. When
 * a scrub lands outside it, re-decoding one group is cheap — the *samples* are
 * still in memory, which is the expensive thing to have thrown away and the one
 * thing this never throws away.
 *
 * ── Frame indices ──────────────────────────────────────────────────────────
 *
 * Callers speak display order ("the 47th frame someone sees"). Internally
 * everything is decode order, because that is the order the codec requires
 * frames be fed in. `Samples` owns the map between them.
 */
/**
 * The hard ceiling on frames alive at once, whatever the device profile says.
 *
 * This is not a memory budget — it is a decoder-liveness limit. Platform decoder
 * pools are small and undiscoverable, so the safe number is "few", and a
 * high-memory phone does not get a bigger pool for having more RAM.
 */
const MAX_LIVE_FRAMES = 4;

export default class VideoSource {
  #src;
  #capabilities;
  #onLoading;
  #timeout;

  #samples = null;
  #config = null;
  #decoder = null;
  /** Set by the decoder's own error callback, which fires outside any await. */
  #decoderError = null;

  /** decodeIndex → VideoFrame, insertion-ordered so the oldest is first. */
  #cache = new Map();
  /** GOP start → in-flight decode, so concurrent requests share one pass. */
  #inflight = new Map();
  /** Serialises decodes: one decoder and one sink means one at a time. */
  #chain = Promise.resolve();
  /** Set while a decode is running; collects the decoder's output. */
  #sink = null;
  /** The half-open range of frames the running decode is retaining. */
  #retainFrom = 0;
  #retainTo = 0;

  constructor(src, { capabilities, onLoading, timeout = 15000 } = {}) {
    this.#src = src;
    this.#capabilities = capabilities;
    this.#onLoading = onLoading || null;
    this.#timeout = timeout;
    this.type = "video";
    this.properties = {};
    this.loaded = false;
  }

  get src() {
    return this.#src;
  }

  /** Frames currently decoded and held. The number to watch on a phone. */
  get framesHeld() {
    return this.#cache.size;
  }

  /** Approximate bytes of decoded frames held, at 12 bits a pixel (4:2:0). */
  get bytesHeld() {
    const { width = 0, height = 0 } = this.properties;
    return Math.round(this.#cache.size * width * height * 1.5);
  }

  get frameCount() {
    return this.#samples?.length ?? 0;
  }

  async load() {
    if (this.loaded) return this;
    await this.#report("Loading video", async () => {
      const response = await withTimeout(fetch(this.#src), this.#timeout);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${this.#src}: ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      const { samples, displayToDecodeIndex, config, properties } =
        await demux(buffer);

      if (!this.#capabilities.hasWebCodecs) {
        throw new Error("This browser has no WebCodecs — video cannot decode.");
      }
      const support = await VideoDecoder.isConfigSupported(config);
      if (!support.supported) {
        throw new Error(`Unsupported video codec: ${config.codec}`);
      }

      this.#samples = new Samples(samples, displayToDecodeIndex);
      this.#config = config;
      this.properties = properties;
      this.loaded = true;
    });
    return this;
  }

  /**
   * The frame at a display index, or null.
   *
   * Returned frames are **borrowed**: the source owns them and will close them
   * when they fall out of the cache. A caller draws and forgets. Closing one
   * yourself will empty somebody else's picture.
   */
  async frameAt(displayIndex) {
    if (!this.loaded) return null;

    const index = this.#samples.decodeIndex(displayIndex);
    if (index === undefined) return null;

    const hit = this.#cache.get(index);
    if (hit) {
      /* Re-insert to mark it most-recent. A held segment asks for the same
         frame repeatedly and it must not age out underneath itself. */
      this.#cache.delete(index);
      this.#cache.set(index, hit);
      return hit;
    }

    await this.#decodeGroupFor(index);
    const decoded = this.#cache.get(index);
    if (decoded) return decoded;

    /* A decode of this group was already running for a *different* target, so it
       retained a window that doesn't include this frame. Now that it has finished,
       ask again — this time the window will be built around what we want. One
       retry only: a second miss means the frame genuinely isn't producible. */
    await this.#decodeGroupFor(index);
    return this.#cache.get(index) ?? null;
  }

  /**
   * Drop every decoded frame, keeping the samples and the decoder.
   *
   * For a clip that has left the screen. Coming back costs one group's decode
   * rather than a refetch and a re-demux, which is what makes it safe to do this
   * the moment a clip is no longer drawn instead of guessing whether it will be
   * wanted again.
   */
  releaseFrames() {
    const freed = this.bytesHeld;
    for (const frame of this.#cache.values()) frame.close();
    this.#cache.clear();
    return freed;
  }

  /** Everything: frames, decoder, samples. The source is unusable after this. */
  destroy() {
    this.releaseFrames();
    this.#closeDecoder();
    this.#inflight.clear();
    this.#samples = null;
    this.#config = null;
    this.loaded = false;
  }

  /* ── decoding ───────────────────────────────────────────────────────────── */

  /**
   * Decode the group containing `index`.
   *
   * A group is the unit because it is the unit the codec allows: every frame
   * except the keyframe is a difference from its neighbours, so the only way to
   * reach frame 47 is to decode forward from the keyframe at or before it.
   *
   * Concurrent callers wanting the same group share one pass — during playback
   * several elements and a re-render can all land on the same group in the same
   * tick, and decoding it three times would be three times the work and three
   * times the frames alive at once.
   */
  #decodeGroupFor(index) {
    const [start, end] = this.#samples.gopRange(index);
    const existing = this.#inflight.get(start);
    if (existing) return existing;

    /**
     * Decodes are serialised per source.
     *
     * There is **one** decoder and **one** `#sink` here, so two decodes running
     * at once would feed the same pipeline from two places and route each other's
     * output into the wrong collection. That is not hypothetical: this
     * composition has two elements pointing at the same clip at different
     * in-points, and a scrub across them asks for two groups in the same tick.
     * Chaining costs a little latency and removes the whole class of problem.
     */
    const run = this.#chain
      .catch(() => {})
      .then(() => this.#decodeGroupNow(index, start, end));
    this.#chain = run.catch(() => {});
    this.#inflight.set(start, run);
    return run.finally(() => {
      if (this.#inflight.get(start) === run) this.#inflight.delete(start);
    });
  }

  #decodeGroupNow(index, start, end) {

    /**
     * The window of this group worth keeping.
     *
     * **A decoded frame you are holding is a buffer the decoder cannot decode
     * into.** Hardware decoders own a small, fixed pool of output buffers, so an
     * application that retains frames faster than it releases them does not use
     * more memory — it *stalls the decoder*, silently and with no error. Measured
     * here before this existed: 12 chunks fed, 9 frames out, `flush()` pending
     * forever, nothing on the console.
     *
     * So frames outside the window are closed the moment they arrive, and only a
     * handful are ever alive at once. The window starts at the frame actually
     * being asked for and runs forward, which is the direction playback goes: the
     * next few requests are hits, and when it runs out the group is decoded again
     * from its keyframe. That re-decode is the cost of the guarantee, and it is
     * the right trade — decoding is work, and starving is a hang.
     */
    const keep = Math.max(1, Math.min(this.#capabilities.frameCache, MAX_LIVE_FRAMES));
    this.#retainFrom = index;
    this.#retainTo = index + keep;

    const run = this.#report(`Decoding frames ${start}–${end}`, async () => {
      const decoder = this.#ensureDecoder();
      const produced = [];
      this.#sink = (frame) => {
        if (frame.timestamp >= this.#retainFrom && frame.timestamp < this.#retainTo) {
          produced.push(frame);
        } else {
          /* Not wanted, and holding it would cost the decoder a buffer. */
          frame.close();
        }
      };

      try {
        for (let i = start; i <= end; i++) {
          const sample = this.#samples.sample(i);
          decoder.decode(
            new EncodedVideoChunk({
              type: sample.is_sync ? "key" : "delta",
              /* The decode index travels as the timestamp and comes back
                 attached to the frame — that is how output is matched to
                 input without tracking order. */
              timestamp: i,
              duration: (sample.duration * 1e6) / sample.timescale,
              data: sample.data,
            }),
          );
        }
        /* Flush rather than close: it drains the pipeline and leaves the decoder
           configured and ready for the next group's keyframe. */
        await decoder.flush();
        /* The decoder's `error` callback fires out of band, so a failure can
           land without `flush()` rejecting. Checked here so a broken pipeline
           is torn down instead of being fed forever. */
        if (this.#decoderError) throw this.#decoderError;
      } catch (err) {
        /* A decoder that errored is not reusable. Drop it; the next request
           builds a fresh one rather than feeding a dead pipeline forever. */
        for (const frame of produced) frame.close();
        this.#closeDecoder();
        throw err;
      } finally {
        this.#sink = null;
      }

      /* Destroyed or released while this was in flight — these frames belong to
         nobody now, and `#keep` would put them into a cache that is meant to be
         empty. Close them here or they are exactly the leak this class exists to
         prevent. */
      if (!this.loaded) {
        for (const frame of produced) frame.close();
        return;
      }
      for (const frame of produced) this.#keep(frame);
    });

    return run;
  }

  #ensureDecoder() {
    if (this.#decoder && this.#decoder.state !== "closed") return this.#decoder;
    this.#decoder = new VideoDecoder({
      output: (frame) => {
        if (this.#sink) this.#sink(frame);
        /* No sink means the decode that asked for this was abandoned (a
           destroy, or an error). The frame still has to be closed or it
           leaks exactly like the ones this class exists to stop leaking. */
        else frame.close();
      },
      error: (err) => {
        this.#decoderError = err;
      },
    });
    this.#decoderError = null;
    this.#decoder.configure(this.#config);
    return this.#decoder;
  }

  #closeDecoder() {
    if (this.#decoder && this.#decoder.state !== "closed") this.#decoder.close();
    this.#decoder = null;
  }

  /**
   * Insert into the cache, evicting the oldest past the ceiling.
   *
   * **The existing entry for a timestamp must be closed before it is replaced.**
   * A `Map.set` over an occupied key drops the old value silently, and the old
   * value here is a `VideoFrame` — a handle that only `close()` releases. Looping
   * playback decodes the same group again on every pass and produces frames with
   * the same timestamps, so without this every loop stranded a group's worth of
   * frames: the console fills with "A VideoFrame was garbage collected without
   * being closed" and memory climbs for as long as it plays. It showed up first
   * at 9:16 only because that stage is three times the area of the others and
   * therefore reaches the ceiling first — the leak was never ratio-specific.
   */
  #keep(frame) {
    const limit = Math.max(
      1,
      Math.min(this.#capabilities.frameCache, MAX_LIVE_FRAMES),
    );
    const existing = this.#cache.get(frame.timestamp);
    if (existing) {
      if (existing === frame) return;
      existing.close();
    }
    this.#cache.set(frame.timestamp, frame);
    while (this.#cache.size > limit) {
      const oldest = this.#cache.keys().next().value;
      this.#cache.get(oldest)?.close();
      this.#cache.delete(oldest);
    }
  }

  async #report(label, work) {
    this.#onLoading?.(true, label);
    try {
      return await work();
    } finally {
      this.#onLoading?.(false, null);
    }
  }
}

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}
