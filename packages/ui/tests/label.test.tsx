import { describe, expect, it } from "vitest";
import { newBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Label } from "../src/widgets/Label";

describe("Label", () => {
  it("paints the caption", () => {
    const ui = createUI({ screen: newBitMap(200, 40) });
    ui.render(() => <Label>Volume</Label>);
    ui.frame();
    expect(ui.inspect().some((n) => n.text === "Volume")).toBe(true);
  });
});
