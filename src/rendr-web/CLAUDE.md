# Rendr Web

A rendering runtime for the browser. It takes a composition — a JSON document
describing what appears, where, and when — and draws any frame of it into a DOM
element you give it.

**This is a real, shared module in the shipped site — not something to copy.**
It lives at `src/rendr-web/` once, and every project or beyond entry that wants
a Rendr-powered visual imports it from here through the `@rendr-web` alias
(configured in `vite.config.js`), the one path alias this repo has. Do not
duplicate this folder into a project's own directory — that's what the demo
*kit* is for (see below), not the engine itself.

```jsx
// from any project, anywhere in src/
import { createRendr } from "@rendr-web";
import Composition from "@rendr-web/core/Composition.js";
```

It knows nothing about the project importing it — no theme tokens, no
stylesheet of its own beyond what a composition asks for, no framework.
Everything visual comes from the composition; everything structural it builds
itself.

## Using it from a project

Nothing to install — it's already in the tree. Just import it via `@rendr-web`.

The one thing to know is that `media/mp4box.js` is **third-party** — the GPAC
project's MP4 demuxer, BSD-3-Clause, ~11,850 lines. It's vendored rather than
depended on, carries its own licence header, and is excluded from linting in
`eslint.config.js`. Everything else here is ours and lints clean.

**It is also never loaded unless you use video.** `AssetStore` imports the video
path dynamically, so a composition whose `assets.media` declares no `"video"`
entry never fetches the demuxer at all. A text-and-keyframes composition costs
you nothing for a capability it does not use.

### The live-demo kit — separate, and copied, not imported

The three React demo components (`MiniDemo`, `MediumDemo`, `RendrBench`) are
**not** in this folder. They live at
`.project-details/rendr/v2/live-demos/` and are meant to be copied wholesale
into a project's own folder (they take a composition as a prop, so each copy is
customized per project). They already import this engine via `@rendr-web`, so a
copied kit works with zero edits regardless of where in `src/projects/<slug>/`
it lands. See that folder's own README, and `.project-details/rendr/v2/FORMAT.md`
for the composition JSON schema.

**It is also never loaded unless you use video.** `AssetStore` imports the video
path dynamically, so a composition whose `assets.media` declares no `"video"`
entry never fetches the demuxer at all. A text-and-keyframes composition costs
you nothing for a capability it does not use.

---

## Origin

This is not a patched copy of an older engine. It is a rewrite around a different
premise, because the original was built for a host process that renders a file
once, front to back, and then exits. Everything about that shape is wrong for a
web page, where the same runtime has to survive being edited, scrubbed, replayed
and left open for an hour on a phone.

---

## What the page needs that a renderer-that-exits never did

| The original assumes | A page actually does |
| --- | --- |
| One composition, loaded once | The composition changes on every keystroke |
| Frames are rendered in order, once each | The reader scrubs backwards, jumps, replays |
| Memory is reclaimed when the process exits | Nothing is reclaimed unless we reclaim it |
| The machine is ours | We are one tab, on a phone, next to other tabs |
| Rendering ends | It doesn't |

Each of those is a design constraint, not a bug to patch. The three failures that
forced this rewrite all came from the same place:

- **Decoded frames were cached as `ImageBitmap`s.** A group of pictures at
  854×480 is ~20MB of GPU-backed textures, several groups were held at once, and
  garbage collection does not reclaim them. The fix is not a smaller cache; it is
  to notice that a renderer showing frame *n* needs **frame *n***, and that a
  decoded frame can be drawn and released in the same breath.
- **A `VideoDecoder` was constructed per group and never closed.** Platforms allow
  a handful of hardware decoders at once. The fix is not to close them faster; it
  is to keep **one** per source and reuse it.
- **Every edit rebuilt the whole engine.** Teardown, reload, re-decode, re-mount,
  ~30 `<style>` nodes replaced. The fix is to treat an edit as an edit: diff the
  new composition against the old one and touch only what changed.

## Principles

1. **Bounded by construction.** Every cache has a stated ceiling derived from the
   device, not from what happens to fit. See `runtime/Capabilities.js`.
2. **Frames are borrowed, not owned.** A `VideoFrame` is drawn to a canvas and
   closed immediately. The steady-state working set is one frame per video
   element, not one group.
3. **Updates are diffs.** `update(json)` reconciles. Rebuilding is the fallback
   for a structural change, not the normal path.
4. **The runtime owns time.** Play, pause, seek, rate and looping live here, so a
   host doesn't re-implement a frame clock — and so playback never depends on a UI
   framework re-rendering at 60fps.
