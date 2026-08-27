import BeyondCard from "./components/BeyondCard.jsx";
import { getBeyondEntries } from "../lib/beyond.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import usePageMeta from "../lib/usePageMeta.js";

import "./style/Beyond.scss";

import accentIcon from "../assets/accent-icon-double.svg";

/* Fixed display order for the topic sections. An entry's `meta.tag` picks its
   section; the label comes from `home.beyond.tags.<tag>`, the same keys the
   Home banner's pills read, so a tag is named in exactly one place per
   language. A section with no entries in the active locale isn't rendered. */
const TAG_ORDER = ["infrastructure", "automation"];

/* `titlePrefix` is a freeform discipline string ("Automation; Developer
   Tooling"). The hero splits it into kicker terms rather than printing the
   separator; the card chip does the same so the two read alike. */
function disciplineTerms(titlePrefix) {
  return String(titlePrefix || "")
    .split(/[;,/|]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ");
}

function Beyond() {
  const { locale, t } = useLanguage();
  const entries = getBeyondEntries(locale);

  usePageMeta({ title: t("beyond.metaTitle"), description: t("beyond.intro") });

  const groups = TAG_ORDER.map((tag) => ({
    key: tag,
    title: t(`home.beyond.tags.${tag}`),
    items: entries.filter((entry) => entry.meta?.tag === tag),
  })).filter((group) => group.items.length > 0);

  /* Anything with a tag outside `TAG_ORDER` (or none at all) still has to
     appear — a typo in a new entry's meta shouldn't silently delete it. */
  const untagged = entries.filter(
    (entry) => !TAG_ORDER.includes(entry.meta?.tag),
  );
  if (untagged.length > 0) {
    groups.push({
      key: "__other",
      title: t("beyond.otherGroup"),
      items: untagged,
    });
  }

  return (
    <div className="beyond-page">
      {/* Deliberately a <div>, not <header>: `sections/style/Header.scss`
          styles the bare `header` element globally as `position: fixed;
          z-index: 1000`, which silently lifts any <header> here out of flow
          and paints it over the cards below.

          Title block and intro are siblings, not a stack: above the masthead
          breakpoint they sit side by side so the banner keeps its scale
          without pushing the first row of ideas off the first screen. */}
      <div className="beyond-masthead">
        <div className="masthead-title">
          <img src={accentIcon} alt="" className="accent-icon" />
          <h1 className="beyond-heading">{t("beyond.heading")}</h1>
        </div>
        <p className="beyond-intro">{t("beyond.intro")}</p>
      </div>

      {entries.length === 0 && (
        <p className="beyond-empty">{t("beyond.empty")}</p>
      )}

      {groups.map((group) => (
        <section className="beyond-group" key={group.key}>
          <div className="group-rule">
            <h2 className="group-title">{group.title}</h2>
            <span className="group-count">
              {String(group.items.length).padStart(2, "0")}
            </span>
            <span className="group-hair" aria-hidden="true" />
          </div>

          <div className="beyond-grid">
            {group.items.map((entry) => (
              <BeyondCard
                key={entry.meta?.slug}
                slug={entry.meta?.slug}
                title={entry.meta?.title}
                blurb={entry.meta?.subtitle}
                tagLabel={disciplineTerms(entry.meta?.titlePrefix)}
                imageUrl={entry.meta?.cover}
                style={entry.meta?.style}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default Beyond;
