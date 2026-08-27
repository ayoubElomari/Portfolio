import "../style/PipelineDiagram.scss";

const STAGES = ["Fetch", "Rewrite", "Compose", "Render", "Upload"];

export default function PipelineDiagram() {
  return (
    <div className="se-pipeline">
      <div className="se-pipeline__row">
        {STAGES.map((stage, i) => (
          <div className="se-pipeline__step" key={stage}>
            <div className="se-pipeline__node">{stage}</div>
            {i < STAGES.length - 1 && <div className="se-pipeline__arrow" aria-hidden="true" />}
          </div>
        ))}
      </div>
      <div className="se-pipeline__feedback">
        <div className="se-pipeline__feedback-line" aria-hidden="true" />
        <div className="se-pipeline__node se-pipeline__node--ghost">Notify on error</div>
      </div>
    </div>
  );
}
