import type { JSX } from "@mockintosh/ui";
import { Overlay, type OverlayAlign } from "./Overlay";
import { useRadius } from "../theme";

export interface PopoverProps {
  name?: string;
  open: boolean;
  onDismiss: () => void;
  align?: OverlayAlign;
  trigger: JSX.Element;
  children?: JSX.Element;
}

/** Anchored panel. Parent owns `open`. Dismiss is click outside or Escape. */
export function Popover(props: PopoverProps): JSX.Element {
  const radius = useRadius("md");
  return (
    <Overlay
      open={props.open}
      onDismiss={props.onDismiss}
      align={props.align}
      role="dialog"
      trigger={props.trigger}
    >
      <box
        semantic={{ name: props.name ?? "popover", role: "dialog" }}
        minWidth={120}
        padding={8}
        borderColor={1}
        borderWidth={1}
        borderRadius={radius()}
        background={0}
        flexDirection="column"
        gap={4}
      >
        {props.children}
      </box>
    </Overlay>
  );
}
