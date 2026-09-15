/**
 * Layout engine unit tests.
 * These are pure math tests — no QuickDraw, no fonts, no DOM.
 */

import { describe, it, expect } from "vitest";
import { computeLayout } from "../src/layout";
import { createNode, type CanvasNode } from "../src/nodes";
import type { MeasureFunc } from "../src/layout";

const noMeasure: MeasureFunc = () => ({ width: 0, height: 0 });
const fixedMeasure =
  (w: number, h: number): MeasureFunc =>
  () => ({ width: w, height: h });

function box(style: CanvasNode["style"] = {}, children: CanvasNode[] = []): CanvasNode {
  const node = createNode("box");
  node.style = style;
  for (const child of children) {
    child.parent = node;
    node.children.push(child);
  }
  return node;
}

function text(style: CanvasNode["style"] = {}): CanvasNode {
  const node = createNode("text");
  node.style = style;
  node.textContent = "abc";
  return node;
}

// -------------------------------------------------------------------------

describe("computeLayout — fixed sizes", () => {
  it("root fills container width/height", () => {
    const root = createNode("_root");
    computeLayout(root, 200, 100, noMeasure);
    expect(root.layout.width).toBe(200);
    expect(root.layout.height).toBe(100);
  });

  it("child with explicit size", () => {
    const child = box({ width: 50, height: 30 });
    const root = createNode("_root");
    root.children = [child];
    child.parent = root;
    computeLayout(root, 200, 100, noMeasure);
    expect(child.layout.width).toBe(50);
    expect(child.layout.height).toBe(30);
  });

  it("child with percentage width", () => {
    const child = box({ width: "50%" });
    const root = createNode("_root");
    root.children = [child];
    child.parent = root;
    computeLayout(root, 200, 100, noMeasure);
    expect(child.layout.width).toBe(100);
  });
});

describe("computeLayout — column layout (default)", () => {
  it("stacks two children vertically", () => {
    const a = box({ height: 20 });
    const b = box({ height: 30 });
    const root = createNode("_root");
    root.style = { width: 100, height: 100, flexDirection: "column" };
    root.children = [a, b];
    a.parent = root;
    b.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(a.layout.y).toBe(0);
    expect(b.layout.y).toBe(20);
  });

  it("gap is applied between children", () => {
    const a = box({ height: 10 });
    const b = box({ height: 10 });
    const root = createNode("_root");
    root.style = { width: 100, height: 100, flexDirection: "column", gap: 5 };
    root.children = [a, b];
    a.parent = root;
    b.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(a.layout.y).toBe(0);
    expect(b.layout.y).toBe(15); // 10 + 5
  });

  it("padding offsets children", () => {
    const child = box({ height: 10 });
    const root = createNode("_root");
    root.style = { width: 100, height: 100, padding: 8 };
    root.children = [child];
    child.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(child.layout.x).toBe(8);
    expect(child.layout.y).toBe(8);
  });
});

