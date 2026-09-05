/**
 * Universal renderer tests — the CanvasNode tree must follow DOM semantics
 * for insertion so Solid's control flow (<For> reordering in particular)
 * produces the tree it expects.
 */

import { describe, it, expect } from "vitest";
import { createSignal, For } from "solid-js";
import { render, createElement } from "../src/renderer";
import { createNode, insertChild, type CanvasNode } from "../src/nodes";

function ids(root: CanvasNode): string[] {
  return root.children.map((c) => c.props["id"] as string);
}

describe("insertChild", () => {
  it("moves a node that is already attached instead of duplicating it", () => {
    const root = createNode("_root");
    const a = createNode("box"); a.props.id = "a";
    const b = createNode("box"); b.props.id = "b";
    const c = createNode("box"); c.props.id = "c";
    insertChild(root, a, null);
    insertChild(root, b, null);
    insertChild(root, c, null);

    insertChild(root, c, a); // move c to the front
    expect(ids(root)).toEqual(["c", "a", "b"]);

    insertChild(root, a, null); // move a to the end
    expect(ids(root)).toEqual(["c", "b", "a"]);
    expect(a.parent).toBe(root);
  });

  it("reparents a node attached elsewhere", () => {
    const p1 = createNode("box");
    const p2 = createNode("box");
    const n = createNode("box");
    insertChild(p1, n, null);
    insertChild(p2, n, null);
    expect(p1.children).toHaveLength(0);
    expect(p2.children).toEqual([n]);
    expect(n.parent).toBe(p2);
  });

  it("inserting a node before itself is a no-op", () => {
    const root = createNode("_root");
    const a = createNode("box");
    insertChild(root, a, null);
    insertChild(root, a, a);
    expect(root.children).toEqual([a]);
  });
});

describe("<For> through the renderer", () => {
  function mount() {
    const root = createNode("_root");
    const [items, setItems] = createSignal(["a", "b", "c"]);
    const dispose = render(
      () =>
        For({
          get each() {
            return items();
          },
          children: (item: string) => {
            const n = createElement("box");
            n.props.id = item;
            return n;
          },
        }),
      root
    );
    return { root, setItems, dispose };
  }

  it("reordering items reorders children without duplicates", () => {
    const { root, setItems, dispose } = mount();
    expect(ids(root)).toEqual(["a", "b", "c"]);

    setItems(["a", "c", "b"]); // bring b to the front (paint order = last)
    expect(ids(root)).toEqual(["a", "c", "b"]);

    setItems(["c", "b", "a"]);
    expect(ids(root)).toEqual(["c", "b", "a"]);

    setItems(["b", "a", "c"]);
    expect(ids(root)).toEqual(["b", "a", "c"]);
    for (const child of root.children) expect(child.parent).toBe(root);
    dispose();
  });

  it("removing an item after a reorder removes exactly that node", () => {
    const { root, setItems, dispose } = mount();
    setItems(["c", "a", "b"]);
    setItems(["c", "b"]);
    expect(ids(root)).toEqual(["c", "b"]);
    dispose();
  });
});
