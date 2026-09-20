import {
  Button,
  Checkbox,
  Dithered,
  Divider,
  Field,
  Label,
  Progress,
  Radio,
  RadioGroup,
  ScrollView,
  Slider,
  Spacer,
  Tabs,
  TextEditor,
  TextInput,
  createSignal,
} from "@mockintosh/ui";
import type { ImageFrame, JSX } from "@mockintosh/ui";
import { For } from "@mockintosh/ui";
import { COMPONENT_ITEMS } from "../nav";
import { NavLink, PageTitle, Preview } from "../layout";
import {
  AccordionPage,
  AvatarPage,
  BadgePage,
  BreadcrumbPage,
  ButtonGroupPage,
  CardPage,
  DisclosurePage,
  EmptyPage,
  InputGroupPage,
  ItemPage,
  KbdPage,
  NotePage,
  PaginationPage,
  SpinnerPage,
  SwitchPage,
  TablePage,
  TogglePage,
} from "./structure";
import {
  AttachmentPage,
  BubblePage,
  MarkerPage,
  MessagePage,
  MessageScrollerPage,
  QuestionnairePage,
} from "./chat";
import { MenuPage, PopoverPage, SelectPage, TooltipPage } from "./overlay";

function grayRamp(width: number, height: number): ImageFrame {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const g = Math.round((x / Math.max(1, width - 1)) * 255);
      rgba[i] = rgba[i + 1] = rgba[i + 2] = g;
      rgba[i + 3] = 255;
    }
  }
  return { width, height, rgba };
}

export function ComponentsOverviewPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Components"
        lede="Shipped widgets. Each page has a live preview. The same list is in the sidebar."
      />
      <box flexDirection="column" gap={4}>
        <For each={COMPONENT_ITEMS}>
          {(item) => <NavLink href={item.href} label={item.title} active={false} />}
        </For>
      </box>
    </box>
  );
}

export function ButtonPage(): JSX.Element {
  const [clicks, setClicks] = createSignal(0);
  const click = () => setClicks((n) => n + 1);
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Button"
        lede="A square 16px face with a 1px drop shadow. font, borderRadius, shadow, and ring forward to the box underneath — ring is a wrapper outside the face. shadow turns on depress: the face slides into the shadow while pressed."
      />
      <Preview
        code={`<Button
  label="OK"
  onClick={() => setClicks((n) => n + 1)}
/>`}
      >
        <box flexDirection="row" gap={12} alignItems="center">
          <Button label="OK" onClick={click} />
          <text font="body">{`clicks: ${clicks()}`}</text>
        </box>
      </Preview>
      <Preview
        code={`<Button
  label="OK"
  font="menu"
  onClick={() => setClicks((n) => n + 1)}
/>`}
      >
        <Button label="OK" font="menu" onClick={click} />
      </Preview>
      <Preview
        code={`<Button
  label="OK"
  font="menu"
  height={20}
  borderRadius={5}
  onClick={() => setClicks((n) => n + 1)}
/>`}
      >
        <Button label="OK" font="menu" height={20} borderRadius={5} onClick={click} />
      </Preview>
      <Preview
        code={`<Button
  label="OK"
  font="menu"
  height={20}
  borderRadius={5}
  ring
  onClick={() => setClicks((n) => n + 1)}
/>`}
      >
        <Button
          label="OK"
          font="menu"
          height={20}
          borderRadius={5}
          ring
          onClick={click}
        />
      </Preview>
      <Preview
        code={`<Button
  label="OK"
  shadow={false}
  onClick={() => setClicks((n) => n + 1)}
/>`}
      >
        <Button label="OK" shadow={false} onClick={click} />
      </Preview>
    </box>
  );
}

export function CheckboxPage(): JSX.Element {
  const [on, setOn] = createSignal(true);
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Checkbox" lede="A 12px box plus an optional label. Space or click toggles." />
      <Preview
        code={`<Checkbox
  checked={on()}
  onChange={setOn}
  label="one bit is enough"
/>`}
      >
        <Checkbox checked={on()} onChange={setOn} label="one bit is enough" />
      </Preview>
    </box>
  );
}

