# Rendr — Visual Methodology

Base ruleset for every visual built on this page, from a one-time Opus
consultation (advice only, grounded in `src/pages/style/Project.scss`). Not a
placement plan — this is taste and process, reread before starting each new
visual rather than re-derived.

## 1. Does this beat even get a diagram?

Pass all three gates or it stays prose.

- **One-sentence test**: write the caption first. If you can't state what the
  visual proves in one plain sentence, it's not a visual, it's a mood. If
  that sentence is already the section's topic sentence, cut it — redundant.
- **Prose-failure test**: prose is bad at exactly five things — topology
  (what talks to what), simultaneity (parallel things prose must serialize),
  transformation (before/after of the same object), dependency (X needs Y,
  in an order that isn't reading order), magnitude (a ratio that needs to be
  felt, not read). A diagram earns its place only if the beat is one of
  these. A plain sequential procedure is not one of these — that's `Flow`.
  Personal narrative (§1, the origin story) gets zero visuals on purpose —
  that's pacing, not a gap.
- **Cheaper-primitive test**: `Facts` beats a bespoke SVG for any magnitude.
  `Flow` beats a hand-drawn flowchart for any linear procedure. Hand-authored
  SVG only when the relationship is genuinely spatial and no primitive
  already expresses it.

**Budget up front**: 4-6 bespoke SVGs total across the whole article, plus
the 3 live demos (hero `RendrBench`, `MediumDemo` in §5, `MiniDemo` in §7),
plus the existing `Facts` card band in the Summary. Seven sections does not
mean seven diagrams — scarcity is what makes each one read as deliberate. A
new candidate has to beat one already on the list, not just join it.

**Distribution**: never two diagrams in adjacent sections. At least one full
section of pure prose between visual beats. Spread the three live demos
across the page rather than clustering them.

## 2. What "professional" means here

Register: engineering-documentation quality, drawn with editorial care —
the figures in a good systems paper or hardware datasheet, redrawn with
taste. Precise, hairline, mono-labeled, generous whitespace, near-monochrome,
color used as a pointer, not decoration. Competence signal = restraint +
accuracy, not richness.

**Do**: sit directly on the page ground inside `Frame`, no nested box; Fira
Code for technical names (process names, buffer slots, frame indices,
units), body face for plain-language explanation; let empty space carry
structure (~60% fill reads more expensive than ~95%); align everything to an
8px grid; orthogonal routing (H/V segments, small corner radius) over
freehand curves and diagonals.

**Don't**: no gradients/glow/drop-shadows/glassmorphism; no isometric/3D, no
cloud shapes, no server-rack icons, no cartoon browser windows, no emoji, no
imported icon sets; no multi-hue palette — one accent only, never
red-for-bad/green-for-good (encode good/bad via weight, position, or fill
state instead); no decorative particles/dot fields/circuit-board texture; no
symmetrical "three cards in a row" — that's the template look being
avoided; **no fake UI chrome ever** — no title bars, traffic lights, cursor
arrows, scrollbars, fake sliders/timelines, or photographic-looking
rectangles standing in for video. Zero elements a reader could mistake for a
captured screenshot.

**Complexity ceiling per diagram**: max 7 primary nodes, max 2 hierarchy
levels, zero crossing lines (never more than one), one dominant flow
direction. Thesis extractable in under 8 seconds. If it needs more, it's two
diagrams or it's prose.

## 3. Invariant kit — fixed across every session, never renegotiated

- **Corner radius**: 8px, nodes/chips only. No pills, no circles for nodes.
- **Stroke weights, exactly two: 1px and 2px.** 1px is every normal line and
  node outline; 2px is reserved for the one accented path per diagram.
  Hierarchy below the accent is carried by **colour and length**
  (`--pp-whisper` context vs `--pp-rule`/`--pp-body` primary), never by a
  third weight. *Revised during figure 2, from an original 1/1.5/2 kit:* CSS
  rounds a 1.5px border down to 1px at DPR 1 while SVG renders 1.5 exactly,
  so a CSS figure and an SVG figure using "1.5" silently disagree on
  hairline weight. 1 and 2 render identically in both.
- **Node padding**: 12px vertical / 16px horizontal, always.
- **Spacing**: 8px grid throughout. 24px between sibling nodes, 48px between
  groups.
- **Line caps/joins**: round joins, butt caps, consistently.
- **Arrows**: one arrowhead for the whole page — open chevron, ~7px, 45°,
  stroked not filled. Build once as an SVG `<marker>`, reuse everywhere.
  Solid line = data/frames actually moving. Dashed (4 2) = a boundary,
  grouping, or non-transfer relationship. Two meanings only, never a third
  dash pattern.
- **Type, three sizes only**: micro label 11px Fira Code uppercase ~0.08em
  tracking `--pp-faint` (units/tiny annotations); node label 13px (Fira Code
  for technical names, body face for plain language) `--pp-body`; diagram
  thesis/region title 15px body face `--pp-strong`, used at most twice per
  diagram. Never below 11px rendered, never `--pp-muted` or dimmer at that
  size.
- **Color rationing (strictest rule)**: default state is the ink scale
  (`--pp-strong/body/muted/faint` for text, `--pp-rule`/`--pp-whisper` for
  structure — `--pp-whisper` is not text-safe, ever). Accent marks exactly
  one thing per diagram: the caption sentence's subject — one path, one node,
  or one region, never three. Prefer accent stroke + `--pp-accent-faint`
  fill over solid accent fill; if solid fill is used, pair with
  `--pp-on-accent` text. Target: accent touches under 10% of inked area.
