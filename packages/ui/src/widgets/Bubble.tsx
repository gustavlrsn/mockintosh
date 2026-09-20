import type { JSX } from "@mockintosh/ui";
import { useRadius } from "../theme";

export interface BubbleProps {
  /** `end` is the current user. Default `start`. */
  align?: "start" | "end";
  /** Invert the face. Defaults on for `align="end"`. */
  invert?: boolean;
  /** Cap width. Default 220. */
  maxWidth?: number;
  children: string;
}

/** 1-bit chat surface: outline or invert. No tint variants. */
export function Bubble(props: BubbleProps): JSX.Element {
  const invert = () => props.invert ?? props.align === "end";
  const radius = useRadius("lg");
  return (
    <box
      semantic={{ role: "text", value: props.children }}
      alignSelf={props.align === "end" ? "flex-end" : "flex-start"}
      maxWidth={props.maxWidth ?? 220}
      padding={6}
      borderColor={1}
      borderWidth={1}
      borderRadius={radius()}
      background={invert() ? 1 : 0}
    >
      <text font="body" wrap color={invert() ? 0 : 1} selectable>
        {props.children}
      </text>
    </box>
  );
}
