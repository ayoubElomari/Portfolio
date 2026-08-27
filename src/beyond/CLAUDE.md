# Authoring a beyond entry

This file applies to any work under `src/beyond/`. Read it before touching an
entry folder. It covers **mechanics only** — how the system works, what's
required for a page to render correctly, what you must never touch outside
your own folder. It does not tell you how an entry should look, how it should
be structured, or what it should say. That's yours.

`/beyond` is the index of ideas not built yet; `/beyond/:slug` renders through
exactly the same template as a `/project/:slug` page — same hero, same
three-track article grid, same contents rail, same prev/next footer — so the
mechanics below mirror `src/projects/CLAUDE.md` closely. Two things are
different about an entry, not mechanically but in what it's for:

- **Entries are shorter.** These are ideas, not shipped work. Say what the
  idea is and where the thinking currently stops; don't pad it to case-study
  length.
- **There's usually no live demo, so visuals carry more of the weight.**
  Nothing here is built, so there's often nothing to embed — lean on
  `Strip`/`StripItem` carousels, `Break` beats and `Frame` figures. (If an
  idea genuinely calls for a live, editable visual, the Rendr engine is
  available here too — see below. Nothing stops a concept page from actually
  demonstrating itself.)

## Full creative freedom, one hard boundary

Inside `src/beyond/<slug>/`, do whatever the idea actually calls for. Invent
your own structure, your own visual language, your own components, your own
palette. Nothing here is a template, and no earlier entry is a pattern to
copy. Two entries should never read like the same report with the nouns
swapped.

**If a task would benefit from a design skill you don't have access to — a
specific visual style, a layout approach, 3D, animation — ask for it.** Several
are already installed (`frontend-design`, for instance); more can be searched
for and added.

The one boundary that isn't negotiable: **touch only your own folder.** Adding
or editing an entry means changing files inside `src/beyond/<slug>/` —
`page.<locale>.mdx`, `components/`, `assets/`, `style/` — and nothing else.
Never edit `src/lib/beyond.js`, `src/mdx/mdx-components.jsx`, any shared
`.scss` outside your folder, or another entry's folder. If something you need
doesn't exist yet, build it locally rather than reaching into shared code.

## One MDX file per language

The site is multilingual (see `src/i18n/`). Entry content is **one MDX file
per locale**, named by the locale's two-letter code:

```
src/beyond/<slug>/
  page.en.mdx      ← English write-up
  page.fr.mdx      ← French write-up (optional)
  components/
  assets/
```

- Each locale file is **fully self-contained**: its own `export const meta =
  {...}`, its own imports, its own `HeroDemo` export if it has one. `slug`,
  `cover`, `date`, `duration` and so on are duplicated verbatim across the
  locale files — deliberate, so each file is a complete unit you can hand off
  for a translation pass.
- An entry exists in a locale **if and only if** that locale's file exists.
  Visiting its URL in a locale with no matching file redirects to `/beyond`.
  This is expected behavior — never add a fallback that renders one
  language's content under another's UI.
- Adding a translation is purely additive: drop in `page.fr.mdx` and it
  appears. No registration anywhere; `src/lib/beyond.js` globs `page.*.mdx`
  and keys by folder + locale code.

### Locale-specific assets

Assets follow a suffix convention inside your own `assets/`:

```
assets/diagram.svg        ← shared, locale-agnostic (no suffix)
assets/pipeline.en.svg    ← English version (has baked-in text)
assets/pipeline.fr.svg    ← French version
```

Only give an asset a locale suffix when it actually contains language.
**Bespoke components stay locale-agnostic** — a component in your
`components/` never reads the language context; each `page.<locale>.mdx`
passes in the right localized assets and strings as props.

## The page frame: three widths (available, not mandatory)

The article template is a **three-track grid**:

```
┌─────────────── reading column ───────────────┐ gap ┌── channel ──┐
│ prose, code, callouts, detail figures        │     │ aside media │
└──────────────────────────────────────────────┘     └─────────────┘
├────────────────────────── wide ────────────────────────────────────┤
├──── full (reaches the page edge, stopping clear of the rail) ──────┤
```

Everything defaults to the reading column (~656px). Media primitives take a
`bleed` prop — `"text"`, `"wide"`, or `"full"`. All three collapse gracefully
to a phone.

## Shared MDX primitives (optional infrastructure)

The MDX components available globally without import exist for prose and
image *layout* scaffolding, not content. Use them, ignore them, or build a
local equivalent — whatever a given idea calls for.

Type:

