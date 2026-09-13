/**
 * Non-scrolling window bands — chrome the app fills, above or below the
 * scrollable body. Folder “N items” and Icon Gallery’s search bar both use
 * `WindowHeader`; a status strip uses `WindowFooter`. The window scrollbar
 * thumbs only the body between them.
 *
 * Children are registered as a live view (`() => props.children`) so the
 * chrome can render them. Storing a JSX snapshot remounts inputs on every
 * keystroke and steals focus.
 */
import { createContext, createEffect, onCleanup, useContext } from "@mockintosh/ui";
import type { JSX } from "solid-js";

export type WindowBandView = (() => JSX.Element) | null;

export interface WindowSlots {
  setHeader(view: WindowBandView, height: number): void;
  setFooter(view: WindowBandView, height: number): void;
}

export const WindowSlotsContext = createContext<WindowSlots | null>(null);

function useWindowSlots(): WindowSlots {
  const slots = useContext(WindowSlotsContext);
  if (!slots) throw new Error("WindowHeader/WindowFooter must be used inside a window");
  return slots;
}

export function WindowHeader(props: { height: number; children: JSX.Element }): JSX.Element {
  const slots = useWindowSlots();
  createEffect(() => {
    const height = props.height;
    slots.setHeader(() => props.children, height);
  });
  onCleanup(() => slots.setHeader(null, 0));
  return null;
}

export function WindowFooter(props: { height: number; children: JSX.Element }): JSX.Element {
  const slots = useWindowSlots();
  createEffect(() => {
    const height = props.height;
    slots.setFooter(() => props.children, height);
  });
  onCleanup(() => slots.setFooter(null, 0));
  return null;
}
