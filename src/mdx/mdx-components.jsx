/* eslint-disable react-refresh/only-export-components --
   This module is a component *registry*: its single export is the map handed
   to MDX, so every component declared here trips the fast-refresh heuristic
   by design. */

/* ─────────────────────────────────────────────────────────────────────────
   Shared MDX layout primitives — available inside every project's `page.mdx`
   without an import.

   The rule that governs this file: these are *framing mechanics*, never
   content. They decide how wide something sits, how it is captioned, how it
   is bordered and spaced — not what it shows. Actual artwork, diagrams and
   bespoke widgets are authored per project inside `src/projects/<slug>/
   components/`, which is what keeps every case study visually distinct.

   Everything here is styled by `sections/Project/style/article.scss` and
   reads the `--pp-*` token layer, so a project retints all of it by setting
   `meta.style`.

   ── The three widths ────────────────────────────────────────────────────
   The article is a three-track grid: a reading column, a gap, and a margin
   channel. Blocks opt into a width with `bleed`:

     "text"  (default) — the reading column
     "wide"            — reading column + margin channel
     "full"            — edge to edge of the page canvas, escaping the
                         contents rail on the left

   Every media primitive below takes `bleed`, so a project builds its own
   rhythm of narrow → wide → full moments without touching shared code.
   ───────────────────────────────────────────────────────────────────────── */

const BLEEDS = { text: "", wide: "pp-wide", full: "pp-full" };

function bleedClass(bleed) {
  return BLEEDS[bleed] ?? BLEEDS.text;
}

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/* ═══ Legacy prose scaffolding ══════════════════════════════════════════ */

function Container({ children }) {
  return <div className="container">{children}</div>;
}

function Spacer({ size = "16" }) {
  return (
    <div
      className={`spacer spacer_${size}`}
      style={{ height: `${size}px`, width: `${size}px` }}
      aria-hidden="true"
    />
  );
}

function SideBySide({ children, ...props }) {
  return (
    <div {...props} className={`side_by_side ${props.className || ""}`}>
      {children}
    </div>
  );
}

function Dot() {
  return <div className="separation_dot" aria-hidden="true" />;
}

/* ═══ Type ══════════════════════════════════════════════════════════════ */

/**
 * The opening paragraph of the article, or of a major section. Sets a larger,
 * lighter measure so a case study starts editorially rather than dropping the
 * reader straight into body copy.
 *
 *   <Lede>Warden flips traffic between two versions of a service…</Lede>
 */
function Lede({ children }) {
  return <div className="pp-lede">{children}</div>;
}

/**
 * A statement that breaks the reading column. Use for the one or two lines a
 * reader should remember — not for every quote.
 *
 *   <Pull cite="Design review, week 3">
 *     Nothing ships until the old instance can come back in under a second.
 *   </Pull>
 */
function Pull({ children, cite, bleed = "wide" }) {
  return (
    <blockquote className={cx("pp-pull", bleedClass(bleed))}>
      <div className="pp-pull-body">{children}</div>
      {cite && <cite className="pp-pull-cite">{cite}</cite>}
    </blockquote>
  );
}

/* ═══ Media framing ═════════════════════════════════════════════════════ */

/**
 * The general-purpose container for anything visual: an image, an inline SVG,
 * a project's own React widget. Gives it a considered plate — hairline frame,
 * corner ticks, optional micro-label and caption — so a cheap hand-drawn SVG
 * still reads as a deliberate figure.
 *
 *   <Frame label="Topology" caption="One daemon, two instances." bleed="wide">
 *     <MyDiagram />
 *   </Frame>
 *
 * Props:
 *   src, alt   — render an <img> instead of children
 *   label      — micro-label chip on the frame's top rule
 *   caption    — figcaption below
 *   bleed      — "text" | "wide" | "full"
 *   ratio      — CSS aspect-ratio for the body, e.g. "16 / 9"
 *   flush      — drop the inner padding (media touches the frame)
 *   plain      — drop the frame entirely, keep label/caption + width
 */
function Frame({
  src,
  alt = "",
  label,
  caption,
  bleed = "text",
  ratio,
  flush = false,
  plain = false,
  children,
}) {
  return (
    <figure
      className={cx(
        "pp-frame",
        bleedClass(bleed),
        flush && "is-flush",
        plain && "is-plain",
      )}
    >
      {label && <span className="pp-frame-label">{label}</span>}
      <div className="pp-frame-body" style={ratio ? { aspectRatio: ratio } : undefined}>
        {src ? <img src={src} alt={alt} loading="lazy" /> : children}
      </div>
      {caption && <figcaption className="pp-caption">{caption}</figcaption>}
    </figure>
  );
}

/** Back-compat alias for the original `Figure`. It defaults to `wide` because
    the old single-column article gave it the full column width — holding it
    to the reading measure would quietly shrink every existing figure. */
function LegacyFigure({ src, alt = "", caption, bleed = "wide", children }) {
  return (
    <Frame src={src} alt={alt} caption={caption} bleed={bleed} flush>
      {children}
    </Frame>
  );
}

/**
 * A full-width visual beat between sections — the primary tool for keeping a
 * long read illustrated. Defaults to `full`, so it genuinely interrupts the
 * column rather than sitting politely inside it.
 *
 *   <Break src={diagram} label="03 — The flip" caption="…" ratio="21 / 9" />
 *   <Break bleed="wide"><MyAnimatedThing /></Break>
 */
