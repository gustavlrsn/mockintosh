import { type JSX } from "solid-js";
import type { Ink } from "../nodes";

export function Divider(props: { color?: Ink }): JSX.Element {
  return <box height={1} background={props.color ?? 1} />;
}

export function Spacer(): JSX.Element {
  return <box flexGrow={1} />;
}

export interface ScrollViewProps {
  height: number;
  children: JSX.Element;
}

export function ScrollView(props: ScrollViewProps): JSX.Element {
  return (
    <box overflow="scroll" height={props.height}>
      {props.children}
    </box>
  );
}
