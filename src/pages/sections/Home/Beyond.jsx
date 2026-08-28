import { Link } from "react-router-dom";

import { useLanguage } from "../../../i18n/LanguageContext.jsx";
import useInView from "../../../lib/useInView.js";

import "./style/Beyond.scss";

import accentIcon from "../../../assets/accent-icon.svg";
import ArrowRightIcon from "../../../assets/arrow-right.svg?react";

/* The topic categories the /beyond page groups its ideas into. Still a
   hardcoded list rather than one derived from the real entries. Keep it
   in sync with `TAG_ORDER` in `src/pages/Beyond.jsx`; both read their labels
   from the same `home.beyond.tags.*` keys. */
const TAGS = ["infrastructure", "automation"];

function Beyond() {
  const { t } = useLanguage();
  const [sectionRef, inView] = useInView(0.25);

  return (
    <section
      className={`beyond-section${inView ? " is-revealed" : ""}`}
      ref={sectionRef}
    >
      <div className="bg-accent-icon" aria-hidden="true">
        <img src={accentIcon} alt="" />
        <img src={accentIcon} alt="" />
      </div>

      <div className="section-content">
        <span className="beyond-eyebrow">{t("home.beyond.eyebrow")}</span>
        <h2 className="section-headline">{t("home.beyond.headline")}</h2>
        <p className="section-body">{t("home.beyond.body")}</p>

        <ul className="beyond-tags">
          {TAGS.map((tag, i) => (
            <li key={tag} style={{ "--i": i }}>
              {t(`home.beyond.tags.${tag}`)}
            </li>
          ))}
        </ul>

        <Link to="/beyond" className="action-button">
          <span>{t("home.beyond.cta")}</span>
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  );
}

export default Beyond;
