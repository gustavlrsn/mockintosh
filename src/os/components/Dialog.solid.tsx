import { For, Show, type JSX } from "solid-js";
import { Button, TextInput, createSignal } from "@mockintosh/ui";
import { useWindow } from "../windowContext";

export interface DialogProps {
  message: string;
  buttons?: string[];
  showInput?: boolean;
  inputDefault?: string;
  resolve: (value: string | null) => void;
}

export function DialogApp(props: DialogProps): JSX.Element {
  const win = useWindow();
  const buttons = () => (props.buttons && props.buttons.length > 0 ? props.buttons : ["OK"]);
  const [value, setValue] = createSignal(props.inputDefault ?? "");

  function finish(label: string): void {
    props.resolve(props.showInput ? value() : label);
    win.close();
  }

  return (
    <box
      width={win.width()}
      height={win.height()}
      padding={16}
      flexDirection="column"
      gap={8}
      background={0}
      borderColor={1}
      borderWidth={2}
      tabIndex={0}
      autoFocus
      onKeyDown={(key) => {
        if (key === "Enter") finish(buttons()[buttons().length - 1]);
        if (key === "Escape") {
          const cancel = buttons().find((b) => b === "Cancel");
          if (cancel) finish(cancel);
        }
      }}
    >
      <text font="body" wrap>
        {props.message}
      </text>
      <Show when={props.showInput}>
        <TextInput
          value={value()}
          onChange={setValue}
          onSubmit={() => finish(buttons()[buttons().length - 1])}
          width={win.width() - 40}
          autoFocus
        />
      </Show>
      <box flexDirection="row" justifyContent="flex-end" gap={8}>
        <For each={buttons()}>
          {(label) => <Button label={label} onClick={() => finish(label)} />}
        </For>
      </box>
    </box>
  );
}
