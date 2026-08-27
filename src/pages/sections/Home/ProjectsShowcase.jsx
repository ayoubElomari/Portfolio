import ProjectCard from "../../components/ProjectCard.jsx";
import { getProjects } from "../../../lib/projects.js";
import { useLanguage } from "../../../i18n/LanguageContext.jsx";

import "./style/ProjectsShowcase.scss";

import accentIcon from "../../../assets/accent-icon-double.svg";

function ProjectsShowcase() {
  const { locale, t } = useLanguage();
  const projects = getProjects(locale);

  return (
    /* `id` is the landing target for the header/footer "projects" links and a
       project article's "All work" link — see `lib/ScrollRestore.js`. */
    <section className="projects-showcase-section" id="projects">
      <div className="section-header">
        <img
          src={accentIcon}
          alt=""
          className="accent-icon"
          width="111"
          height="80"
        />
        <h2>{t("home.projects.heading")}</h2>
      </div>
      <div className="project-list">
        {projects.map((project, i) => (
          <ProjectCard
            key={i}
            slug={project.meta?.slug}
            titlePrefix={project.meta?.titlePrefix}
            title={project.meta?.title}
            duration={project.meta?.duration}
            imageUrl={project.meta?.cover}
          />
        ))}
      </div>
    </section>
  );
}

export default ProjectsShowcase;