function Break({
  src,
  alt = "",
  label,
  caption,
  bleed = "full",
  ratio = "21 / 9",
  children,
}) {
  return (
    <figure className={cx("pp-break", bleedClass(bleed))}>
      <div className="pp-break-body" style={{ aspectRatio: ratio }}>
        {src ? <img src={src} alt={alt} loading="lazy" /> : children}
      </div>
      {(label || caption) && (
        <figcaption className="pp-break-foot">
          {label && <span className="pp-break-label">{label}</span>}
          {caption && <span className="pp-caption">{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * A row of small related visuals — variants, states, frames of a sequence.
 * Cheap density: three tiny SVGs in a strip read as far more considered than
 * three stacked figures.
 *
 *   <Strip cols={3} caption="Three probe outcomes." bleed="wide">
 *     <StripItem caption="Healthy"><SvgA /></StripItem>
 *     <StripItem src={img} caption="Draining" />
 *   </Strip>
 *
 * Below the strip breakpoint the track becomes a snap-scrolling carousel
 * rather than collapsing into a stack of full-width blocks.
 */
function Strip({ children, caption, cols = 3, bleed = "wide" }) {
  return (
    <figure
      className={cx("pp-strip", bleedClass(bleed))}
      style={{ "--pp-strip-cols": cols }}
    >
      <div className="pp-strip-track">{children}</div>
      {caption && <figcaption className="pp-caption">{caption}</figcaption>}
    </figure>
  );
}

function StripItem({ src, alt = "", caption, label, children }) {
  return (
    <div className="pp-strip-item">
      <div className="pp-strip-media">
        {src ? <img src={src} alt={alt} loading="lazy" /> : children}
      </div>
      {(label || caption) && (
        <div className="pp-strip-foot">
          {label && <span className="pp-strip-label">{label}</span>}
          {caption && <span className="pp-caption">{caption}</span>}
        </div>
      )}
    </div>
  );
}

/**
 * A mixed-media aside: prose in the reading column with a small visual pinned
 * beside it in the margin channel. This is the "small graphic next to an idea"
 * rhythm — the thing that makes a page feel illustrated throughout instead of
 * only at section boundaries.
 *
 *   <Aside title="Why not a load balancer?" media={<TinySvg />}>
 *     A cloud LB assumes a control plane…
 *   </Aside>
 *
 * Props:
 *   media   — the visual (node); or use `src`
 *   side    — "right" (default) | "left"
 *   ratio   — "margin" (default, narrow channel) | "even" (50/50)
 *   title   — micro-label above the prose
 * Below the aside breakpoint it stacks: visual first, then prose.
 */
function Aside({
  children,
  media,
  src,
  alt = "",
  title,
  side = "right",
  ratio = "margin",
  bleed = "wide",
}) {
  const visual = src ? <img src={src} alt={alt} loading="lazy" /> : media;

  return (
    <aside
      className={cx(
        "pp-aside",
        bleedClass(bleed),
        `side-${side}`,
        `ratio-${ratio}`,
      )}
    >
      <div className="pp-aside-body">
        {title && <p className="pp-aside-title">{title}</p>}
        <div className="pp-aside-prose">{children}</div>
      </div>
      {visual && <div className="pp-aside-media">{visual}</div>}
    </aside>
  );
}

/**
 * Numbers, versions, constraints. Free visual density for a section that would
 * otherwise be a bulleted list.
 *
 *   <Facts>
 *     <Fact label="Median flip" value="240ms" note="p50, 40 runs" />
 *   </Facts>
 *
 * `variant="band"` (default) is a dense hairline strip that reads as an
 * instrument panel. `variant="cards"` gives each fact its own plate, for the
 * two or three headline numbers a section is actually about.
 */
function Facts({ children, bleed = "wide", variant = "band" }) {
  return (
    <dl className={cx("pp-facts", `is-${variant}`, bleedClass(bleed))}>
      {children}
    </dl>
  );
}

function Fact({ label, value, note }) {
  return (
    <div className="pp-fact">
      <dt className="pp-fact-label">{label}</dt>
      <dd className="pp-fact-value">
        <span className="pp-fact-number">{value}</span>
        {note && <span className="pp-fact-note">{note}</span>}
      </dd>
    </div>
  );
}

/* ═══ Asides & process ══════════════════════════════════════════════════ */

/** A footnote, caveat or definition. `tone` is "note" or "accent". */
function Callout({ children, title, tone = "note", bleed = "text" }) {
  return (
    <aside className={cx("callout", `tone-${tone}`, bleedClass(bleed))}>
      {title && <p className="callout-title">{title}</p>}
      <div className="callout-body">{children}</div>
    </aside>
  );
}

/**
 * A left-to-right process diagram (stacks vertically on narrow screens).
 * Steps are auto-numbered via CSS counters.
 */
function Flow({ children, caption, bleed = "wide" }) {
  return (
    <figure className={cx("flow", bleedClass(bleed))}>
      <div className="flow-track">{children}</div>
      {caption && <figcaption className="flow-caption">{caption}</figcaption>}
    </figure>
  );
}

function FlowStep({ children, note }) {
  return (
    <div className="flow-step">
      <span className="flow-step-index" aria-hidden="true" />
      <span className="flow-step-title">{children}</span>
      {note && <span className="flow-step-note">{note}</span>}
    </div>
  );
}

const mdxComponents = {
  /* prose scaffolding */
  Container,
  Spacer,
  SideBySide,
  Dot,
  /* type */
  Lede,
  Pull,
  /* media framing */
  Frame,
  Figure: LegacyFigure,
  Break,
  Strip,
  StripItem,
  Aside,
  Facts,
  Fact,
  /* asides & process */
  Callout,
  Flow,
  FlowStep,
  h1: (props) => <h1 {...props} className="section_title" />,
  h2: (props) => <h2 {...props} className="container_title" />,
};

export default mdxComponents;
