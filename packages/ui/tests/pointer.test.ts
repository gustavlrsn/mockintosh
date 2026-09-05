import { describe, it, expect } from "vitest";
import { createNode } from "../src/nodes";
import { computeLayout } from "../src/layout";
import { createPointerDispatcher, hitTest } from "../src/pointer";
import { createFocusManager } from "../src/focus";
import type { MeasureFunc } from "../src/layout";

const noMeasure: MeasureFunc = () => ({ width: 0, height: 0 });

function tree() {
  const root = createNode("_root");
  root.style = { width: 100, height: 100 };
  const a = createNode("box");
  a.style = { position: "absolute", left: 0, top: 0, width: 50, height: 50 };
  a._eventHandlers = {};
  const b = createNode("box");
  b.style = { position: "absolute", left: 25, top: 25, width: 50, height: 50 };
  b._eventHandlers = {};
  a.parent = root;
  b.parent = root;
  root.children = [a, b];
  computeLayout(root, 100, 100, noMeasure);
  return { root, a, b };
}

describe("hitTest", () => {
  it("returns the topmost (later) node", () => {
    const { root, b } = tree();
    b._eventHandlers.onClick = () => {};
    const hit = hitTest(root, 30, 30);
    expect(hit).toBe(b);
  });

  it("skips inert subtrees", () => {
    const { root, a, b } = tree();
    a._eventHandlers.onClick = () => {};
    b._eventHandlers.onClick = () => {};
    b.props.inert = true;
    expect(hitTest(root, 30, 30)).toBe(a);
  });

  it("honors hit masks", () => {
    const { root, b } = tree();
    b._eventHandlers.onClick = () => {};
    const mask = new Uint8Array(50 * 50);
    mask[0] = 1; // only (0,0) of the box
    b.props.hitMask = { data: mask, width: 50, height: 50 };
    expect(hitTest(root, 25, 25)).toBe(b);
    expect(hitTest(root, 30, 30)).toBe(null);
  });
});

describe("pointer capture", () => {
  it("delivers drag and dragEnd to the mousedown node", () => {
    const { root, a } = tree();
    const events: string[] = [];
    a._eventHandlers.onMouseDown = () => events.push("down");
    a._eventHandlers.onDragStart = () => events.push("start");
    a._eventHandlers.onDrag = () => events.push("drag");
    a._eventHandlers.onDragEnd = () => events.push("end");
    a._eventHandlers.onMouseUp = () => events.push("up");
    const focus = createFocusManager(root);
    const ptr = createPointerDispatcher(root, focus);
    ptr.dispatch("mousedown", 10, 10);
    ptr.dispatch("mousemove", 80, 80);
    ptr.dispatch("mouseup", 80, 80);
    expect(events).toEqual(["down", "start", "drag", "end", "up"]);
  });

  it("keeps delivering hover to nodes under the pointer during a capture", () => {
    const { root, a, b } = tree();
    const events: string[] = [];
    a._eventHandlers.onMouseDown = () => {};
    a._eventHandlers.onMouseLeave = () => events.push("a:leave");
    b._eventHandlers.onMouseEnter = () => events.push("b:enter");
    b._eventHandlers.onMouseLeave = () => events.push("b:leave");
    const focus = createFocusManager(root);
    const ptr = createPointerDispatcher(root, focus);
    ptr.dispatch("mousedown", 10, 10); // on a
    ptr.dispatch("mousemove", 60, 60); // over b (drop target)
    ptr.dispatch("mousemove", 90, 5);  // over nothing
    ptr.dispatch("mouseup", 90, 5);
    expect(events).toEqual(["a:leave", "b:enter", "b:leave"]);
  });

  it("does not click if released outside the node", () => {
    const { root, a } = tree();
    let clicked = false;
    a._eventHandlers.onMouseDown = () => {};
    a._eventHandlers.onClick = () => {
      clicked = true;
    };
    const focus = createFocusManager(root);
    const ptr = createPointerDispatcher(root, focus);
    ptr.dispatch("mousedown", 10, 10);
    ptr.dispatch("mouseup", 80, 80);
    expect(clicked).toBe(false);
  });

  it("focuses a tabIndex node on mousedown", () => {
    const { root, a } = tree();
    a._eventHandlers.tabIndex = 0;
    a._eventHandlers.onMouseDown = () => {};
    const focus = createFocusManager(root);
    const ptr = createPointerDispatcher(root, focus);
    ptr.dispatch("mousedown", 10, 10);
    expect(focus.focused).toBe(a);
  });
});

