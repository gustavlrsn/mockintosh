import type { JSX } from "@mockintosh/ui";
import { Show } from "solid-js";
import { useRadius } from "../theme";

export interface InputGroupProps {
  before?: string;
  after?: string;
  children?: JSX.Element;
}

/** Addon before/after a borderless TextInput. */
export function InputGroup(props: InputGroupProps): JSX.Element {
  const radius = useRadius("md");
  return (
    <box
      semantic={{ role: "group" }}
      flexDirection="row"
      alignItems="center"
      alignSelf="flex-start"
      borderColor={1}
      borderWidth={1}
      borderRadius={radius()}
      background={0}
    >
      <Show when={props.before !== undefined}>
        <box paddingLeft={4} paddingRight={2}>
          <text font="body" nowrap>{props.before!}</text>
        </box>
      </Show>
      {props.children}
      <Show when={props.after !== undefined}>
        <box paddingLeft={2} paddingRight={4}>
          <text font="body" nowrap>{props.after!}</text>
        </box>
      </Show>
    </box>
  );
}
