import "../style/ChannelCompare.scss";

/* Two anonymous channels, not the two real ones. Real names, exact
   subreddit, and real story lines are off-limits per the archive's own
   publication constraints, so this mockup uses generic labels and a
   synthetic caption line, while keeping the real, recorded per-channel
   style deltas (accent, caption size/weight/width) and the real output
   counts, since those describe the system, not a specific channel. */
const CHANNELS = [
  {
    id: "a",
    name: "Channel A",
    tag: "English",
    accent: "#ff4500",
    subreddit: "r/stories",
    words: ["voice,", "tuned", "per", "channel"],
    hot: 1,
    capWidth: "75%",
    capSize: 0.053,
    capWeight: 400,
    capTrack: "0.01em",
    spec: "255 videos · 82 days",
  },
  {
    id: "b",
    name: "Channel B",
    tag: "French",
    accent: "#b30d60",
    subreddit: "r/stories",
    words: ["voix,", "réglée", "par", "chaîne"],
    hot: 1,
    capWidth: "90%",
    capSize: 0.069,
    capWeight: 600,
    capTrack: "0em",
    spec: "161 videos · 60 days",
  },
];

export default function ChannelCompare({ channels = CHANNELS }) {
  return (
    <div className="se-cc">
      {channels.map((ch) => (
        <div
          className="se-cc-item"
          key={ch.id}
          style={{
            "--se-ch": ch.accent,
            "--se-cap-width": ch.capWidth,
            "--se-cap-size": ch.capSize,
            "--se-cap-weight": ch.capWeight,
            "--se-cap-track": ch.capTrack,
          }}
        >
          <span className="se-cc-name">
            <span className="se-cc-dot" aria-hidden="true" />
            {ch.name}
            <span className="se-cc-tag">{ch.tag}</span>
          </span>

          <div className="se-cc-frame">
            <div className="se-cc-wash" aria-hidden="true" />

            <div className="se-cc-post">
              <span className="se-cc-avatar" aria-hidden="true" />
              <span className="se-cc-sub">{ch.subreddit}</span>
              <span className="se-cc-bars" aria-hidden="true">
                <span className="se-cc-bar" />
                <span className="se-cc-bar is-short" />
              </span>
            </div>

            <p className="se-cc-caption">
              {ch.words.map((word, i) => (
                <span
                  key={`${ch.id}-${i}`}
                  className={`se-cc-word${i === ch.hot ? " is-hot" : ""}`}
                >
                  {word}
                </span>
              ))}
            </p>
          </div>

          <p className="se-cc-spec">{ch.spec}</p>
        </div>
      ))}
    </div>
  );
}
