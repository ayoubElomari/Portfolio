import bgPattern from "../../assets/hero-bg-pattern.svg";
import "./style/BgPattern.scss";

function BgPattern() {
  return (
    <div className="bg-pattern-container">
      <img className="bg-pattern" src={bgPattern} alt="Background Pattern" />
      <img className="bg-pattern" src={bgPattern} alt="Background Pattern" />
    </div>
  );
}

export default BgPattern;
