import { createSignal, onCleanup, onSettled } from "solid-js";
import type { JSX } from "@mockintosh/ui";

const FRAMES = ["-", "\\", "|", "/"] as const;
const SIZE = 12;

export interface SpinnerProps {
  name?: string;
}

/** Inline watch. Distinct from the cursor. */
export function Spinner(props: SpinnerProps): JSX.Element {
  const [frame, setFrame] = createSignal(0);
  let id: ReturnType<typeof setInterval> | undefined;
  onSettled(() => {
    id = setInterval(() => setFrame((n) => (n + 1) % FRAMES.length), 120);
  });
  onCleanup(() => {
    if (id !== undefined) clearInterval(id);
  });

  return (
    <box
      semantic={{ name: props.name, role: "status", value: "busy" }}
      width={SIZE}
      height={SIZE}
      borderColor={1}
      borderWidth={1}
      background={0}
      justifyContent="center"
      alignItems="center"
      alignSelf="flex-start"
    >
      <text font="mono" align="center" nowrap>
        {FRAMES[frame()]}
      </text>
    </box>
  );
}
