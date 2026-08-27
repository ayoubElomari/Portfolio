import { useState } from "react";

import "./style/ShortEmbed.scss";

/* The one piece of outside-world evidence on this page. Section 3 claims a
   loop that scripted, rendered and posted videos with nobody in it; this is
   one of the videos it posted, still up on the channel.

   Unlike the figures in this folder it wears the bordered plate, because it
   is a real artifact rather than a drawing, and the page reserves that
   treatment for things that are actually running (see
   ../.copy/visual-guidelines.md, section 4).

   Nothing from YouTube loads until the play button is pressed: no player
   script, no cookies, no third party request beyond the poster image. That
   keeps a case study page from paying a video player's start-up cost for a
   reader who never watches, and matches how the hero demo is already
   code-split rather than shipped in the initial chunk. */

const VIDEO_ID = "PLb3-nzxUxE";

/* YouTube renders a vertical short into a 4:3 poster by padding the sides.
   The content column of that image is exactly 9:16 of its height, so a
   `cover` fit inside a 9:16 box crops the padding off precisely and leaves
   the real frame. See the note in the stylesheet. */
const POSTER = `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`;

const EMBED = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

export function ShortEmbed({
  title = "A Shorts Engine video, still on the channel",
  playLabel = "Play",
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="rendr-short">
      <div className="rendr-short-screen">
        {playing ? (
          <iframe
            src={EMBED}
            title={title}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="rendr-short-play"
            onClick={() => setPlaying(true)}
          >
            <img src={POSTER} alt="" loading="lazy" decoding="async" />
            <span className="rendr-short-glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M9 6.5 18 12l-9 5.5Z" fill="currentColor" />
              </svg>
            </span>
            <span className="rendr-short-sr">{playLabel}: {title}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ShortEmbed;
