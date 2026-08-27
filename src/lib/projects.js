// Project meta contract (set via `export const meta = {...}` in each page.<locale>.mdx):
//   slug, title, titlePrefix, subtitle, description, cover, duration, date  — required
//   stats: [{ label, value }]                                              — optional, freeform per-project facts
//   style: { "--project-accent-color": "...", ... }                        — optional, CSS var overrides for the page root
//
// A project may also export a component as `HeroDemo`, which renders full-width
// between the hero and the article instead of inside the reading grid — for a
// demo that needs the whole screen. Optional; most projects won't have one.
//
// Localization: content is one MDX file per locale — `src/projects/<slug>/page.en.mdx`,
// `page.fr.mdx`, … Each file is fully self-contained (its own `meta` export), so a
// project exists in a locale if and only if that locale's file exists. A project with
// no file for the active locale is simply invisible there: it drops out of listings,
// out of the hero counter, and out of the prev/next footer. `slugExists` is the escape
// hatch that lets the route tell "real 404" apart from "not translated yet".
const modules = import.meta.glob("../projects/*/page.*.mdx", { eager: true });

/* "../projects/warden/page.en.mdx" → { slug: "warden", locale: "en" } */
function parsePath(path) {
  const match = /\/projects\/([^/]+)\/page\.([a-z]{2})\.mdx$/i.exec(path);
  if (!match) return null;
  return { slug: match[1], locale: match[2].toLowerCase() };
}

/* { [slug]: { [locale]: { Component, HeroDemo, meta } } } */
const bySlug = {};

for (const [path, mod] of Object.entries(modules)) {
  const parsed = parsePath(path);
  if (!parsed) continue;

  const { slug, locale } = parsed;
  if (!bySlug[slug]) bySlug[slug] = {};

  bySlug[slug][locale] = {
    slug,
    locale,
    Component: mod.default,
    HeroDemo: mod.HeroDemo,
    meta: mod.meta,
  };
}

function byDateDesc(a, b) {
  return (a.meta?.date || "") < (b.meta?.date || "") ? 1 : -1;
}

// Every project that has content in `locale`, sorted by `meta.date` descending.
export function getProjects(locale) {
  return Object.values(bySlug)
    .map((locales) => locales[locale])
    .filter(Boolean)
    .sort(byDateDesc);
}

// Exact locale match only — no silent fallback to another language. Returning
// `undefined` for an untranslated project is what drives the redirect-home
// behavior in `pages/Project.jsx`.
export function getProjectBySlug(slug, locale) {
  return bySlug[slug]?.[locale];
}

// True when the slug exists in *any* locale — i.e. it's a real project that
// merely hasn't been translated into the active one.
export function slugExists(slug) {
  return Boolean(bySlug[slug]);
}

// 1-based position of `slug` in the sorted list for `locale`, plus the list
// size — the hero shows it as an "03 / 04" dossier counter. Returns null when
// unknown (including: the project isn't translated into this locale).
export function getProjectIndex(slug, locale) {
  const list = getProjects(locale);
  const index = list.findIndex((p) => p.meta?.slug === slug);
  if (index === -1) return null;
  return { position: index + 1, total: list.length };
}

// Returns the previous/next project relative to `slug` within `locale`,
// wrapping at the ends. Both are null when that locale has fewer than 2.
export function getAdjacentProjects(slug, locale) {
  const list = getProjects(locale);
  if (list.length < 2) return { previous: null, next: null };

  const index = list.findIndex((p) => p.meta?.slug === slug);
  if (index === -1) return { previous: null, next: null };

  const previous = list[(index - 1 + list.length) % list.length];
  const next = list[(index + 1) % list.length];

  /* With exactly two projects the wrap makes both sides the same entry —
     surface it once rather than rendering a duplicate card. */
  if (previous === next) return { previous: null, next };

  return { previous, next };
}
