import type { JSX } from "@mockintosh/ui";
import { useRadius } from "../theme";

export interface BadgeProps {
  children: string;
  /** Invert the pill. Default is a 1px frame. */
  invert?: boolean;
}

/** Count or state pill. */
export function Badge(props: BadgeProps): JSX.Element {
  const invert = () => !!props.invert;
  const radius = useRadius("sm");
  return (
    <box
      semantic={{ role: "status", value: props.children }}
      alignSelf="flex-start"
      paddingLeft={4}
      paddingRight={4}
      paddingTop={1}
      paddingBottom={1}
      background={invert() ? 1 : 0}
      borderColor={1}
      borderWidth={1}
      borderRadius={radius()}
    >
      <text font="body" color={invert() ? 0 : 1} nowrap>
        {props.children}
      </text>
    </box>
  );
}
