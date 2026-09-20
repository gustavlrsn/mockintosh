import type { JSX } from "@mockintosh/ui";
import { Show } from "solid-js";

export interface EmptyProps {
  title: string;
  description?: string;
  children?: JSX.Element;
}

/** Centered empty state. Put one action in `children`. */
export function Empty(props: EmptyProps): JSX.Element {
  return (
    <box
      semantic={{ role: "status", value: props.title }}
      flexDirection="column"
      gap={8}
      alignItems="center"
      alignSelf="stretch"
      padding={16}
    >
      <text font="body" align="center" nowrap>
        {props.title}
      </text>
      <Show when={!!props.description}>
        <text font="body" wrap align="center">
          {props.description!}
        </text>
      </Show>
      {props.children}
    </box>
  );
}