/** root > outer (capture) > inner (target), inner fills outer at (10,10)-(60,60). */
function nestedTree() {
  const root = createNode("_root");
  root.style = { width: 100, height: 100 };
  const outer = createNode("box");
  outer.style = { position: "absolute", left: 10, top: 10, width: 50, height: 50 };
  const inner = createNode("box");
  inner.style = { position: "absolute", left: 0, top: 0, width: 50, height: 50 };
  outer.parent = root;
  inner.parent = outer;
  root.children = [outer];
  outer.children = [inner];
  computeLayout(root, 100, 100, noMeasure);
  return { root, outer, inner };
}

describe("mousedown capture phase", () => {
  it("runs ancestors first, then the target, before the target's onMouseDown", () => {
    const { root, outer, inner } = nestedTree();
    const events: string[] = [];
    outer._eventHandlers.onMouseDownCapture = (e) => events.push(`outer@${e.localX},${e.localY}`);
    inner._eventHandlers.onMouseDownCapture = (e) => events.push(`inner@${e.localX},${e.localY}`);
    inner._eventHandlers.onMouseDown = (lx, ly) => events.push(`down@${lx},${ly}`);
    const ptr = createPointerDispatcher(root, createFocusManager(root));
    ptr.dispatch("mousedown", 30, 40);
    expect(events).toEqual(["outer@20,30", "inner@20,30", "down@20,30"]);
  });

  it("preventDefault swallows the press and the matching release", () => {
    const { root, outer, inner } = nestedTree();
    const events: string[] = [];
    outer._eventHandlers.onMouseDownCapture = (e) => {
      events.push("capture");
      e.preventDefault();
      expect(e.defaultPrevented).toBe(true);
    };
    inner._eventHandlers.onMouseDownCapture = () => events.push("inner-capture");
    inner._eventHandlers.onMouseDown = () => events.push("down");
    inner._eventHandlers.onMouseUp = () => events.push("up");
    inner._eventHandlers.onClick = () => events.push("click");
    inner._eventHandlers.onDrag = () => events.push("drag");
    const ptr = createPointerDispatcher(root, createFocusManager(root));
    ptr.dispatch("mousedown", 30, 30);
    ptr.dispatch("mousemove", 35, 35);
    ptr.dispatch("mouseup", 30, 30);
    expect(events).toEqual(["capture"]);
  });

  it("a swallowed press does not move keyboard focus to the target", () => {
    const { root, outer, inner } = nestedTree();
    inner._eventHandlers.tabIndex = 0;
    outer._eventHandlers.onMouseDownCapture = (e) => e.preventDefault();
    const focus = createFocusManager(root);
    const ptr = createPointerDispatcher(root, focus);
    ptr.dispatch("mousedown", 30, 30);
    expect(focus.focused).toBe(null);
  });

  it("a press inside a focus scope activates that scope even when swallowed", () => {
    const { root, outer, inner } = nestedTree();
    outer.props.focusScope = true;
    outer._eventHandlers.onMouseDownCapture = (e) => e.preventDefault();
    inner._eventHandlers.onClick = () => {};
    const focus = createFocusManager(root);
    const ptr = createPointerDispatcher(root, focus);
    ptr.dispatch("mousedown", 30, 30);
    expect(focus.getActiveScope()).toBe(outer);
  });

  it("a node with only a capture handler is still a hit target", () => {
    const { root, outer } = nestedTree();
    outer._eventHandlers.onMouseDownCapture = () => {};
    expect(hitTest(root, 30, 30)).toBe(outer);
  });
});
