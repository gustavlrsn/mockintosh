import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";
import { newBitMap } from "@mockintosh/quickdraw/bits";
import { createUI } from "../src/ui";
import { Accordion } from "../src/widgets/Disclosure";
import { Badge } from "../src/widgets/Badge";
import { Breadcrumb } from "../src/widgets/Breadcrumb";
import { Card } from "../src/widgets/Card";
import { Empty } from "../src/widgets/Empty";
import { InputGroup } from "../src/widgets/InputGroup";
import { Item } from "../src/widgets/Item";
import { Kbd } from "../src/widgets/Kbd";
import { Note } from "../src/widgets/Note";
import { Pagination } from "../src/widgets/Pagination";
import { Switch } from "../src/widgets/Switch";
import { Table } from "../src/widgets/Table";
import { TextInput } from "../src/widgets/TextInput";
import { Toggle, ToggleGroup } from "../src/widgets/Toggle";

function click(ui: ReturnType<typeof createUI>, name: string): void {
  const node = ui.inspect().find((n) => n.name === name)!;
  ui.dispatchPointer("mousedown", node.bounds.x + 4, node.bounds.y + 4);
  ui.dispatchPointer("mouseup", node.bounds.x + 4, node.bounds.y + 4);
}

describe("Wave 2 widgets", () => {
  it("toggles and keeps a group exclusive", () => {
    const [on, setOn] = createSignal(false);
    const [tool, setTool] = createSignal("pencil");
    const ui = createUI({ screen: newBitMap(280, 80) });
    ui.render(() => (
      <box>
        <Toggle name="bold" label="Bold" pressed={on()} onChange={setOn} />
        <ToggleGroup
          name="tool"
          value={tool()}
          onChange={setTool}
          items={[
            { value: "pencil", label: "Pencil" },
            { value: "lasso", label: "Lasso" },
          ]}
        />
      </box>
    ));
    ui.frame();
    click(ui, "bold");
    expect(on()).toBe(true);
    click(ui, "tool:lasso");
    expect(tool()).toBe("lasso");
    click(ui, "tool:lasso");
    expect(tool()).toBe("lasso");
  });

  it("flips a switch and pages forward", () => {
    const [wifi, setWifi] = createSignal(false);
    const [page, setPage] = createSignal(1);
    const ui = createUI({ screen: newBitMap(320, 80) });
    ui.render(() => (
      <box>
        <Switch name="wifi" label="Wi-Fi" checked={wifi()} onChange={setWifi} />
        <Pagination name="p" page={page()} pageCount={4} onChange={setPage} />
      </box>
    ));
    ui.frame();
    click(ui, "wifi");
    expect(wifi()).toBe(true);
    click(ui, "p:next");
    expect(page()).toBe(2);
  });

  it("opens one accordion section and follows a breadcrumb", () => {
    const [open, setOpen] = createSignal<string | null>("ship");
    let crumb = "Docs";
    const ui = createUI({ screen: newBitMap(320, 120) });
    ui.render(() => (
      <box flexDirection="column" gap={8}>
        <Accordion
          name="faq"
          value={open()}
          onChange={setOpen}
          items={[
            { value: "ship", title: "Shipping", content: <text>5-7 days</text> },
            { value: "pay", title: "Payment", content: <text>cash</text> },
          ]}
        />
        <Breadcrumb
          items={[
            { label: "Home", onClick: () => { crumb = "Home"; } },
            { label: "Docs" },
          ]}
        />
      </box>
    ));
    ui.frame();
    expect(ui.inspect().some((n) => n.text.includes("5-7 days"))).toBe(true);
    click(ui, "faq:pay");
    ui.frame();
    expect(open()).toBe("pay");
    const home = ui.inspect().find((n) => n.value === "Home" && n.role === "button")!;
    ui.dispatchPointer("mousedown", home.bounds.x + 2, home.bounds.y + 2);
    ui.dispatchPointer("mouseup", home.bounds.x + 2, home.bounds.y + 2);
    expect(crumb).toBe("Home");
  });

  it("paints card, table, item, note, badge, empty, kbd, and input group", () => {
    const ui = createUI({ screen: newBitMap(360, 240) });
    ui.render(() => (
      <box flexDirection="column" gap={6} width={340}>
        <Card title="Disk">
          <Table headers={["Name", "Kind"]} rows={[["Read Me", "text"]]} />
        </Card>
        <Item title="Inbox" description="3 unread" />
        <Note variant="caution">Save a copy first.</Note>
        <Badge invert>3</Badge>
        <Empty title="Nothing here" />
        <Kbd>⌘S</Kbd>
        <InputGroup before="$">
          <TextInput name="amt" borderless width={80} value="12" onChange={() => {}} />
        </InputGroup>
      </box>
    ));
    ui.frame();
    const texts = ui.inspect().map((n) => n.text).join(" ");
    expect(texts).toContain("Disk");
    expect(texts).toContain("Read Me");
    expect(texts).toContain("Inbox");
    expect(texts).toContain("Save a copy first.");
    expect(texts).toContain("Nothing here");
    expect(ui.inspect().some((n) => n.value === "3")).toBe(true);
    expect(ui.inspect().some((n) => n.name === "amt")).toBe(true);
  });
});
