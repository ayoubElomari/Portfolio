import { Link } from "react-router-dom";

import { useLanguage } from "../i18n/LanguageContext.jsx";
import BgPattern from "../pages/components/BgPattern";

import "./style/Footer.scss";

import ArrowUpIcon from "../assets/arrow-up.svg?react";
/* Restore alongside the commented-out LinkedIn link below, once there's a
   real profile URL. Left out for now so it isn't an unused import. */
// import LinkedInIcon from "../assets/socials/linkedin.svg?react";
import EmailIcon from "../assets/socials/email.svg?react";
import GitHubIcon from "../assets/socials/github.svg?react";

const CONTACT_EMAIL = "ayoubelomari463@gmail.com";
const PHONE_DISPLAY = "+33 6 05 89 64 60";
const PHONE_HREF = "+33605896460";
const GITHUB_URL = "https://github.com/ayoubElomari";

function Footer() {
  const { t } = useLanguage();

  return (
    <footer>
      <div className="personal-info-container">
        <div className="info-section contact-info">
          <span className="section-title">{t("footer.contact")}</span>
          <div className="section-content">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a className="phone-number" href={`tel:${PHONE_HREF}`}>
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>

        <div className="info-section location-info">
          <span className="section-title">{t("footer.location")}</span>
          <div className="section-content">
            <span className="location">Essonnes, France</span>
          </div>
        </div>
        <div className="info-section social-links-info">
          <span className="section-title">{t("footer.social")}</span>

          <div className="section-content">
            {/* These were `<a href="">` wrapping a `<button>` — an empty href
                reloads the current page, and nesting a button inside an
                anchor is invalid. Now plain anchors with accessible names.
                Restore the LinkedIn entry below once there's a real profile
                URL to point at; a placeholder is worse than an absence. */}
            <div className="social-links">
              {/*
              <a
                href="https://www.linkedin.com/in/"
                className="link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("footer.linkedinLabel")}
              >
                <LinkedInIcon />
              </a>
              */}
              <a
                href={GITHUB_URL}
                className="link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("footer.githubLabel")}
              >
                <GitHubIcon />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="link"
                aria-label={t("footer.emailLabel")}
              >
                <EmailIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        {/* The hero's drifting grid, running behind the whole bottom strip so
            there's still something quietly moving at the very bottom of every
            page. Absolutely positioned, so it isn't a flex item and doesn't
            disturb the space-between layout. */}
        <BgPattern />
        <span className="copyright">{t("footer.copyright")}</span>
        <div className="navigation">
          <Link to="/about">{t("nav.about")}</Link>
          {/* Mirrors the header: no `/projects` route, so land on Home and
              scroll to the showcase. */}
          <Link to="/" state={{ scrollTo: "projects" }}>
            {t("nav.projects")}
          </Link>
          <Link to="/beyond">{t("nav.beyond")}</Link>
          <Link to="/resume">{t("nav.resume")}</Link>
        </div>
        <button
          className="go-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUpIcon />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
