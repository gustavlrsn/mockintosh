import { describe, expect, it } from "vitest";
import { newBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { findDebugNode, formatDebugJsx } from "../src/debugInspect";
import { nodeAt } from "../src/pointer";
import type { SemanticMetadata } from "../src/inspection";
import { Button } from "../src/widgets/Button";

describe("debugInspect", () => {
  it("records the Solid widget that created a host node", () => {
    const ui = createUI({ screen: newBitMap(200, 40) });
    ui.render(() => <Button name="go" label="Go" onClick={() => {}} />);
    ui.frame();
    const tree = ui.debugInspect();
    const face = findDebugNode(tree, (n) => n.name === "go");
    expect(face).toBeTruthy();
    expect(face!.owner[0]).toBe("Button");
    const jsx = formatDebugJsx(face!);
    expect(jsx).toContain("<box");
    expect(jsx).toContain("Go");
  });

  it("reconstructs host JSX for a page-authored box", () => {
    function Preview() {
      return (
        <box padding={8} flexDirection="column" background={0}>
          <text font="body">Hello</text>
        </box>
      );
    }
    const ui = createUI({ screen: newBitMap(200, 40) });
    ui.render(() => <Preview />);
    ui.frame();
    const tree = ui.debugInspect();
    const box = findDebugNode(tree, (n) => n.attrs.includes("padding={8}"));
    expect(box).toBeTruthy();
    expect(box!.owner[0]).toBe("Preview");
    expect(formatDebugJsx(box!)).toBe('<box padding={8} flexDirection="column" background={0}>\n  <text font="body">Hello</text>\n</box>');
  });

  it("nodeAt finds a painted box that has no mouse handlers", () => {
    const ui = createUI({ screen: newBitMap(200, 40) });
    ui.render(() => (
      <box width={40} height={20} background={1}>
        <text font="body">Hi</text>
      </box>
    ));
    ui.frame();
    const hit = nodeAt(ui.root, 8, 8);
    expect(hit).toBeTruthy();
    expect(hit!.type === "box" || hit!.type === "text").toBe(true);
    const snap = findDebugNode(ui.debugInspect(), (n) => n.id === hit!.id);
    expect(snap?.text).toContain("Hi");
  });

  it("looks through a full-screen inspect catcher to the page node", () => {
    const ui = createUI({ screen: newBitMap(80, 40) });
    ui.render(() => (
      <box width="100%" height="100%">
        <box width={40} height={20} semantic={{ name: "page" }} background={1} />
        <box
          semantic={{ name: "devtools-menu-catcher", role: "devtools" }}
          position="absolute"
          left={0}
          top={0}
          width="100%"
          height="100%"
          onMouseDown={() => {}}
        />
      </box>
    ));
    ui.frame();
    const skipChrome = (node: { props: Record<string, unknown> }) => {
      const semantic = node.props.semantic as SemanticMetadata | undefined;
      return semantic?.role === "devtools" || (semantic?.name?.startsWith("devtools") ?? false);
    };
    const covered = nodeAt(ui.root, 8, 8);
    expect((covered?.props.semantic as SemanticMetadata | undefined)?.name).toBe("devtools-menu-catcher");
    const page = nodeAt(ui.root, 8, 8, 0, 0, null, skipChrome);
    expect((page?.props.semantic as SemanticMetadata | undefined)?.name).toBe("page");
  });
});
