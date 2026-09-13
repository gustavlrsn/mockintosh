import { createSignal, type JSX } from "solid-js";
import type { Ink, LayoutStyle, PatternName } from "../nodes";

/**
 * Control Manager push-button metrics (`Button CDEF`):
 * `FrameRoundRect(r, 10, 10)` on a 20px-tall face; the default ring is
 * `PenSize(3, 3)` / `FrameRoundRect(inset(r, -4), 16, 16)` — a 3px stroke
 * and 1px gap, so the outer box is 8px larger on each axis.
 */
const FACE_HEIGHT = 20;
const FACE_RADIUS = 5;
const FACE_MIN_WIDTH = 59;
const RING_RADIUS = 8;
const RING_PEN = 3;
const RING_GAP = 1;

export interface ButtonProps {
  name?: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /**
   * Default (primary) button: the 3px rounded ring the Macintosh drew
   * around the item that Return hits.
   */
  default?: boolean;
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
      semantic={{ name: props.name, role: "button", enabled: !props.disabled }}
      width={props.width}
      alignSelf={props.alignSelf ?? "flex-start"}
      padding={props.default ? RING_GAP : 0}
      borderColor={props.default ? 1 : undefined}
      borderWidth={props.default ? RING_PEN : undefined}
      borderRadius={props.default ? RING_RADIUS : undefined}
      background={props.default ? 0 : undefined}
      tabIndex={props.disabled ? undefined : 0}
      onMouseDown={() => { if (!props.disabled) setPressed(true); }}
      onMouseUp={() => { setPressed(false); if (!props.disabled) props.onClick(); }}
      onMouseLeave={() => setPressed(false)}
      onKeyDown={(key: string) => {
        if ((key === "Enter" || key === " ") && !props.disabled) props.onClick();
      }}
    >
      <box
        width={props.width !== undefined ? "100%" : undefined}
        height={FACE_HEIGHT}
        minWidth={props.default ? FACE_MIN_WIDTH : undefined}
        paddingLeft={8}
        paddingRight={8}
        background={background()}
        borderColor={1}
        borderWidth={1}
        borderStyle={borderStyle()}
        borderRadius={FACE_RADIUS}
        justifyContent="center"
        alignItems="center"
      >
        <text font="menu" color={pressed() ? 0 : 1} align="center" verticalAlign="middle">
          {props.label}
        </text>
      </box>
    </box>
  );
}
