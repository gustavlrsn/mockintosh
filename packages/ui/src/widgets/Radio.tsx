import type { JSX } from "@mockintosh/ui";
import { For, Show } from "solid-js";

const WELL = 12;
const DOT = 6;

export interface RadioProps {
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/** Classic Mac radio: a 12px circle, filled when selected. */
export function Radio(props: RadioProps): JSX.Element {
  const select = () => {
    if (!props.disabled && !props.checked) props.onChange(true);
  };

  return (
    <box
      semantic={{
        name: props.name,
        role: "radio",
        value: String(props.checked),
        enabled: !props.disabled,
      }}
      flexDirection="row"
      gap={4}
      alignItems="center"
      alignSelf="flex-start"
      tabIndex={props.disabled ? undefined : 0}
      cursor={props.disabled ? "default" : "pointer"}
      onClick={select}
      onKeyDown={(key: string) => {
        if (key === " " || key === "Enter") select();
      }}
    >
      <box
        width={WELL}
        height={WELL}
        borderColor={1}
        borderWidth={1}
        borderRadius={WELL / 2}
        background={0}
        justifyContent="center"
        alignItems="center"
      >
        <Show when={props.checked}>
          <box width={DOT} height={DOT} borderRadius={DOT / 2} background={1} />
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

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  options?: readonly RadioOption[];
  children?: JSX.Element;
}

/** Exclusive radios. Pass `options` or compose `Radio` children yourself. */
export function RadioGroup(props: RadioGroupProps): JSX.Element {
  return (
    <box
      semantic={{
        name: props.name,
        role: "radiogroup",
        value: props.value,
        enabled: !props.disabled,
      }}
      flexDirection="column"
      gap={4}
      alignSelf="flex-start"
    >
      <Show
        when={props.options}
        fallback={props.children}
      >
        <For each={props.options ?? []}>
          {(opt) => (
            <Radio
              name={props.name ? `${props.name}:${opt.value}` : opt.value}
              checked={props.value === opt.value}
              disabled={props.disabled || opt.disabled}
              label={opt.label}
              onChange={() => props.onChange(opt.value)}
            />
          )}
        </For>
      </Show>
    </box>
  );
}