export function DitheredPage(): JSX.Element {
  const src = grayRamp(160, 64);
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Dithered"
        lede="Photograph or RGBA frame to a 1-bit bitmap. URL src needs the host images service."
      />
      <Preview
        code={`<Dithered
  src={src}
  width={160}
  height={64}
  mode="atkinson"
/>`}
      >
        <Dithered src={src} width={160} height={64} mode="atkinson" />
      </Preview>
    </box>
  );
}

export function DividerPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Divider" lede="A 1px rule. Default ink is black." />
      <Preview
        code={`<text font="body">above</text>
<Divider />
<text font="body">below</text>`}
      >
        <text font="body">above</text>
        <Divider />
        <text font="body">below</text>
      </Preview>
    </box>
  );
}

export function ScrollViewPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="ScrollView" lede="A box with overflow=scroll and a fixed height." />
      <Preview
        code={`<ScrollView height={72}>
  <box flexDirection="column" gap={6} padding={4}>
    <text font="body">row 1 — drag or scroll</text>
    <text font="body">row 2</text>
    …
  </box>
</ScrollView>`}
      >
        <ScrollView height={72}>
          <box flexDirection="column" gap={6} padding={4}>
            <text font="body">row 1 — drag or scroll</text>
            <text font="body">row 2</text>
            <text font="body">row 3</text>
            <text font="body">row 4</text>
            <text font="body">row 5</text>
            <text font="body">row 6</text>
          </box>
        </ScrollView>
      </Preview>
    </box>
  );
}

export function SpacerPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Spacer" lede="flexGrow={1} — pushes siblings apart in a row or column." />
      <Preview
        code={`<box flexDirection="row" width={220} alignItems="center">
  <text font="body">left</text>
  <Spacer />
  <text font="body">right</text>
</box>`}
      >
        <box flexDirection="row" width={220} alignItems="center">
          <text font="body">left</text>
          <Spacer />
          <text font="body">right</text>
        </box>
      </Preview>
    </box>
  );
}

export function TextEditorPage(): JSX.Element {
  const [value, setValue] = createSignal("multiline\nedit me");
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="TextEditor"
        lede="Multiline editing. The owner keeps the string; the widget owns caret, selection, and viewport."
      />
      <Preview
        code={`<TextEditor
  width={260}
  height={80}
  value={value()}
  onChange={setValue}
/>`}
      >
        <TextEditor width={260} height={80} value={value()} onChange={setValue} />
      </Preview>
    </box>
  );
}

export function TextInputPage(): JSX.Element {
  const [name, setName] = createSignal("");
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="TextInput" lede="Single-line field. Placeholder, password, and submit are optional." />
      <Preview
        code={`<TextInput
  width={220}
  value={name()}
  onChange={setName}
  placeholder="type here"
/>`}
      >
        <TextInput width={220} value={name()} onChange={setName} placeholder="type here" />
        <text font="body" wrap>
          {name() ? `hello, ${name()}` : "the field is empty"}
        </text>
      </Preview>
    </box>
  );
}

export function RadioPage(): JSX.Element {
  const [fruit, setFruit] = createSignal("apple");
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Radio"
        lede="A 12px circle. RadioGroup keeps one value. Clicking a selected radio does not clear it."
      />
      <Preview
        code={`<RadioGroup
  value={fruit()}
  onChange={setFruit}
  options={[
    { value: "apple", label: "Apple" },
    { value: "pear", label: "Pear" },
    { value: "plum", label: "Plum" },
  ]}
/>`}
      >
        <RadioGroup
          value={fruit()}
          onChange={setFruit}
          options={[
            { value: "apple", label: "Apple" },
            { value: "pear", label: "Pear" },
            { value: "plum", label: "Plum" },
          ]}
        />
        <text font="body">{`selected: ${fruit()}`}</text>
      </Preview>
      <Preview
        code={`<Radio
  checked={fruit() === "solo"}
  onChange={() => setFruit("solo")}
  label="compose one yourself"
/>`}
      >
        <Radio
          checked={fruit() === "solo"}
          onChange={() => setFruit("solo")}
          label="compose one yourself"
        />
      </Preview>
    </box>
  );
}

export function LabelPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Label" lede="A caption. Field composes this; you can use it alone." />
      <Preview code={`<Label>Volume</Label>`}>
        <Label>Volume</Label>
      </Preview>
    </box>
  );
}

