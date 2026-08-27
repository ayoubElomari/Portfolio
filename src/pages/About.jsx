import { useCallback, useState } from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "../i18n/LanguageContext.jsx";
import useInView from "../lib/useInView.js";
import usePageMeta from "../lib/usePageMeta.js";

import "./style/About.scss";

import QuoteIcon from "../assets/about/quote-icon.svg?react";
import Signature from "../assets/about/signature.svg";
import pfp from "../assets/about/pfp.webp";

/* A proper noun — same in every locale, so it stays out of the dictionaries,
   same as the header's `AYOUB.` logotype. */
const NAME = "Ayoub El Omari";

/* Matches the address used in `Footer.jsx`. Change both together. */
const CONTACT_EMAIL = "ayoubelomari463@gmail.com";

/* Key stems only. Each resolves against `about.<group>.<id>.<field>`, so
   adding a row is an id here plus its strings in every dictionary — no JSX
   change. */
const LEDGER = ["since", "shipped", "stack", "base"];
const CHAPTERS = ["work", "method", "learning"];
const TIMELINE = ["1", "2", "3", "4", "5"];
/* The 2027 row is a plan, not a fact yet — dimmed via `is-future` rather than
   left indistinguishable from the rest of the chronology. */
const FUTURE_TIMELINE_IDS = new Set(["5"]);

/* Translated copy names the Rendr project by name in a couple of spots.
   Turning just that word into a link (rather than a whole sentence) lets a
   reader who doesn't recognise it click through without disrupting the
   sentence. Splitting on a capturing group keeps every other word intact. */
function withRendrLink(text) {
  return text.split(/(Rendr)/g).map((part, i) =>
    part === "Rendr" ? (
      <Link key={i} to="/project/rendr" className="rendr-link">
        Rendr
      </Link>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function About() {
  const { t } = useLanguage();
  const [timelineRef, timelineInView] = useInView(0.12);

  /* The grade plays once the photo has actually decoded. Kicking it off on
     mount instead would burn the animation on an empty frame whenever the
     image is slower than the render — the whole effect is the colour draining
     out of a picture you've already seen.

     `onLoad` alone misses the cached case: the browser can fire `load` before
     React attaches the handler, leaving the photo stuck un-graded. A callback
     ref runs at commit, once the node exists and its `src` is set, so it can
     catch an already-complete image. (An effect would do the same job but
     trips `react-hooks/set-state-in-effect`.) */
  const [portraitReady, setPortraitReady] = useState(false);

  const portraitRef = useCallback((node) => {
    if (node?.complete) setPortraitReady(true);
  }, []);

  usePageMeta({
    title: t("about.metaTitle"),
    description: t("about.metaDescription"),
  });

  return (
    <div className="about-page">
      {/* ── Masthead ───────────────────────────────────────────────────────
          Simple two-up: photo on the left, everything else stacked to its
          right. Photo comes first in the DOM on purpose — that's also the
          order that reads correctly once the layout stacks on mobile. */}
      <section className="about-masthead">
        <div className="masthead-portrait rdr2-frame">
          <img
            ref={portraitRef}
            className={"rdr2-grade" + (portraitReady ? " rdr2-grade-in" : "")}
            src={pfp}
            alt={t("about.portraitAlt")}
            onLoad={() => setPortraitReady(true)}
          />
        </div>
        <div className="masthead-text">
          <span className="about-eyebrow">{t("about.eyebrow")}</span>
          <h1 className="masthead-name">{NAME}</h1>
          <span className="masthead-role">{t("about.role")}</span>
          <p className="masthead-lede">{t("about.lede")}</p>
        </div>
      </section>

      {/* ── Ledger ───────────────────────────────────────────────────────── */}
      <section className="about-ledger" aria-label={t("about.ledgerLabel")}>
        {LEDGER.map((id) => (
          <div className="ledger-item" key={id}>
            <span className={`ledger-value ledger-value-${id}`}>
              {t(`about.ledger.${id}.value`)}
            </span>
            <span className="ledger-label">{t(`about.ledger.${id}.label`)}</span>
          </div>
        ))}
      </section>

      {/* ── Narrative ────────────────────────────────────────────────────── */}
      <section className="about-narrative">
        {CHAPTERS.map((id, i) => (
          <article className="chapter" key={id}>
            <div className="chapter-margin" aria-hidden="true">
              <span className="chapter-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="chapter-rule" />
            </div>
            <div className="chapter-body">
              <h2 className="chapter-title">{t(`about.chapters.${id}.title`)}</h2>
              <p className="chapter-text">
                {withRendrLink(t(`about.chapters.${id}.body`))}
              </p>
            </div>
          </article>
        ))}

        <figure className="about-pull">
          <div className="pull-icon" aria-hidden="true">
            <QuoteIcon />
          </div>
          <blockquote>{t("about.pull")}</blockquote>
        </figure>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <section
        className={"about-timeline" + (timelineInView ? " in-view" : "")}
        ref={timelineRef}
      >
        <h2 className="timeline-heading">{t("about.timeline.heading")}</h2>
        <ol className="timeline-list">
          {TIMELINE.map((n, i) => (
            <li
              className={
                "timeline-row" +
                (FUTURE_TIMELINE_IDS.has(n) ? " is-future" : "")
              }
              key={n}
              /* Staggered so the rows draw down the rail in sequence. */
              style={{ "--row-delay": `${i * 110}ms` }}
            >
              <span className="row-year">{t(`about.timeline.${n}.year`)}</span>
              <span className="row-marker" aria-hidden="true" />
              <div className="row-text">
                <h3 className="row-title">
                  {withRendrLink(t(`about.timeline.${n}.title`))}
                </h3>
                <p className="row-body">
                  {withRendrLink(t(`about.timeline.${n}.body`))}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Sign-off ─────────────────────────────────────────────────────── */}
      <section className="about-signoff">
        <div className="signoff-block">
          <p className="signoff-text">{t("about.signoff")}</p>
          <a className="signoff-cta" href={`mailto:${CONTACT_EMAIL}`}>
            {t("about.cta")}
            {/* U+FE0E forces text presentation — bare arrows render as colour
                emoji on iOS otherwise. */}
            <span aria-hidden="true"> &#8599;&#xFE0E;</span>
          </a>
        </div>
        {/* Decorative: the name is already the page's <h1>, so announcing the
            signature again is noise. */}
        <img className="signoff-mark" src={Signature} alt="" aria-hidden="true" />
      </section>
    </div>
  );
}

export default About;
