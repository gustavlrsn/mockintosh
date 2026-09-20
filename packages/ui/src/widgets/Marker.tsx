import type { JSX } from "@mockintosh/ui";
import { Show } from "solid-js";
import { Spinner } from "./Spinner";

export interface MarkerProps {
  children: string;
  /** `separator` is a labeled rule (a date, a compact). */
  variant?: "default" | "separator";
  busy?: boolean;
}

/** Inline status, date rule, or tool line. */
export function Marker(props: MarkerProps): JSX.Element {
  if (props.variant === "separator") {
    return (
      <box
        semantic={{ role: "separator", value: props.children }}
        flexDirection="row"
        gap={6}
        alignItems="center"
        alignSelf="stretch"
      >
        <box flexGrow={1} height={1} background={1} />
        <text font="body" nowrap>{props.children}</text>
        <box flexGrow={1} height={1} background={1} />
      </box>
    );
  }

  return (
    <box
      semantic={{ role: "status", value: props.children }}
      flexDirection="row"
      gap={6}
      alignItems="center"
      alignSelf="flex-start"
    >
      <Show when={props.busy}>
        <Spinner />
      </Show>
      <text font="body" nowrap>{props.children}</text>
    </box>
  );
}
