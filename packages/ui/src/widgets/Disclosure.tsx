import type { JSX } from "@mockintosh/ui";
import { For, Show } from "solid-js";

export interface DisclosureProps {
  name?: string;
  title: string;
  open: boolean;
  onChange: (open: boolean) => void;
  children?: JSX.Element;
}

/** Triangle + title. Classic Mac disclosure. */
export function Disclosure(props: DisclosureProps): JSX.Element {
  const flip = () => props.onChange(!props.open);

  return (
    <box semantic={{ name: props.name, role: "group", value: String(props.open) }} flexDirection="column" gap={4}>
      <box
        flexDirection="row"
        gap={6}
        alignItems="center"
        alignSelf="flex-start"
        tabIndex={0}
        cursor="pointer"
        onClick={flip}
        onKeyDown={(key: string) => {
          if (key === " " || key === "Enter") flip();
        }}
      >
        <text font="body" nowrap>{props.open ? "v" : ">"}</text>
        <text font="body" nowrap>{props.title}</text>
      </box>
      <Show when={props.open}>
        <box paddingLeft={12} flexDirection="column" gap={4}>
          {props.children}
        </box>
      </Show>
    </box>
  );
}

export interface AccordionEntry {
  value: string;
  title: string;
  content: JSX.Element;
}

export interface AccordionProps {
  name?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  items: readonly AccordionEntry[];
}

/** One open disclosure at a time. Compose Disclosure yourself for multiple. */
export function Accordion(props: AccordionProps): JSX.Element {
  return (
    <box semantic={{ name: props.name, role: "group", value: props.value ?? "" }} flexDirection="column" gap={8}>
      <For each={props.items}>
        {(item) => (
          <Disclosure
            name={props.name ? `${props.name}:${item.value}` : item.value}
            title={item.title}
            open={props.value === item.value}
            onChange={(open) => props.onChange(open ? item.value : null)}
          >
            {item.content}
          </Disclosure>
        )}
      </For>
    </box>
  );
}