export function SliderPage(): JSX.Element {
  const [vol, setVol] = createSignal(4);
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Slider"
        lede="Slot plus thumb. Click, drag, or arrow keys. Photo Booth's AdjustSlider is this widget with a label."
      />
      <Preview
        code={`<Slider
  label="Volume"
  labelWidth={48}
  value={vol()}
  min={0}
  max={10}
  step={1}
  onChange={setVol}
/>`}
      >
        <Slider
          label="Volume"
          labelWidth={48}
          value={vol()}
          min={0}
          max={10}
          step={1}
          onChange={setVol}
        />
      </Preview>
    </box>
  );
}

export function ProgressPage(): JSX.Element {
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle title="Progress" lede="A thermometer. value is clamped to 0…max (default max is 1)." />
      <Preview
        code={`<Progress value={0.35} width={160} />
<Progress value={7} max={10} width={160} />`}
      >
        <Progress value={0.35} width={160} />
        <Progress value={7} max={10} width={160} />
      </Preview>
    </box>
  );
}

export function FieldPage(): JSX.Element {
  const [name, setName] = createSignal("");
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Field"
        lede="Label, control, help, error. Not a form library — compose the control yourself."
      />
      <Preview
        code={`<Field
  label="Name"
  description="appears on the invoice"
>
  <TextInput
    width={180}
    value={name()}
    onChange={setName}
  />
</Field>`}
      >
        <Field label="Name" description="appears on the invoice">
          <TextInput width={180} value={name()} onChange={setName} />
        </Field>
      </Preview>
      <Preview
        code={`<Field
  label="Name"
  error="required"
  orientation="horizontal"
>
  <TextInput width={180} value="" onChange={() => {}} />
</Field>`}
      >
        <Field label="Name" error="required" orientation="horizontal">
          <TextInput width={180} value="" onChange={() => {}} />
        </Field>
      </Preview>
    </box>
  );
}

export function TabsPage(): JSX.Element {
  const [pane, setPane] = createSignal("one");
  return (
    <box flexDirection="column" gap={16}>
      <PageTitle
        title="Tabs"
        lede="A tab bar. The parent still decides which panel to show in children."
      />
      <Preview
        code={`<Tabs
  value={pane()}
  onChange={setPane}
  items={[
    { value: "one", label: "One" },
    { value: "two", label: "Two" },
    { value: "three", label: "Three" },
  ]}
>
  <box padding={8}>
    <text font="body">{pane()}</text>
  </box>
</Tabs>`}
      >
        <Tabs
          value={pane()}
          onChange={setPane}
          items={[
            { value: "one", label: "One" },
            { value: "two", label: "Two" },
            { value: "three", label: "Three" },
          ]}
        >
          <box padding={8}>
            <text font="body">{pane()}</text>
          </box>
        </Tabs>
      </Preview>
    </box>
  );
}

export const COMPONENT_PAGES: Record<string, () => JSX.Element> = {
  overview: ComponentsOverviewPage,
  accordion: AccordionPage,
  attachment: AttachmentPage,
  avatar: AvatarPage,
  badge: BadgePage,
  breadcrumb: BreadcrumbPage,
  bubble: BubblePage,
  button: ButtonPage,
  "button-group": ButtonGroupPage,
  card: CardPage,
  checkbox: CheckboxPage,
  disclosure: DisclosurePage,
  dithered: DitheredPage,
  divider: DividerPage,
  empty: EmptyPage,
  field: FieldPage,
  "input-group": InputGroupPage,
  item: ItemPage,
  kbd: KbdPage,
  label: LabelPage,
  marker: MarkerPage,
  menu: MenuPage,
  message: MessagePage,
  "message-scroller": MessageScrollerPage,
  note: NotePage,
  pagination: PaginationPage,
  popover: PopoverPage,
  progress: ProgressPage,
  questionnaire: QuestionnairePage,
  radio: RadioPage,
  "scroll-view": ScrollViewPage,
  select: SelectPage,
  slider: SliderPage,
  spacer: SpacerPage,
  spinner: SpinnerPage,
  switch: SwitchPage,
  table: TablePage,
  tabs: TabsPage,
  "text-editor": TextEditorPage,
  "text-input": TextInputPage,
  toggle: TogglePage,
  tooltip: TooltipPage,
};
