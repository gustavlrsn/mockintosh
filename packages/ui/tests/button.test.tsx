import { describe, expect, it } from "vitest";
import { newBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Button } from "../src/widgets/Button";

describe("Button", () => {
  it("defaults to a 16px face plus the 1px shadow slot", () => {
    const ui = createUI({ screen: newBitMap(200, 80) });
    ui.render(() => <Button name="ok" label="OK" onClick={() => {}} />);
    ui.frame();
    expect(ui.inspect().find((n) => n.name === "ok")!.bounds.height).toBe(17);
  });

  it("ring sits outside the face and adds the CDEF inset", () => {
    const ui = createUI({ screen: newBitMap(200, 80) });
    ui.render(() => (
      <Button name="ok" label="OK" height={20} ring onClick={() => {}} />
    ));
    ui.frame();
    expect(ui.inspect().find((n) => n.name === "ok")!.bounds.height).toBe(29);
  });

  it("shadow reserves a 1px slot and press does not change the box size", () => {
    const ui = createUI({ screen: newBitMap(200, 80) });
    ui.render(() => <Button name="ok" label="OK" shadow onClick={() => {}} />);
    ui.frame();
    const rest = ui.inspect().find((n) => n.name === "ok")!.bounds;
    expect(rest.height).toBe(17);
    ui.dispatchPointer("mousedown", rest.x + 4, rest.y + 4);
    ui.frame();
    expect(ui.inspect().find((n) => n.name === "ok")!.bounds.height).toBe(17);
  });

  it("fires on every click, including the second down of a double-click", () => {
    let n = 0;
    const ui = createUI({ screen: newBitMap(200, 80) });
    ui.render(() => <Button name="ok" label="OK" onClick={() => { n += 1; }} />);
    ui.frame();
    const { x, y } = ui.inspect().find((node) => node.name === "ok")!.bounds;
    const cx = x + 4;
    const cy = y + 4;
    ui.dispatchPointer("mousedown", cx, cy);
    ui.dispatchPointer("mouseup", cx, cy);
    ui.dispatchPointer("mousedown", cx, cy);
    ui.dispatchPointer("dblclick", cx, cy);
    ui.dispatchPointer("mouseup", cx, cy);
    expect(n).toBe(2);
  });
});
