# CLAUDE.md

Guidance for Claude Code working in this repository. Keep this file compact —
it's a map, not documentation. Read the linked files when a task actually
touches that area; don't absorb them speculatively.

## What this is

Ayoub El Omari's personal portfolio: a React single-page site with a home
page, an about page, a resume page, and two content systems built on MDX —
`/project/:slug` (real case studies) and `/beyond/:slug` (ideas not built
yet). Multilingual, English and French, switched client-side with no URL
segment. No projects exist yet; the site is starting from a clean slate after
its placeholder content was removed.

## Design philosophy

The shared chrome — Home, About, Resume, Header, Footer, and anything else
that isn't a project or beyond page — has to read as one coherent product.
Same brand tokens throughout (dark background, cream primary text, orange
accent, Akshar/Inter/Raleway/Fira Code), same interaction language, no page
that looks like it wandered in from a different design system.

**Project and beyond pages are the deliberate exception.** Each one is fully
self-contained and free to look however the piece calls for — see the two
authoring guides in the Map below. Don't apply the chrome's coherence rule to
case-study content; it doesn't hold there on purpose.

## Architecture

**Stack**: React 19, React Router v7 (`BrowserRouter`), Vite 7, Sass, MDX
(`@mdx-js/rollup`), plain CSS custom properties for theming (no
CSS-in-JS/Tailwind). JS/JSX, not TypeScript.

- **Routing** (`src/App.jsx`, `src/main.jsx`): `/`, `/about`, `/resume`,
  `/project/:slug`, `/beyond`, `/beyond/:slug`, catch-all → `NotFound`.
  `Header`/`Footer` are persistent chrome outside `<Routes>`.
- **i18n** (`src/i18n/`): a hand-rolled `LanguageContext` + flat dictionaries
  (`en.json`/`fr.json`), no library. `SUPPORTED_LOCALES` is the source of
  truth for which locales exist. Content (projects, beyond entries) is
  translated by file, not by dictionary — see the content systems below.
- **Content systems**: `src/projects/` (case studies) and `src/beyond/`
  (unbuilt ideas) are both auto-discovered by `import.meta.glob`
  (`src/lib/projects.js`, `src/lib/beyond.js`) — adding one is just adding a
  folder, no registration. Full authoring rules are in each folder's own
  `CLAUDE.md`, linked below.
- **The Rendr engine** (`src/rendr-web/`): a shared, importable rendering
  runtime, not tied to any one project. Imported via the `@rendr-web` path
  alias — the one alias configured in `vite.config.js`. See its own
  `CLAUDE.md`.
- **Styling**: global tokens on `:root` in `src/index.css`. A project or
  beyond entry can override the accent/font via `meta.style`, applied inline
  on its page root. Every component's Sass lives in a sibling `style/`
  folder, imported directly — no global stylesheet aggregation.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run preview` — preview production build

There is no test runner configured in this project.

## Skills

Use the `/andrej-karpathy-skills:karpathy-guidelines` skill when writing,
reviewing, or refactoring code in this repo — it helps avoid overcomplication,
keep changes surgical, surface assumptions, and define verifiable success
criteria.

## Map

Everything below is a pointer, not a summary — open the link when the task is
actually in that area.

- **[src/projects/CLAUDE.md](src/projects/CLAUDE.md)** — how to author a
  project case study: the MDX system, the `meta` contract, shared primitives,
  self-containment. Full creative freedom inside your own folder.
- **[src/beyond/CLAUDE.md](src/beyond/CLAUDE.md)** — the same, for `/beyond`
  entries.
- **[src/rendr-web/CLAUDE.md](src/rendr-web/CLAUDE.md)** — the Rendr
  rendering engine: the API, how to import it, its constraints.
- **[.project-details/rendr/README.md](.project-details/rendr/README.md)** —
  dev-only archive for the Rendr project: old research, an engine snapshot,
  and the copy-into-your-project live-demo kit. Never shipped, never imported
  by `src/`.
