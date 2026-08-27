import { useLanguage } from "../i18n/LanguageContext.jsx";
import usePageMeta from "../lib/usePageMeta.js";

import "./style/Home.scss";
import Hero from "./sections/Home/Hero";
import Terminal from "./sections/Home/Terminal";
import ProjectsShowcase from "./sections/Home/ProjectsShowcase";
import Beyond from "./sections/Home/Beyond";

function Home() {
  const { t } = useLanguage();

  usePageMeta({
    title: t("home.metaTitle"),
    description: t("home.metaDescription"),
  });

  return (
    <div className="home-page">
      <Hero />
      <Terminal />
      <ProjectsShowcase />
      <Beyond />
    </div>
  );
}

export default Home;
