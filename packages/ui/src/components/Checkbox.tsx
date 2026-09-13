import { type JSX } from "solid-js";
import { Show } from "solid-js";

export interface CheckboxProps {
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox(props: CheckboxProps): JSX.Element {
  const toggle = () => {
    if (!props.disabled) props.onChange(!props.checked);
  };

  return (
    <box
      semantic={{ name: props.name, role: "checkbox", value: String(props.checked), enabled: !props.disabled }}
      flexDirection="row"
      gap={4}
      alignItems="center"
      alignSelf="flex-start"
      tabIndex={props.disabled ? undefined : 0}
      onClick={toggle}
      onKeyDown={(key: string) => {
        if (key === " " || key === "Enter") toggle();
      }}
    >
      <box width={12} height={12} borderColor={1} borderWidth={1} background={0}>
        <Show when={props.checked}>
          <text font="body" color={1} align="center" verticalAlign="middle">
            {"\u2713"}
          </text>
        </Show>
      </box>
      <Show when={!!props.label}>
        <text font="body" color={1} stipple={props.disabled} verticalAlign="middle">
          {props.label!}
        </text>
      </Show>
    </box>
  );
}
