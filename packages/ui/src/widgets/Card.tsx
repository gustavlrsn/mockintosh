import type { JSX } from "@mockintosh/ui";
import { Show } from "solid-js";
import { useRadius } from "../theme";

export interface CardProps {
  title?: string;
  /** Window-style 1px drop shadow. The face sits 1px up-left on the L. Defaults on. */
  shadow?: boolean;
  /** Body inset. Default 8. Pass 0 for a flush pane (a scroller, a table). */
  padding?: number;
  children?: JSX.Element;
}

/** Bordered group. Optional title sits above a 1px rule. */
export function Card(props: CardProps): JSX.Element {
  const shadow = () => props.shadow !== false;
  const slot = () => (shadow() ? 1 : 0);
  const radius = useRadius("lg");
  return (
    <box semantic={{ role: "group" }} alignSelf="stretch" flexDirection="column">
      <box paddingRight={slot()} paddingBottom={slot()} flexDirection="column" alignSelf="stretch">
        <box
          borderColor={1}
          borderWidth={1}
          borderRadius={radius()}
          background={0}
          alignSelf="stretch"
          flexDirection="column"
          shadow={shadow()}
        >
          <Show when={props.title !== undefined}>
            <box padding={8} paddingBottom={6}>
              <text font="body" nowrap>{props.title!}</text>
            </box>
            <box height={1} background={1} />
          </Show>
          <box
            padding={props.padding ?? 8}
            flexDirection="column"
            gap={props.padding === 0 ? 0 : 8}
          >
            {props.children}
          </box>
        </box>
      </box>
    </box>
  );
}
