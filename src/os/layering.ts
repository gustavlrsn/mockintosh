import type { OSWindow, OSWindowKind } from "./state";

const LAYER: Record<OSWindowKind, number> = {
  "finder-desktop": 0,
  document: 1,
  "finder-folder": 1,
  dialog: 1,
  utility: 2,
  presentation: 3,
  alert: 4,
};

export function windowLayer(kind: OSWindowKind): number {
  return LAYER[kind] ?? 1;
}

export function sortWindowsForPaint(windows: OSWindow[]): OSWindow[] {
  return windows
    .map((w, i) => ({ w, i }))
    .sort((a, b) => {
      const la = windowLayer(a.w.kind);
      const lb = windowLayer(b.w.kind);
      if (la !== lb) return la - lb;
      return a.i - b.i;
    })
    .map((x) => x.w);
}

export function isModalKind(kind: OSWindowKind): boolean {
  return kind === "alert";
}

export function hasModalFront(windows: OSWindow[]): boolean {
  return windows.some((w) => isModalKind(w.kind));
}

/** True if `win` must ignore input because a modal window is open above it. */
export function isBlockedByModal(win: OSWindow, windows: OSWindow[]): boolean {
  return !isModalKind(win.kind) && hasModalFront(windows);
}
