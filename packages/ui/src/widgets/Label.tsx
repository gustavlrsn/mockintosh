import type { JSX } from "@mockintosh/ui";

export interface LabelProps {
  children: string;
  disabled?: boolean;
  font?: string;
  size?: number;
  wrap?: boolean;
  nowrap?: boolean;
}

/** Caption next to a control. Field composes this. */
export function Label(props: LabelProps): JSX.Element {
  return (
    <text
      font={props.font ?? "body"}
      size={props.size}
      color={1}
      wrap={props.wrap}
      nowrap={props.nowrap}
      stipple={props.disabled}
    >
      {props.children}
    </text>
  );
}
