# Authoring a project case study

This file applies to any work under `src/projects/`. Read it before touching a
project folder. It covers **mechanics only** — how the system works, what's
required for a page to render correctly, what you must never touch outside your
own folder. It does not tell you how a project should look, how it should be
structured, or what it should say. That's yours.

## Full creative freedom, one hard boundary

Inside `src/projects/<slug>/`, do whatever the project actually calls for.
Invent your own structure, your own visual language, your own components, your
own palette if the piece wants one — nothing here is a template, and no earlier
project (including ones you might see referenced elsewhere) is a pattern to
copy. Two case studies should never read like the same report with the nouns
swapped.

**Never read another project's folder under `src/projects/`, for inspiration
or any other reason, full stop.** This means every sibling folder under
`src/projects/<other-slug>/` in its entirety — not just its
`page.<locale>.mdx`, but its `components/`, `style/`, `assets/`, and any
`README.md`/working notes inside it too. Don't open them, don't glob them,
don't grep them "just to see how they did X." Seeing how another case study
solved a layout or visual problem biases you toward its solution even when
you don't intend to copy it. The only sources to read when authoring a
project are this file, the linked docs in the root `CLAUDE.md` Map
(`src/rendr-web/CLAUDE.md`, etc.), and your own project's folder — including
its own `README.md`/working notes and any `.project-details/` archive for
that specific project.

**If a task would benefit from a design skill you don't have access to — a
specific visual style, a layout approach, 3D, animation — ask for it.** Several
are already installed (`frontend-design`, for instance); more can be searched
for and added. Don't default to the plainest version of an idea because the
right tool wasn't already in hand.

The one boundary that isn't negotiable: **touch only your own folder.** Adding
or editing a project means changing files inside `src/projects/<slug>/` —
`page.<locale>.mdx`, `components/`, `assets/`, `style/` — and nothing else.
Never edit `src/lib/projects.js`, `src/mdx/mdx-components.jsx`, any shared
`.scss` outside your folder, or another project's folder. If something you
need doesn't exist yet, build it locally rather than reaching into shared code.
This is what keeps every project self-contained and safe to add, edit, or
delete without touching anything else on the site.

## One MDX file per language

The site is multilingual (see `src/i18n/`). Project content is **one MDX file
per locale**, named by the locale's two-letter code:

```
src/projects/<slug>/
  page.en.mdx      ← English case study
  page.fr.mdx      ← French case study (optional)
  components/
  assets/
```

- Each locale file is **fully self-contained**: its own `export const meta =
  {...}`, its own imports, its own `HeroDemo` export if it has one. `slug`,
  `cover`, `date`, `duration` and so on are duplicated verbatim across the
  locale files. That duplication is deliberate — it keeps each file a complete
  unit you can hand off for a translation pass without cross-file bookkeeping.
- A project exists in a locale **if and only if** that locale's file exists. A
  project with only `page.en.mdx` is simply invisible while the site is in
  French: it drops out of the Home listing, out of the hero's "03 / 04"
  counter, and out of the prev/next article footer. Visiting its URL in that
  locale redirects home. This is expected behavior, not a bug — never add a
  fallback that renders one language's content under another's UI.
- Adding a translation is purely additive: drop in `page.fr.mdx` and it
  appears. No registration anywhere; `src/lib/projects.js` globs `page.*.mdx`
  and keys by folder + locale code.
- The two locale files do **not** have to be a literal sentence-for-sentence
  translation. Same project, same structure — but idiomatic in each language.

### Locale-specific assets

Assets follow a suffix convention inside your own `assets/`:

```
assets/diagram.svg        ← shared, locale-agnostic (no suffix)
assets/pipeline.en.svg    ← English version (has baked-in text)
assets/pipeline.fr.svg    ← French version
```

Only give an asset a locale suffix when it actually contains language —
labelled diagrams, screenshots with UI text. Everything else stays unsuffixed
and is imported by both files.

