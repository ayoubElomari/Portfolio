import { useState } from "react";
import { trackColor } from "../trackColors.js";
import { ColorField, DebouncedText, NumberDrag } from "./Fields.jsx";
import {
  CloseIcon,
  ImageIcon,
  PlusIcon,
  TextIcon,
  TrashIcon,
  VideoIcon,
} from "./Icons.jsx";

const TYPE_ICONS = { Text: TextIcon, Image: ImageIcon, Video: VideoIcon };
import {
  assetKeys,
  elementKind,
  elementLabel,
  getStyleProp,
  isAnimated,
  STYLE_FIELDS,
} from "../edit.js";
import { fill, useLabels } from "../labels.js";

/**
 * The inspector's style rows are driven by `STYLE_FIELDS` in `edit.js`, which
 * keys each row by the CSS property it writes. Those property names are part of
 * the format and never translate; the words shown beside them are. This maps one
 * to the other so `edit.js` stays a description of the format rather than a
 * place translations have to be kept in sync.
 */
const STYLE_LABEL_KEYS = {
  left: "fieldX",
  top: "fieldY",
  width: "fieldWidth",
  height: "fieldHeight",
  color: "fieldColour",
};

/** The label a type chip and its heading use. Keyed by the engine's own names. */
const TYPE_LABEL_KEYS = {
  Text: "typeText",
  Image: "typeImage",
  Video: "typeVideo",
};

/**
 * The editing surface — and the reason there is no free-text JSON box anywhere in
 * this demo.
 *
 * Every control here maps to one move that cannot produce an invalid composition:
 * timecodes are written from frame numbers by the engine's own timecode class,
 * colours come from a colour input, assets come from the ones the file has actually
 * loaded, and a property already driven by keyframes is shown as animated rather
 * than offered as a text field to overwrite. The JSON panel on the left is the
 * read-out; this is the keyboard.
 */
