import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getBeyondEntryBySlug, beyondSlugExists } from "../lib/beyond";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import usePageMeta from "../lib/usePageMeta.js";

import BeyondEntryHero from "./sections/BeyondEntry/BeyondEntryHero";
import BeyondEntryArticle from "./sections/BeyondEntry/BeyondEntryArticle";

import "./style/Project.scss";

/* ─────────────────────────────────────────────────────────────────────────
   A beyond entry renders through exactly the same template as a project
   case study — same hero, same three-track article grid, same contents rail,
   same prev/next footer. That is deliberate: an idea page is a shorter read,
   not a different kind of page.

   The template is reused rather than duplicated: every part below emits the
   same `project-*` class names as `pages/Project.jsx`, so it reads from the
   one `--pp-*` token layer in `style/Project.scss` and the one article
   stylesheet. The extra `beyond-entry-page` class is a hook with no rules of
   its own yet — it's where the two systems would diverge if they ever need
   to, without touching the project side.
   ───────────────────────────────────────────────────────────────────────── */
function BeyondEntry() {
  const { slug } = useParams();
  const { locale, t } = useLanguage();
  const entry = useMemo(
    () => getBeyondEntryBySlug(slug || "", locale),
    [slug, locale],
  );

  /* Above the early returns — hooks can't run conditionally. Falls back to the
     404 title for the genuinely-bad-slug branch below. */
  usePageMeta({
    title: entry?.meta?.title ?? t("notFound.metaTitle"),
    description: entry?.meta?.description,
  });

  if (!entry) {
    /* A real entry that simply isn't translated into the active locale:
       send the reader back to the listing rather than showing a dead end. A
       slug that exists in no locale at all is a genuine 404 and keeps the
       inline message. */
    if (beyondSlugExists(slug || ""))
      return (
        <Navigate
          to="/beyond"
          replace
          state={{ redirectReason: "untranslated-beyond-entry" }}
        />
      );

    return (
      <div style={{ padding: 24, paddingTop: 120 }}>
        <p>{t("beyond.notFound")}</p>
        <Link to="/beyond">{t("common.back")}</Link>
      </div>
    );
  }

  /* Mirrors the project page's optional full-width demo slot. No beyond
     entry is expected to have one — these are unbuilt ideas, there is
     nothing live to demo — but the seam is kept so the two templates stay
     literally the same shape. */
  const HeroDemo = entry.HeroDemo;

  return (
    <div
      className="project-page beyond-entry-page"
      style={entry.meta?.style}
    >
      <BeyondEntryHero entry={entry} />
      {HeroDemo && (
        <div className="project-hero-demo" id="live_demo">
          <HeroDemo />
        </div>
      )}
      <BeyondEntryArticle entry={entry} />
    </div>
  );
}

export default BeyondEntry;
