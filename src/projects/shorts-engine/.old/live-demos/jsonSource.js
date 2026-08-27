/**
 * Serialises a composition to the exact text of its `.rendr.json` file, while
 * remembering which timeline element each line belongs to.
 *
 * That mapping is what lets the three panels agree: a clip on the timeline, the
 * block of JSON that produced it, and the element on the stage are all the same
 * thing in the reader's eye because they carry the same colour.
 */
export function buildSource(config) {
  const lines = [];
  const push = (text, element = null) => lines.push({ text, element });

  const head = { ...config };
  delete head.timeline;

  const headLines = JSON.stringify(head, null, 2).split("\n");
  /* drop the closing brace, reopen for the timeline */
  headLines.slice(0, -1).forEach((text) => push(text));
  lines[lines.length - 1].text += ",";
  push('  "timeline": [');

  (config.timeline || []).forEach((el, i) => {
    const body = JSON.stringify(el, null, 2)
      .split("\n")
      .map((l) => "    " + l);
    if (i < config.timeline.length - 1) body[body.length - 1] += ",";
    body.forEach((text) => push(text, i));
  });

  push("  ]");
  push("}");
  return lines;
}

/**
 * Line ranges per element, so the editor can scroll an element into view without
 * scanning the whole file.
 */
export function elementRanges(lines) {
  const ranges = new Map();
  lines.forEach((line, i) => {
    if (line.element === null) return;
    const range = ranges.get(line.element);
    if (range) range.end = i;
    else ranges.set(line.element, { start: i, end: i });
  });
  return ranges;
}

/* ── syntax colouring ────────────────────────────────────────────────────── */

const TOKEN = /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|(\b-?\d+\.?\d*\b)|(\btrue\b|\bfalse\b|\bnull\b)|([{}[\],:])/g;

/**
 * Splits one line of JSON into `{ text, kind }` runs. Deliberately a small regex
 * rather than a real parser — one line of already-valid JSON is not a parsing
 * problem, and a tokenizer that can't fail is worth more here than a correct one.
 */
export function tokenize(line) {
  const out = [];
  let last = 0;
  let match;
  TOKEN.lastIndex = 0;

  while ((match = TOKEN.exec(line)) !== null) {
    if (match.index > last) out.push({ text: line.slice(last, match.index) });

    const [text, key, string, number, literal, punct] = match;
    if (key) out.push({ text, kind: "key" });
    else if (string) out.push({ text, kind: refKind(string) });
    else if (number) out.push({ text, kind: "number" });
    else if (literal) out.push({ text, kind: "literal" });
    else if (punct) out.push({ text, kind: "punct" });

    last = match.index + text.length;
  }

  if (last < line.length) out.push({ text: line.slice(last) });
  return out;
}

/** `@variables:accent`, `@assets:…`, `@presets:…` are references, not plain strings. */
function refKind(string) {
  return /^"@[a-z]+:/.test(string) ? "ref" : "string";
}
