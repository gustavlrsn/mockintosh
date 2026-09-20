import type { JSX } from "@mockintosh/ui";
import { useRadius } from "../theme";

export interface KbdProps {
  children: string;
}

/** Shortcut caption. ⌘⌥⇧ live in the faces. */
export function Kbd(props: KbdProps): JSX.Element {
  const radius = useRadius("sm");
  return (
    <box
      semantic={{ role: "text", value: props.children }}
      alignSelf="flex-start"
      paddingLeft={3}
      paddingRight={3}
      paddingTop={1}
      paddingBottom={1}
      borderColor={1}
      borderWidth={1}
      borderRadius={radius()}
      background={0}
    >
      <text font="body" nowrap>{props.children}</text>
    </box>
  );
}
