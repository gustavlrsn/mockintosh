import { describe, expect, it } from "vitest";
import { newBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Tabs } from "../src/widgets/Tabs";

describe("Tabs", () => {
  it("changes value when a tab is clicked", () => {
    let value = "one";
    const ui = createUI({ screen: newBitMap(240, 60) });
    ui.render(() => (
      <Tabs
        name="pane"
        value={value}
        onChange={(next) => {
          value = next;
        }}
        items={[
          { value: "one", label: "One" },
          { value: "two", label: "Two" },
        ]}
      />
    ));
    ui.frame();
    const two = ui.inspect().find((n) => n.name === "pane:two")!;
    ui.dispatchPointer("mousedown", two.bounds.x + 6, two.bounds.y + 4);
    ui.dispatchPointer("mouseup", two.bounds.x + 6, two.bounds.y + 4);
    expect(value).toBe("two");
  });
});
