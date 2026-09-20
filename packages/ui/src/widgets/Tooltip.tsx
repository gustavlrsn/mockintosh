import { createSignal } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { Overlay } from "./Overlay";
import { useRadius } from "../theme";

export interface TooltipProps {
  label: string;
  children?: JSX.Element;
}

/** Balloon-help caption. Hover or focus. Not modal. */
export function Tooltip(props: TooltipProps): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const radius = useRadius("sm");

  return (
    <Overlay
      open={open()}
      modal={false}
      side="top"
      offset={16}
      role="tooltip"
      trigger={
        <box
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {props.children}
        </box>
      }
    >
      <box
        semantic={{ name: "tooltip", role: "tooltip", value: props.label }}
        paddingLeft={3}
        paddingRight={3}
        paddingTop={2}
        paddingBottom={2}
        borderColor={1}
        borderWidth={1}
        borderRadius={radius()}
        background={0}
      >
        <text font="body" nowrap>{props.label}</text>
      </box>
    </Overlay>
  );
}
