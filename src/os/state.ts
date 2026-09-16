/**
 * OS state as Solid signals — the single source of truth for the Solid OS.
 *
 * All window management, menubar state, and UI state lives here.
 * Components read from these signals reactively; mutations call the
 * helper functions below, which update the signals and automatically
 * schedule a repaint via the @mockintosh/ui renderer hook.
 */

import { createSignal, createStore, flush, getObserver, runWithOwner, type StoreSetter } from "solid-js";

/** `flush()` inside an effect apply is a no-op and logs; event-handler writes still need it. */
let flushing = false;
function flushIfIdle(): void {
  if (flushing || getObserver()) return;
  flushing = true;
  try {
    flush();
  } finally {
    flushing = false;
  }
}

function runHostWrite(write: () => void): void {
  runWithOwner(null, write);
}
import type { JSX } from "@mockintosh/ui";
import { isModalKind, sortWindowsForPaint, windowLayer } from "./layering";
import { windowDefinition, type OSWindowKind } from "./windowKinds";
import type { MenubarDefinition } from "@mockintosh/sdk";

export type { OSWindowKind } from "./windowKinds";

/** The app that owns the desktop and folder windows; active when nothing else is. */
export const FINDER_APP_ID = "finder";

// ---------------------------------------------------------------------------
// Window types
// ---------------------------------------------------------------------------

/** Content mounted in a window. Props are whatever the opener passed (`OSWindow.props`). */
export type WindowComponent = (props: Record<string, unknown>) => JSX.Element;

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The kind and bounds a window had before it went full screen. */
export interface WindowedState extends WindowBounds {
  kind: OSWindowKind;
}

export interface OSWindow {
  instanceId?: string;
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: OSWindowKind;
  /** Content to mount; the owning app's `Component` when absent. */
  Component?: WindowComponent;
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
  /**
   * @deprecated Prefer `WindowHeader`. Text items for the default 20px
   * header band when `headerHeight` is unset.
   */
  infoBar?: string[];
  /** Non-scrolling chrome below the title bar (app-filled via `WindowHeader`). */
  headerHeight?: number;
  /** Non-scrolling chrome below the scrollable body (`WindowFooter`). */
  footerHeight?: number;
  /**
   * Per-window menubar override. Most apps set menus once for the whole app
   * (`SolidApp.menus` / `setAppMenus`); a window sets its own only when its
   * menus depend on window state (e.g. Finder's current folder).
   */
  menus?: MenubarDefinition[];
  userBounds?: WindowBounds;
  standardBounds?: WindowBounds;
  /** Set while a window that was opened windowed is in full screen; what `setWindowFullScreen(id, false)` restores. */
  windowed?: WindowedState;
}

// ---------------------------------------------------------------------------
// Signals
// ---------------------------------------------------------------------------

/**
 * Windows are stored in a Solid *store* (not a plain signal) so that
 * `updateOSWindow` can mutate individual properties in-place via a draft setter.
 * This keeps the object reference for each window stable across updates,
 * which means Solid's `<For>` never destroys and recreates Window components
 * during a drag — preventing stale CanvasNode ids and reset drag offsets.
 */
const [_windowStore, _setWindowStoreRaw] = createStore<{ list: OSWindow[] }>({ list: [] });
const _setWindowStore: StoreSetter<{ list: OSWindow[] }> = (fn) => {
  // Window open/close runs from instance `createRoot`s and effect cleanups;
  // those writes are host mutations, not component-owned state.
  runHostWrite(() => { _setWindowStoreRaw(fn); });
};

export function getWindows(): OSWindow[] {
  return _windowStore.list as OSWindow[];
}

export const [getActiveWindowId, setActiveWindowId] = createSignal<string | null>(null, {
  ownedWrite: true,
});

// ---------------------------------------------------------------------------
// Apps and the menubar
//
// Windows belong to apps (`OSWindow.appId`). The *active app* is derived from
// the active window; the menubar shows that app's menus. Menus are owned by
// apps, not windows: `setAppMenus` registers an app's menubar, and a window
// may override it with `OSWindow.menus` when its menus depend on window state.
// ---------------------------------------------------------------------------

const [_appMenus, _setAppMenusRaw] = createStore<Record<string, MenubarDefinition[]>>({});

