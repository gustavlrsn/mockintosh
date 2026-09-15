import { For, useContext, type JSX } from "solid-js";
import { parseMarkdown, type LayoutNode, type InlineSegment } from "@mockintosh/markdown";
import { AppServicesContext } from "./index";

export type { LayoutNode, InlineSegment } from "@mockintosh/markdown";
export { parseMarkdown } from "@mockintosh/markdown";

function InlineRun(props: { segments: InlineSegment[] }): JSX.Element {
  return (
    <text font="body" wrap>
      {props.segments.map((seg) => seg.text).join("")}
    </text>
  );
}

function Block(props: { node: LayoutNode; onLink?: (href: string) => void }): JSX.Element {
  const app = useContext(AppServicesContext);
  if (!app) throw new Error("useApp() must be called inside a Mockintosh app window");
  const node = props.node;
  if (node.type === "heading") {
    return <text font="menu">{node.text}</text>;
  }
  if (node.type === "paragraph") {
    return <InlineRun segments={node.segments} />;
  }
  if (node.type === "listItem") {
    return (
      <box flexDirection="row" gap={4} paddingLeft={node.indent * 8}>
        <text font="body">•</text>
        <InlineRun segments={node.segments} />
      </box>
    );
  }
  if (node.type === "hr") {
    return <box height={1} background={1} />;
  }
  if (node.type === "image") {
    const sprite = app.getSprite(node.src);
    if (sprite) {
      return (
        <image
          width={sprite.width}
          height={sprite.height}
          src={{ width: sprite.width, height: sprite.height, data: sprite.data, mask: sprite.mask }}
        />
      );
    }
    return <text font="body">{node.alt || node.src}</text>;
  }
  if (node.type === "spacer") {
    return <box height={node.height} />;
  }
  return <box height={6} />;
}

export interface MarkdownProps {
  text: string;
  onLink?: (href: string) => void;
}

/** Renders markdown through the 1-bit layout tree (`box` / `text` / `image`). */
export function Markdown(props: MarkdownProps): JSX.Element {
  const nodes = () => parseMarkdown(props.text || "");
  return (
    <box flexDirection="column" gap={4} width="100%">
      <For each={nodes()}>{(n) => <Block node={n} onLink={props.onLink} />}</For>
    </box>
  );
}
