import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { getBit, newBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Button } from "../src/widgets/Button";
import { Dialog } from "../src/widgets/Dialog";
import { Menu } from "../src/widgets/Menu";
import { Popover } from "../src/widgets/Popover";
import { Select } from "../src/widgets/Select";
import { Tooltip } from "../src/widgets/Tooltip";

const OPTIONS = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Pear" },
] as const;

function click(ui: ReturnType<typeof createUI>, name: string): void {
  const node = ui.inspect().find((n) => n.name === name)!;
  ui.dispatchPointer("mousedown", node.bounds.x + 4, node.bounds.y + 4);
  ui.dispatchPointer("mouseup", node.bounds.x + 4, node.bounds.y + 4);
  ui.frame();
}

describe("Select", () => {
  it("opens a list and picks an option without toggling off", () => {
    const [value, setValue] = createSignal("a");
    const ui = createUI({ screen: newBitMap(240, 160) });
    ui.render(() => (
      <Select name="fruit" value={value()} onChange={setValue} options={OPTIONS} />
    ));
    ui.frame();
    click(ui, "fruit");
    expect(ui.inspect().some((n) => n.name === "fruit:b")).toBe(true);
    click(ui, "fruit:b");
    expect(value()).toBe("b");
    expect(ui.inspect().some((n) => n.name === "overlay-panel")).toBe(false);
    expect(ui.inspect().find((n) => n.name === "fruit")!.text.includes("Pear")).toBe(true);
  });

  it("dismisses on the catcher and on Escape", () => {
    const ui = createUI({ screen: newBitMap(240, 160) });
    ui.render(() => (
      <Select name="fruit" value="a" onChange={() => {}} options={OPTIONS} />
    ));
    ui.frame();
    click(ui, "fruit");
    const catcher = ui.inspect().find((n) => n.name === "overlay-catcher")!;
    ui.dispatchPointer("mousedown", catcher.bounds.x + 2, catcher.bounds.y + 2);
    ui.dispatchPointer("mouseup", catcher.bounds.x + 2, catcher.bounds.y + 2);
    ui.frame();
    expect(ui.inspect().some((n) => n.name === "overlay-panel")).toBe(false);

    click(ui, "fruit");
    ui.dispatchKeyboard("keydown", "Escape");
    ui.frame();
    expect(ui.inspect().some((n) => n.name === "overlay-panel")).toBe(false);
  });

  it("paints the list outside an overflow:scroll ancestor", () => {
    const ui = createUI({ screen: newBitMap(240, 160) });
    ui.render(() => (
      <box overflow="scroll" height={20} width={200}>
        <box height={80} padding={2}>
          <Select name="fruit" value="a" onChange={() => {}} options={OPTIONS} />
        </box>
      </box>
    ));
    ui.frame();
    click(ui, "fruit");
    const panel = ui.inspect().find((n) => n.name === "overlay-panel")!;
    expect(panel.bounds.height).toBeGreaterThan(20);
  });
});

describe("Tooltip", () => {
  it("shows a caption while the pointer is over the trigger", () => {
    const ui = createUI({ screen: newBitMap(240, 80) });
    ui.render(() => (
      <box padding={20}>
        <Tooltip label="Save the file">
          <box
            semantic={{ name: "save" }}
            width={40}
            height={16}
            onClick={() => {}}
          >
            <text font="body">Save</text>
          </box>
        </Tooltip>
      </box>
    ));
    ui.frame();
    const save = ui.inspect().find((n) => n.name === "save")!;
    ui.dispatchPointer("mousemove", save.bounds.x + 4, save.bounds.y + 4);
    ui.frame();
    expect(ui.inspect().some((n) => n.name === "tooltip")).toBe(true);
    ui.dispatchPointer("mousemove", 2, 2);
    ui.frame();
    expect(ui.inspect().some((n) => n.name === "tooltip")).toBe(false);
  });
});

