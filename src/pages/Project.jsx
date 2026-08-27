import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getProjectBySlug, slugExists } from "../lib/projects";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import usePageMeta from "../lib/usePageMeta.js";

import ProjectHero from "./sections/Project/ProjectHero";
import ProjectArticle from "./sections/Project/ProjectArticle";

import "./style/Project.scss";

function Project() {
  const { slug } = useParams();
  const { locale, t } = useLanguage();
  const project = useMemo(
    () => getProjectBySlug(slug || "", locale),
    [slug, locale],
  );

  /* Above the early returns — hooks can't run conditionally. Falls back to the
     404 title for the genuinely-bad-slug branch below. */
  usePageMeta({
    title: project?.meta?.title ?? t("notFound.metaTitle"),
    description: project?.meta?.description,
  });

  if (!project) {
    /* A real project that simply isn't translated into the active locale:
       send the reader home rather than showing a dead end. A slug that exists
       in no locale at all is a genuine 404 and keeps the inline message. */
    if (slugExists(slug || ""))
      return (
        <Navigate
          to="/"
          replace
          state={{ redirectReason: "untranslated-project" }}
        />
      );

    return (
      <div style={{ padding: 24, paddingTop: 120 }}>
        <p>{t("project.notFound")}</p>
        <Link to="/">{t("common.back")}</Link>
      </div>
    );
  }

  /* Optional per-project full-width demo slot. It sits outside the article's
     rail+reading grid on purpose: a demo that wants the whole screen can't get
     it from inside the three-track layout. The mount point is deliberately
     bare — no padding, no max-width — so the project's own component owns
     every layout decision inside it. Carries the `live_demo` anchor so the
     hero's jump button lights up for free. */
  const HeroDemo = project.HeroDemo;

  return (
    <div className="project-page" style={project.meta?.style}>
      <ProjectHero project={project} />
      {HeroDemo && (
        <div className="project-hero-demo" id="live_demo">
          <HeroDemo />
        </div>
      )}
      <ProjectArticle project={project} />
    </div>
  );
}

export default Project;