5. **The host subscribes; it does not poll.** Events carry the frame number, so a
   UI can update a readout without asking.
6. **Nothing is global.** Two instances on one page share nothing but the module.

## Layout

```
rendr-web/
  package.json          name, exports, "type": "module"
  index.js              createRendr() — the only entry point
  core/
    Rendr.js            the facade: composition, stage, clock, assets
    Composition.js      JSON → a normalised, resolved, queryable model
    Reconciler.js       diff two compositions, apply the difference
    Stage.js            the DOM surface; sizing, fit, teardown
    Clock.js            playback: rAF loop, time debt, rate, seek, loop
    Emitter.js          a small event bus
  elements/
    Element.js          base: node, style, animation, lifecycle
    Text.js Image.js Video.js Caption.js
    registry.js         type name → class
  animation/
    Track.js            a keyframed property, evaluated at a frame
    easings.js          carried over from the original, unchanged
    interpolate.js      carried over: numbers, units, functions, colours
  media/
    AssetStore.js       ref-counted, shared, LRU-evicted
    VideoSource.js      demux + a single reused decoder + bounded lookahead
    ImageSource.js
    demux.js            mp4box wrapper
    Samples.js          sample table / GOP arithmetic
    mp4box.js           third party (GPAC, BSD-3-Clause) — not ours, not linted
  runtime/
    Capabilities.js     what this device can be asked for
  util/
    timecode.js  css.js  refs.js
```

## The API

```js
import { createRendr } from "./rendr-web/index.js";

const rendr = createRendr(stageElement, composition, {
  onFrame:  ({ frame, time }) => {},
  onState:  ({ playing, ready }) => {},
  onLoading: ({ loading, label }) => {},
  onError:  (err) => {},
});

await rendr.ready();

// content
rendr.update(nextComposition);   // reconciles; does not reboot

// transport
rendr.play();  rendr.pause();  rendr.toggle();
rendr.seek(120);                 // by frame
rendr.seekTime(4.5);             // by seconds
rendr.setRate(0.5);              // 0.25 … 4
rendr.setLoop(true);

// reading it
rendr.frame; rendr.totalFrames; rendr.time; rendr.duration;
rendr.fps;   rendr.resolution;  rendr.aspect;
rendr.playing; rendr.timecode();
rendr.stats();                   // frame cost, decoder count, bytes held

rendr.destroy();
```

Everything the transport needs is here, so a host is a JSON editor and a set of
buttons — it should never own a frame loop, a timecode formatter or a play flag.

### The host element

`createRendr(host, …)` takes **a box you size**. The runtime builds its own
`.rw-stage` inside it and owns everything below that: sizing, the fit transform,
clipping, teardown. So the host needs a width and a height (or an
`aspect-ratio`) and nothing else — no positioning, no overflow rules, no
stylesheet reaching inside.

Resizing is automatic. A `ResizeObserver` refits on every change, so responsive
layouts, rotation and container queries all work without the host telling the
runtime anything. If the box ever measures 0×0 — a hidden ancestor, an unsettled
layout — the stage hides rather than rendering at 1:1, and comes back when there
is room.

### The smallest possible composition

Enough to see something move, with no assets and therefore no demuxer:

```js
const composition = {
  rendr: "v2.1.0",
  settings: { fps: 30, resolution: [1280, 720] },
  variables: { accent: "#b98cff" },
  timeline: [
    {
      id: "box",
      type: "Text",
      at: "00:00:00.000",
      duration: "00:00:02.000",
      config: { content: "" },
      style: {
        "&": {
          position: "absolute",
          top: "310px",
          width: "100px",
          height: "100px",
          background: "@variables:accent",
          left: {
            keyframes: [
              { at: "0%", value: "100px", easing: "easeOutCubic" },
              { at: "100%", value: "1080px" },
            ],
          },
        },
      },
    },
  ],
};
```

Two rules that are not obvious and *will* bite when authoring:

1. **The authoring space is always 1280 wide.** Height falls out of the ratio
   (16:9 → 720, 1:1 → 1280, 9:16 → 2276). `settings.resolution` is an **output**
   setting only — it scales the stage; it does not move a single coordinate. One
   file renders identically at 480p and 8K, and *changing the aspect ratio is not
   a setting but a second layout.*
2. **A `@ref` only substitutes when it is the whole string.**
   `"color": "@variables:accent"` works; `"border": "1px solid @variables:accent"`
   passes through unsubstituted and the CSS parser then drops the whole line —
   silently. Split every shorthand. (`{{param}}` inside a component is the
   opposite and *does* substitute inline, because a parameter is always scalar.)

