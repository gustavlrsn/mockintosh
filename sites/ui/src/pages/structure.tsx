import {
  Accordion,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  COMMAND_KEY,
  Disclosure,
  Empty,
  InputGroup,
  Item,
  Kbd,
  Note,
  Pagination,
  Spinner,
  Switch,
  Table,
  TextInput,
  Toggle,
  ToggleGroup,
  createSignal,
} from "@mockintosh/ui";
import type { JSX } from "@mockintosh/ui";
import { PageTitle, Preview } from "../layout";

export function AccordionPage(): JSX.Element {
  const [open, setOpen] = createSignal<string | null>("ship");
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Accordion"
        lede="Stacked disclosures. One section open at a time. Compose Disclosure yourself for multiple."
      />
      <Preview
        code={`<Accordion
  value={open()}
  onChange={setOpen}
  items={[
    { value: "ship", title: "Shipping", content: <text font="body">5-7 days</text> },
    { value: "pay", title: "Payment", content: <text font="body">cash or cheque</text> },
  ]}
/>`}
      >
        <Accordion
          value={open()}
          onChange={setOpen}
          items={[
            { value: "ship", title: "Shipping", content: <text font="body">5-7 days</text> },
            { value: "pay", title: "Payment", content: <text font="body">cash or cheque</text> },
          ]}
        />
      </Preview>
    </box>
  );
}

export function AvatarPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Avatar" lede="32x32 well. Initials sit on a dithered 50% to 90% ramp (top-left to bottom-right) in outlined Geneva 12. A photograph goes through Dithered. Radius follows the theme." />
      <Preview code={`<Avatar initials="CN" />`}>
        <Avatar initials="CN" />
      </Preview>
    </box>
  );
}

export function BadgePage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Badge" lede="A 1px frame, or invert for a count." />
      <Preview
        code={`<Badge>beta</Badge>
<Badge invert>3</Badge>`}
      >
        <box flexDirection="row" gap={8} alignItems="center">
          <Badge>beta</Badge>
          <Badge invert>3</Badge>
        </box>
      </Preview>
    </box>
  );
}

export function BreadcrumbPage(): JSX.Element {
  const [here, setHere] = createSignal("Fonts");
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Breadcrumb" lede="Path with : separators. The last crumb is now." />
      <Preview
        code={`<Breadcrumb
  items={[
    { label: "Home", onClick: () => setHere("Home") },
    { label: "Docs", onClick: () => setHere("Docs") },
    { label: here() },
  ]}
/>`}
      >
        <Breadcrumb
          items={[
            { label: "Home", onClick: () => setHere("Home") },
            { label: "Docs", onClick: () => setHere("Docs") },
            { label: here() },
          ]}
        />
      </Preview>
    </box>
  );
}

export function ButtonGroupPage(): JSX.Element {
  const [n, setN] = createSignal(0);
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Button Group" lede="A row of actions. Buttons keep their own faces." />
      <Preview
        code={`<ButtonGroup>
  <Button label="OK" onClick={() => setN((c) => c + 1)} />
  <Button label="Cancel" onClick={() => setN(0)} />
</ButtonGroup>`}
      >
        <ButtonGroup>
          <Button label="OK" onClick={() => setN((c) => c + 1)} />
          <Button label="Cancel" onClick={() => setN(0)} />
        </ButtonGroup>
        <text font="body">{`clicks: ${n()}`}</text>
      </Preview>
    </box>
  );
}

export function CardPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Card" lede="A bordered group with a 1px drop shadow. Optional title sits above a 1px rule." />
      <Preview
        code={`<Card title="Disk">
  <text font="body">Macintosh HD</text>
</Card>`}
      >
        <Card title="Disk">
          <text font="body">Macintosh HD</text>
        </Card>
      </Preview>
    </box>
  );
}

export function DisclosurePage(): JSX.Element {
  const [open, setOpen] = createSignal(false);
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Disclosure" lede="Triangle plus title. Classic Mac disclosure." />
      <Preview
        code={`<Disclosure
  title="Advanced"
  open={open()}
  onChange={setOpen}
>
  <text font="body">hidden until you open it</text>
</Disclosure>`}
      >
        <Disclosure title="Advanced" open={open()} onChange={setOpen}>
          <text font="body">hidden until you open it</text>
        </Disclosure>
      </Preview>
    </box>
  );
}

export function EmptyPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Empty" lede="Centered caption, optional help, one action." />
      <Preview
        code={`<Empty title="Nothing here" description="Drop a file on this window.">
  <Button label="New" onClick={() => {}} />
</Empty>`}
      >
        <Empty title="Nothing here" description="Drop a file on this window.">
          <Button label="New" onClick={() => {}} />
        </Empty>
      </Preview>
    </box>
  );
}

