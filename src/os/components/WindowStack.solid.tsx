import { JSX, For, createMemo } from "solid-js";
import { getWindows } from "../state";
import { sortWindowsForPaint } from "../layering";
import { Window } from "./Window.solid";

export function WindowStack(): JSX.Element {
  const ordered = createMemo(() => sortWindowsForPaint(getWindows()));
  return (
    <For each={ordered()}>
      {(win) => <Window win={win} />}
    </For>
  );
}
