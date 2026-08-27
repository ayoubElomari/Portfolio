import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* Same masthead as a project's hero, reading the same stylesheet — see the
   note in `pages/BeyondEntry.jsx` for why the template is shared rather than
   copied. Only the data source and the back-link destination differ. */
import "../Project/style/ProjectHero.scss";

import ArrowDown from "../../../assets/arrow-down.svg?react";
import { getBeyondEntryIndex } from "../../../lib/beyond";
import { useLanguage } from "../../../i18n/LanguageContext.jsx";

/* Anchors an entry's `page.<locale>.mdx` can drop to opt into a hero action.
   Each button only renders if its anchor is actually in the article, so an
   entry with no deep-dive split never shows dead UI. */
const HERO_ANCHORS = [
  { id: "live_demo", label: "Live demo", variant: "primary" },
  { id: "more_in_depth", label: "Deep dive", variant: "ghost" },
];

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function scrollToAnchor(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function BeyondEntryHero({ entry }) {
  const meta = entry.meta || {};
  const { locale, t } = useLanguage();
  const [available, setAvailable] = useState([]);

  /* The article renders in the same commit as this component, so any anchor
     dropped in the entry's MDX is already in the DOM by the time effects run
     (same technique `useToc` uses to scan headings). */
  useEffect(() => {
    setAvailable(
      HERO_ANCHORS.filter((a) => !!document.getElementById(a.id)).map(
        (a) => a.id,
      ),
    );
  }, [entry]);

  const actions = HERO_ANCHORS.filter((a) => available.includes(a.id));

  /* `titlePrefix` is a freeform discipline string ("Automation; Tooling") —
     split it into kicker terms rather than dumping it raw. */
  const kicker = String(meta.titlePrefix || "")
    .split(/[;,/|]/)
    .map((part) => part.trim())
    .filter(Boolean);

  const year = /^\d{4}/.test(String(meta.date || ""))
    ? String(meta.date).slice(0, 4)
    : null;

  const counter = getBeyondEntryIndex(meta.slug, locale);

  const stats = [
    ...(Array.isArray(meta.stats) ? meta.stats : []),
    meta.duration ? { label: t("hero.duration"), value: meta.duration } : null,
  ].filter((s) => s && s.label && s.value);

  return (
    <section className="project-hero beyond-entry-hero">
      <div className="hero-atmosphere" aria-hidden="true">
        <div className="atmosphere-glow" />
        <div className="atmosphere-grid" />
        <div className="atmosphere-grain" />
      </div>

      <div className="hero-canvas">
        {/* Deliberately <div>s, not <header>/<footer>: the site chrome styles
            those as bare element selectors globally. */}
        <div className="hero-eyebrow">
          <Link to="/beyond" className="hero-back">
            <span className="hero-back-arrow" aria-hidden="true">
              &#8592;
            </span>
            <span>{t("common.allIdeas")}</span>
          </Link>

          <div className="hero-meta">
            {counter && (
              <span className="hero-counter">
                <span className="counter-now">{pad(counter.position)}</span>
                <span className="counter-slash" aria-hidden="true">
                  /
                </span>
                <span className="counter-total">{pad(counter.total)}</span>
              </span>
            )}
            {year && <span className="hero-year">{year}</span>}
          </div>
        </div>

        <div className="hero-masthead">
          {kicker.length > 0 && (
            <p className="hero-kicker">
              {kicker.map((term, i) => (
                <span key={term} className="kicker-term">
                  {i > 0 && (
                    <span className="kicker-sep" aria-hidden="true">
                      &#183;
                    </span>
                  )}
                  {term}
                </span>
              ))}
            </p>
          )}

          <h1 className="hero-title">{meta.title}</h1>
        </div>

        <div className={"hero-deck" + (meta.cover ? " has-plate" : "")}>
          <div className="hero-pitch">
            {meta.subtitle && <p className="hero-subtitle">{meta.subtitle}</p>}

            {meta.description && (
              <p className="hero-description">{meta.description}</p>
            )}

            {actions.length > 0 && (
              <div className="hero-actions">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    className={`hero-action ${action.variant}`}
                    onClick={() => scrollToAnchor(action.id)}
                  >
                    <span>{action.label}</span>
                    <ArrowDown className="action-arrow" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {meta.cover && (
            <figure className="hero-plate">
              <div className="plate-frame">
                <img
                  src={meta.cover}
                  alt={meta.title ? `${meta.title} — cover` : ""}
                  fetchPriority="high"
                />
                <span className="plate-tick tl" aria-hidden="true" />
                <span className="plate-tick tr" aria-hidden="true" />
                <span className="plate-tick bl" aria-hidden="true" />
                <span className="plate-tick br" aria-hidden="true" />
              </div>
              <figcaption className="plate-caption">
                <span className="plate-caption-mark" aria-hidden="true" />
                {meta.title}
              </figcaption>
            </figure>
          )}
        </div>

        {stats.length > 0 && (
          <dl className="hero-spec">
            {stats.map((stat, i) => (
              <div className="spec-cell" key={stat.label}>
                <span className="spec-index" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

export default BeyondEntryHero;
