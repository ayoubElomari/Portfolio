import { visit } from "unist-util-visit";

function textFromChildren(children = []) {
  return children
    .map((child) => {
      if (child.type === "text" || child.type === "inlineCode") {
        return child.value;
      }
      return "";
    })
    .join("")
    .trim();
}

function setJsxName(node, name) {
  node.type = "mdxJsxFlowElement";
  node.name = name;
}

function attrsToMdx(attributes = {}) {
  return Object.entries(attributes).map(([key, value]) => ({
    type: "mdxJsxAttribute",
    name: key,
    value: String(value),
  }));
}

const BASE_SPACE = 16;

export function remarkCustomDirectives() {
  return function transformer(tree) {
    visit(tree, (node, index, parent) => {
      // ::space / ::space[16]
      if (node.type === "leafDirective" && node.name === "space") {
        const raw =
          textFromChildren(node.children) || node.attributes?.size || "16";
        const size = String(raw);

        setJsxName(node, "Spacer");
        node.attributes = attrsToMdx({ size });
        node.children = [];
        return;
      }

      // Support plain markdown syntax like:
      // ::space
      // ::space x2
      // ::space x1.5
      if (
        node.type === "paragraph" &&
        parent &&
        typeof index === "number" &&
        node.children?.length === 1 &&
        node.children[0].type === "text"
      ) {
        const value = node.children[0].value.trim();
        const match = value.match(/^::space(?:\s*x\s*(\d+(?:\.\d+)?))?$/i);

        if (match) {
          const multiplier = match[1] ? Number(match[1]) : 1;
          const size = String(BASE_SPACE * multiplier);

          parent.children[index] = {
            type: "mdxJsxFlowElement",
            name: "Spacer",
            attributes: attrsToMdx({ size }),
            children: [],
          };
        }
      }
    });
  };
}
