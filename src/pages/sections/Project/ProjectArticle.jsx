import { useEffect, useRef, useState } from "react";

import ArticleFooter from "./components/ArticleFooter";

import "./style/ProjectArticle.scss";
import "./style/article.scss";
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

/* Toggles the classes the fade mask in ProjectArticle.scss reads — top/bottom
   edges only fade when there's actually more list to scroll to in that
   direction, so a short list never fades content that isn't there. */
function updateTocScrollFade(el) {
  if (!el) return;
  el.classList.toggle("can-scroll-up", el.scrollTop > 2);
  el.classList.toggle(
    "can-scroll-down",
    el.scrollTop < el.scrollHeight - el.clientHeight - 2,
  );
}

/* Keeps the active entry pinned at a fixed, comfortable read position inside
   the list's own scroll — not "nearest edge, only once fully out of view."
   Every active-section change re-seats it, so the rail reads as continuously
   tracking your place in the article rather than snapping late. */
const TOC_ACTIVE_OFFSET_RATIO = 0.2;

function scrollActiveTocIntoPlace(scrollEl, behavior = "smooth") {
  const link = scrollEl?.querySelector(".toc-item.is-active > .toc-link");
  /* A collapsed mobile sheet has zero height, which would make the 20% target
     resolve to 0 and jam every active entry against the top edge. There's no
     meaningful position to compute until it's actually open. */
  if (!scrollEl || !link || scrollEl.clientHeight === 0) return;

  const scrollRect = scrollEl.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const currentOffset = linkRect.top - scrollRect.top;
  const targetOffset = scrollEl.clientHeight * TOC_ACTIVE_OFFSET_RATIO;
  const maxScrollTop = scrollEl.scrollHeight - scrollEl.clientHeight;
  const targetScrollTop = Math.max(
    0,
    Math.min(maxScrollTop, scrollEl.scrollTop + (currentOffset - targetOffset)),
  );

  scrollEl.scrollTo({
    top: targetScrollTop,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : behavior,
  });
  updateTocScrollFade(scrollEl);
}

export default function ProjectArticle({ project }) {
  const { t } = useLanguage();
  const articleRef = useRef(null);
  const tocScrollRef = useRef(null);
  /* Keyed on the MDX component so the rail re-scans when the article is
     swapped for another language's version. */
  const { tocs, activeToc, progress } = useToc(articleRef, project.Component);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [snapping, setSnapping] = useState(false);

  /* The list can be taller than the room the rail has (many sections, deep
     sub-headings, or just a short window), so it scrolls inside itself rather
     than pushing the sticky rail's overflow out of reach. Re-seat on every
     active-section change instead of only nudging once an entry is fully
     scrolled out. */
  useEffect(() => {
    scrollActiveTocIntoPlace(tocScrollRef.current);
  }, [activeToc]);

  /* Height changes don't fire `scroll`, and several of them matter here: the
     mobile sheet expanding from zero (where the 20% target is meaningless
     until it lands), a viewport resize, and a language swap changing the
     list. A ResizeObserver catches all three, where an effect on
     `mobileTocOpen` alone would fire while the sheet is still animating open
     and compute against a height it's about to leave behind. */
  useEffect(() => {
    const el = tocScrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      scrollActiveTocIntoPlace(el, "auto");
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    updateTocScrollFade(tocScrollRef.current);
  }, [tocs, mobileTocOpen]);

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
      .flatMap((entry) => [entry, ...(entry.children || [])])
      .find((entry) => entry.id === activeToc)?.title || t("toc.contents");

  const percent = Math.round(progress * 100);

  return (
    <section className="project-article-section">
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
              {/* `.toc-track` is the fixed frame — it owns the rail line and
                  the progress fill, and deliberately does not scroll, so
                  neither can be scrolled away or clipped by the list's fade
                  mask. Only `.toc-scroll` inside it moves. */}
              <div className="toc-track">
                <span
                  className="toc-progress"
                  style={{ transform: `scaleY(${progress})` }}
                  aria-hidden="true"
                />
                <div
                  className="toc-scroll"
                  ref={tocScrollRef}
                  onScroll={(e) => updateTocScrollFade(e.currentTarget)}
                >
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
            </div>
          </nav>
        )}

        <article className="project-article" ref={articleRef}>
          <project.Component components={mdxComponents} />
        </article>
      </div>

      <ArticleFooter project={project} />
    </section>
  );
}
