import { describe, expect, it } from "vitest";
import { newBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Radio, RadioGroup } from "../src/widgets/Radio";

describe("Radio", () => {
  it("selects on click and does not toggle off", () => {
    let checked = false;
    const ui = createUI({ screen: newBitMap(200, 40) });
    ui.render(() => (
      <Radio
        name="opt"
        checked={checked}
        label="Apple"
        onChange={(next) => {
          checked = next;
        }}
      />
    ));
    ui.frame();
    const node = ui.inspect().find((n) => n.name === "opt")!;
    ui.dispatchPointer("mousedown", node.bounds.x + 4, node.bounds.y + 4);
    ui.dispatchPointer("mouseup", node.bounds.x + 4, node.bounds.y + 4);
    expect(checked).toBe(true);
    ui.dispatchPointer("mousedown", node.bounds.x + 4, node.bounds.y + 4);
    ui.dispatchPointer("mouseup", node.bounds.x + 4, node.bounds.y + 4);
    expect(checked).toBe(true);
  });
});

describe("RadioGroup", () => {
  it("keeps one value selected", () => {
    let value = "a";
    const ui = createUI({ screen: newBitMap(200, 80) });
    ui.render(() => (
      <RadioGroup
        name="fruit"
        value={value}
        onChange={(next) => {
          value = next;
        }}
        options={[
          { value: "a", label: "Apple" },
          { value: "b", label: "Pear" },
        ]}
      />
    ));
    ui.frame();
    const pear = ui.inspect().find((n) => n.name === "fruit:b")!;
    ui.dispatchPointer("mousedown", pear.bounds.x + 4, pear.bounds.y + 4);
    ui.dispatchPointer("mouseup", pear.bounds.x + 4, pear.bounds.y + 4);
    expect(value).toBe("b");
  });
});
