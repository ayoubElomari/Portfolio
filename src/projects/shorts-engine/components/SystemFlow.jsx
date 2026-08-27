import "../style/SystemFlow.scss";

/* The payload between two nodes is one thing, not two: what Bots hands out is
   exactly what Render takes in. It lives on the arrow rather than being
   printed twice, once per card. */
const NODES = [
  { key: "bots", label: "Bots", note: "reads a profile" },
  { key: "render", label: "Render", note: "draws the frames" },
  { key: "publish", label: "Publish", note: "waits for its slot" },
];

const HANDOFFS = ["composition", "video"];

export default function SystemFlow({
  nodes = NODES,
  handoffs = HANDOFFS,
  startLabel = "channel profile",
  endLabel = "live",
}) {
  return (
    <div className="se-flow">
      <div className="se-flow__row">
        <div className="se-flow__terminus">{startLabel}</div>
        <div className="se-flow__arrow" aria-hidden="true" />

        {nodes.map((node, i) => (
          <div className="se-flow__step" key={node.key}>
            <div className="se-flow__node">
              <div className="se-flow__node-label">{node.label}</div>
              <div className="se-flow__node-note">{node.note}</div>
            </div>
            {i < nodes.length - 1 && (
              <div className="se-flow__link">
                <span className="se-flow__link-label">{handoffs[i]}</span>
                <div className="se-flow__arrow" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}

        <div className="se-flow__arrow" aria-hidden="true" />
        <div className="se-flow__terminus is-end">{endLabel}</div>
      </div>
    </div>
  );
}
