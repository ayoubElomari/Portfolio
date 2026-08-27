import "../style/TerminalLog.scss";

/**
 * A few lines of what the pipeline actually printed.
 *
 * `lines` is `[{ type?: "progress" | "error" | "info", text }]`. Nothing here
 * is parsed or styled by content — the real logs had no structure to read, and
 * pretending otherwise on a page that says so would be a lie.
 */
export default function TerminalLog({ lines = [] }) {
  if (!lines.length) return null;

  return (
    <div className="se-log">
      <pre className="se-log-body">
        {lines.map((line, i) => (
          <span
            key={`${i}-${line.text}`}
            className={`se-log-line is-${line.type || "info"}`}
          >
            {line.text}
          </span>
        ))}
      </pre>
    </div>
  );
}
