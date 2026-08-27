import { Link } from "react-router-dom";

import "./style/ArticleFooter.scss";

import { getAdjacentProjects } from "../../../../lib/projects";
import { useLanguage } from "../../../../i18n/LanguageContext.jsx";

/* ─────────────────────────────────────────────────────────────────────────
   Article footer — one large "next" plate rather than two equal cards.

   A symmetric prev/next pair gives the reader no reason to pick either. This
   commits: the next project is a full-width invitation with its own cover,
   and the previous one stays a quiet hairline link beneath it.
   ───────────────────────────────────────────────────────────────────────── */
function NextPlate({ project }) {
  const meta = project.meta || {};
  const { t } = useLanguage();

  return (
    <Link to={`/project/${meta.slug}`} className="next-plate">
      <div className="next-visual">
        {meta.cover && <img src={meta.cover} alt="" loading="lazy" />}
        <span className="next-tick tl" aria-hidden="true" />
        <span className="next-tick br" aria-hidden="true" />
      </div>

      <div className="next-body">
        {meta.titlePrefix && (
          <span className="next-kicker">{meta.titlePrefix}</span>
        )}
        <span className="next-title">{meta.title}</span>
        {meta.subtitle && <span className="next-sub">{meta.subtitle}</span>}
        <span className="next-cta">
          <span>{t("articleFooter.readCaseStudy")}</span>
          <span className="next-arrow" aria-hidden="true">
            &#8594;
          </span>
        </span>
      </div>
    </Link>
  );
}

function ArticleFooter({ project }) {
  const { locale, t } = useLanguage();
  const { previous, next } = getAdjacentProjects(project.meta?.slug, locale);

  if (!previous && !next) return null;

  const forward = next || previous;

  return (
    /* Deliberately a <div>, not <footer>: `sections/style/Footer.scss`
       styles the bare `footer` element globally. */
    <div className="project-footer">
      <div className="footer-rule">
        <span className="footer-label">{t("articleFooter.nextProject")}</span>
        <span className="footer-hair" aria-hidden="true" />
      </div>

      {forward && <NextPlate project={forward} />}

      <div className="footer-tail">
        {previous && next && (
          <Link
            to={`/project/${previous.meta?.slug}`}
            className="tail-link previous"
          >
            <span className="tail-arrow" aria-hidden="true">
              &#8592;
            </span>
            <span className="tail-role">{t("articleFooter.previous")}</span>
            <span className="tail-name">{previous.meta?.title}</span>
          </Link>
        )}

        <Link
          to="/"
          state={{ scrollTo: "projects" }}
          className="tail-link index"
        >
          <span className="tail-role">{t("common.allWork")}</span>
          <span className="tail-arrow" aria-hidden="true">
            {/* U+FE0E forces the text glyph — without it iOS renders this
                arrow as a colour emoji instead of a thin line arrow. */}
            &#8599;&#xFE0E;
          </span>
        </Link>
      </div>
    </div>
  );
}

export default ArticleFooter;