describe("computeLayout — row layout", () => {
  it("places children side by side", () => {
    const a = box({ width: 30, height: 20 });
    const b = box({ width: 40, height: 20 });
    const root = createNode("_root");
    root.style = { width: 200, height: 50, flexDirection: "row" };
    root.children = [a, b];
    a.parent = root;
    b.parent = root;
    computeLayout(root, 200, 50, noMeasure);
    expect(a.layout.x).toBe(0);
    expect(b.layout.x).toBe(30);
    expect(a.layout.y).toBe(0);
    expect(b.layout.y).toBe(0);
  });

  it("flexGrow distributes remaining space", () => {
    const fixed = box({ width: 40 });
    const grow = box({ flexGrow: 1 });
    const root = createNode("_root");
    root.style = { width: 200, height: 50, flexDirection: "row" };
    root.children = [fixed, grow];
    fixed.parent = root;
    grow.parent = root;
    computeLayout(root, 200, 50, noMeasure);
    expect(fixed.layout.width).toBe(40);
    expect(grow.layout.width).toBe(160); // 200 - 40
  });

  it("flexGrow with two growing children splits remaining evenly", () => {
    const a = box({ flexGrow: 1 });
    const b = box({ flexGrow: 1 });
    const root = createNode("_root");
    root.style = { width: 100, height: 50, flexDirection: "row" };
    root.children = [a, b];
    a.parent = root;
    b.parent = root;
    computeLayout(root, 100, 50, noMeasure);
    expect(a.layout.width).toBe(50);
    expect(b.layout.width).toBe(50);
  });

  it("overflow:scroll flex item shrinks so it can scroll instead of growing the column", () => {
    const content = box({ height: 200 });
    const pane = box({ flexGrow: 1, overflow: "scroll" }, [content]);
    const bar = box({ height: 22 });
    const root = createNode("_root");
    root.style = { width: 100, height: 100, flexDirection: "column" };
    root.children = [pane, bar];
    pane.parent = root;
    bar.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(pane.layout.height).toBe(78);
    expect(bar.layout.y).toBe(78);
    expect(content.layout.height).toBe(200);
  });

  it("flexGrow adds free space on top of the child's own size", () => {
    // ChatGippity: a padded flexGrow pane + a fixed compose row. Free space
    // is available minus every sibling's base size, including the grow pane's
    // padding. Skipping that base made the column overflow and clipped the row.
    const pane = box({ flexGrow: 1, padding: 6 });
    const bar = box({ height: 22 });
    const root = createNode("_root");
    root.style = { width: 100, height: 100, flexDirection: "column" };
    root.children = [pane, bar];
    pane.parent = root;
    bar.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(pane.layout.height).toBe(78);
    expect(bar.layout.y).toBe(78);
    expect(bar.layout.y + bar.layout.height).toBe(100);
  });
});

describe("computeLayout — alignment", () => {
  it("alignItems center centers child on cross axis", () => {
    const child = box({ width: 20, height: 20 });
    const root = createNode("_root");
    root.style = { width: 100, height: 100, flexDirection: "row", alignItems: "center" };
    root.children = [child];
    child.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(child.layout.y).toBe(40); // (100 - 20) / 2
  });

  it("alignItems stretch fills cross axis", () => {
    const child = box({});
    const root = createNode("_root");
    root.style = { width: 100, height: 60, flexDirection: "row", alignItems: "stretch" };
    root.children = [child];
    child.parent = root;
    computeLayout(root, 100, 60, noMeasure);
    expect(child.layout.height).toBe(60);
  });

  it("defaults to stretch: auto-sized child fills the cross axis (column)", () => {
    const t = text({});
    const root = createNode("_root");
    root.style = { width: 200, height: 100 };
    root.children = [t];
    t.parent = root;
    computeLayout(root, 200, 100, fixedMeasure(60, 11));
    expect(t.layout.width).toBe(200); // stretched, so align="center" can work
    expect(t.layout.height).toBe(11); // main axis keeps measured size
  });

  it("defaults to stretch: auto-sized child fills the cross axis (row)", () => {
    const child = box({ width: 30 });
    const root = createNode("_root");
    root.style = { width: 100, height: 60, flexDirection: "row" };
    root.children = [child];
    child.parent = root;
    computeLayout(root, 100, 60, noMeasure);
    expect(child.layout.height).toBe(60);
  });

  it("stretch does not override an explicit cross size", () => {
    const child = box({ width: 20, height: 10 });
    const root = createNode("_root");
    root.style = { width: 100, height: 100 };
    root.children = [child];
    child.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(child.layout.width).toBe(20);
  });

  it("stretch respects maxWidth", () => {
    const child = box({ maxWidth: 40 });
    const root = createNode("_root");
    root.style = { width: 100, height: 100 };
    root.children = [child];
    child.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(child.layout.width).toBe(40);
  });

  it("alignSelf flex-start opts a child out of stretching", () => {
    const t = text({ alignSelf: "flex-start" });
    const root = createNode("_root");
    root.style = { width: 200, height: 100 };
    root.children = [t];
    t.parent = root;
    computeLayout(root, 200, 100, fixedMeasure(60, 11));
    expect(t.layout.width).toBe(60);
    expect(t.layout.x).toBe(0);
  });

  it("stretched children do not inflate a content-sized parent", () => {
    const t = text({});
    const parent = box({ padding: 4 }, [t]);
    const root = createNode("_root");
    root.style = { width: 200, height: 100, alignItems: "flex-start" };
    root.children = [parent];
    parent.parent = root;
    computeLayout(root, 200, 100, fixedMeasure(60, 11));
    expect(parent.layout.width).toBe(68); // 60 + 2*4, hugs content
    expect(t.layout.width).toBe(60);
  });

  it("justifyContent center centers on main axis", () => {
    const child = box({ width: 40, height: 10 });
    const root = createNode("_root");
    root.style = { width: 100, height: 50, flexDirection: "row", justifyContent: "center" };
    root.children = [child];
    child.parent = root;
    computeLayout(root, 100, 50, noMeasure);
    expect(child.layout.x).toBe(30); // (100 - 40) / 2
  });
});

