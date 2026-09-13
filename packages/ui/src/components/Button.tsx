import { createSignal, type JSX } from "solid-js";
import type { Ink, LayoutStyle, PatternName } from "../nodes";

export interface ButtonProps {
  name?: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Explicit width; by default the button hugs its label. */
  width?: LayoutStyle["width"];
  /** Cross-axis alignment in the parent. Defaults to "flex-start" (content-sized). */
  alignSelf?: LayoutStyle["alignSelf"];
}

export function Button(props: ButtonProps): JSX.Element {
  const [pressed, setPressed] = createSignal(false);

  const background = (): Ink | PatternName =>
    pressed() ? 1 : props.disabled ? "checker" : 0;

  const borderStyle = (): "solid" | "dotted" =>
    props.disabled ? "dotted" : "solid";

  return (
    <box
      semantic={{ name: props.name, role: "button",  enabled: !props.disabled }}
      width={props.width}
      alignSelf={props.alignSelf ?? "flex-start"}
      background={background()}
      borderColor={1}
      borderWidth={1}
      borderStyle={borderStyle()}
      borderRadius={3}
      padding={3}
      tabIndex={props.disabled ? undefined : 0}
      onMouseDown={() => { if (!props.disabled) setPressed(true); }}
      onMouseUp={() => { setPressed(false); if (!props.disabled) props.onClick(); }}
      onMouseLeave={() => setPressed(false)}
      onKeyDown={(key: string) => {
        if ((key === "Enter" || key === " ") && !props.disabled) props.onClick();
      }}
    >
      <text font="body" color={pressed() ? 0 : 1} align="center">
        {props.label}
      </text>
    </box>
  );
}
