import type { JSX } from "@mockintosh/ui";
import { Show } from "solid-js";
import { Label } from "./Label";

export interface FieldProps {
  label?: string;
  description?: string;
  error?: string;
  orientation?: "vertical" | "horizontal";
  disabled?: boolean;
  children?: JSX.Element;
}

/** Label + control + optional help and error. Not a form engine. */
export function Field(props: FieldProps): JSX.Element {
  const horizontal = () => props.orientation === "horizontal";

  return (
    <box
      semantic={{ role: "group", enabled: !props.disabled }}
      flexDirection={horizontal() ? "row" : "column"}
      gap={horizontal() ? 8 : 4}
      alignItems={horizontal() ? "center" : "stretch"}
      alignSelf="flex-start"
    >
      <Show when={props.label !== undefined}>
        <Label disabled={props.disabled}>{props.label!}</Label>
      </Show>
      <box flexDirection="column" gap={2} flexGrow={horizontal() ? 1 : undefined}>
        {props.children}
        <Show when={!!props.description && !props.error}>
          <text font="body" wrap>
            {props.description!}
          </text>
        </Show>
        <Show when={!!props.error}>
          <text font="body" wrap>
            {props.error!}
          </text>
        </Show>
      </box>
    </box>
  );
}
