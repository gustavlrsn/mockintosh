import type { JSX } from "@mockintosh/ui";
import { Show } from "solid-js";
import { createToggle } from "../primitives/toggle";

const WELL = 12;

export interface CheckboxProps {
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox(props: CheckboxProps): JSX.Element {
  const toggle = createToggle(props);

  return (
    <box
      {...toggle.rootProps()}
      flexDirection="row"
      gap={4}
      alignItems="center"
      alignSelf="flex-start"
    >
      <box width={WELL} height={WELL} borderColor={1} borderWidth={1} background={0}>
        <Show when={props.checked}>
          <text font="body" color={1} align="center" verticalAlign="middle" nowrap>
            {"\u2713"}
          </text>
        </Show>
      </box>
      <Show when={!!props.label}>
        <text font="body" color={1} stipple={props.disabled} verticalAlign="middle" nowrap>
          {props.label!}
        </text>
      </Show>
    </box>
  );
}
