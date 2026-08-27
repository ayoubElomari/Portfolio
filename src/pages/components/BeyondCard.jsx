import { Link } from "react-router-dom";

import useInView from "../../lib/useInView.js";

import "./style/BeyondCard.scss";

import ViewIcon from "../../assets/go-to-icon.svg?react";

/* A teaser for one unbuilt idea. Deliberately *not* a `ProjectCard`: a
   project card is a full-width 512px row built to sell finished work, while
   an idea is a small tile in a grid — lighter, denser, several to a row.
   Same site language (hairline box, accent hover, reveal-on-scroll), a
   different weight.

   `style` is the entry's own `meta.style` object, passed through verbatim.
   That's the same object the entry's article page applies to its root, so a
   single `--project-accent-color` in one `page.<locale>.mdx` colours the card
   here and the whole page it links to — the card can't drift from the article
   because there's nothing to keep in sync. Entries that set no style fall
   back to the site accent (see `BeyondCard.scss`). */
function BeyondCard({ slug, title, blurb, tagLabel, imageUrl, style }) {
  /* Each card watches itself rather than the grid watching all of them, so a
     card animates when you actually reach it. */
  const [cardRef, inView] = useInView(0.15);

  return (
    <Link to={`/beyond/${slug}`} className="beyond-card-link" style={style}>
      <article
        className={`beyond-card${inView ? " is-revealed" : ""}`}
        ref={cardRef}
      >
        <div className="beyond-card-visual">
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              width="640"
              height="400"
              loading="lazy"
            />
          )}
          <span className="card-tick tl" aria-hidden="true" />
          <span className="card-tick br" aria-hidden="true" />
        </div>

        <div className="beyond-card-body">
          {tagLabel && <span className="beyond-card-tag">{tagLabel}</span>}
          <h3 className="beyond-card-title">{title}</h3>
          {blurb && <p className="beyond-card-blurb">{blurb}</p>}

          <span className="beyond-card-go" aria-hidden="true">
            <ViewIcon />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default BeyondCard;
