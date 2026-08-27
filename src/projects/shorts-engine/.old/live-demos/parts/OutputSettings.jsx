import {
  FPS_CHOICES,
  RESOLUTIONS,
  currentRatio,
  currentResolution,
} from "../edit.js";
import { FpsIcon, RatioIcon, SizeIcon } from "./Icons.jsx";
import { fill, useLabels } from "../labels.js";

/**
 * Frame rate, aspect ratio and output size — the three things a renderer is told
 * rather than designed around.
 *
 * Chips rather than dropdowns, because a dropdown hides its own range: the fact
 * that the list runs to 240fps and 8K is the point, and you can't see it if it's
 * behind a click. Every one of these is one field in `settings`, and none of them
 * touches the composition — the authoring space is always 1280 wide and every
 * placement is a timecode, so the same file just gets more frames, or more pixels.
 *
 * **The ratio row is the exception, and it disappears when it would be a lie.**
 * `ratios` comes from the host's own compositions rather than a fixed list (see
 * `ratiosFrom` in `edit.js`), because nothing in the format reflows: a ratio chip
 * is only honest if there is an authored layout behind it. Pass one composition
 * and the row is not rendered at all, rather than offering a control that would
 * letterbox the only cut there is.
 */
export default function OutputSettings({
  config,
  ratios = [],
  onFps,
  onRatio,
  onResolution,
}) {
  const fps = config.settings.fps;
  const ratio = currentRatio(config, ratios);
  const resolution = currentResolution(config);
  const t = useLabels();

  return (
    <div className="rb-settings">
      <Row label={t.rowFps} icon={<FpsIcon />}>
        {FPS_CHOICES.map((choice) => (
          <Chip
            key={choice}
            on={choice === fps}
            onClick={() => onFps(choice)}
            title={fill(t.fpsChipTitle, { n: choice })}
          >
            {choice}
          </Chip>
        ))}
      </Row>

      {ratios.length > 1 && (
        <Row label={t.rowRatio} icon={<RatioIcon />}>
          {ratios.map((option) => (
            <Chip
              key={option.label}
              on={option.label === ratio?.label}
              onClick={() => onRatio(option)}
            >
              <span
                className="rb-chip-ratio"
                style={{ aspectRatio: `${option.w} / ${option.h}` }}
                aria-hidden="true"
              />
              {option.label}
            </Chip>
          ))}
        </Row>
      )}

      <Row label={t.rowSize} icon={<SizeIcon />}>
        {RESOLUTIONS.map((option) => (
          <Chip
            key={option.label}
            on={option.label === resolution.label}
            onClick={() => onResolution(option)}
          >
            {option.label}
          </Chip>
        ))}
      </Row>
    </div>
  );
}

function Row({ label, icon, children }) {
  return (
    <div className="rb-settings-row">
      <span className="rb-settings-label">
        {icon}
        {label}
      </span>
      <div className="rb-chips">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, title, children }) {
  return (
    <button
      type="button"
      className={"rb-chip" + (on ? " is-on" : "")}
      onClick={onClick}
      title={title}
      aria-pressed={on}
    >
      {children}
    </button>
  );
}
