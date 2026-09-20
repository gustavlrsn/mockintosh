import { describe, expect, it } from "vitest";
import { newBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Progress } from "../src/widgets/Progress";

describe("Progress", () => {
  it("exposes the value and sizes to the well", () => {
    const ui = createUI({ screen: newBitMap(200, 40) });
    ui.render(() => <Progress name="load" value={0.5} width={80} height={12} />);
    ui.frame();
    const node = ui.inspect().find((n) => n.name === "load")!;
    expect(node.role).toBe("progressbar");
    expect(node.value).toBe("0.5");
    expect(node.bounds.width).toBe(80);
    expect(node.bounds.height).toBe(12);
  });

  it("clamps a full bar to the well width", () => {
    const ui = createUI({ screen: newBitMap(200, 40) });
    ui.render(() => <Progress name="load" value={4} max={2} width={80} />);
    ui.frame();
    const node = ui.inspect().find((n) => n.name === "load")!;
    expect(node.bounds.width).toBe(80);
  });
});
