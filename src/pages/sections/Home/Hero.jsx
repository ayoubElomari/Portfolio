import BgPattern from "../../components/BgPattern";
import ImageMaskEffect from "../../components/ImageMaskEffect";
import { useLanguage } from "../../../i18n/LanguageContext.jsx";

import "./style/Hero.scss";

import heroPlus from "../../../assets/hero-plus.svg";
import AccentIcon from "../../../assets/accent-icon.svg?react";

/* Photos come straight out of the gallery folder, so swapping one out or
   dropping a new one in needs no code change here. Sorted by filename to keep
   the intended order, capped at four to protect the 2x2 grid.

   These go through Vite's asset pipeline (unlike the raw "src/assets/..."
   strings this used to use, which resolve in dev but 404 in a real build). */
const galleryModules = import.meta.glob(
  "../../../assets/hero gallery/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" },
);
const gallery = Object.keys(galleryModules)
  .sort()
  .map((path) => galleryModules[path])
  .slice(0, 4);

const META = ["location", "status", "focus"];

/* NOTE: every string here is placeholder copy, living under home.hero.* in
   the dictionaries — replace with real details before launch. */
function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero-section">
      <div className="hero-part top left">
        <div className="part-content">
          <span className="hero-kicker">{t("home.hero.kicker")}</span>
          <div className="sidebyside-container">
            <h1 className="hero-title">
              AYOUB <br />
              EL OMARI
            </h1>
            <div className="accent-icon">
              <AccentIcon />
            </div>
          </div>
          <p className="hero-lede">{t("home.hero.lede")}</p>
        </div>
      </div>

      <div className="hero-part top right">
        <BgPattern />
        <div className="part-content">
          <p className="hero-description">{t("home.hero.role")}</p>
          <p className="hero-bio">{t("home.hero.bio")}</p>
          <dl className="hero-meta">
            {META.map((key) => (
              <div className="hero-meta-row" key={key}>
                <dt>{t(`home.hero.meta.${key}.label`)}</dt>
                <dd>{t(`home.hero.meta.${key}.value`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="hero-part bottom left">
        <BgPattern />
        <div className="part-content">
          <p className="hero-description">{t("home.hero.tagline")}</p>
          <p className="hero-blurb">{t("home.hero.blurb")}</p>
          <span className="hero-hint">{t("home.hero.galleryHint")}</span>
        </div>
      </div>

      <div className="hero-part bottom right">
        <div className="part-content">
          <div className="image-grid">
            {gallery.map((src, i) => (
              <ImageMaskEffect
                key={src}
                imageSrc={src}
                alt={t("home.hero.galleryAlt", { n: i + 1 })}
              />
            ))}
          </div>
        </div>
      </div>

      <div id="hero-center-plus">
        <img
          src={heroPlus}
          alt={t("home.hero.plusIconAlt")}
          width="54"
          height="54"
        />
      </div>
    </section>
  );
}

export default Hero;
