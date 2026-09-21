import { createSignal } from "@mockintosh/ui";
import { hostPresentsCursor, type CursorPresentation } from "@mockintosh/ui/web";

const KEY = "mockintosh-ui-cursors";

export type SiteCursorMode = Extract<CursorPresentation, "css" | "mac">;

let apply: ((mode: CursorPresentation) => void) | undefined;

function readStored(): SiteCursorMode {
  try {
    return localStorage.getItem(KEY) === "css" ? "css" : "mac";
  } catch {
    return "mac";
  }
}

const [cursorMode, setCursorMode] = createSignal<SiteCursorMode>(readStored());

export { cursorMode };

function presentable(mode: SiteCursorMode): CursorPresentation {
  return hostPresentsCursor() ? mode : "none";
}

export function bindCursorHost(fn: (mode: CursorPresentation) => void): void {
  apply = fn;
  if (typeof matchMedia !== "function") return;
  const mq = matchMedia("(hover: hover) and (pointer: fine)");
  mq.addEventListener("change", () => apply?.(presentable(cursorMode())));
}

export function setSiteCursors(mode: SiteCursorMode): void {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* ignore quota / private mode */
  }
  setCursorMode(mode);
  apply?.(presentable(mode));
}

export function readCursorMode(): CursorPresentation {
  return presentable(cursorMode());
}
