import { Link } from "react-router-dom";

import { useLanguage } from "../../i18n/LanguageContext.jsx";
import useInView from "../../lib/useInView.js";

import "./style/ProjectCard.scss";

import ViewIcon from "../../assets/go-to-icon.svg?react";

function ProjectCard({ slug, titlePrefix, title, duration, imageUrl }) {
  const { t } = useLanguage();
  /* Each card watches itself rather than the list watching all of them, so a
     card animates when you actually reach it — the ones below the fold aren't
     already finished by the time you scroll down. */
  const [cardRef, inView] = useInView(0.15);

  return (
    <Link to={`/project/${slug}`} className="project-link">
      <div
        className={`project-card${inView ? " is-revealed" : ""}`}
        ref={cardRef}
      >
        <div className="project-info">
          <div className="top-part">
            <span className="project-title-prefix">{titlePrefix}</span>
            <h3 className="project-title">{title}</h3>
          </div>
          <div className="bottom-part">
            <div className="project-duration">
              <span className="duration-label">
                {t("hero.duration").toUpperCase()}
              </span>
              <span className="duration-value">{duration}</span>
            </div>
            <button
              className="view-project-button"
              aria-label={t("home.projects.viewButtonAlt", { title })}
            >
              <div className="icons-container" aria-hidden="true">
                <ViewIcon />
                <ViewIcon />
              </div>
            </button>
          </div>
        </div>
        <div className="product-image-container">
          <div className="project-image">
            <img
              src={imageUrl}
              alt={`${title} Screenshot`}
              width="512"
              height="320"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProjectCard;