export function setAppMenus(appId: string, menus: MenubarDefinition[]): void {
  runHostWrite(() => {
    _setAppMenusRaw((s) => {
      s[appId] = menus;
    });
  });
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

/**
 * Whether the menubar is off screen: the frontmost non-modal window covers
 * the screen (Macintosh "special presentation mode"). Its menus still exist —
 * ⌘ shortcuts keep working — which is how an app offers the way back.
 */
export function isMenubarHidden(): boolean {
  const win = menubarWindow();
  return !!win && windowDefinition(win.kind).coversScreen;
}

export const [getOpenMenuIndex, setOpenMenuIndex] = createSignal<number | null>(null, {
  ownedWrite: true,
});
export const [getHighlightedMenuItem, setHighlightedMenuItem] = createSignal<number | null>(null, {
  ownedWrite: true,
});

export const [getSplashVisible, setSplashVisible] = createSignal(true, { ownedWrite: true });

/** XOR window drag/resize outline, in screen coordinates. */
export const [getWindowOutline, setWindowOutline] = createSignal<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null>(null, { ownedWrite: true });

// ---------------------------------------------------------------------------
// Window helpers
// ---------------------------------------------------------------------------

export function openOSWindow(win: OSWindow): void {
  _setWindowStore((s) => {
    // Remove any duplicate with the same id before adding
    const idx = s.list.findIndex((w) => w.id === win.id);
    if (idx >= 0) s.list.splice(idx, 1);
    s.list.push(win);
  });
  setActiveWindowId(win.id);
  flushIfIdle();
}

export function closeOSWindow(id: string): void {
  _setWindowStore((s) => {
    const idx = s.list.findIndex((w) => w.id === id);
    if (idx >= 0) s.list.splice(idx, 1);
  });
  setActiveWindowId((prev) => {
    if (prev !== id) return prev;
    const remaining = _windowStore.list.filter((w) => w.id !== id);
    return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
  });
  flushIfIdle();
}

/** Close every window — what shutting the machine down does. */
export function closeAllWindows(): void {
  _setWindowStore((s) => {
    s.list = [];
  });
  setActiveWindowId(null);
  flushIfIdle();
}

export function bringToFront(id: string): void {
  _setWindowStore((s) => {
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
  });
  setActiveWindowId(id);
  flushIfIdle();
}

/**
 * Update individual properties of a window in-place.
 * Draft setters keep the store proxy reference stable so that
 * `<For>` never recreates the Window component — critical for smooth dragging.
 */
export function updateOSWindow(id: string, updates: Partial<OSWindow>): void {
  _setWindowStore((s) => {
    const win = s.list.find((w) => w.id === id);
    if (win) Object.assign(win, updates);
  });
}

export function getActiveWindow(): OSWindow | undefined {
  const id = getActiveWindowId();
  return id ? _windowStore.list.find((w) => w.id === id) : undefined;
}

/**
 * Bounds of a window that covers the screen: `width` is the outer width and
 * `height` the content height, and a `fullscreen` window has no chrome, so
 * both are simply the screen's.
 */
export function fullScreenBounds(screen: { width: number; height: number }): WindowBounds {
  return { x: 0, y: 0, width: screen.width, height: screen.height };
}

/**
 * Switch a window into or out of full screen in place — the content stays
 * mounted, as when the zoom box toggles `standardBounds`. Entering remembers
 * the kind and bounds to come back to; leaving restores them. A window that
 * was opened as `fullscreen` has no windowed form and leaving is a no-op.
 */
export function setWindowFullScreen(
  id: string,
  on: boolean,
  screen: { width: number; height: number }
): void {
  const win = _windowStore.list.find((w) => w.id === id);
  if (!win) return;
  const isFullScreen = windowDefinition(win.kind).coversScreen;
  if (on && !isFullScreen) {
    updateOSWindow(id, {
      windowed: { kind: win.kind, x: win.x, y: win.y, width: win.width, height: win.height },
      kind: "fullscreen",
      ...fullScreenBounds(screen),
    });
    bringToFront(id);
  } else if (!on && isFullScreen && win.windowed) {
    updateOSWindow(id, { ...win.windowed, windowed: undefined });
  }
}