export default function Inspector({
  config,
  selected,
  windows,
  fps,
  frame,
  onPatch,
  onStyle,
  onTiming,
  onDelete,
  onDeselect,
  onAdd,
}) {
  /* `false` = closed, otherwise the element type being added. */
  const [adding, setAdding] = useState(false);
  const t = useLabels();

  if (adding) {
    return (
      <AddForm
        fps={fps}
        type={adding}
        color={trackColor(config.timeline.length)}
        startAt={frame}
        assets={assetKeys(config, adding === "Text" ? undefined : adding)}
        onCancel={() => setAdding(false)}
        onSubmit={(draft) => {
          setAdding(false);
          onAdd(draft);
        }}
      />
    );
  }

  if (selected === null) {
    return (
      <section className="rb-inspector rb-inspector-empty">
        <p className="rb-hint">{t.insEmptyHint}</p>
        <AddBar
          config={config}
          nextColor={trackColor(config.timeline.length)}
          onPick={(type) => setAdding(type)}
        />
      </section>
    );
  }

  const el = config.timeline[selected];
  const window = windows[selected];
  const kind = elementKind(el);
  const hasText = typeof el.config?.content === "string";

  return (
    <section className="rb-inspector">
      <div className="rb-inspector-head">
        <span
          className="rb-inspector-swatch"
          style={{ background: trackColor(selected) }}
          aria-hidden="true"
        />
        <span className="rb-inspector-title">{elementLabel(el)}</span>
        <span className="rb-inspector-type">{kind.name}</span>
        <span className="rb-inspector-tools">
          <button
            type="button"
            className="rb-icon-btn rb-icon-danger"
            onClick={() => onDelete(selected)}
            aria-label={fill(t.insDeleteAria, { name: elementLabel(el) })}
            title={t.insDelete}
          >
            <TrashIcon />
          </button>
          <button
            type="button"
            className="rb-icon-btn"
            onClick={onDeselect}
            aria-label={t.insDeselect}
            title={t.insDeselectTitle}
          >
            ×
          </button>
        </span>
      </div>

      {kind.kind === "component" ? (
        /* A component invocation has no style block of its own — it has arguments.
           Showing it style fields would be a lie about what the element is. */
        <div className="rb-fields">
          <p className="rb-field rb-field-wide rb-field-locked">
            <span>{t.insExpandsTo}</span>
            <em>
              {fill(t.insExpansion, {
                n: config.components?.[kind.name]?.timeline?.length ?? "?",
              })}
            </em>
          </p>
          {Object.entries(el.config || {}).map(([key, value]) => (
            <label className="rb-field" key={key}>
              <span>{key}</span>
              {typeof value === "number" ? (
                <NumberDrag
                  value={value}
                  label={key}
                  onChange={(next) =>
                    onPatch(selected, {
                      config: { ...el.config, [key]: next },
                    })
                  }
                />
              ) : (
                <DebouncedText
                  key={`${selected}-${key}`}
                  defaultValue={value}
                  label={key}
                  onChange={(next) =>
                    onPatch(selected, {
                      config: { ...el.config, [key]: next },
                    })
                  }
                />
              )}
            </label>
          ))}
          <Timing
            index={selected}
            window={window}
            onTiming={onTiming}
            fps={fps}
          />
        </div>
      ) : (
        <div className="rb-fields">
          {hasText && (
            <label className="rb-field rb-field-wide">
              <span>{t.insContent}</span>
              <DebouncedText
                key={`content-${selected}`}
                defaultValue={el.config.content}
                placeholder={t.insNoTextPlaceholder}
                label={t.insContent}
                onChange={(next) =>
                  onPatch(selected, {
                    config: { ...el.config, content: next },
                  })
                }
              />
            </label>
          )}

          {(kind.kind === "image" || kind.kind === "video") && (
            <label className="rb-field">
              <span>{t.insAsset}</span>
              <select
                value={String(el.config?.src ?? "")}
                onChange={(e) =>
                  onPatch(selected, {
                    config: { ...el.config, src: e.target.value },
                  })
                }
              >
                {assetKeys(config, kind.kind).map((key) => (
                  <option key={key} value={`@assets:${key}`}>
                    @assets:{key}
                  </option>
                ))}
              </select>
            </label>
          )}

          <Timing
            index={selected}
            window={window}
            onTiming={onTiming}
            fps={fps}
          />

          {STYLE_FIELDS.map((field) => (
            <StyleField
              key={`${selected}-${field.prop}`}
              field={field}
              element={el}
              config={config}
              onChange={(value) => onStyle(selected, field.prop, value)}
            />
          ))}
        </div>
      )}

      <div className="rb-inspector-foot">
        <p className="rb-inspector-note">{t.insNote}</p>
        <AddBar
          config={config}
          nextColor={trackColor(config.timeline.length)}
          onPick={(type) => setAdding(type)}
        />
      </div>
    </section>
  );
}

/* ── shared field groups ─────────────────────────────────────────────────── */

function Timing({ index, window, onTiming, fps }) {
  const t = useLabels();
  return (
    <>
      <label className="rb-field">
        <span>{t.insStartsAt}</span>
        <NumberDrag
          value={window.at}
          min={0}
          label={t.insStartsAt}
          onChange={(next) => onTiming(index, { at: next }, fps)}
        />
      </label>
      <label className="rb-field">
        <span>{t.insLasts}</span>
        <NumberDrag
          value={window.length}
          min={1}
          label={t.insLasts}
          onChange={(next) => onTiming(index, { duration: next }, fps)}
        />
      </label>
    </>
  );
}

/**
 * One style property. A property currently driven by keyframes is reported as
 * animated instead of being offered as an input — writing a static value over it
 * would silently delete the animation, and the format's own interpolator makes a
 * point of never doing that kind of favour.
 */
function StyleField({ field, element, config, onChange }) {
  const value = getStyleProp(element, field.prop);
  const t = useLabels();
  /* The CSS property name is the key; the word beside it is the translation. */
  const name = t[STYLE_LABEL_KEYS[field.prop]] ?? field.label;

  if (isAnimated(value)) {
    return (
      <p className="rb-field rb-field-locked">
        <span>{name}</span>
        <em>{t.insAnimated}</em>
      </p>
    );
  }

  if (field.kind === "color") {
    return (
      <label className="rb-field">
        <span>{name}</span>
        <ColorField
          value={resolveColorValue(value, config)}
          label={name}
          onChange={onChange}
        />
      </label>
    );
  }

  if (field.kind === "text") {
    /* The placeholder is a CSS value, not prose — same in every language. */
    return (
      <label className="rb-field rb-field-wide">
        <span>{name}</span>
        <DebouncedText
          defaultValue={value === undefined ? "" : String(value)}
          placeholder="1px solid #b98cff"
          label={name}
          onChange={onChange}
        />
      </label>
    );
  }

  return (
    <label className="rb-field">
      <span>{name}</span>
      <NumberDrag
        value={numberOf(value)}
        label={name}
        suffix="px"
        onChange={(next) => onChange(`${next}px`)}
      />
    </label>
  );
}

