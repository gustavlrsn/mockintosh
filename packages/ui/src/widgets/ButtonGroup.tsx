import type { JSX } from "@mockintosh/ui";

export interface ButtonGroupProps {
  children?: JSX.Element;
}

/** Row of actions. Buttons keep their own faces. */
export function ButtonGroup(props: ButtonGroupProps): JSX.Element {
  return (
    <box
      semantic={{ role: "group" }}
      flexDirection="row"
      gap={8}
      alignItems="center"
      alignSelf="flex-start"
    >
      {props.children}
    </box>
  );
}
