import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Header from "./sections/Header";
import Footer from "./sections/Footer";
import Toast from "./sections/Toast";
import Home from "./pages/Home";
import Project from "./pages/Project";
import Beyond from "./pages/Beyond";
import BeyondEntry from "./pages/BeyondEntry";
import About from "./pages/About";
import Resume from "./pages/Resume";
import NotFound from "./pages/NotFound";
import { useLanguage } from "./i18n/LanguageContext.jsx";

/* Pages that redirect away when the requested content has no translation in
   the active locale hand the reason over in router state; each one maps to
   the message the toast should carry. */
const REDIRECT_TOASTS = {
  "untranslated-project": "toast.projectUnavailable",
  "untranslated-beyond-entry": "toast.beyondUnavailable",
};

function App() {
  const [hideHeaderOnScroll, setHideHeaderOnScroll] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Listen for route changes to determine when to hide the header
  const location = useLocation();
  const navigate = useNavigate();
  const { locale, t } = useLanguage();

  useEffect(() => {
    const path = location.pathname;

    // Long reads hide the header on scroll. `/beyond/:slug` is one of them;
    // the `/beyond` listing above it is not — it behaves like Home.
    if (
      path.startsWith("/project/") ||
      path.startsWith("/beyond/") ||
      path === "/about"
    ) {
      setHideHeaderOnScroll(true);
    } else {
      setHideHeaderOnScroll(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    // `Project.jsx` / `BeyondEntry.jsx` redirect here (via `replace`, carrying
    // `state`) when the content exists but has no translation for the active
    // locale — without this, the reader is silently dropped elsewhere with no
    // explanation for why what they clicked disappeared.
    const messageKey = REDIRECT_TOASTS[location.state?.redirectReason];
    if (!messageKey) return;

    setToastMessage(t(messageKey, { language: t(`language.${locale}`) }));
    // Clear the state so a reload/back-forward doesn't keep re-showing it.
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, locale, t, navigate, location.pathname]);

  return (
    <>
      {/* First focusable thing on the page: lets a keyboard user jump the
          whole nav. Visually hidden until focused — see `.skip-link` in
          `index.css`. */}
      <a className="skip-link" href="#main">
        {t("common.skipToContent")}
      </a>
      <Header hideOnScroll={hideHeaderOnScroll} />
      <Toast
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />
      {/* NOTE: this <main> sits between `header` and the page root, which
          breaks any `header ~ .page` sibling selector. `ProjectArticle.scss`
          has one (the mobile contents bar that rises when the header
          retracts) and was updated to `header.hidden ~ main .project-page`.
          Any future sibling selector reaching from the chrome to a page needs
          the same `main` step. */}
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/project/:slug" element={<Project />} />
          <Route path="/beyond" element={<Beyond />} />
          <Route path="/beyond/:slug" element={<BeyondEntry />} />
          {/* Real 404 rather than a silent redirect home — a bad URL that
              quietly becomes the homepage hides typos and broken inbound
              links. Declared last, where a catch-all reads naturally. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