**Bespoke components stay locale-agnostic.** A component in your `components/`
must never read the language context or branch on locale internally. Instead,
each `page.<locale>.mdx` imports the right assets and passes them (and any
strings) in as props:

```jsx
// page.fr.mdx
import pipeline from "./assets/pipeline.fr.svg";

<MyDiagram src={pipeline} caption="Le pipeline de rendu" />
```

That keeps one component serving every language, with the translation surface
living entirely in the MDX files.

## The page frame: three widths (available, not mandatory)

The article template is a **three-track grid**, not a single column:

```
┌─────────────── reading column ───────────────┐ gap ┌── channel ──┐
│ prose, code, callouts, detail figures        │     │ aside media │
└──────────────────────────────────────────────┘     └─────────────┘
├────────────────────────── wide ────────────────────────────────────┤
├──── full (reaches the page edge, stopping clear of the rail) ──────┤
```

`full` runs to the true page edge on the right and stops flush against the
contents rail on the left, so a full-bleed beat never paints over the sticky
navigation. Below the rail breakpoint there's no rail to clear and it reaches
both edges. You don't manage any of this — just pick a `bleed` and the
template resolves it.

Everything defaults to the reading column (~656px, ~74 characters). Media
primitives take a `bleed` prop — `"text"` (default for `Frame`/`Callout`),
`"wide"` (default for `Strip`, `Aside`, `Flow`, `Pull`), or `"full"` (default
for `Break`). All three widths collapse gracefully down to a phone.

## Shared MDX primitives (optional infrastructure)

The MDX components available globally without import exist for prose and
image *layout* scaffolding — how something is framed, captioned, spaced, or
broken across the column. They're there to save you from rebuilding basic
scaffolding, not to constrain what you build. Ignore any of them, all of them,
or build your own local equivalent if a project's own visual language calls
for something different.

Type:

| Component | Purpose |
| --- | --- |
| `<Lede>` | Opening paragraph of the article or a major section. Larger, lighter, accent hairline. |
| `<Pull cite bleed>` | One statement that breaks the column. Display type. |

Media framing (all take `bleed`):

| Component | Props | Purpose |
| --- | --- | --- |
| `<Frame>` | `src` `alt` `label` `caption` `bleed` `ratio` `flush` `plain` | The general-purpose plate for any visual — an image, an inline SVG, or one of your own React widgets as children. `flush` drops the inner padding (screenshots); `plain` drops the frame entirely but keeps the label/caption voice and the chosen width. |
| `<Break>` | `src` `alt` `label` `caption` `bleed` (default `"full"`) `ratio` (default `"21 / 9"`) | A full-width visual beat between sections. |
| `<Strip cols>` + `<StripItem>` | Strip: `cols` `caption` `bleed`. Item: `src` `alt` `label` `caption` | A row of small related visuals. Becomes a snap-scrolling carousel below 900px. |
| `<Aside>` | `media` (node) or `src` `alt`, `title`, `side` (`"right"`/`"left"`), `ratio` (`"margin"`/`"even"`) | Prose on the reading column, a small visual pinned beside it in the margin channel. Stacks visual-first below 900px. |
| `<Facts>` + `<Fact label value note>` | Facts: `bleed` `variant` | Numbers/constraints. `variant="band"` (default) is a dense hairline strip; `variant="cards"` gives each fact its own plate. |
| `<Figure src alt caption>` | — | Back-compat alias for `<Frame flush>`. |

Prose scaffolding & process: `<Container>`, `<Spacer>`, `<SideBySide>`, `<Dot>`,
`<Callout title tone bleed>` (`tone` = `"note"` \| `"accent"`), `<Flow caption
bleed>` + `<FlowStep note>`, and styled `h1`/`h2` from plain markdown headings.

Notes:

- Put your own artwork *inside* these — `<Frame label="Topology"><MyDiagram />
  </Frame>` — rather than reinventing a bordered container in your project's
  stylesheet, if you're using them at all.