/* ── the add-element form ────────────────────────────────────────────────── */

function AddForm({ fps, type, color, assets, startAt, onCancel, onSubmit }) {
  const t = useLabels();
  /* Seeded once, from the labels the page handed down, so a new element arrives
     already written in the reader's language. `useState`'s initialiser runs on
     the first render only, which is what keeps typing in the field from being
     overwritten. */
  const [draft, setDraft] = useState(() => ({
    id:
      type === "Image"
        ? t.addDefaultImageId
        : type === "Video"
          ? t.addDefaultVideoId
          : t.addDefaultTextId,
    type,
    content: t.addDefaultText,
    src: assets.length ? `@assets:${assets[0]}` : "",
    /* Starts where the playhead already is, so the element appears on the frame
       the reader is looking at rather than somewhere they have to go find. */
    at: startAt,
    duration: fps * 4,
    left: 0,
    top: 0,
    width: 400,
    height: 400,
    color: "#f6f2ec",
    fontSize: 40,
  }));

  const set = (key) => (e) =>
    setDraft((d) => ({
      ...d,
      [key]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    }));

  const isImage = draft.type === "Image" || draft.type === "Video";

  return (
    <form
      className="rb-inspector rb-inspector-add"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
    >
      <div className="rb-inspector-head">
        <span
          className="rb-inspector-swatch"
          style={{ background: color }}
          aria-hidden="true"
        />
        <span className="rb-inspector-title">
          {fill(t.addNew, {
            type: (t[TYPE_LABEL_KEYS[type]] ?? type).toLowerCase(),
          })}
        </span>
        <span className="rb-inspector-tools">
          <button
            type="button"
            className="rb-icon-btn"
            onClick={onCancel}
            aria-label={t.addCancel}
            title={t.addCancel}
          >
            <CloseIcon />
          </button>
        </span>
      </div>

      <div className="rb-fields">
        <label className="rb-field">
          <span>{t.addName}</span>
          <DebouncedText
            defaultValue={draft.id}
            label={t.addName}
            onChange={(next) => setDraft((d) => ({ ...d, id: next }))}
          />
        </label>

        {isImage ? (
          <label className="rb-field rb-field-wide">
            <span>{t.insAsset}</span>
            <select value={draft.src} onChange={set("src")}>
              {assets.map((key) => (
                <option key={key} value={`@assets:${key}`}>
                  @assets:{key}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="rb-field rb-field-wide">
            <span>{t.insContent}</span>
            <DebouncedText
              defaultValue={draft.content}
              label={t.insContent}
              onChange={(next) => setDraft((d) => ({ ...d, content: next }))}
            />
          </label>
        )}

        <label className="rb-field">
          <span>{t.insStartsAt}</span>
          <NumberDrag
            value={draft.at}
            min={0}
            label={t.insStartsAt}
            onChange={(next) => setDraft((d) => ({ ...d, at: next }))}
          />
        </label>
        <label className="rb-field">
          <span>{t.insLasts}</span>
          <NumberDrag
            value={draft.duration}
            min={1}
            label={t.insLasts}
            onChange={(next) => setDraft((d) => ({ ...d, duration: next }))}
          />
        </label>

        <label className="rb-field">
          <span>{t.fieldX}</span>
          <NumberDrag
            value={draft.left}
            label={t.fieldX}
            onChange={(next) => setDraft((d) => ({ ...d, left: next }))}
          />
        </label>
        <label className="rb-field">
          <span>{t.fieldY}</span>
          <NumberDrag
            value={draft.top}
            label={t.fieldY}
            onChange={(next) => setDraft((d) => ({ ...d, top: next }))}
          />
        </label>
        <label className="rb-field">
          <span>{t.fieldWidth}</span>
          <NumberDrag
            value={draft.width}
            label={t.fieldWidth}
            onChange={(next) => setDraft((d) => ({ ...d, width: next }))}
          />
        </label>
        <label className="rb-field">
          <span>{t.fieldHeight}</span>
          <NumberDrag
            value={draft.height}
            label={t.fieldHeight}
            disabled={!isImage}
            onChange={(next) => setDraft((d) => ({ ...d, height: next }))}
          />
        </label>

        {draft.type === "Text" && (
          <>
            <label className="rb-field">
              <span>{t.fieldColour}</span>
              <ColorField
                value={draft.color}
                label={t.fieldColour}
                onChange={(next) => setDraft((d) => ({ ...d, color: next }))}
              />
            </label>
            <label className="rb-field">
              <span>{t.fieldSize}</span>
              <NumberDrag
                value={draft.fontSize}
                min={8}
                max={240}
                label={t.fieldSize}
                onChange={(next) => setDraft((d) => ({ ...d, fontSize: next }))}
              />
            </label>
          </>
        )}
      </div>

      <p className="rb-inspector-note">{t.addAuthoringNote}</p>

      <div className="rb-inspector-actions">
        <button type="submit" className="rb-btn rb-btn-primary">
          {t.addToTimeline}
        </button>
        <button type="button" className="rb-btn" onClick={onCancel}>
          {t.addCancel}
        </button>
      </div>
    </form>
  );
}

/* ── helpers ─────────────────────────────────────────────────────────────── */


/** Pull a number out of "140px", "0", 140 — anything the format allows. */
function numberOf(value) {
  if (value === undefined || value === null) return "";
  const parsed = parseFloat(String(value));
  return Number.isNaN(parsed) ? "" : parsed;
}

/**
 * A colour input needs a literal hex. The composition may hold a reference like
 * `@variables:accent` instead, so resolve it the same way the engine would before
 * showing it — and fall back to something valid rather than letting the input
 * silently reset itself to black.
 */
function resolveColorValue(value, config) {
  const ref = /^@variables:(.+)$/.exec(String(value));
  const resolved = ref ? config.variables?.[ref[1]] : value;
  return /^#[0-9a-f]{6}$/i.test(String(resolved)) ? resolved : "#ffffff";
}

/* ── the add bar ─────────────────────────────────────────────────────────── */

/**
 * One line of space when idle, a row of typed choices when opened.
 *
 * The types are the ones the engine's registry actually holds — text, image,
 * video — so this doubles as an honest statement of the element set rather than a
 * menu of things that might exist. The chip wears the colour the new element will
 * take on the timeline, so the connection is made before it's created rather than
 * discovered afterwards.
 */
function AddBar({ config, nextColor, onPick }) {
  const [open, setOpen] = useState(false);
  const t = useLabels();

  if (!open) {
    return (
      <button
        type="button"
        className="rb-add-trigger"
        onClick={() => setOpen(true)}
        style={{ "--next-color": nextColor }}
      >
        <span className="rb-add-plus" aria-hidden="true">
          <PlusIcon />
        </span>
        {t.addElement}
      </button>
    );
  }

  return (
    <div className="rb-add-types" style={{ "--next-color": nextColor }}>
      {["Text", "Image", "Video"].map((type) => {
        /* Greyed out when the composition has nothing of that kind loaded — an
           element pointed at a missing asset is a broken demo, not a lesson. */
        const available =
          type === "Text" || assetKeys(config, type).length > 0;
        const Icon = TYPE_ICONS[type];
        const name = t[TYPE_LABEL_KEYS[type]] ?? type;
        return (
          <button
            key={type}
            type="button"
            className="rb-add-type"
            disabled={!available}
            title={
              available
                ? undefined
                : fill(t.addNoAssets, { type: name.toLowerCase() })
            }
            onClick={() => onPick(type)}
          >
            <Icon />
            {name}
          </button>
        );
      })}
      <button
        type="button"
        className="rb-icon-btn"
        onClick={() => setOpen(false)}
        aria-label={t.addCancel}
      >
        <CloseIcon />
      </button>
    </div>
  );
}
