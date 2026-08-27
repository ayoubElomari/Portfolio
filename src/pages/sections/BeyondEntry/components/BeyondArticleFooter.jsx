import { Link } from "react-router-dom";

/* Same footer plate as a project's, reading the same stylesheet — see the
   note in `pages/BeyondEntry.jsx`. Only the link targets and the label
   strings differ ("Next idea" rather than "Next project"). */
import "../../Project/components/style/ArticleFooter.scss";

import { getAdjacentBeyondEntries } from "../../../../lib/beyond";
import { useLanguage } from "../../../../i18n/LanguageContext.jsx";

/* One large "next" plate rather than two equal cards: a symmetric prev/next
   pair gives the reader no reason to pick either. The next idea is a
   full-width invitation with its own cover, and the previous one stays a
   quiet hairline link beneath it. */
function NextPlate({ entry }) {
  const meta = entry.meta || {};
  const { t } = useLanguage();

  return (
    <Link to={`/beyond/${meta.slug}`} className="next-plate">
      <div className="next-visual">
        {meta.cover && <img src={meta.cover} alt="" loading="lazy" />}
        <span className="next-tick tl" aria-hidden="true" />
        <span className="next-tick br" aria-hidden="true" />
      </div>

      <div className="next-body">
        {meta.titlePrefix && (
          <span className="next-kicker">{meta.titlePrefix}</span>
        )}
        <span className="next-title">{meta.title}</span>
        {meta.subtitle && <span className="next-sub">{meta.subtitle}</span>}
        <span className="next-cta">
          <span>{t("beyondFooter.readIdea")}</span>
          <span className="next-arrow" aria-hidden="true">
            &#8594;
          </span>
        </span>
      </div>
    </Link>
  );
}

function BeyondArticleFooter({ entry }) {
  const { locale, t } = useLanguage();
  const { previous, next } = getAdjacentBeyondEntries(entry.meta?.slug, locale);

  if (!previous && !next) return null;

  const forward = next || previous;

  return (
    /* Deliberately a <div>, not <footer>: `sections/style/Footer.scss`
       styles the bare `footer` element globally. */
    <div className="project-footer beyond-entry-footer">
      <div className="footer-rule">
        <span className="footer-label">{t("beyondFooter.nextEntry")}</span>
        <span className="footer-hair" aria-hidden="true" />
      </div>

      {forward && <NextPlate entry={forward} />}

      <div className="footer-tail">
        {previous && next && (
          <Link
            to={`/beyond/${previous.meta?.slug}`}
            className="tail-link previous"
          >
            <span className="tail-arrow" aria-hidden="true">
              &#8592;
            </span>
            <span className="tail-role">{t("articleFooter.previous")}</span>
            <span className="tail-name">{previous.meta?.title}</span>
          </Link>
        )}

        <Link to="/beyond" className="tail-link index">
          <span className="tail-role">{t("common.allIdeas")}</span>
          <span className="tail-arrow" aria-hidden="true">
            {/* U+FE0E forces the text glyph — without it iOS renders this
                arrow as a colour emoji instead of a thin line arrow. */}
            &#8599;&#xFE0E;
          </span>
        </Link>
      </div>
    </div>
  );
}

export default BeyondArticleFooter;
