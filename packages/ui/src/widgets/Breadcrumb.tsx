import type { JSX } from "@mockintosh/ui";
import { For, Show } from "solid-js";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: readonly BreadcrumbItem[];
}

/** Path with : separators. Last crumb is the current page. */
export function Breadcrumb(props: BreadcrumbProps): JSX.Element {
  return (
    <box
      semantic={{ role: "navigation", value: props.items.map((i) => i.label).join(":") }}
      flexDirection="row"
      gap={4}
      alignItems="center"
      alignSelf="flex-start"
    >
      <For each={props.items.map((item, i) => ({ item, i }))}>
        {(entry) => {
          const last = () => entry.i === props.items.length - 1;
          return (
            <box flexDirection="row" gap={4} alignItems="center">
              <Show when={entry.i > 0}>
                <text font="body" nowrap>:</text>
              </Show>
              <box
                semantic={{ role: last() || !entry.item.onClick ? "text" : "button", value: entry.item.label }}
                tabIndex={!last() && entry.item.onClick ? 0 : undefined}
                cursor={!last() && entry.item.onClick ? "pointer" : undefined}
                onClick={() => {
                  if (!last()) entry.item.onClick?.();
                }}
                onKeyDown={(key: string) => {
                  if ((key === "Enter" || key === " ") && !last()) entry.item.onClick?.();
                }}
              >
                <text font="body" nowrap>{entry.item.label}</text>
              </box>
            </box>
          );
        }}
      </For>
    </box>
  );
}