- Inline SVGs you author can use the `--pp-*` tokens (`var(--pp-accent)`,
  `var(--pp-rule)`, `var(--pp-faint)`) if you want them to retint with a
  `meta.style` accent override — entirely optional.
- `h1` becomes a numbered section heading and feeds the contents rail; `h2` is
  a sub-heading.

## A Rendr-powered live demo, if the project wants one

The Rendr rendering engine — a browser runtime that draws a JSON composition
into a DOM element, with playback and live editing — is available as a shared
module at [`src/rendr-web/`](../rendr-web/CLAUDE.md), imported via the
`@rendr-web` alias. It's not just for a project *about* Rendr; anything that
wants a live, editable visual can use it as a backbone.

Three ready-made demo sizes (a full editor, a player-focused medium size, and a
single-idea mini) live at `.project-details/rendr/v2/live-demos/` — copy that
folder into your own `components/` or project root as a starting point, then
supply your own composition. See that folder's `README.md` for the props, and
`.project-details/rendr/v2/FORMAT.md` for the composition JSON schema.

## The `meta` contract

Set via `export const meta = {...}` in every `page.<locale>.mdx`:

- Required: `slug`, `title`, `titlePrefix` (short discipline string, e.g.
  `"Automation; Video Production"` — split on `;,/|` into hero kicker terms),
  `subtitle`, `description`, `cover` (imported image), `duration`, `date`
  (used for sort order **and** the hero year).
- Optional: `stats: [{ label, value }]` — freeform facts rendered as the
  hero's spec band. `duration` is appended automatically, so don't repeat it
  here.
- Optional: `style: { "--project-accent-color": "...",
  "--project-primary-color": "...", "--project-font-family": "...",
  "--project-on-accent-color": "..." }` — CSS variable overrides applied to
  the page root, if you want the shared chrome (hero, footer) to pick up a
  project color.

**One functional constraint, not a creative one:** the hero's primary action
paints black ink on the accent fill. If you set a dark `--project-accent-
color`, also set `"--project-on-accent-color": "#fff"` or that button's text
becomes unreadable.

Cover art note: the hero renders `cover` as a framed plate at **3:2**
(`object-fit: cover`), and the footer of the *previous* project shows it at
16:10.

## The full-width demo slot (optional)

Anything inside `page.<locale>.mdx` renders in the article's three-track grid,
which is the right frame for almost everything — but not for a demo that
genuinely wants the whole screen. For that, export a component as `HeroDemo`
alongside `meta`:

```jsx
import MyDemo from "./components/MyDemo.jsx";

export const HeroDemo = MyDemo;
```

It renders full-width between the hero and the article, outside the reading
grid and outside the contents rail entirely. The mount point is deliberately
bare — no padding, no max-width, no surface — so your component owns every
layout decision inside it. Two things worth knowing:

- Inset yourself with `--pp-gutter` if you want to line up with the hero and
  article rather than touch the screen edges. Nothing upstream does this for
  you.
- The article's primitives (`.pp-frame-label`, `.pp-caption`, …) are scoped
  *inside* the article, so they don't apply out here. Style your own
  label/caption locally.

The slot carries the `live_demo` anchor automatically, so the hero's "Live
demo" button lights up without you dropping a `<span>` anywhere.

## Anchor conventions (optional)

Dropping `<span id="more_in_depth"></span>` before a section makes a "Deep
dive" hero button appear and jump there; `<span id="live_demo"></span>` does
the same for a "Live demo" button. Both are convenience jump-links for a hero
that's already tall.

## Before you finish

- [ ] Only files inside your own `src/projects/<slug>/` were created or
      changed
- [ ] The content file is named `page.<locale>.mdx` (never a bare
      `page.mdx`), with its own complete `meta` export; locale-specific
      assets carry a `.en`/`.fr` suffix
- [ ] If you set a dark `meta.style` accent, `--project-on-accent-color` is
      also set