| Component | Purpose |
| --- | --- |
| `<Lede>` | Opening paragraph. Larger, lighter, accent hairline. |
| `<Pull cite bleed>` | One statement that breaks the column. |

Media framing (all take `bleed`):

| Component | Props | Purpose |
| --- | --- | --- |
| `<Frame>` | `src` `alt` `label` `caption` `bleed` `ratio` `flush` `plain` | The general-purpose plate for any visual, including your own React widgets as children. |
| `<Break>` | `src` `alt` `label` `caption` `bleed` (default `"full"`) `ratio` (default `"21 / 9"`) | A full-width visual beat between sections. |
| `<Strip cols>` + `<StripItem>` | Strip: `cols` `caption` `bleed`. Item: `src` `alt` `label` `caption` | A row of small related visuals; a snap-scrolling carousel below 900px. |
| `<Aside>` | `media`/`src` `alt`, `title`, `side`, `ratio` | Prose plus a small visual pinned in the margin channel. |
| `<Facts>` + `<Fact label value note>` | `bleed` `variant` | Numbers/constraints as a hairline strip (`"band"`) or plates (`"cards"`). |
| `<Figure src alt caption>` | — | Back-compat alias for `<Frame flush>`. |

Prose scaffolding: `<Container>`, `<Spacer>`, `<SideBySide>`, `<Dot>`,
`<Callout title tone bleed>`, `<Flow caption bleed>` + `<FlowStep note>`, and
styled `h1`/`h2` from markdown headings.

## A Rendr-powered live demo, if the idea wants one

The Rendr rendering engine is available as a shared module at
[`src/rendr-web/`](../rendr-web/CLAUDE.md), imported via the `@rendr-web`
alias — not just for projects about Rendr itself. Three ready-made demo sizes
live at `.project-details/rendr/v2/live-demos/`; copy that folder in and
supply your own composition. See its `README.md` and
`.project-details/rendr/v2/FORMAT.md` for the composition schema.

## The `meta` contract

Set via `export const meta = {...}` in every `page.<locale>.mdx`:

- Required: `slug`, `title`, `titlePrefix`, `subtitle`, `description`, `cover`
  (imported image), `duration`, `date`.
- Required here, unlike the project system: **`tag`** — which section of the
  `/beyond` listing this entry files under. One of `"automation"`,
  `"generative"`, `"interfaces"`, `"prototypes"` (the list lives as
  `TAG_ORDER` in `src/pages/Beyond.jsx`, labelled per language under
  `home.beyond.tags.*`). A missing or unrecognised tag still renders — it
  lands in a catch-all "Elsewhere" group — but that's a signal something's
  off, not a real category.
- `duration` has no natural value for an unbuilt idea; `"Unbuilt"` is the
  existing convention, but not a rule — use whatever's honest.
- **Give every entry its own accent**, unlike projects (where `style` is
  optional): `style: { "--project-accent-color": "#..." }`. That one value
  colours both the entry's article page and its teaser card on `/beyond` —
  `pages/Beyond.jsx` passes `meta.style` straight through to `BeyondCard`.
  **The cover SVG hard-codes the same accent** (an `<img src>` can't read
  page CSS variables), so changing an entry's accent means updating its
  `assets/cover.svg` too, or the card's tint and its artwork disagree.
- Optional: `stats: [{ label, value }]`, and the same `style` overrides as
  the project system.

**One functional constraint, not a creative one:** the hero's primary action
paints black ink on the accent fill. A dark accent needs
`"--project-on-accent-color": "#fff"` set alongside it, or the CTA is
illegible.

Cover art renders as a framed plate at **3:2**.

## The full-width demo slot (optional)

Export a component as `HeroDemo` alongside `meta` for a demo that wants the
whole screen rather than the reading grid:

```jsx
import MyDemo from "./components/MyDemo.jsx";
export const HeroDemo = MyDemo;
```

It renders full-width between the hero and the article, bare — no padding, no
max-width. Inset yourself with `--pp-gutter` if you want to line up with the
hero. Carries the `live_demo` anchor automatically.

## Anchor conventions (optional)

`<span id="more_in_depth"></span>` makes a "Deep dive" hero button jump there;
`<span id="live_demo"></span>` does the same for "Live demo".

## Before you finish

- [ ] Only files inside your own `src/beyond/<slug>/` were created or changed
- [ ] The content file is named `page.<locale>.mdx`, with its own complete
      `meta` export including `tag` and an accent color
- [ ] The cover SVG's hard-coded color matches `meta.style`'s accent
- [ ] If the accent is dark, `--project-on-accent-color` is also set
