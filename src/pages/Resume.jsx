import { useEffect, useRef, useState } from "react";

import { useLanguage } from "../i18n/LanguageContext.jsx";
import usePageMeta from "../lib/usePageMeta.js";

import "./style/Resume.scss";

/* The CV lives in `public/`, which Vite serves verbatim at the root without
   touching the asset pipeline — the one place a plain string path is correct
   rather than an `import`. Drop the files in as:
     public/cv-ayoub-el-omari.en.pdf
     public/cv-ayoub-el-omari.fr.pdf
   A locale with no file of its own falls back to the English one. */
const CV_FILES = {
  en: "/cv-ayoub-el-omari.en.pdf",
  fr: "/cv-ayoub-el-omari.fr.pdf",
};
const CV_FALLBACK = CV_FILES.en;

const HIGHLIGHTS = ["1", "2", "3"];

/* Resolves which CV file actually exists, so the page can disable its own
   actions instead of handing someone a 404. Checks the locale's file first,
   then the English fallback. */
async function resolveCvUrl(locale) {
  const candidates = [CV_FILES[locale], CV_FALLBACK].filter(Boolean);

  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      /* The dev server answers unknown paths with the SPA shell, so a 200
         alone isn't proof — the content type has to actually be a PDF. */
      if (res.ok && (res.headers.get("content-type") || "").includes("pdf")) {
        return url;
      }
    } catch {
      /* Network error — treat as missing and try the next candidate. */
    }
  }
  return null;
}

function Resume() {
  const { locale, t } = useLanguage();
  const [cvUrl, setCvUrl] = useState(null);
  const [checked, setChecked] = useState(false);
  const printFrameRef = useRef(null);

  usePageMeta({
    title: t("resume.metaTitle"),
    description: t("resume.metaDescription"),
  });

  useEffect(() => {
    let cancelled = false;
    setChecked(false);

    resolveCvUrl(locale).then((url) => {
      if (cancelled) return;
      setCvUrl(url);
      setChecked(true);
    });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  /* Prints the PDF itself rather than this page — which is why there's no
     print stylesheet here. The hidden iframe lets the browser's own PDF
     print dialog open in place; if that's blocked (some browsers refuse to
     script-print a framed PDF), fall back to opening the file in a tab where
     the viewer's own print button is one click away. */
  const handlePrint = () => {
    const frame = printFrameRef.current;
    try {
      const win = frame?.contentWindow;
      if (!win) throw new Error("no print frame");
      win.focus();
      win.print();
    } catch {
      window.open(cvUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="resume-page">
      <div className="resume-plate">
        <span className="resume-eyebrow">{t("resume.eyebrow")}</span>
        <h1 className="resume-heading">{t("resume.heading")}</h1>
        <p className="resume-lede">{t("resume.lede")}</p>

        <ul className="resume-highlights">
          {HIGHLIGHTS.map((n) => (
            <li className="highlight" key={n}>
              <span className="highlight-marker" aria-hidden="true" />
              {t(`resume.highlights.${n}`)}
            </li>
          ))}
        </ul>

        <div className="resume-actions">
          <a
            className={"resume-action primary" + (cvUrl ? "" : " disabled")}
            href={cvUrl || undefined}
            download
            aria-disabled={!cvUrl}
            /* An anchor with no href is still focusable and clickable; block
               it outright rather than relying on styling to communicate. */
            onClick={(e) => {
              if (!cvUrl) e.preventDefault();
            }}
          >
            {t("resume.download")}
          </a>
          <button
            type="button"
            className="resume-action"
            onClick={handlePrint}
            disabled={!cvUrl}
          >
            {t("resume.print")}
          </button>
        </div>

        {/* Only speak up once the check has actually run — flashing "not
            available" for a moment on every load would be worse than silence. */}
        {checked && !cvUrl && (
          <p className="resume-notice" role="status">
            {t("resume.unavailable")}
          </p>
        )}

        <p className="resume-footnote">{t("resume.footnote")}</p>
      </div>

      {cvUrl && (
        <iframe
          ref={printFrameRef}
          className="resume-print-frame"
          src={cvUrl}
          title={t("resume.frameTitle")}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
    </div>
  );
}

export default Resume;
