import easings from "@rendr-web/animation/easings.js";

/**
 * One element, one property, one curve — the smallest composition that says
 * something true about the format.
 *
 * The easing list is imported from the engine rather than typed out here, so the
 * dropdown offers exactly the curves the interpolator actually implements. Two of
 * the families (`back`, `elastic`) deliberately overshoot past the destination
 * value, which is the point: an interpolator that clamped to "valid" values would
 * quietly delete the effect.
 */
export const EASING_NAMES = Object.keys(easings);

export const FPS = 30;

export const miniKeyframes = {
  rendr: "v2.1.0",
  settings: { fps: FPS, resolution: [1280, 720] },
  variables: {
    accent: "#b98cff",
    ink: "#f6f2ec",
  },
  timeline: [
    {
      id: "backdrop",
      type: "Text",
      at: "00:00:00.000",
      duration: "00:00:03.000",
      config: { content: "" },
      style: {
        "&": {
          position: "absolute",
          inset: "0",
          zIndex: 1,
          background: "#0d0a16",
          backgroundImage:
            "linear-gradient(90deg, rgba(246,242,236,0.08) 1px, transparent 1px)",
          backgroundSize: "128px 100%",
        },
      },
    },
    {
      id: "box",
      type: "Text",
      at: "00:00:00.000",
      duration: "00:00:03.000",
      config: { content: "" },
      style: {
        "&": {
          position: "absolute",
          top: "286px",
          width: "148px",
          height: "148px",
          borderRadius: "4px",
          zIndex: 2,
          background: "@variables:accent",
          left: {
            keyframes: [
              { at: "0%", value: "96px", easing: "easeOutBack" },
              { at: "100%", value: "1036px" },
            ],
          },
        },
      },
    },
  ],
};

export default miniKeyframes;
