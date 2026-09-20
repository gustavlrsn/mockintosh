import type { JSX } from "@mockintosh/ui";
import { Show } from "solid-js";

export interface ItemProps {
  title: string;
  description?: string;
  media?: JSX.Element;
  children?: JSX.Element;
}

/** Media + title + description + optional actions. */
export function Item(props: ItemProps): JSX.Element {
  return (
    <box
      semantic={{ role: "listitem", value: props.title }}
      flexDirection="row"
      gap={8}
      alignItems="center"
      alignSelf="stretch"
      padding={6}
    >
      {props.media}
      <box flexDirection="column" gap={2} flexGrow={1}>
        <text font="body" nowrap>{props.title}</text>
        <Show when={!!props.description}>
          <text font="body" wrap>
            {props.description!}
          </text>
        </Show>
      </box>
      {props.children}
    </box>
  );
}
