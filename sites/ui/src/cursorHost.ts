import { createSignal } from "@mockintosh/ui";
import type { CursorPresentation } from "@mockintosh/ui/web";

const KEY = "mockintosh-ui-cursors";

export type SiteCursorMode = Extract<CursorPresentation, "css" | "mac">;

let apply: ((mode: SiteCursorMode) => void) | undefined;

function readStored(): SiteCursorMode {
  try {
    return localStorage.getItem(KEY) === "css" ? "css" : "mac";
  } catch {
    return "mac";
  }
}

const [cursorMode, setCursorMode] = createSignal<SiteCursorMode>(readStored());

export { cursorMode };

export function bindCursorHost(fn: (mode: SiteCursorMode) => void): void {
  apply = fn;
}

export function setSiteCursors(mode: SiteCursorMode): void {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* ignore quota / private mode */
  }
  setCursorMode(mode);
  apply?.(mode);
}

export function readCursorMode(): SiteCursorMode {
  return cursorMode();
}