describe("computeLayout — borders participate in layout (CSS box model)", () => {
  function bordered(style: CanvasNode["style"], children: CanvasNode[] = [], bw = 1): CanvasNode {
    const node = box({ ...style, borderWidth: bw }, children);
    node.props.borderColor = 1;
    return node;
  }

  it("flow children are inset by border + padding", () => {
    const child = box({ height: 10 });
    const parent = bordered({ width: 100, height: 50, padding: 4 }, [child]);
    const root = createNode("_root");
    root.style = { width: 200, height: 200 };
    root.children = [parent];
    parent.parent = root;
    computeLayout(root, 200, 200, noMeasure);
    expect(child.layout.x).toBe(5); // 1 border + 4 padding
    expect(child.layout.y).toBe(5);
    expect(child.layout.width).toBe(90); // 100 - 2*(1+4), stretched
  });

  it("absolute children are positioned relative to the padding box", () => {
    const child = box({ position: "absolute", left: 0, top: 0, width: 10, height: 10 });
    const parent = bordered({ width: 100, height: 50, padding: 4 }, [child], 2);
    const root = createNode("_root");
    root.style = { width: 200, height: 200 };
    root.children = [parent];
    parent.parent = root;
    computeLayout(root, 200, 200, noMeasure);
    expect(child.layout.x).toBe(2); // inside the border, padding ignored
    expect(child.layout.y).toBe(2);
  });

  it("absolute right/bottom are measured from the inside of the border", () => {
    const child = box({ position: "absolute", right: 0, bottom: 0, width: 10, height: 10 });
    const parent = bordered({ width: 100, height: 50 }, [child]);
    const root = createNode("_root");
    root.style = { width: 200, height: 200 };
    root.children = [parent];
    parent.parent = root;
    computeLayout(root, 200, 200, noMeasure);
    expect(child.layout.x).toBe(100 - 1 - 10);
    expect(child.layout.y).toBe(50 - 1 - 10);
  });

  it("a content-sized bordered box grows by its border", () => {
    const child = box({ width: 20, height: 10 });
    const parent = bordered({ padding: 2, alignSelf: "flex-start" }, [child]);
    const root = createNode("_root");
    root.style = { width: 200, height: 200 };
    root.children = [parent];
    parent.parent = root;
    computeLayout(root, 200, 200, noMeasure);
    expect(parent.layout.width).toBe(20 + 2 * 2 + 2 * 1);
    expect(parent.layout.height).toBe(10 + 2 * 2 + 2 * 1);
  });

  it("borderWidth without borderColor does not inset", () => {
    const child = box({ height: 10 });
    const parent = box({ width: 100, height: 50, borderWidth: 3 }, [child]);
    const root = createNode("_root");
    root.style = { width: 200, height: 200 };
    root.children = [parent];
    parent.parent = root;
    computeLayout(root, 200, 200, noMeasure);
    expect(child.layout.x).toBe(0);
    expect(child.layout.width).toBe(100);
  });
});

