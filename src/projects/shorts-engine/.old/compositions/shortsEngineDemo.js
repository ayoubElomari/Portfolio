// A fresh, original composition in the current rendr-web (v2.1.0) format —
// not a replay of any real Shorts Engine output. The real pipeline only ever
// ran against old, standalone Rendr versions whose format the current engine
// no longer reads (see .project-details/shorts-engine/facts/08-rendr-json-migration.md).
// This recreates the real *shape* — a Reddit-post card over a background
// plate, with word-synced captions below — using content written for this
// page, never a real story title or a real channel's copy.

export const heroComposition = {
  rendr: "v2.1.0",
  settings: { fps: 30, resolution: [1080, 1920] },
  variables: {
    accent: "#ff6a3d",
    highlight: "#ff6a3d",
  },
  components: {
    RedditCard: {
      parameters: {
        avatarInitial: { type: "string", default: "?" },
        subreddit: { type: "string", default: "r/stories" },
        username: { type: "string", default: "u/throwaway" },
        hook: { type: "string", default: "" },
        accent: { type: "string", default: "#ff6a3d" },
      },
      timeline: [
        {
          id: "card-plate",
          type: "Text",
          at: "00:00:00.000",
          duration: "00:00:01.000",
          config: { content: "" },
          style: {
            "&": {
              position: "absolute",
              left: "64px",
              top: "140px",
              width: "1152px",
              height: "300px",
              background: "rgba(14,15,18,0.82)",
              borderRadius: "28px",
              boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
              zIndex: 1,
            },
          },
        },
        {
          id: "card-avatar",
          type: "Text",
          at: "00:00:00.000",
          duration: "00:00:01.000",
          config: { content: "{{avatarInitial}}" },
          style: {
            "&": {
              position: "absolute",
              left: "96px",
              top: "172px",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "{{accent}}",
              color: "#0b0b0d",
              fontFamily: "Arial, sans-serif",
              fontSize: "32px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            },
          },
        },
        {
          id: "card-meta",
          type: "Text",
          at: "00:00:00.000",
          duration: "00:00:01.000",
          config: { content: "{{subreddit}}  •  {{username}}" },
          style: {
            "&": {
              position: "absolute",
              left: "184px",
              top: "182px",
              width: "900px",
              color: "#9aa0ab",
              fontFamily: "Arial, sans-serif",
              fontSize: "26px",
              fontWeight: 500,
              zIndex: 2,
            },
          },
        },
        {
          id: "card-hook",
          type: "Text",
          at: "00:00:00.000",
          duration: "00:00:01.000",
          config: { content: "{{hook}}" },
          style: {
            "&": {
              position: "absolute",
              left: "96px",
              top: "238px",
              width: "1088px",
              color: "#f5f4f2",
              fontFamily: "Arial, sans-serif",
              fontSize: "40px",
              fontWeight: 700,
              lineHeight: "1.28",
              zIndex: 2,
            },
          },
        },
      ],
    },
  },
  timeline: [
    {
      id: "backdrop",
      type: "Text",
      at: "00:00:00.000",
      duration: "00:00:08.000",
      config: { content: "" },
      style: {
        "&": {
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundColor: {
            keyframes: [
              { at: "0%", value: "#141019" },
              { at: "50%", value: "#1c1420" },
              { at: "100%", value: "#141019" },
            ],
            loop: true,
          },
        },
      },
    },
    {
      id: "reddit-card",
      type: "@components:RedditCard",
      at: "00:00:00.000",
      duration: "00:00:08.000",
      config: {
        avatarInitial: "R",
        subreddit: "r/stories",
        username: "u/throwaway0417",
        hook: "AITA for automating my job and never telling my manager?",
        accent: "@variables:accent",
      },
    },
    {
      id: "caption",
      type: "Caption",
      at: "00:00:01.200",
      duration: "00:00:05.000",
      config: {
        words:
          "So I built a script that did my job and I just never told my manager.",
        timestamps:
          "0 0.22 0.42 0.68 0.8 1.05 1.4 1.6 1.78 2.1 2.55 2.75 2.98 3.28 3.62 3.8",
        wordsAtOnce: 3,
      },
      style: {
        ".cap-line": {
          position: "absolute",
          left: "96px",
          top: "1550px",
          width: "1088px",
          display: "flex",
          flexWrap: "wrap",
          gap: "14px 16px",
          justifyContent: "center",
          zIndex: 3,
        },
        ".cap-word": {
          fontFamily: "Arial, sans-serif",
          fontSize: "56px",
          fontWeight: 800,
          color: "#ffffff",
          WebkitTextStroke: "2px rgba(0,0,0,0.55)",
        },
        ".cap-word.is-live": {
          background: "@variables:highlight",
          color: "#0b0b0d",
          borderRadius: "10px",
          padding: "2px 10px",
        },
      },
    },
  ],
};

export const heroEdits = [
  {
    path: ["variables", "accent"],
    type: "color",
    label: "accent",
  },
  {
    path: ["variables", "highlight"],
    type: "color",
    label: "caption highlight",
  },
  {
    path: ["timeline", 2, "config", "wordsAtOnce"],
    type: "number",
    label: "words per card",
    min: 1,
    max: 6,
    step: 1,
  },
  {
    path: ["timeline", 2, "style", ".cap-word", "fontSize"],
    type: "length",
    label: "caption size",
    min: 32,
    max: 96,
    step: 2,
  },
];
