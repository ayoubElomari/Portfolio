import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useLanguage } from "../i18n/LanguageContext.jsx";

import "./style/Header.scss";

import MobileNavIcon from "../assets/mobile-nav.svg?react";
import MobileNavCloseIcon from "../assets/mobile-nav-close.svg?react";

function Header({ hideOnScroll }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { locale, setLocale, supportedLocales, t } = useLanguage();

  // Scroll state
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!hideOnScroll) {
      setHidden(false);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setHidden(true);
        setMobileNavOpen(false);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hideOnScroll]);

  return (
    <header className={hidden ? "hidden" : ""}>
      <div className="header-container">
        <Link to="/" className="logo-name">
          AYOUB.
        </Link>
        <button
          type="button"
          className={
            "mobile-nav-icon" +
            (mobileNavOpen
              ? " open " +
                ["left", "right", "top", "bottom"][
                  Math.floor(Math.random() * 4)
                ]
              : "")
          }
          aria-label={t(mobileNavOpen ? "nav.menuClose" : "nav.menuOpen")}
          aria-expanded={mobileNavOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
        >
          <MobileNavIcon className="open-icon" />
          <MobileNavCloseIcon className="close-icon" />
        </button>
        <div
          id="primary-navigation"
          className={`navigation ${mobileNavOpen ? "mobile-open" : ""}`}
        >
          {/* onClick closes the mobile slide-up panel — without it, a link
              press navigates but leaves the panel visibly open over the new
              page until something else happens to close it. */}
          <Link to="/about" onClick={() => setMobileNavOpen(false)}>
            {t("nav.about")}
          </Link>
          {/* There's no `/projects` route — the work lives in Home's showcase,
              so this lands there and scrolls down to it. */}
          <Link
            to="/"
            state={{ scrollTo: "projects" }}
            onClick={() => setMobileNavOpen(false)}
          >
            {t("nav.projects")}
          </Link>
          <Link to="/beyond" onClick={() => setMobileNavOpen(false)}>
            {t("nav.beyond")}
          </Link>
          <Link to="/resume" onClick={() => setMobileNavOpen(false)}>
            {t("nav.resume")}
          </Link>
          {/* Inside `.navigation` on purpose: on mobile that container *is* the
              slide-up panel, so the switcher comes along for free. */}
          <div
            className="lang-switch"
            role="group"
            aria-label={t("nav.language")}
          >
            {supportedLocales.map((code) => (
              <button
                key={code}
                type="button"
                className={"lang-option" + (code === locale ? " active" : "")}
                aria-pressed={code === locale}
                onClick={() => {
                  setLocale(code);
                  setMobileNavOpen(false);
                }}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
        <div
          className={`mobile-nav-background ${mobileNavOpen ? "mobile-open" : ""}`}
          onClick={() => setMobileNavOpen(false)}
        />
      </div>
    </header>
  );
}

export default Header;
