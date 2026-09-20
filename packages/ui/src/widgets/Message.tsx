import { Show, createEffect, onSettled } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import type { CanvasNode } from "../nodes";
import { scrollOverflow } from "../pointer";
import { scheduleRepaint } from "../renderer";
import { Avatar } from "./Avatar";
import { Bubble } from "./Bubble";

export interface MessageProps {
  align?: "start" | "end";
  initials?: string;
  name?: string;
  footer?: string;
  invert?: boolean;
  children: string;
}

/** Row: Avatar + header + Bubble + footer. ChatGippity is the first consumer. */
export function Message(props: MessageProps): JSX.Element {
  const end = () => props.align === "end";
  return (
    <box
      semantic={{ role: "listitem", value: props.children }}
      flexDirection="column"
      gap={2}
      alignItems={end() ? "flex-end" : "flex-start"}
      alignSelf="stretch"
    >
      <Show when={!!props.name}>
        <text font="body" nowrap>{props.name!}</text>
      </Show>
      <box flexDirection="row" gap={6} alignItems="flex-end">
        <Show when={!end()}>
          <Avatar initials={props.initials ?? "G"} size={24} />
        </Show>
        <Bubble align={props.align} invert={props.invert}>
          {props.children}
        </Bubble>
        <Show when={end()}>
          <Avatar initials={props.initials ?? "Y"} size={24} />
        </Show>
      </box>
      <Show when={!!props.footer}>
        <text font="body" nowrap>{props.footer!}</text>
      </Show>
    </box>
  );
}

export interface MessageScrollerProps {
  height: number;
  /** Inner inset. Default 4. */
  padding?: number;
  children?: JSX.Element;
  /**
   * When this changes, pin to the bottom if the user is already there
   * (or has not scrolled away).
   */
  stickKey?: string | number;
}

/** Stick-to-bottom thread on a scroll pane. */
export function MessageScroller(props: MessageScrollerProps): JSX.Element {
  let node: CanvasNode | null = null;
  let pinned = true;

  const pin = () => {
    if (!node || !pinned) return;
    const max = scrollOverflow(node);
    if (node._scrollOffset === max) return;
    node._scrollOffset = max;
    scheduleRepaint();
  };

  createEffect(
    () => props.stickKey,
    () => {
      onSettled(pin);
    },
  );

  return (
    <box
      ref={(el) => {
        node = el;
      }}
      semantic={{ role: "log" }}
      overflow="scroll"
      height={props.height}
      flexDirection="column"
      gap={8}
      padding={props.padding ?? 4}
      onScroll={() => {
        if (!node) return;
        pinned = node._scrollOffset >= scrollOverflow(node) - 2;
      }}
    >
      {props.children}
    </box>
  );
}
