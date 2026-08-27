import { useEffect } from "react";

/* Per-route <title> and meta description, without pulling in react-helmet —
   the same "hand-rolled over a dependency" call the i18n layer made.

   Call it from a page component:
     usePageMeta({ title: t("about.metaTitle"), description: "..." })

   Pass titles through `t()` at the call site so they re-run on a locale
   switch: `title`/`description` are the effect's deps, so a new string is all
   it takes to update the tab.

   Both fields are optional — omit `description` and the page simply inherits
   whatever `index.html` declares. */

const SITE_NAME = "Ayoub El Omari";

function getDescriptionTag() {
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }
  return tag;
}

export default function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    if (!title) return undefined;

    const previous = document.title;
    /* Home passes the site name itself, so don't suffix it twice. */
    document.title = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;

    return () => {
      document.title = previous;
    };
  }, [title]);

  useEffect(() => {
    if (!description) return undefined;

    const tag = getDescriptionTag();
    const previous = tag.getAttribute("content");
    tag.setAttribute("content", description);

    return () => {
      if (previous !== null) tag.setAttribute("content", previous);
    };
  }, [description]);
}
