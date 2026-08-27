# Rendr live demos

Three sizes of interactive demo for
[`rendr-web`](../../../../src/rendr-web/CLAUDE.md), as React components. Each
one shows a composition running and lets the reader change values in it and
watch the picture respond.

**No composition ships with these.** Every demo takes its content as a prop. That
is the entire reason this folder is separate from the page it was written for: a
demo carrying its own authored `.rendr.json` forces that content on everyone who
imports it, and the previous version did exactly that — the bench hard-imported
three specific cuts of one video and was therefore unusable by anything else.

## Install

Copy **this folder only** into your project:

```
your-project/src/projects/<slug>/
  live-demos/         ← this folder, copied whole
```

The engine is not copied alongside it. It's a real, shared module that already
lives at `src/rendr-web/` (imported everywhere via the `@rendr-web` alias
configured in `vite.config.js`), so every file here imports it that way —
`import { createRendr } from "@rendr-web";` — rather than by relative path.
That means this folder works unedited no matter how deep it lands inside your
project; there's no sibling layout to preserve.

**Requires React 18+** and a bundler that handles `.scss`. Nothing else.

## The three sizes

|  | What it is for | Cost |
| --- | --- | --- |
| `MiniDemo` | One idea, one or two editable values. A cropped view of just the object those values live in, beside a small stage. | Nothing beyond the runtime, if the composition has no video. |
| `MediumDemo` | A player worth watching, its controls, and a short snippet underneath. For when the picture is the argument and the file is the footnote. | One video source if the composition has one. |
| `RendrBench` | The full editor: file panel, inspector, timeline, output settings. For arguing that a video *is* a data structure. | Whatever the composition costs; gated behind a click. |

Import the **lazy wrappers** unless you have a reason not to. They code-split the
component and hold it until the reader is near it:

```jsx
import { LazyMiniDemo, LazyMediumDemo, LazyBench } from "./live-demos";
```

The bare components are exported too, for a host doing its own splitting —
importing those directly puts them in whatever chunk does the importing, which is
what the wrappers exist to avoid.

---

## `MiniDemo` / `MediumDemo`

```jsx
<LazyMiniDemo
  composition={myComposition}
  edits={[
    { path: ["timeline", 1, "style", "&", "left", "keyframes", 0, "easing"],
      type: "select", label: "easing", options: ["linear", "easeOutCubic"] },
    { path: ["variables", "accent"], type: "color", label: "accent" },
  ]}
  note="One element, one property, one curve."
/>
```

| Prop | |
| --- | --- |
| `composition` | **Required.** The composition object. |
| `edits` | Which values the reader can change. See below. |
| `poster` | Frame to open on. Default `0`. |
| `note` | A line of prose under the snippet. |
| `fpsControl` | Show the fps chips. Default `true`. |
| `labels` | String overrides — see [`labels.js`](./labels.js). |
| `meter` | *(mini only)* Show the frame-cost readout. Default `false`. |
| `keyframeEvery` | *(mini only)* Draw GOP marks on the scrubber every N frames. |

### Writing `edits`

An edit is a **path into the composition object** plus how to render a control
for it. The path is literal — array indices included:

```js
{ path: ["variables", "title"], type: "text",   label: "title" }
{ path: ["variables", "accent"], type: "color", label: "accent" }
{ path: ["timeline", 2, "style", "&", "fontSize"], type: "length",
  label: "size", min: 12, max: 200, step: 2 }
{ path: ["settings", "fps"], type: "number", label: "fps", min: 1, max: 240 }
{ path: ["timeline", 1, "config", "fit"], type: "select",
  label: "fit", options: ["contain", "cover"] }
```

Types: `text`, `color`, `length` (a number with its unit preserved — `"1036px"`
comes back as `"1036px"`, not `1036`), `number`, `select` (needs `options`).

