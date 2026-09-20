import type { JSX } from "@mockintosh/ui";
import { useRadius } from "../theme";

export type NoteVariant = "stop" | "note" | "caution";

export interface NoteProps {
  variant?: NoteVariant;
  children: string;
}

const MARK: Record<NoteVariant, string> = {
  stop: "X",
  note: "i",
  caution: "!",
};

/** Inline stop / note / caution. Not a window — use OS showDialog for that. */
export function Note(props: NoteProps): JSX.Element {
  const variant = () => props.variant ?? "note";
  const radius = useRadius("lg");
  const markRadius = useRadius("sm");
  return (
    <box
      semantic={{ role: "status", value: variant() }}
      flexDirection="row"
      gap={8}
      alignItems="flex-start"
      alignSelf="stretch"
      padding={8}
      borderColor={1}
      borderWidth={1}
      borderRadius={radius()}
      background={0}
    >
      <box
        width={16}
        height={16}
        borderColor={1}
        borderWidth={1}
        borderRadius={markRadius()}
        background={variant() === "stop" ? 1 : 0}
        justifyContent="center"
        alignItems="center"
      >
        <text font="body" color={variant() === "stop" ? 0 : 1} align="center" nowrap>
          {MARK[variant()]}
        </text>
      </box>
      <box flexGrow={1} paddingTop={2}>
        <text font="body" wrap>
          {props.children}
        </text>
      </box>
    </box>
  );
}
