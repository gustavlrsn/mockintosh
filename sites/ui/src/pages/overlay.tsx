import {
  Button,
  Menu,
  Popover,
  Select,
  Tooltip,
  createSignal,
} from "@mockintosh/ui";
import type { JSX } from "@mockintosh/ui";
import { PageTitle, Preview } from "../layout";

const FRUIT = [
  { value: "apple", label: "Apple" },
  { value: "pear", label: "Pear" },
  { value: "plum", label: "Plum" },
];

export function SelectPage(): JSX.Element {
  const [fruit, setFruit] = createSignal("apple");
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Select"
        lede="System 7 pop-up menu. Exclusive. The list is an in-window overlay, not a host portal."
      />
      <Preview
        code={`<Select
  value={fruit()}
  onChange={setFruit}
  options={[
    { value: "apple", label: "Apple" },
    { value: "pear", label: "Pear" },
  ]}
/>`}
      >
        <box flexDirection="row" gap={12} alignItems="center">
          <Select name="fruit" value={fruit()} onChange={setFruit} options={FRUIT} />
          <text font="body">{fruit()}</text>
        </box>
      </Preview>
    </box>
  );
}

export function TooltipPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Tooltip"
        lede="Balloon-help caption. Hover the trigger. Not modal, so it does not steal clicks."
      />
      <Preview
        code={`<Tooltip label="Save the file">
  <Button label="Save" onClick={() => {}} />
</Tooltip>`}
      >
        <box paddingTop={20}>
          <Tooltip label="Save the file">
            <Button label="Save" onClick={() => {}} />
          </Tooltip>
        </box>
      </Preview>
    </box>
  );
}

export function PopoverPage(): JSX.Element {
  const [open, setOpen] = createSignal(false);
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Popover"
        lede="Anchored panel. Parent owns open. Click outside or press Escape to dismiss."
      />
      <Preview
        code={`<Popover
  open={open()}
  onDismiss={() => setOpen(false)}
  trigger={<Button label="More" onClick={() => setOpen(true)} />}
>
  Extra notes live here.
</Popover>`}
      >
        <Popover
          open={open()}
          onDismiss={() => setOpen(false)}
          trigger={<Button label="More" onClick={() => setOpen(true)} />}
        >
          <text font="body">Extra notes live here.</text>
        </Popover>
      </Preview>
    </box>
  );
}

export function MenuPage(): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const [last, setLast] = createSignal("none");
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Menu"
        lede="In-window menu. Not the OS menubar. Items can be checked or disabled."
      />
      <Preview
        code={`<Menu
  open={open()}
  onDismiss={() => setOpen(false)}
  trigger={<Button label="Edit" onClick={() => setOpen(true)} />}
  items={[
    { label: "Cut", onClick: () => {} },
    { label: "Copy", checked: true },
    { label: "Paste", disabled: true },
  ]}
/>`}
      >
        <box flexDirection="row" gap={12} alignItems="center">
          <Menu
            open={open()}
            onDismiss={() => setOpen(false)}
            trigger={<Button label="Edit" onClick={() => setOpen(true)} />}
            items={[
              { label: "Cut", onClick: () => setLast("Cut") },
              { label: "Copy", checked: true, onClick: () => setLast("Copy") },
              { label: "Paste", disabled: true },
            ]}
          />
          <text font="body">{last()}</text>
        </box>
      </Preview>
    </box>
  );
}