The reader only ever sees the smallest parent object containing your edits, with
its real line numbers — see [`snippet.js`](./snippet.js) for why that is a parent
block rather than a crop of the text. But the **whole** composition is what gets
handed to the runtime on every change, so the thing responding is the real file.

### Auto-start

Both sizes start once the reader scrolls near, rather than waiting for a click.
That is safe because `rendr-web` only loads the video path for a composition that
declares a video asset — a text-and-keyframes demo never fetches the demuxer at
all. **If you give one of these a composition with more than one video source,
use `RendrBench`'s gate instead**, or several on a page will contend for the
platform's small pool of hardware decoders.

---

## `RendrBench`

```jsx
{/* one composition */}
<LazyBench composition={myComposition} filename="scene.rendr.json" />

{/* several authored cuts — ratio chips appear automatically */}
<LazyBench
  variants={{ "16:9": wide, "9:16": tall, "1:1": square }}
  defaultVariant="16:9"
  filename="short.rendr.json"
/>
```

| Prop | |
| --- | --- |
| `composition` | A single composition. Use this **or** `variants`. |
| `variants` | `{ label: composition }`. Ratio chips appear when there is more than one. |
| `defaultVariant` | Which key to open on. Defaults to the first. |
| `posterFrame` | Where the playhead rests before play, and where reset returns. Default `0`. |
| `filename` | What the file panel calls the file. The variant key is appended when there are several. |
| `labels` | String overrides. |

### Why `variants` rather than a ratio setting

Nothing in the format reflows. Every placement is an absolute coordinate in a
1280-wide space, so a composition cut for a wide frame does not *become* a
vertical one by changing a number — it becomes a wide composition letterboxed
inside a vertical frame. A ratio chip is only honest if there is an authored
layout behind it.

So the chips are derived from the compositions you actually pass. One
composition, no ratio row at all. Three, three chips. There is no hardcoded list
to drift out of sync with the cuts behind it.

Frame rate and output size *are* genuine settings and stay as chips regardless —
they change one field and move no coordinates.

### The gate

The bench does not start until the reader presses **Run the engine**. That is
deliberate for the size that tends to carry several video sources: it puts the
expensive moment where the reader asked for it. The file, the timeline and every
control are readable before that — a composition is data, and reading it never
needed a runtime.

---

## Styling

The demos ship their own `.scss` and import it themselves. They read these custom
properties from whatever encloses them, so a host themes them by setting these
rather than by overriding selectors:

```css
--rendr-accent          /* the one colour that is really yours */
--rendr-accent-bright
--rendr-accent-deep
--rendr-accent-dim
--pp-surface            /* panel fills */
--pp-surface-raised
--pp-rule               /* hairlines */
--pp-ink --pp-body --pp-muted --pp-faint --pp-whisper   /* text */
--code-font --secondary-font
```

Lane colours (the per-element tints shared by the timeline, the JSON panel and
the inspector) are **not** taken from your theme — they live in
[`trackColors.js`](./trackColors.js), because their job is to be told apart from
each other and from your accent. Import `trackColor` if you want your own set.

> One trap worth knowing: `style/RendrBench.scss` is wrapped in a
> `.rendr-bench-test` scope in the copy this was extracted from, because two
> byte-identical stylesheets shipped the same `.rb-*` class names on one page and
> the later one silently won. If you only have one copy in your project, that
> wrapper is unnecessary — but if you ever end up with two, this is the failure
> mode: the source says one thing and the computed style says another.

## Strings

Every user-facing string is in [`labels.js`](./labels.js) as a flat object. Pass a
partial `labels` prop to override any of them; missing keys fall back to English
rather than rendering `undefined`.

No component here reads a language context or branches on locale — the strings
arrive as a prop, which is what lets one component serve every language.

## What is not here

`compositions/` and `assets/` from the original page, deliberately. Also
`useRendrEngine.js` and the vendored `engine/` it drove — both superseded by
`rendr-web` and dead before this snapshot was taken.
