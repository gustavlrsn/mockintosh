import { createSignal } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import type { CursorName } from "../cursor";
import type { Ink, LayoutStyle, PatternName } from "../nodes";
import { useRadius } from "../theme";

/** Control Manager default-button ring — outside the face, not inside it. */
const RING_PEN = 3;
const RING_GAP = 1;
const RING_RADIUS = 8;

export interface ButtonProps {
  name?: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Face type. Defaults to `"body"`. */
  font?: string;
  /** Native point size when `font` is a family with more than one strike. */
  size?: number;
  /** Font Manager bold smear on the label. */
  bold?: boolean;
  /** Font Manager italic shear on the label. */
  italic?: boolean;
  /** Window-style 1px drop shadow (right + below). Defaults on. */
  shadow?: boolean;
  /**
   * Drop the raise while pressed. Defaults on when `shadow` is set.
   * Unshadowed buttons still slide into a reserved 1px slot.
   */
  depress?: boolean;
  /** Face corner radius. Forwards to the inner box. */
  borderRadius?: number;
  /**
   * CDEF default ring outside the face (3px stroke, 1px gap).
   * The face keeps its own border box; this is a wrapping box.
   */
  ring?: boolean;
  /** Named cursor. Buttons leave the host default (arrow) unless set. */
  cursor?: CursorName;
  width?: LayoutStyle["width"];
  /** Face height. Defaults to 16. */
  height?: LayoutStyle["height"];
  minWidth?: LayoutStyle["minWidth"];
  alignSelf?: LayoutStyle["alignSelf"];
}

export function Button(props: ButtonProps): JSX.Element {
  const [pressed, setPressed] = createSignal(false);
  const shadow = () => props.shadow !== false;
  const depress = () => props.depress ?? shadow();
  const slot = () => (shadow() || depress() ? 1 : 0);
  // Shadowed faces drop 1px by turning the raise off. Unshadowed depress
  // still slides into the reserved slot.
  const inset = () => depress() && pressed() && !shadow();
  const radius = useRadius("md");

  const background = (): Ink | PatternName =>
    pressed() ? 1 : props.disabled ? "checker" : 0;

  const borderStyle = (): "solid" | "dotted" =>
    props.disabled ? "dotted" : "solid";

  return (
    <box
      semantic={{ name: props.name, role: "button", enabled: !props.disabled }}
      width={props.width}
      alignSelf={props.alignSelf ?? "flex-start"}
      padding={props.ring ? RING_GAP : 0}
      borderColor={props.ring ? 1 : undefined}
      borderWidth={props.ring ? RING_PEN : undefined}
      borderRadius={props.ring ? RING_RADIUS : undefined}
      background={props.ring ? 0 : undefined}
      tabIndex={props.disabled ? undefined : 0}
      cursor={props.cursor}
      onMouseDown={() => { if (!props.disabled) setPressed(true); }}
      onMouseUp={() => { setPressed(false); if (!props.disabled) props.onClick(); }}
      onMouseLeave={() => setPressed(false)}
      onKeyDown={(key: string) => {
        if ((key === "Enter" || key === " ") && !props.disabled) props.onClick();
      }}
    >
      <box
        paddingLeft={inset() ? slot() : 0}
        paddingTop={inset() ? slot() : 0}
        paddingRight={!inset() ? slot() : 0}
        paddingBottom={!inset() ? slot() : 0}
      >
        <box
          width={props.width !== undefined ? "100%" : undefined}
          height={props.height ?? 16}
          minWidth={props.minWidth ?? (props.ring ? 59 : undefined)}
          paddingLeft={8}
          paddingRight={8}
          background={background()}
          borderColor={1}
          borderWidth={1}
          borderStyle={borderStyle()}
          borderRadius={props.borderRadius ?? radius()}
          shadow={shadow() && !pressed()}
          justifyContent="center"
          alignItems="center"
        >
          <text font={props.font ?? "body"} size={props.size} bold={props.bold} italic={props.italic} color={pressed() ? 0 : 1} align="center" verticalAlign="middle" nowrap>
            {props.label}
          </text>
        </box>
      </box>
    </box>
  );
}