describe("Popover", () => {
  it("opens from the trigger and dismisses outside", () => {
    const [open, setOpen] = createSignal(false);
    const ui = createUI({ screen: newBitMap(240, 160) });
    ui.render(() => (
      <Popover
        open={open()}
        onDismiss={() => setOpen(false)}
        trigger={<Button name="more" label="More" onClick={() => setOpen(true)} />}
      >
        <text font="body">notes</text>
      </Popover>
    ));
    ui.frame();
    click(ui, "more");
    expect(ui.inspect().some((n) => n.name === "popover")).toBe(true);
    const catcher = ui.inspect().find((n) => n.name === "overlay-catcher")!;
    ui.dispatchPointer("mousedown", catcher.bounds.x + 2, catcher.bounds.y + 2);
    ui.frame();
    expect(ui.inspect().some((n) => n.name === "popover")).toBe(false);
  });
});

describe("Dialog", () => {
  it("opens centered and dismisses on Escape", () => {
    const [open, setOpen] = createSignal(false);
    const ui = createUI({ screen: newBitMap(240, 160) });
    ui.render(() => (
      <box flexDirection="column">
        <box width={8} height={8} background={1} />
        <Dialog
          open={open()}
          onDismiss={() => setOpen(false)}
          title="Edit profile"
          trigger={<Button name="edit" label="Edit" onClick={() => setOpen(true)} />}
        >
          <text font="body">Name is local.</text>
        </Dialog>
      </box>
    ));
    ui.frame();
    click(ui, "edit");
    const panel = ui.inspect().find((n) => n.name === "dialog")!;
    expect(panel.role).toBe("dialog");
    expect(panel.text.includes("Edit profile")).toBe(true);
    expect(panel.bounds.x).toBeGreaterThan(0);
    expect(panel.bounds.y).toBeGreaterThan(0);
    expect(getBit(ui.port.portBits, 0, 0)).toBe(0);
    expect(getBit(ui.port.portBits, 1, 0)).toBe(1);

    ui.dispatchKeyboard("keydown", "Escape");
    ui.frame();
    expect(ui.inspect().some((n) => n.name === "dialog")).toBe(false);
  });

  it("dismisses when clicking the dimmed chrome", () => {
    const [open, setOpen] = createSignal(false);
    const ui = createUI({ screen: newBitMap(240, 160) });
    ui.render(() => (
      <Dialog
        open={open()}
        onDismiss={() => setOpen(false)}
        title="Edit profile"
        trigger={<Button name="edit" label="Edit" onClick={() => setOpen(true)} />}
      >
        <text font="body">Name is local.</text>
      </Dialog>
    ));
    ui.frame();
    click(ui, "edit");
    ui.dispatchPointer("mousedown", 2, 2);
    ui.dispatchPointer("mouseup", 2, 2);
    ui.frame();
    expect(ui.inspect().some((n) => n.name === "dialog")).toBe(false);
  });

  it("keeps the panel open when clicking inside it", () => {
    const [open, setOpen] = createSignal(false);
    const ui = createUI({ screen: newBitMap(240, 160) });
    ui.render(() => (
      <Dialog
        open={open()}
        onDismiss={() => setOpen(false)}
        title="Edit profile"
        trigger={<Button name="edit" label="Edit" onClick={() => setOpen(true)} />}
      >
        <text font="body">Name is local.</text>
      </Dialog>
    ));
    ui.frame();
    click(ui, "edit");
    const panel = ui.inspect().find((n) => n.name === "dialog")!;
    ui.dispatchPointer("mousedown", panel.bounds.x + 8, panel.bounds.y + 8);
    ui.frame();
    expect(ui.inspect().some((n) => n.name === "dialog")).toBe(true);
  });
});

describe("Menu", () => {
  it("runs an item then closes", () => {
    const [open, setOpen] = createSignal(false);
    let cut = false;
    const ui = createUI({ screen: newBitMap(240, 160) });
    ui.render(() => (
      <Menu
        name="edit"
        open={open()}
        onDismiss={() => setOpen(false)}
        trigger={<Button name="edit-btn" label="Edit" onClick={() => setOpen(true)} />}
        items={[
          {
            id: "cut",
            label: "Cut",
            onClick: () => {
              cut = true;
            },
          },
          { id: "copy", label: "Copy" },
        ]}
      />
    ));
    ui.frame();
    click(ui, "edit-btn");
    click(ui, "edit:cut");
    expect(cut).toBe(true);
    expect(ui.inspect().some((n) => n.name === "overlay-panel")).toBe(false);
  });
});
