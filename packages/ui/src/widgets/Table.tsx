import type { JSX } from "@mockintosh/ui";
import { For } from "solid-js";

export interface TableProps {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}

/** Header + rows. No sort or selection — compose that later. */
export function Table(props: TableProps): JSX.Element {
  return (
    <box
      semantic={{ role: "table" }}
      flexDirection="column"
      alignSelf="stretch"
      borderColor={1}
      borderWidth={1}
    >
      <box flexDirection="row" background={1}>
        <For each={props.headers}>
          {(header) => (
            <box flexGrow={1} padding={4}>
              <text font="body" color={0} nowrap>
                {header}
              </text>
            </box>
          )}
        </For>
      </box>
      <For each={props.rows}>
        {(row) => (
          <box flexDirection="row">
            <For each={props.headers.map((_, i) => row[i] ?? "")}>
              {(cell) => (
                <box flexGrow={1} padding={4}>
                  <text font="body" nowrap>{cell}</text>
                </box>
              )}
            </For>
          </box>
        )}
      </For>
    </box>
  );
}
