/**
 * OS state as Solid signals — the single source of truth for the Solid OS.
 *
 * All window management, menubar state, and UI state lives here.
 * Components read from these signals reactively; mutations call the
 * helper functions below, which update the signals and automatically
 * schedule a repaint via the @mockintosh/ui renderer hook.
 */

import { createSignal } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { isModalKind, sortWindowsForPaint, windowLayer } from "./layering";
import type { MenubarDefinition } from "@mockintosh/sdk";

/** The app that owns the desktop and folder windows; active when nothing else is. */
export const FINDER_APP_ID = "finder";

// ---------------------------------------------------------------------------
// Window types
// ---------------------------------------------------------------------------

export type OSWindowKind =
  | "finder-desktop"
  | "finder-folder"
  | "document"
  | "dialog"
  | "alert"
  | "utility"
  | "presentation";

export interface OSWindow {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: OSWindowKind;
  props: Record<string, unknown>;
  scrollY: number;
  scrollX: number;
  contentHeight: number;
  contentWidth: number;
  scrollable: boolean;
  resizable: boolean;
  /** Minimum content width when resizing (default 100). */
  minWidth?: number;
  /** Minimum content height when resizing (default 60). */
  minHeight?: number;
  /** Screen rect of the icon this window was opened from (for close zoom). */
  openedFromRect?: { x: number; y: number; width: number; height: number };
  /** Optional info bar items (shown below title bar). */
  infoBar?: string[];
  /** Height of fixed non-scrolling strip at the top of content. */
  contentTopInset?: number;
  /**
   * Per-window menubar override. Most apps set menus once for the whole app
   * (`SolidApp.menus` / `setAppMenus`); a window sets its own only when its
   * menus depend on window state (e.g. Finder's current folder).
   */
  menus?: MenubarDefinition[];
  userBounds?: { x: number; y: number; width: number; height: number };
  standardBounds?: { x: number; y: number; width: number; height: number };
}

// ---------------------------------------------------------------------------
// Signals
// ---------------------------------------------------------------------------

/**
 * Windows are stored in a Solid *store* (not a plain signal) so that
 * `updateOSWindow` can mutate individual properties in-place via `produce`.
 * This keeps the object reference for each window stable across updates,
 * which means Solid's `<For>` never destroys and recreates Window components
 * during a drag — preventing stale CanvasNode ids and reset drag offsets.
 */
const [_windowStore, _setWindowStore] = createStore<{ list: OSWindow[] }>({ list: [] });

export function getWindows(): OSWindow[] {
  return _windowStore.list as OSWindow[];
}

export const [getActiveWindowId, setActiveWindowId] = createSignal<string | null>(null);

// ---------------------------------------------------------------------------
// Apps and the menubar
//
// Windows belong to apps (`OSWindow.appId`). The *active app* is derived from
// the active window; the menubar shows that app's menus. Menus are owned by
// apps, not windows: `setAppMenus` registers an app's menubar, and a window
// may override it with `OSWindow.menus` when its menus depend on window state.
// ---------------------------------------------------------------------------

const [_appMenus, _setAppMenus] = createStore<Record<string, MenubarDefinition[]>>({});

export function setAppMenus(appId: string, menus: MenubarDefinition[]): void {
  _setAppMenus(appId, menus);
}

export function getAppMenus(appId: string): MenubarDefinition[] | undefined {
  return _appMenus[appId];
}

/**
 * The window that determines the menubar: the active window, unless it is a
 * system-modal alert, in which case the frontmost non-modal window (alerts
 * borrow the menubar of whatever they interrupted). Undefined means the
 * Finder desktop.
 */
function menubarWindow(): OSWindow | undefined {
  const active = getActiveWindow();
  if (active && !isModalKind(active.kind)) return active;
  const stack = sortWindowsForPaint(_windowStore.list as OSWindow[]);
  for (let i = stack.length - 1; i >= 0; i--) {
    if (!isModalKind(stack[i].kind)) return stack[i];
  }
  return undefined;
}

/** The app whose menus the menubar shows; the Finder when no window is open. */
export function getActiveAppId(): string {
  return menubarWindow()?.appId ?? FINDER_APP_ID;
}

/** Menus currently shown in the menubar (derived; reactive). */
export function getMenubarMenus(): MenubarDefinition[] {
  const win = menubarWindow();
  return win?.menus ?? getAppMenus(win?.appId ?? FINDER_APP_ID) ?? [];
}

export const [getOpenMenuIndex, setOpenMenuIndex] = createSignal<number | null>(null);
export const [getHighlightedMenuItem, setHighlightedMenuItem] = createSignal<number | null>(null);

export const [getSplashVisible, setSplashVisible] = createSignal(true);

/** XOR window drag/resize outline, in screen coordinates. */
export const [getWindowOutline, setWindowOutline] = createSignal<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null>(null);

// ---------------------------------------------------------------------------
// Window helpers
// ---------------------------------------------------------------------------

export function openOSWindow(win: OSWindow): void {
  _setWindowStore(produce((s) => {
    // Remove any duplicate with the same id before adding
    const idx = s.list.findIndex((w) => w.id === win.id);
    if (idx >= 0) s.list.splice(idx, 1);
    s.list.push(win);
  }));
  setActiveWindowId(win.id);
}

export function closeOSWindow(id: string): void {
  _setWindowStore(produce((s) => {
    const idx = s.list.findIndex((w) => w.id === id);
    if (idx >= 0) s.list.splice(idx, 1);
  }));
  setActiveWindowId((prev) => {
    if (prev !== id) return prev;
    const remaining = _windowStore.list.filter(
      (w) => w.id !== id && w.kind !== "finder-desktop"
    );
    return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
  });
}

export function bringToFront(id: string): void {
  _setWindowStore(produce((s) => {
    const idx = s.list.findIndex((w) => w.id === id);
    if (idx < 0) return;
    const win = s.list[idx];
    const layer = windowLayer(win.kind);
    // Insert after the last window of the same or lower layer.
    s.list.splice(idx, 1);
    let insertAt = s.list.length;
    for (let i = s.list.length - 1; i >= 0; i--) {
      if (windowLayer(s.list[i].kind) <= layer) {
        insertAt = i + 1;
        break;
      }
      insertAt = i;
    }
    s.list.splice(insertAt, 0, win);
  }));
  setActiveWindowId(id);
}

/**
 * Update individual properties of a window in-place.
 * Using `produce` keeps the store proxy reference stable so that
 * `<For>` never recreates the Window component — critical for smooth dragging.
 */
export function updateOSWindow(id: string, updates: Partial<OSWindow>): void {
  _setWindowStore(produce((s) => {
    const win = s.list.find((w) => w.id === id);
    if (win) Object.assign(win, updates);
  }));
}

export function getActiveWindow(): OSWindow | undefined {
  const id = getActiveWindowId();
  return id ? _windowStore.list.find((w) => w.id === id) : undefined;
}
