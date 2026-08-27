import { useId, useState } from "react";

import "./style/DropdownItem.scss";

/* A disclosure. Open state lives in React rather than in a
   `parent.classList.toggle("open")` DOM mutation, so the markup and the
   `aria-expanded` value can't drift out of sync with what's on screen. */
function DropdownItem({ title, content }) {
  const [open, setOpen] = useState(false);
  const panelId = `${useId()}-panel`;

  return (
    <div className={"dropdown-item" + (open ? " open" : "")}>
      <button
        type="button"
        className="drop-item-header"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="drop-item-title">{title}</span>
        <div className="drop-item-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9L12 15L18 9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>
      {/* `hidden` would kill the height/opacity transition, so the panel stays
          rendered and is hidden from assistive tech via `inert` instead —
          which also takes anything focusable inside it out of the tab order
          while collapsed. */}
      <div className="drop-item-content" id={panelId} inert={!open}>
        <p>{content}</p>
      </div>
    </div>
  );
}

export default DropdownItem;