export function InputGroupPage(): JSX.Element {
  const [amt, setAmt] = createSignal("12");
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Input Group" lede="Addon before or after a borderless TextInput." />
      <Preview
        code={`<InputGroup before="$" after=".00">
  <TextInput
    borderless
    width={80}
    value={amt()}
    onChange={setAmt}
  />
</InputGroup>`}
      >
        <InputGroup before="$" after=".00">
          <TextInput borderless width={80} value={amt()} onChange={setAmt} />
        </InputGroup>
      </Preview>
    </box>
  );
}

export function ItemPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Item" lede="Media, title, description, actions. Finder-row grammar without chrome." />
      <Preview
        code={`<Item
  media={<Avatar initials="IN" size={24} />}
  title="Inbox"
  description="3 unread"
>
  <Badge invert>3</Badge>
</Item>`}
      >
        <Item
          media={<Avatar initials="IN" size={24} />}
          title="Inbox"
          description="3 unread"
        >
          <Badge invert>3</Badge>
        </Item>
      </Preview>
    </box>
  );
}

export function KbdPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Kbd" lede="Shortcut caption. Command, option, and shift live in the faces." />
      <Preview code={`<Kbd>${COMMAND_KEY}S</Kbd>`}>
        <Kbd>{`${COMMAND_KEY}S`}</Kbd>
      </Preview>
    </box>
  );
}

export function NotePage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Note"
        lede="Inline stop, note, or caution. Not a window. Use OS showDialog for that."
      />
      <Preview
        code={`<Note>The kit stays 1-bit.</Note>
<Note variant="caution">Save a copy first.</Note>
<Note variant="stop">The disk is locked.</Note>`}
      >
        <box flexDirection="column" gap={8}>
          <Note>The kit stays 1-bit.</Note>
          <Note variant="caution">Save a copy first.</Note>
          <Note variant="stop">The disk is locked.</Note>
        </box>
      </Preview>
    </box>
  );
}

export function PaginationPage(): JSX.Element {
  const [page, setPage] = createSignal(1);
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Pagination" lede="Prev, a window of pages, next." />
      <Preview
        code={`<Pagination
  page={page()}
  pageCount={8}
  onChange={setPage}
/>`}
      >
        <Pagination page={page()} pageCount={8} onChange={setPage} />
      </Preview>
    </box>
  );
}

export function SpinnerPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Spinner" lede="Inline watch. Distinct from the cursor." />
      <Preview code={`<Spinner />`}>
        <box flexDirection="row" gap={8} alignItems="center">
          <Spinner />
          <text font="body">working…</text>
        </box>
      </Preview>
    </box>
  );
}

export function SwitchPage(): JSX.Element {
  const [wifi, setWifi] = createSignal(true);
  const [air, setAir] = createSignal(false);
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Switch" lede="A pill track and a circular thumb. The thumb slides; the track fills when on." />
      <Preview
        code={`<Switch
  checked={wifi()}
  onChange={setWifi}
  label="Wi-Fi"
/>
<Switch
  checked={air()}
  onChange={setAir}
  label="Airplane"
/>`}
      >
        <box flexDirection="column" gap={8}>
          <Switch checked={wifi()} onChange={setWifi} label="Wi-Fi" />
          <Switch checked={air()} onChange={setAir} label="Airplane" />
        </box>
      </Preview>
    </box>
  );
}

export function TablePage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Table" lede="Header plus rows. No sort or selection yet." />
      <Preview
        code={`<Table
  headers={["Name", "Kind"]}
  rows={[
    ["Read Me", "text"],
    ["System", "folder"],
  ]}
/>`}
      >
        <Table
          headers={["Name", "Kind"]}
          rows={[
            ["Read Me", "text"],
            ["System", "folder"],
          ]}
        />
      </Preview>
    </box>
  );
}

export function TogglePage(): JSX.Element {
  const [bold, setBold] = createSignal(false);
  const [tool, setTool] = createSignal("pencil");
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Toggle"
        lede="Latching tool button. ToggleGroup is an exclusive well: the MacPaint palette."
      />
      <Preview
        code={`<Toggle
  label="Bold"
  pressed={bold()}
  onChange={setBold}
/>`}
      >
        <Toggle label="Bold" pressed={bold()} onChange={setBold} />
      </Preview>
      <Preview
        code={`<ToggleGroup
  value={tool()}
  onChange={setTool}
  items={[
    { value: "pencil", label: "Pencil" },
    { value: "lasso", label: "Lasso" },
    { value: "fill", label: "Fill" },
  ]}
/>`}
      >
        <ToggleGroup
          value={tool()}
          onChange={setTool}
          items={[
            { value: "pencil", label: "Pencil" },
            { value: "lasso", label: "Lasso" },
            { value: "fill", label: "Fill" },
          ]}
        />
      </Preview>
    </box>
  );
}
