import { Link } from "react-router-dom";

import { useLanguage } from "../i18n/LanguageContext.jsx";
import usePageMeta from "../lib/usePageMeta.js";

import "./style/NotFound.scss";

function NotFound() {
  const { t } = useLanguage();

  usePageMeta({ title: t("notFound.metaTitle") });

  return (
    <div className="not-found-page">
      <span className="not-found-code" aria-hidden="true">
        404
      </span>
      <h1 className="not-found-heading">{t("notFound.heading")}</h1>
      <p className="not-found-body">{t("notFound.body")}</p>
      <div className="not-found-actions">
        <Link to="/" className="not-found-action primary">
          {t("notFound.home")}
        </Link>
        {/* Mirrors the header/footer: there's no `/projects` route, so land on
            Home and scroll down to the showcase. */}
        <Link
          to="/"
          state={{ scrollTo: "projects" }}
          className="not-found-action"
        >
          {t("notFound.work")}
        </Link>
        <Link to="/beyond" className="not-found-action">
          {t("notFound.ideas")}
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
