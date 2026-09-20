import type { JSX } from "@mockintosh/ui";
import { For } from "solid-js";
import { useRadius } from "../theme";

export interface ToggleProps {
  name?: string;
  pressed: boolean;
  onChange: (pressed: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** Latching tool button. Invert when pressed. Not a Switch. */
export function Toggle(props: ToggleProps): JSX.Element {
  const radius = useRadius("sm");
  const flip = () => {
    if (!props.disabled) props.onChange(!props.pressed);
  };

  return (
    <box
      semantic={{
        name: props.name,
        role: "button",
        value: String(props.pressed),
        enabled: !props.disabled,
      }}
      alignSelf="flex-start"
      paddingLeft={6}
      paddingRight={6}
      paddingTop={2}
      paddingBottom={2}
      background={props.pressed ? 1 : 0}
      borderColor={1}
      borderWidth={1}
      borderRadius={radius()}
      tabIndex={props.disabled ? undefined : 0}
      cursor={props.disabled ? "default" : "pointer"}
      onClick={flip}
      onKeyDown={(key: string) => {
        if (key === " " || key === "Enter") flip();
      }}
    >
      <text font="body" color={props.pressed ? 0 : 1} stipple={props.disabled} nowrap>
        {props.label}
      </text>
    </box>
  );
}

export interface ToggleOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ToggleGroupProps {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  items: readonly ToggleOption[];
  disabled?: boolean;
}

/** Exclusive tool well. */
export function ToggleGroup(props: ToggleGroupProps): JSX.Element {
  return (
    <box
      semantic={{ name: props.name, role: "group", value: props.value }}
      flexDirection="row"
      gap={0}
      alignSelf="flex-start"
    >
      <For each={props.items}>
        {(item) => (
          <Toggle
            name={props.name ? `${props.name}:${item.value}` : item.value}
            pressed={props.value === item.value}
            disabled={props.disabled || item.disabled}
            label={item.label}
            onChange={() => props.onChange(item.value)}
          />
        )}
      </For>
    </box>
  );
}