- **Motion**: diagrams never loop-animate. At most one entrance reveal on
  scroll-into-view, once, under 500ms, opacity + a few px translate — never a
  redraw of the diagram's own logic. Respect `prefers-reduced-motion` (drop
  to none). This is deliberate: continuous motion is the reserved signal for
  "real engine running" (§4) — spending it on a drawing devalues the demos.
- **Track discipline**: reading/wide for diagrams that support an argument;
  full-bleed reserved for the live demos and at most one diagram — the one
  carrying the page's single biggest structural idea (candidate: the render
  farm fan-out in §6).

## 4. Live demo vs. illustrative diagram — must read apart before any caption

Three orthogonal signals, never mixed:

1. **Motion/response** — demos move and react to input; diagrams are static.
2. **Ground vs. plate** — demos sit on `--pp-surface-raised`, full inset-panel
   treatment; diagrams sit on page ground / transparent, hairline only. Never
   swap these.
3. **Label vocabulary** — demos: "Live", "Running in this page", the demo's
   own name. Diagrams: concept nouns ("Topology," "Capture path," "Frame
   dependency"). Supporting signal only — signals 1 and 2 must work with
   labels stripped.

A diagram should look *drawn*, never *captured*. If it starts looking like a
nice UI, it has crossed the anti-screenshot line.

## 5. Inline SVG in this token-driven dark system

- **Coordinate space**: set `viewBox` so 1 user unit ≈ 1 rendered CSS px at
  the track's desktop width. Get this wrong and every stroke weight/type size
  lies, and cross-diagram consistency becomes impossible to eyeball.
- **Mobile scaling** (decided, applies to every diagram): scale proportionally
  like a normal responsive image — `width: 100%`, `height: auto` from the
  viewBox, no min-width floor, no horizontal scroll, no separate reflowed
  layout. Because scaling is uniform, label-to-diagram proportion never
  changes; keep the node count and viewBox low enough (see the complexity
  ceiling in §1/§2) that the design still reads at a phone width, since text
  will get smaller in absolute terms and there's no scroll to fall back on.
- **Color**: never a hex literal. Use `--pp-*` tokens directly in
  `fill`/`stroke`, or set `color` on the SVG root and use `currentColor` for
  the dominant ink. Mentally validate against a non-orange accent override —
  if meaning depends on orange reading as "hot," it breaks under retint.
  Encode meaning via position/weight; accent marks salience only.
- **Never tune to pure black** — `--pp-surface` is `#0a0908`, not `#000`.
  Sanity-check by flipping the frame's background between `--pp-surface` and
  `--pp-surface-raised`; if a fill disappears, it was tuned to black.
- **Hairline contrast**: never below 1px stroke; keep long dashed runs short;
  avoid large 1px hatching/fine-grid fills (shimmer on non-retina). Labels
  stay at `--pp-faint` or brighter, never `--pp-whisper`.
- **Accessibility**: `role="img"` + accessible name/description carrying the
  caption's sentence. Where state is encoded by fill, also vary shape/label
  so it survives color-blindness and retint.
- **Author declaratively** — plain markup, not runtime-generated from data.
  These are figures, not charts.
- **Lead every rule with two classes.** The shared article stylesheet styles
  bare elements inside the reading column at a specificity a single class
  cannot beat, and it is outside the project folder so it cannot be edited:
  `article.project-article img { height: auto }` (0,1,2),
  `article.project-article ol, ...ul { display: flex; flex-direction: column;
  padding-left: 24px; gap: 6px }` (0,1,2), and `...ol li { padding-left: 4px }`
  (0,1,3). A `.my-figure-part` rule is (0,1,0) and silently loses to all of
  them. This has already cost three bugs: a poster stuck at its intrinsic
  ratio, a pipeline locked to a column at every width, and chips with 4px of
  padding on one side and 16px on the other. Every one looked like a design
  mistake rather than a cascade one. Nest the whole component under its root
  class so every rule is at least (0,2,0), and write `padding-top/right/
  bottom/left` rather than the `padding` shorthand wherever a more specific
  longhand exists upstream.

## 6. Building 4-10 of these solo, across separate sessions

- **Sequence**: simplest diagram first (establishes the language, gets buy-in
  fast), hardest one second while the vocabulary is still soft enough to
  flex. Everything after inherits a proven kit.
- **Freeze constants after #1, abstract shared code after #3** — not before.
  Premature shared components produce a rigid kit that fights whatever
  actually turns out to need to differ.
- **Squint test, every session**: new diagram next to all previous ones at
  40-50% zoom. Check line weights match, label sizes match, accent lands in a
  comparable amount/role. Drift shows at reduced zoom before it shows at full
  size.
- **Resist escalation** — later diagrams must not get denser just because the
  topic got harder or the tooling got easier. One ambition level for the
  whole page.
- **Resist over-labeling** — the commonest failure. Every label competes with
  the caption and the surrounding prose that already explains it. Try to
  remove one label from every diagram before calling it done.
- **Keep numbers out of drawings** — 70ms, 500fps, 30x, 100% live in `Facts`.
  Numbers scattered into diagrams dilute the diagram's one thesis and
  duplicate `Facts`'s job.
- **Watch honesty drift** — the pressure to make later diagrams more
  "product-like" runs straight at the anti-screenshot rule. Reread it each
  session; it's the easiest one to erode by degrees.
- **Caption grammar, one pattern for the whole page**: short noun-phrase
  label + one sentence stating the claim. No em dashes anywhere — labels,
  captions, node text, SVG titles. Check earlier captions before writing a
  new one.
- **Done means**: every visual on the page is one a skimming engineer would
  stop for — not "every section has art." If building a visual because a
  section looks bare, that's already a Gate-1 failure. Bare is fine; the
  prose is locked and good, visuals exist only for what prose genuinely can't
  do.
