import type { JSX } from "@mockintosh/ui";
import { Show } from "solid-js";
import { useRadius } from "../theme";
import { Button } from "./Button";
import { Item } from "./Item";
import { Progress } from "./Progress";

export type AttachmentState = "idle" | "uploading" | "error" | "done";

export interface AttachmentProps {
  title: string;
  description?: string;
  state?: AttachmentState;
  /** 0…1 while `state` is `uploading`. */
  progress?: number;
  onRemove?: () => void;
}

/** File chip: icon, name, size, Progress. Does not upload. */
export function Attachment(props: AttachmentProps): JSX.Element {
  const radius = useRadius("md");
  const markRadius = useRadius("sm");
  const state = () => props.state ?? "done";
  const description = () => {
    if (state() === "error") return props.description ?? "upload failed";
    if (state() === "uploading") return props.description ?? "uploading";
    return props.description;
  };

  return (
    <box
      semantic={{ role: "group", value: `${props.title}:${state()}` }}
      alignSelf="stretch"
      borderColor={1}
      borderWidth={1}
      borderRadius={radius()}
    >
      <Item
        title={props.title}
        description={description()}
        media={
          <box
            width={16}
            height={16}
            borderColor={1}
            borderWidth={1}
            borderRadius={markRadius()}
            justifyContent="center"
            alignItems="center"
          >
            <text font="body" nowrap>F</text>
          </box>
        }
      >
        <Show when={state() === "uploading"}>
          <Progress name="attach-progress" value={props.progress ?? 0} width={48} />
        </Show>
        <Show when={!!props.onRemove}>
          <Button name="attach-remove" label="X" onClick={props.onRemove!} />
        </Show>
      </Item>
    </box>
  );
}
