import { describe, expect, it } from "vitest";
import { createNode, insertChild, setNodeProperty } from "../src/nodes";
import { inspectTree } from "../src/inspection";
import { createFocusManager } from "../src/focus";
function setup() {
  const root = createNode("_root");
  root.layout = {
    x: 0,
    y: 0,
    width: 100,
    height: 100
  };
  const field = createNode("box");
  field.layout = {
    x: 10,
    y: 10,
    width: 50,
    height: 20
  };
  insertChild(root, field, null);
  return {
    root,
    field,
    focus: createFocusManager(root)
  };
}
describe("immutable UI inspection", () => {
  it("masks passwords in both field and aggregate ancestor text", () => {
    const {
      root,
      field,
      focus
    } = setup();
    setNodeProperty(field, "semantic", {
      name: "password",
      role: "textbox",
      password: true,
      value: "secret"
    });
    const text = createNode("_text_content");
    text.textContent = "secret";
    insertChild(field, text, null);
    const snapshot = inspectTree(root, focus);
    expect(JSON.stringify(snapshot)).not.toContain("secret");
    expect(snapshot.find(n => n.name === "password")?.value).toBe("••••");
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot[0].bounds)).toBe(true);
    field.layout.x = 80;
    expect(snapshot[1].bounds.x).toBe(10);
  });
  it("inherits window ownership, clipping and modal blocking", () => {
    const {
      root,
      field,
      focus
    } = setup();
    root.style.overflow = "hidden";
    root.props.semantic = {
      windowId: "window-1"
    };
    root.props.inert = true;
    field.layout = {
      x: 90,
      y: 95,
      width: 50,
      height: 20
    };
    const snapshot = inspectTree(root, focus)[1];
    expect(snapshot).toMatchObject({
      windowId: "window-1",
      enabled: false,
      bounds: {
        x: 90,
        y: 95,
        width: 10,
        height: 5
      }
    });
  });
});