describe("computeLayout — absolute positioning", () => {
  it("absolute child is positioned relative to parent", () => {
    const child = box({ position: "absolute", top: 10, left: 20, width: 30, height: 15 });
    const root = createNode("_root");
    root.style = { width: 100, height: 100 };
    root.children = [child];
    child.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(child.layout.x).toBe(20);
    expect(child.layout.y).toBe(10);
  });
});

describe("computeLayout — intrinsic text size", () => {
  it("text node gets its main-axis size from MeasureFunc", () => {
    const t = text({});
    const root = createNode("_root");
    root.style = { width: 200, height: 100, flexDirection: "row", alignItems: "flex-start" };
    root.children = [t];
    t.parent = root;
    computeLayout(root, 200, 100, fixedMeasure(60, 11));
    expect(t.layout.width).toBe(60);
    expect(t.layout.height).toBe(11);
  });
});

describe("computeLayout — min/max constraints", () => {
  it("minWidth is respected", () => {
    const child = box({ minWidth: 50 });
    const root = createNode("_root");
    root.style = { width: 100, height: 100, flexDirection: "row" };
    root.children = [child];
    child.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(child.layout.width).toBeGreaterThanOrEqual(50);
  });

  it("maxWidth is respected", () => {
    const child = box({ flexGrow: 1, maxWidth: 30 });
    const root = createNode("_root");
    root.style = { width: 100, height: 100, flexDirection: "row" };
    root.children = [child];
    child.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(child.layout.width).toBeLessThanOrEqual(30);
  });

  it("flexShrink reduces a child when the row overflows", () => {
    const a = box({ width: 80, flexShrink: 1, minWidth: 20 });
    const b = box({ width: 80 });
    const root = createNode("_root");
    root.style = { width: 100, height: 20, flexDirection: "row" };
    root.children = [a, b];
    a.parent = root;
    b.parent = root;
    computeLayout(root, 100, 20, noMeasure);
    expect(a.layout.width).toBeLessThan(80);
    expect(a.layout.width).toBeGreaterThanOrEqual(20);
    expect(b.layout.width).toBe(80);
  });

  it("numeric flexBasis overrides measured main size before grow", () => {
    const child = box({ width: 10, flexBasis: 40, flexGrow: 0 });
    const root = createNode("_root");
    root.style = { width: 100, height: 20, flexDirection: "row" };
    root.children = [child];
    child.parent = root;
    computeLayout(root, 100, 20, noMeasure);
    expect(child.layout.width).toBe(40);
  });
});

describe("computeLayout — pixel grid", () => {
  it("centering an odd remainder snaps to whole pixels (biased top-left)", () => {
    // 24x19 container, 9x11 child → 15 and 8 spare pixels; naive centering
    // would give x = 7.5. A pixel renderer must never see half-pixels.
    const child = box({ width: 9, height: 11 });
    const outer = box(
      { width: 24, height: 19, justifyContent: "center", alignItems: "center" },
      [child]
    );
    const root = createNode("_root");
    root.children = [outer];
    outer.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    expect(child.layout.x).toBe(7);
    expect(child.layout.y).toBe(4);
  });

  it("percentage sizes and positions resolve to integers", () => {
    const child = box({ width: "50%", height: "50%" });
    const outer = box({ width: 33, height: 21, alignItems: "center", justifyContent: "center" }, [child]);
    const root = createNode("_root");
    root.children = [outer];
    outer.parent = root;
    computeLayout(root, 100, 100, noMeasure);
    for (const v of [child.layout.x, child.layout.y, child.layout.width, child.layout.height]) {
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});
