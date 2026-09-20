import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { newBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Switch } from "../src/widgets/Switch";

function click(ui: ReturnType<typeof createUI>, name: string): void {
  const node = ui.inspect().find((n) => n.name === name)!;
  ui.dispatchPointer("mousedown", node.bounds.x + 4, node.bounds.y + 4);
  ui.dispatchPointer("mouseup", node.bounds.x + 4, node.bounds.y + 4);
}

describe("Switch", () => {
  it("flips on click", () => {
    const [on, setOn] = createSignal(false);
    const ui = createUI({ screen: newBitMap(200, 40) });
    ui.render(() => <Switch name="wifi" label="Wi-Fi" checked={on()} onChange={setOn} />);
    ui.frame();
    click(ui, "wifi");
    expect(on()).toBe(true);
    expect(ui.inspect().find((n) => n.name === "wifi")!.value).toBe("true");
  });

  it("is 16px tall", () => {
    const ui = createUI({ screen: newBitMap(200, 40) });
    ui.render(() => <Switch name="wifi" checked={false} onChange={() => {}} />);
    ui.frame();
    const node = ui.inspect().find((n) => n.name === "wifi")!;
    expect(node.bounds.height).toBe(16);
    expect(node.bounds.width).toBeGreaterThanOrEqual(28);
  });
});