## The one constraint that is not obvious

**A decoded frame you are holding is a buffer the decoder cannot decode into.**

Hardware decoders own a small, fixed pool of output buffers. An application that
retains `VideoFrame`s faster than it releases them does not use more memory — it
*stalls the decoder*, with no error and nothing on the console. This was measured
during the build, and it is worth stating plainly because it inverts the obvious
instinct: the memory-efficient thing (keep frames rather than converting them)
becomes a hang if you keep more than a handful.

```
12 chunks fed → 9 frames out → flush() pending forever → no error
```

`VideoSource` therefore closes every frame outside a small live window
(`MAX_LIVE_FRAMES`) the moment it arrives, and the window follows the frame being
asked for. Running out of window costs a re-decode of the group. That is the
correct trade: decoding is work, and starving is a hang.

If you ever raise the frame cache, raise it knowing this is the limit it is
bounded by — it is a *decoder liveness* number, not a memory number, and a
device with more RAM does not get a bigger pool.

**And the corollary that cost a second round:** a `Map.set` over an occupied key
drops the old value silently, and the old value here is a frame. Looping playback
decodes the same group again on every pass and produces frames with the *same*
timestamps, so without closing the outgoing one first, every loop stranded a
group's worth. The symptom is the browser's own
`A VideoFrame was garbage collected without being closed` warning and memory that
climbs for as long as it plays. It surfaced at 9:16 first only because that stage
is three times the area of the others and reached the ceiling soonest — the leak
was never ratio-specific, and neither was the crash.

## Events are ordered; renders are not

`#render` awaits — element builds, a decode — so two of them overlap whenever a
frame is asked for before the last one finished, which during playback is most of
the time. Nothing makes them *finish* in the order they started. Emitting the
`frame` event at the end of each therefore delivered frames out of order, and a
subscriber that writes a position from them jitters: the playhead jumped
backwards several times a second, and dragging the scrubber looked like the
control fighting the pointer.

Only the newest render emits (`#renderSeq`). Any host reading `onFrame` can treat
it as monotonic except across a deliberate seek.

The same shape of bug is worth watching for on the host side, where it is even
easier to write: a value that has a per-frame channel **must not also be
rendered**. Two writers, one of them a re-render carrying a coalesced value up to
125ms stale, and every commit is a correction to something that was already
right. Both the playhead and the transport readout had it.

Related: two decodes must never run at once on one source. There is one decoder
and one output sink, so concurrent decodes route each other's frames into the
wrong collection. Decodes are chained per source for that reason — and this is not
hypothetical, since a composition can point two elements at one clip at different
in-points and a scrub across them asks for two groups in the same tick.

## Measured

On the sandbox composition (16s, two clips, a photograph, word-synced captions,
29 resolved elements), in a desktop browser:

| | Old engine | Rendr Web |
| --- | --- | --- |
| `VideoDecoder`s created | one per group, never closed (12 live after boot alone) | **one per source, reused** |
| Decoded frames held | a whole group per source, as RGBA `ImageBitmap`s | **5, bounded, as YUV `VideoFrame`s (~12.8MB)** |
| `<style>` nodes | ~29, plus 29 more per reboot | **1 adopted stylesheet, 0 nodes** |
| An edit | full teardown + rebuild, debounced 110ms | **reconcile** — 11 edits, `builds` stayed 1 |
| Frame cost, warm | ~1–2ms | ~2.7ms (does more per frame: bounded decode) |
| 6 aspect-ratio swaps | flat after fixes | flat — frames 5→5, DOM 8950→8950 |

Determinism holds: render a frame, go far away, come back, and the stage's HTML
is byte-identical.

## Verifying a change

The claims worth re-checking after touching this, in order of how much it hurts
to get them wrong:

```js
// decoders: created must equal closed, and live must be ~1 per video source
// (patch window.VideoDecoder — it is a global, so no module-identity trap)

// frames: nothing accumulates across a full playthrough
rendr.stats().framesHeld       // steady, single digits

// determinism: the same frame twice must be byte-identical
// render n, go far away, come back, diff stage.innerHTML

// reconcile: an edit must not rebuild
rendr.stats().builds           // does not increase on a style-only edit
```

A note on the browser pane: Vite's dev server can serve one module under several
URLs, so `await import(...)` from a console is **not** necessarily the instance
the running code uses. Patching a prototype to count calls can silently measure
nothing. Instrument globals, or edit the source and reload.
