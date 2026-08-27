import { useEffect, useRef, useState } from "react";

import BeyondArticleFooter from "./components/BeyondArticleFooter";

/* The article shell, the three-track grid and the code theme are the same
   ones the project template uses — see `pages/BeyondEntry.jsx`. */
import "../Project/style/ProjectArticle.scss";
import "../Project/style/article.scss";
import "highlight.js/styles/github-dark.css";

import { useToc } from "../../../lib/useToc";
import mdxComponents from "../../../mdx/mdx-components";
import { useLanguage } from "../../../i18n/LanguageContext.jsx";

function TocLink({ entry, index, activeToc, onNavigate }) {
  const isActive = activeToc === entry.id;
  const hasActiveChild = entry.children?.some((c) => c.id === activeToc);

  return (
    <li
      className={
        "toc-item" +
        (isActive ? " is-active" : "") +
        (hasActiveChild ? " has-active-child" : "")
      }
    >
      <a
        href={`#${entry.id}`}
        className="toc-link"
        onClick={(e) => onNavigate(e, entry.id)}
      >
        {index != null && (
          <span className="toc-index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        <span className="toc-label">{entry.title}</span>
      </a>

      {entry.children?.length > 0 && (
        <ul className="toc-sublist">
          {entry.children.map((child) => (
            <li
              key={child.id}
              className={
                "toc-item toc-child" +
                (activeToc === child.id ? " is-active" : "")
              }
            >
              <a
                href={`#${child.id}`}
                className="toc-link"
                onClick={(e) => onNavigate(e, child.id)}
              >
                <span className="toc-label">{child.title}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function BeyondEntryArticle({ entry }) {
  const { t } = useLanguage();
  const articleRef = useRef(null);
  /* Keyed on the MDX component so the rail re-scans when the article is
     swapped for another language's version. */
  const { tocs, activeToc, progress } = useToc(articleRef, entry.Component);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [snapping, setSnapping] = useState(false);

  /* Close the sheet if the reader navigates by some other means. */
  useEffect(() => {
    if (!mobileTocOpen) return;
    const close = () => setMobileTocOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [mobileTocOpen]);

  /* When the mobile sheet is open, the panel occupies real layout height.
     Letting the browser resolve the `#hash` jump while the panel animates
     shut scrolls to a position that no longer exists by the time it lands.
     So: collapse the sheet without a transition, let layout settle, then
     scroll from the corrected position. */
  const handleTocNavigate = (event, id) => {
    if (!mobileTocOpen) return; // desktop rail: let the anchor do its job

    event.preventDefault();
    setSnapping(true);
    setMobileTocOpen(false);

    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        });
        window.history.replaceState(null, "", `#${id}`);
      }
      requestAnimationFrame(() => setSnapping(false));
    });
  };

  const activeTitle =
    tocs
      .flatMap((section) => [section, ...(section.children || [])])
      .find((section) => section.id === activeToc)?.title || t("toc.contents");

  const percent = Math.round(progress * 100);

  return (
    <section className="project-article-section beyond-entry-article-section">
      <div className="article-container">
        {tocs.length > 0 && (
          <nav
            className={
              "article-toc" +
              (mobileTocOpen ? " is-open" : "") +
              (snapping ? " is-snapping" : "")
            }
            aria-label={t("toc.label")}
          >
            <button
              type="button"
              className="toc-toggle"
              aria-expanded={mobileTocOpen}
              onClick={() => setMobileTocOpen((v) => !v)}
            >
              <span className="toc-toggle-label">{t("toc.contents")}</span>
              <span className="toc-toggle-current">{activeTitle}</span>
              <span className="toc-toggle-chevron" aria-hidden="true" />
            </button>

            <div className="toc-panel">
              <div className="toc-head" aria-hidden="true">
                <span className="toc-heading">{t("toc.contents")}</span>
                <span className="toc-percent">{percent}%</span>
              </div>
              <div className="toc-track">
                <span
                  className="toc-progress"
                  style={{ transform: `scaleY(${progress})` }}
                  aria-hidden="true"
                />
                <ul className="toc-list">
                  {tocs.map((toc, i) => (
                    <TocLink
                      key={toc.id}
                      entry={toc}
                      index={i}
                      activeToc={activeToc}
                      onNavigate={handleTocNavigate}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </nav>
        )}

        <article className="project-article" ref={articleRef}>
          <entry.Component components={mdxComponents} />
        </article>
      </div>

      <BeyondArticleFooter entry={entry} />
    </section>
  );
}
