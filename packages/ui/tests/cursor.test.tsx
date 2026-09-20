import { describe, expect, it } from "vitest";
import { newBitMap } from "@mockintosh/quickdraw/bits";
import { cssCursor, cursorOf, DEFAULT_CURSOR } from "../src/cursor";
import { createNode } from "../src/nodes";
import { createUI } from "../src/ui";
import { Button } from "../src/widgets/Button";
import { TextInput } from "../src/widgets/TextInput";

describe("cssCursor", () => {
  it("maps semantic names to CSS keywords", () => {
    expect(cssCursor("pointer")).toBe("pointer");
    expect(cssCursor("arrow")).toBe("default");
    expect(cssCursor("iBeam")).toBe("text");
    expect(cssCursor("watch")).toBe("wait");
    expect(cssCursor("grabbing")).toBe("grabbing");
  });

  it("lets the host override a name and passes unknown values through", () => {
    expect(cssCursor("pointer", { pointer: "url(hand.png) 1 1, pointer" })).toBe(
      "url(hand.png) 1 1, pointer",
    );
    expect(cssCursor("not-allowed")).toBe("not-allowed");
  });
});

describe("cursorOf", () => {
  it("walks to the nearest ancestor with a cursor", () => {
    const parent = createNode("box");
    parent._eventHandlers.cursor = "pointer";
    const child = createNode("box");
    child.parent = parent;
    expect(cursorOf(child)).toBe("pointer");
    expect(cursorOf(null)).toBe(DEFAULT_CURSOR);
  });
});

describe("UIInstance.cursorAt", () => {
  it("leaves Button on the host default and honors an override", () => {
    const ui = createUI({ screen: newBitMap(200, 80) });
    ui.render(() => (
      <box width={200} height={80}>
        <Button name="ok" label="OK" onClick={() => {}} />
        <Button name="wait" label="Wait" cursor="watch" onClick={() => {}} />
      </box>
    ));
    ui.frame();
    const ok = ui.inspect().find((n) => n.name === "ok")!.bounds;
    const wait = ui.inspect().find((n) => n.name === "wait")!.bounds;
    expect(ui.cursorAt(ok.x + 4, ok.y + 4)).toBe("default");
    expect(ui.cursorAt(wait.x + 4, wait.y + 4)).toBe("watch");
    expect(ui.cursorAt(199, 79)).toBe("default");
  });

  it("uses text on selectable host text and TextInput", () => {
    const ui = createUI({ screen: newBitMap(240, 80) });
    ui.render(() => (
      <box width={240} height={80} flexDirection="column" gap={8}>
        <text wrap selectable semantic={{ name: "lede" }}>
          Hello there
        </text>
        <TextInput name="draft" width={180} value="abc" onChange={() => {}} />
      </box>
    ));
    ui.frame();
    const lede = ui.inspect().find((n) => n.name === "lede")!.bounds;
    const draft = ui.inspect().find((n) => n.name === "draft")!.bounds;
    expect(ui.cursorAt(lede.x + 4, lede.y + 4)).toBe("text");
    expect(ui.cursorAt(draft.x + 8, draft.y + 8)).toBe("text");
  });
});
