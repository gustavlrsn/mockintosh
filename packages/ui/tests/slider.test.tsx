import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { newBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Slider } from "../src/widgets/Slider";

describe("Slider", () => {
  it("snaps a click on the track", () => {
    const [value, setValue] = createSignal(0);
    const ui = createUI({ screen: newBitMap(240, 40) });
    ui.render(() => (
      <Slider
        name="vol"
        value={value()}
        min={0}
        max={10}
        step={1}
        width={112}
        onChange={setValue}
      />
    ));
    ui.frame();
    const node = ui.inspect().find((n) => n.name === "vol")!;
    ui.dispatchPointer("mousedown", node.bounds.x + node.bounds.width - 2, node.bounds.y + 8);
    expect(value()).toBe(10);
  });

  it("steps with arrow keys after focus", () => {
    const [value, setValue] = createSignal(4);
    const ui = createUI({ screen: newBitMap(240, 40) });
    ui.render(() => (
      <Slider
        name="vol"
        value={value()}
        min={0}
        max={10}
        step={1}
        width={112}
        onChange={setValue}
      />
    ));
    ui.frame();
    const node = ui.inspect().find((n) => n.name === "vol")!;
    const thumb = node.bounds.x + Math.round((4 / 10) * (112 - 12)) + 6;
    ui.dispatchPointer("mousedown", thumb, node.bounds.y + 8);
    ui.dispatchKeyboard("keydown", "ArrowRight");
    expect(value()).toBe(5);
    ui.dispatchKeyboard("keydown", "ArrowLeft");
    expect(value()).toBe(4);
  });
});
