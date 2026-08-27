// Beyond-entry meta contract (set via `export const meta = {...}` in each page.<locale>.mdx):
//   slug, title, titlePrefix, subtitle, description, cover, duration, date  — required
//   stats: [{ label, value }]                                              — optional, freeform per-entry facts
//   style: { "--project-accent-color": "...", ... }                        — optional, CSS var overrides for the page root
//
// An entry may also export a component as `HeroDemo` — mirrors the project system, but
// no beyond entry is expected to have one (no live demos for unbuilt ideas).
//
// Localization: content is one MDX file per locale — `src/beyond/<slug>/page.en.mdx`,
// `page.fr.mdx`, … Each file is fully self-contained (its own `meta` export), so an
// entry exists in a locale if and only if that locale's file exists. An entry with
// no file for the active locale is simply invisible there: it drops out of listings,
// out of the hero counter, and out of the prev/next footer. `beyondSlugExists` is the
// escape hatch that lets the route tell "real 404" apart from "not translated yet".
//
// This module is a deliberate 1:1 mirror of `src/lib/projects.js` — same logic, same
// shape, just pointed at `src/beyond/` instead of `src/projects/`.
const modules = import.meta.glob("../beyond/*/page.*.mdx", { eager: true });

/* "../beyond/terminal-snippets/page.en.mdx" → { slug: "terminal-snippets", locale: "en" } */
function parsePath(path) {
  const match = /\/beyond\/([^/]+)\/page\.([a-z]{2})\.mdx$/i.exec(path);
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

// Every beyond entry that has content in `locale`, sorted by `meta.date` descending.
export function getBeyondEntries(locale) {
  return Object.values(bySlug)
    .map((locales) => locales[locale])
    .filter(Boolean)
    .sort(byDateDesc);
}

// Exact locale match only — no silent fallback to another language. Returning
// `undefined` for an untranslated entry is what drives the redirect-home
// behavior in `pages/BeyondEntry.jsx`.
export function getBeyondEntryBySlug(slug, locale) {
  return bySlug[slug]?.[locale];
}

// True when the slug exists in *any* locale — i.e. it's a real entry that
// merely hasn't been translated into the active one.
export function beyondSlugExists(slug) {
  return Boolean(bySlug[slug]);
}

// 1-based position of `slug` in the sorted list for `locale`, plus the list
// size — the hero shows it as an "03 / 04" dossier counter. Returns null when
// unknown (including: the entry isn't translated into this locale).
export function getBeyondEntryIndex(slug, locale) {
  const list = getBeyondEntries(locale);
  const index = list.findIndex((p) => p.meta?.slug === slug);
  if (index === -1) return null;
  return { position: index + 1, total: list.length };
}

// Returns the previous/next entry relative to `slug` within `locale`,
// wrapping at the ends. Both are null when that locale has fewer than 2.
export function getAdjacentBeyondEntries(slug, locale) {
  const list = getBeyondEntries(locale);
  if (list.length < 2) return { previous: null, next: null };

  const index = list.findIndex((p) => p.meta?.slug === slug);
  if (index === -1) return { previous: null, next: null };

  const previous = list[(index - 1 + list.length) % list.length];
  const next = list[(index + 1) % list.length];

  /* With exactly two entries the wrap makes both sides the same one —
     surface it once rather than rendering a duplicate card. */
  if (previous === next) return { previous: null, next };

  return { previous, next };
}
