import { BitCanvas, BLACK, WHITE } from "./BitCanvas";
import { AppContext } from "./AppContext";
import { drawBitmapText, measureText } from "./fontAdapter";
import { OSEvent } from "./EventManager";
import { SpriteRegistry } from "./SpriteRegistry";
import { HitRegionMap } from "./HitRegion";

// ---------------------------------------------------------------------------
// Window kind — Mac-aligned classification of every window
// ---------------------------------------------------------------------------

export type WindowKind =
  | "document" // primary document/app window (modeless, title bar, close + zoom)
  | "dialog" // modeless or movable-modal dialog (title bar, no zoom)
  | "alert" // strictly modal: no title bar, double-outline, on top of all
  | "utility" // floating palette: always above document windows
  | "desktop"; // Finder desktop (chromeless, below everything)

// ---------------------------------------------------------------------------
// FindWindow part codes — Mac-aligned hit-testing enum
// ---------------------------------------------------------------------------

export type WindowHitPart =
  | "inMenuBar"
  | "inDesktop"
  | "inWindowBackground"
  | "inDrag" // title bar / drag region
  | "inGoAway" // close box
  | "inZoom" // zoom box
  | "inGrow" // size box
  | "inVScroll" // vertical scroll bar (including arrows + track)
  | "inHScroll" // horizontal scroll bar
  | "inContent"; // window content area

export interface FindWindowResult {
  windowId: string | null;
  part: WindowHitPart;
}

// ---------------------------------------------------------------------------
// WindowState
// ---------------------------------------------------------------------------

export interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  contentHeight: number;
  contentWidth: number;
  scrollY: number;
  scrollX: number;
  active: boolean;
  appId: string;
  props: any;
  scrollable: boolean;
  resizable: boolean;
  minWidth: number;
  minHeight: number;
  infoBar?: string[];
  /** Window kind replaces the old ad-hoc `modal`/`chromeless` flags as the
   *  single source of truth for type. `modal` and `chromeless` are derived
   *  from `windowKind` at open time for backward-compatible fast reads. */
  windowKind: WindowKind;
  modal?: boolean;
  chromeless?: boolean;
  /** Application-defined standard bounds (for zoom box). Computed at open
   *  from the initial rect or app defaultSize; if absent defaults to gray
   *  region minus 3 px border. */
  standardBounds?: { x: number; y: number; width: number; height: number };
  /** Last user-defined bounds (position + size). Updated whenever the user
   *  moves or resizes the window. */
  userBounds?: { x: number; y: number; width: number; height: number };
  /** Screen rect of the icon this window was opened from (for close zoom
   *  animation). Stored at open time and never changed. */
  openedFromRect?: { x: number; y: number; width: number; height: number };
}

export interface WindowManagerConfig {
  screenWidth: number;
  screenHeight: number;
  menubarHeight: number;
  /** Callback fired when the active (frontmost) window changes.
   *  Enables caller to dispatch activate/deactivate events. */
  onActivateChange?: (previousId: string | null, newId: string | null) => void;
}

const TITLE_BAR_HEIGHT = 20;
const INFO_BAR_HEIGHT = 20;
/** 16px wide per Mac spec; rightmost pixel overlaps the window border */
const SCROLLBAR_WIDTH = 16;
const SHADOW_SIZE = 1;
const CLOSE_BOX_SIZE = 11;
const ZOOM_BOX_SIZE = 11;
/** 16×16 per Mac spec */
const GROW_BOX_SIZE = 16;

// ---------------------------------------------------------------------------
// WindowManager
// ---------------------------------------------------------------------------

export class WindowManager {
  windows: WindowState[] = [];
  private config: WindowManagerConfig;

  private dragging: {
    windowId: string;
    offsetX: number;
    offsetY: number;
    /** Prospective position updated on each mouse-move; applied on mouse-up */
    prospectiveX: number;
    prospectiveY: number;
  } | null = null;

  private resizing: {
    windowId: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    /** Prospective size updated on each mouse-move; applied on mouse-up */
    prospectiveWidth: number;
    prospectiveHeight: number;
  } | null = null;

  private scrollDragging: {
    windowId: string;
    startY: number;
    startScrollY: number;
  } | null = null;

  private hScrollDragging: {
    windowId: string;
    startX: number;
    startScrollX: number;
  } | null = null;

  /** Window whose zoom box is currently pressed (for highlight feedback) */
  private zoomBoxPressed: string | null = null;
  /** Window whose close box is currently pressed (for closing sprite feedback) */
  private closeBoxPressed: string | null = null;

  constructor(config: WindowManagerConfig) {
    this.config = config;
  }

  // ---------------------------------------------------------------------------
  // Helpers: derive chromeless / modal from windowKind
  // ---------------------------------------------------------------------------

  static isChromeless(kind: WindowKind): boolean {
    return kind === "alert" || kind === "desktop";
  }

  static isModal(kind: WindowKind): boolean {
    return kind === "alert";
  }

  // ---------------------------------------------------------------------------
  // Window list management
  // ---------------------------------------------------------------------------

  openWindow(
    win: Omit<WindowState, "active" | "scrollY" | "scrollX"> & {
      scrollY?: number;
      scrollX?: number;
    }
  ) {
    const existing = this.windows.find((w) => w.id === win.id);
    if (existing) {
      this.bringToFront(win.id);
      return;
    }

    // Derive convenience booleans from kind
    const chromeless =
      win.chromeless ?? WindowManager.isChromeless(win.windowKind);
    const modal = win.modal ?? WindowManager.isModal(win.windowKind);

    const newWin: WindowState = {
      ...win,
      scrollY: win.scrollY ?? 0,
      scrollX: win.scrollX ?? 0,
      active: true,
      chromeless,
      modal,
    };

    // Initialise userBounds from opening position/size
    newWin.userBounds = {
      x: newWin.x,
      y: newWin.y,
      width: newWin.width,
      height: newWin.height,
    };

    this._insertInLayerOrder(newWin);
    this._notifyActiveChange(() => this._updateActive());
  }

  /** Insert window respecting kind-based layering:
   *  desktop → document / dialog → utility → alert */
  private _insertInLayerOrder(win: WindowState) {
    if (win.windowKind === "desktop") {
      this.windows.unshift(win);
      return;
    }
    if (win.windowKind === "alert") {
      this.windows.push(win);
      return;
    }
    if (win.windowKind === "utility") {
      // Place utility above all documents/dialogs but below any alert
      const firstAlertIdx = this.windows.findIndex(
        (w) => w.windowKind === "alert"
      );
      if (firstAlertIdx >= 0) {
        this.windows.splice(firstAlertIdx, 0, win);
      } else {
        this.windows.push(win);
      }
      return;
    }
    // document / dialog: place above desktop but below utilities and alerts
    const firstUtilityOrAlert = this.windows.findIndex(
      (w) => w.windowKind === "utility" || w.windowKind === "alert"
    );
    if (firstUtilityOrAlert >= 0) {
      this.windows.splice(firstUtilityOrAlert, 0, win);
    } else {
      this.windows.push(win);
    }
  }

  closeWindow(id: string) {
    this.windows = this.windows.filter((w) => w.id !== id);
    this._notifyActiveChange(() => this._updateActive());
  }

  bringToFront(id: string) {
    if (this.hasModalWindow()) {
      const win = this.windows.find((w) => w.id === id);
      if (win && !win.modal) return;
    }
    const idx = this.windows.findIndex((w) => w.id === id);
    if (idx < 0) return;

    const win = this.windows[idx];

    // Remove the window from its current position
    this.windows.splice(idx, 1);

    // Find the highest index that is still within this window's tier
    // (i.e., the last window with the same or lower tier index)
    const tier = this._tierOf(win.windowKind);
    let insertAt = 0;
    for (let i = 0; i < this.windows.length; i++) {
      if (this._tierOf(this.windows[i].windowKind) <= tier) {
        insertAt = i + 1;
      }
    }
    this.windows.splice(insertAt, 0, win);

    this._notifyActiveChange(() => this._updateActive());
  }

  private _tierOf(kind: WindowKind): number {
    switch (kind) {
      case "desktop":
        return 0;
      case "document":
      case "dialog":
        return 1;
      case "utility":
        return 2;
      case "alert":
        return 3;
    }
  }

  hasModalWindow(): boolean {
    return this.windows.some((w) => w.modal);
  }

  getActiveWindow(): WindowState | null {
    // Active window = frontmost non-desktop window
    for (let i = this.windows.length - 1; i >= 0; i--) {
      if (this.windows[i].windowKind !== "desktop") {
        return this.windows[i];
      }
    }
    return null;
  }

  private _lastActiveId: string | null = null;

  private _updateActive() {
    const active = this.getActiveWindow();
    for (let i = 0; i < this.windows.length; i++) {
      this.windows[i].active =
        this.windows[i].windowKind !== "desktop" &&
        active !== null &&
        this.windows[i].id === active.id;
    }
  }

  private _notifyActiveChange(updateFn: () => void) {
    const prevId = this._lastActiveId;
    updateFn();
    const newActive = this.getActiveWindow();
    const newId = newActive?.id ?? null;
    if (newId !== prevId) {
      this._lastActiveId = newId;
      if (this.config.onActivateChange) {
        this.config.onActivateChange(prevId, newId);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Zoom box support
  // ---------------------------------------------------------------------------

  /** Maximum content size: desktop (gray region) minus 3 px on all sides.
   *  Used to clamp both initial open and resize so no window can exceed the
   *  available space (Mac: app/sizeRect set max; we enforce it system-wide). */
  private _maxContentSize(): { width: number; height: number } {
    return {
      width: this.config.screenWidth - 6,
      height: this.config.screenHeight - this.config.menubarHeight - 6,
    };
  }

  /** Compute the fallback standard bounds when the app does not specify one:
   *  desktop area (screenWidth × screenHeight - menubarHeight) minus 3 px on
   *  all sides, matching Mac WM behaviour. */
  private _defaultStandardBounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const max = this._maxContentSize();
    return {
      x: 3,
      y: this.config.menubarHeight + 3,
      width: max.width,
      height: max.height,
    };
  }

  /** Toggle the window between standard state and user state. Called by the
   *  zoom-box hit region on mouse-up while cursor is still in the box. */
  zoomWindow(win: WindowState) {
    const std = win.standardBounds ?? this._defaultStandardBounds();

    const isAtStandard =
      win.x === std.x &&
      win.y === std.y &&
      win.width === std.width &&
      win.height === std.height;

    if (isAtStandard) {
      // Zoom in → restore user state
      const user = win.userBounds ?? {
        x: win.x,
        y: win.y,
        width: win.width,
        height: win.height,
      };
      win.x = user.x;
      win.y = user.y;
      win.width = user.width;
      win.height = user.height;
    } else {
      // Zoom out → save user state and switch to standard
      win.userBounds = {
        x: win.x,
        y: win.y,
        width: win.width,
        height: win.height,
      };
      win.x = std.x;
      win.y = std.y;
      win.width = std.width;
      win.height = std.height;
    }
  }

  // ---------------------------------------------------------------------------
  // FindWindow
  // ---------------------------------------------------------------------------

  /** Given a point in global (screen) coordinates, return which window and
   *  which part of the UI it falls in — analogous to Mac FindWindow(pt). */
  findWindow(globalX: number, globalY: number): FindWindowResult {
    // Menu bar has already been drawn but we check it by y position
    if (globalY < this.config.menubarHeight) {
      return { windowId: null, part: "inMenuBar" };
    }

    // Check windows top-to-bottom (last in array = frontmost)
    for (let i = this.windows.length - 1; i >= 0; i--) {
      const win = this.windows[i];
      if (win.windowKind === "desktop") continue;

      const part = this._hitTestWindow(win, globalX, globalY);
      if (part !== null) {
        return { windowId: win.id, part };
      }
    }

    return { windowId: null, part: "inDesktop" };
  }

  private _hitTestWindow(
    win: WindowState,
    gx: number,
    gy: number
  ): WindowHitPart | null {
    if (win.chromeless) {
      const cr = this.getContentRect(win);
      if (gx >= cr.x && gx < cr.x + cr.w && gy >= cr.y && gy < cr.y + cr.h) {
        return "inContent";
      }
      return null;
    }

    const { x, y, width } = win;
    const headerH = this._headerHeight(win);
    const totalHeight = headerH + win.height;

    // Outside structure region entirely
    if (
      gx < x ||
      gx >= x + width + SHADOW_SIZE ||
      gy < y ||
      gy >= y + totalHeight + SHADOW_SIZE
    ) {
      return null;
    }

    // Zoom box (right of title bar, active only)
    if (win.active && gy >= y && gy < y + TITLE_BAR_HEIGHT) {
      const zbx = x + width - 8 - ZOOM_BOX_SIZE;
      const zby = y + (TITLE_BAR_HEIGHT - ZOOM_BOX_SIZE) / 2;
      if (gx >= zbx && gx < zbx + ZOOM_BOX_SIZE) {
        return "inZoom";
      }
    }

    // Close box (left of title bar, active only)
    if (win.active && gy >= y && gy < y + TITLE_BAR_HEIGHT) {
      const bx = x + 8;
      const by = y + (TITLE_BAR_HEIGHT - CLOSE_BOX_SIZE) / 2;
      if (gx >= bx && gx < bx + CLOSE_BOX_SIZE) {
        return "inGoAway";
      }
    }

    // Title bar drag
    if (gy >= y && gy < y + TITLE_BAR_HEIGHT) {
      return "inDrag";
    }

    // Grow box (resize handle)
    if (win.resizable) {
      const gbx = x + width - GROW_BOX_SIZE;
      const gby = y + headerH + win.height - GROW_BOX_SIZE;
      if (
        gx >= gbx &&
        gx < gbx + GROW_BOX_SIZE &&
        gy >= gby &&
        gy < gby + GROW_BOX_SIZE
      ) {
        return "inGrow";
      }
    }

    // Vertical scroll bar
    if (win.scrollable) {
      const sbx = x + width - SCROLLBAR_WIDTH - 1;
      const sby = y + headerH;
      const bodyH = this._bodyHeight(win);
      if (
        gx >= sbx &&
        gx < sbx + SCROLLBAR_WIDTH &&
        gy >= sby &&
        gy < sby + bodyH
      ) {
        return "inVScroll";
      }
    }

    // Horizontal scroll bar
    if (win.resizable) {
      const hsby = y + headerH + this._bodyHeight(win);
      const hsbh = SCROLLBAR_WIDTH;
      if (gy >= hsby && gy < hsby + hsbh) {
        return "inHScroll";
      }
    }

    // Content
    const cr = this.getContentRect(win);
    if (gx >= cr.x && gx < cr.x + cr.w && gy >= cr.y && gy < cr.y + cr.h) {
      return "inContent";
    }

    return "inWindowBackground";
  }

  // ---------------------------------------------------------------------------
  // Geometry helpers
  // ---------------------------------------------------------------------------

  private _headerHeight(win: WindowState): number {
    return TITLE_BAR_HEIGHT + (win.infoBar ? INFO_BAR_HEIGHT : 0);
  }

  private _bottomBarHeight(win: WindowState): number {
    return win.resizable ? SCROLLBAR_WIDTH : 0;
  }

  private _bodyHeight(win: WindowState): number {
    return win.height - this._bottomBarHeight(win);
  }

  getContentRect(win: WindowState): {
    x: number;
    y: number;
    w: number;
    h: number;
  } {
    if (win.chromeless) {
      return { x: win.x, y: win.y, w: win.width, h: win.height };
    }
    const sbW = win.scrollable ? SCROLLBAR_WIDTH : 0;
    const headerH = this._headerHeight(win);
    const bodyH = this._bodyHeight(win);
    return {
      x: win.x + 1,
      y: win.y + headerH,
      w: win.width - 2 - sbW,
      h: bodyH,
    };
  }

  createAppContext(
    canvas: BitCanvas,
    win: WindowState,
    hitRegions?: HitRegionMap
  ): AppContext {
    const r = this.getContentRect(win);
    const onStartResize = (
      startX: number,
      startY: number,
      startWidth: number,
      startHeight: number
    ) => {
      this.resizing = {
        windowId: win.id,
        startX,
        startY,
        startWidth,
        startHeight,
        prospectiveWidth: startWidth,
        prospectiveHeight: startHeight,
      };
    };
    return new AppContext(
      canvas,
      r.x,
      r.y,
      r.w,
      r.h,
      win.scrollY,
      win.scrollX,
      hitRegions,
      onStartResize,
      { width: win.minWidth, height: win.minHeight },
      { width: win.width, height: win.height }
    );
  }

  toContentLocal(
    win: WindowState,
    x: number,
    y: number
  ): { x: number; y: number } {
    const r = this.getContentRect(win);
    return { x: x - r.x + win.scrollX, y: y - r.y + win.scrollY };
  }

  // ---------------------------------------------------------------------------
  // Drag / resize mouse handling
  // ---------------------------------------------------------------------------

  handleMouseMove(
    x: number,
    y: number
  ): { consumed: boolean; windowId?: string; contentEvent?: OSEvent } {
    if (this.dragging) {
      const newX = x - this.dragging.offsetX;
      const newY = Math.max(
        this.config.menubarHeight,
        y - this.dragging.offsetY
      );
      this.dragging.prospectiveX = newX;
      this.dragging.prospectiveY = newY;
      return { consumed: true };
    }

    if (this.resizing) {
      const dx = x - this.resizing.startX;
      const dy = y - this.resizing.startY;
      const win = this.windows.find((w) => w.id === this.resizing!.windowId);
      const minW = win?.minWidth ?? 100;
      const minH = win?.minHeight ?? 60;
      const max = this._maxContentSize();
      this.resizing.prospectiveWidth = Math.max(
        minW,
        Math.min(max.width, this.resizing.startWidth + dx)
      );
      this.resizing.prospectiveHeight = Math.max(
        minH,
        Math.min(max.height, this.resizing.startHeight + dy)
      );
      return { consumed: true };
    }

    if (this.scrollDragging) {
      const win = this.windows.find(
        (w) => w.id === this.scrollDragging!.windowId
      );
      if (win) {
        const bodyH = this._bodyHeight(win);
        const trackH = bodyH - 30;
        const maxScroll = Math.max(0, win.contentHeight - bodyH);
        const delta = y - this.scrollDragging.startY;
        const scrollRatio = delta / Math.max(1, trackH);
        win.scrollY = Math.max(
          0,
          Math.min(
            maxScroll,
            this.scrollDragging.startScrollY + scrollRatio * maxScroll
          )
        );
      }
      return { consumed: true };
    }

    if (this.hScrollDragging) {
      const win = this.windows.find(
        (w) => w.id === this.hScrollDragging!.windowId
      );
      if (win) {
        const sbW = win.scrollable ? SCROLLBAR_WIDTH : 0;
        const trackW = win.width - GROW_BOX_SIZE - 30 - sbW;
        const contentW = win.width - 2 - sbW;
        const maxScrollX = Math.max(0, win.contentWidth - contentW);
        const delta = x - this.hScrollDragging.startX;
        const scrollRatio = delta / Math.max(1, trackW);
        win.scrollX = Math.max(
          0,
          Math.min(
            maxScrollX,
            this.hScrollDragging.startScrollX + scrollRatio * maxScrollX
          )
        );
      }
      return { consumed: true };
    }

    return { consumed: false };
  }

  handleMouseUp(): { consumed: boolean } {
    if (this.dragging) {
      // Apply prospective position on mouse-up (Mac DragWindow behaviour)
      const win = this.windows.find((w) => w.id === this.dragging!.windowId);
      if (win) {
        win.x = this.dragging.prospectiveX;
        win.y = this.dragging.prospectiveY;
        // Save new user bounds when user moves window
        win.userBounds = {
          x: win.x,
          y: win.y,
          width: win.width,
          height: win.height,
        };
      }
      this.dragging = null;
      return { consumed: true };
    }
    if (this.resizing) {
      // Apply prospective size on mouse-up (Mac grow-image behaviour)
      const win = this.windows.find((w) => w.id === this.resizing!.windowId);
      if (win) {
        win.width = this.resizing.prospectiveWidth;
        win.height = this.resizing.prospectiveHeight;
        // Save new user bounds when user resizes window
        win.userBounds = {
          x: win.x,
          y: win.y,
          width: win.width,
          height: win.height,
        };
      }
      this.resizing = null;
      return { consumed: true };
    }
    if (this.scrollDragging) {
      this.scrollDragging = null;
      return { consumed: true };
    }
    if (this.hScrollDragging) {
      this.hScrollDragging = null;
      return { consumed: true };
    }
    return { consumed: false };
  }

  isDraggingOrResizing(): boolean {
    return !!(
      this.dragging ||
      this.resizing ||
      this.scrollDragging ||
      this.hScrollDragging
    );
  }

  /** Expose current drag/resize prospective outline for the render loop. */
  getDragOutline(): {
    x: number;
    y: number;
    width: number;
    height: number;
    kind: "drag" | "resize";
    windowId: string;
  } | null {
    if (this.dragging) {
      const win = this.windows.find((w) => w.id === this.dragging!.windowId);
      if (!win) return null;
      const headerH = this._headerHeight(win);
      return {
        x: this.dragging.prospectiveX,
        y: this.dragging.prospectiveY,
        width: win.width,
        height: headerH + win.height,
        kind: "drag",
        windowId: win.id,
      };
    }
    if (this.resizing) {
      const win = this.windows.find((w) => w.id === this.resizing!.windowId);
      if (!win) return null;
      const headerH = this._headerHeight(win);
      return {
        x: win.x,
        y: win.y,
        width: this.resizing.prospectiveWidth,
        height: headerH + this.resizing.prospectiveHeight,
        kind: "resize",
        windowId: win.id,
      };
    }
    return null;
  }

  handleScroll(win: WindowState, deltaY: number) {
    const bodyH = this._bodyHeight(win);
    const maxScroll = Math.max(0, win.contentHeight - bodyH);
    win.scrollY = Math.max(0, Math.min(maxScroll, win.scrollY + deltaY));
  }

  handleHScroll(win: WindowState, deltaX: number) {
    const sbW = win.scrollable ? SCROLLBAR_WIDTH : 0;
    const contentW = win.width - 2 - sbW;
    const maxScrollX = Math.max(0, win.contentWidth - contentW);
    win.scrollX = Math.max(0, Math.min(maxScrollX, win.scrollX + deltaX));
  }

  // ---------------------------------------------------------------------------
  // Chrome rendering
  // ---------------------------------------------------------------------------

  drawWindowChrome(
    canvas: BitCanvas,
    win: WindowState,
    sprites: SpriteRegistry,
    hitRegions: HitRegionMap,
    callbacks: {
      onClose: (id: string) => void;
      onBringToFront: (id: string) => void;
      onContentEvent: (id: string, event: OSEvent) => void;
      onZoom: (id: string) => void;
      scheduleRender: () => void;
    }
  ) {
    const hasModal = this.hasModalWindow();
    const interactionBlocked = hasModal && !win.modal;

    if (win.chromeless) {
      const contentRect = this.getContentRect(win);
      if (!interactionBlocked) {
        if (win.modal) {
          hitRegions.add({
            id: `modal-scrim`,
            x: 0,
            y: 0,
            w: this.config.screenWidth,
            h: this.config.screenHeight,
            onMouseDown: () => {},
            onMouseUp: () => {},
          });
        }
        hitRegions.add({
          id: `win-content-${win.id}`,
          x: contentRect.x,
          y: contentRect.y,
          w: contentRect.w,
          h: contentRect.h,
          onMouseDown: (lx: number, ly: number) => {
            callbacks.onContentEvent(win.id, {
              type: "mouseDown",
              x: lx + win.scrollX,
              y: ly + win.scrollY,
            });
          },
          onMouseUp: (lx: number, ly: number) => {
            callbacks.onContentEvent(win.id, {
              type: "mouseUp",
              x: lx + win.scrollX,
              y: ly + win.scrollY,
            });
          },
          onDoubleClick: (lx: number, ly: number) => {
            callbacks.onContentEvent(win.id, {
              type: "doubleClick",
              x: lx + win.scrollX,
              y: ly + win.scrollY,
            });
          },
        });
      }
      return;
    }

    const { x, y, width, title, active } = win;
    const headerH = this._headerHeight(win);
    const totalHeight = headerH + win.height;

    // --- Register hit regions first, in z-order (lowest first) ---

    if (!interactionBlocked) {
      // Window background (catch-all, bring to front)
      hitRegions.add({
        id: `win-bg-${win.id}`,
        x: x,
        y: y,
        w: width + SHADOW_SIZE,
        h: totalHeight + SHADOW_SIZE,
        onMouseDown: () => {
          callbacks.onBringToFront(win.id);
        },
      });

      // Content area (dispatches events to apps)
      const contentRect = this.getContentRect(win);
      hitRegions.add({
        id: `win-content-${win.id}`,
        x: contentRect.x,
        y: contentRect.y,
        w: contentRect.w,
        h: contentRect.h,
        onMouseDown: (lx: number, ly: number) => {
          callbacks.onBringToFront(win.id);
          callbacks.onContentEvent(win.id, {
            type: "mouseDown",
            x: lx + win.scrollX,
            y: ly + win.scrollY,
          });
        },
        onMouseUp: (lx: number, ly: number) => {
          callbacks.onContentEvent(win.id, {
            type: "mouseUp",
            x: lx + win.scrollX,
            y: ly + win.scrollY,
          });
        },
        onDoubleClick: (lx: number, ly: number) => {
          callbacks.onContentEvent(win.id, {
            type: "doubleClick",
            x: lx + win.scrollX,
            y: ly + win.scrollY,
          });
        },
      });

      // Title bar drag region (on top of content)
      hitRegions.add({
        id: `win-titlebar-${win.id}`,
        x: x,
        y: y,
        w: width,
        h: TITLE_BAR_HEIGHT,
        onMouseDown: (lx: number, ly: number) => {
          callbacks.onBringToFront(win.id);
          this.dragging = {
            windowId: win.id,
            offsetX: lx,
            offsetY: ly,
            prospectiveX: win.x,
            prospectiveY: win.y,
          };
        },
      });
    }

    // --- Draw visuals ---

    // Drop shadow
    canvas.fillRect(
      x + SHADOW_SIZE,
      y + totalHeight,
      width,
      SHADOW_SIZE,
      BLACK
    );
    canvas.fillRect(
      x + width,
      y + SHADOW_SIZE,
      SHADOW_SIZE,
      totalHeight,
      BLACK
    );

    // Window background
    canvas.fillRect(x, y, width, totalHeight, WHITE);

    // Border
    canvas.drawRect(x, y, width, totalHeight, BLACK);

    // Title bar bottom border
    canvas.drawHLine(x, y + TITLE_BAR_HEIGHT - 1, width, BLACK);

    // Title text
    const titleW = measureText(title, "ChiKareGo");
    const titleX = x + Math.floor((width - titleW) / 2);
    const titleY = y + 3;

    if (active) {
      const stripeTop = y + 4;
      const stripeH = 11;
      canvas.fillPattern(x + 1, stripeTop, width - 2, stripeH, "stripes");

      // --- Close box ---
      const bx = x + 8;
      const by = y + (TITLE_BAR_HEIGHT - CLOSE_BOX_SIZE) / 2;
      // White clearing pad so sprite sits cleanly against title bar stripes
      canvas.fillRect(
        bx - 1,
        by - 1,
        CLOSE_BOX_SIZE + 2,
        CLOSE_BOX_SIZE + 2,
        WHITE
      );

      const isClosePressed = this.closeBoxPressed === win.id;
      const closeSprite = sprites.get(
        isClosePressed ? "chrome/closing" : "chrome/close"
      );
      if (closeSprite) {
        canvas.blit(closeSprite, bx, by);
      } else {
        canvas.drawRect(bx, by, CLOSE_BOX_SIZE, CLOSE_BOX_SIZE, BLACK);
      }

      if (!interactionBlocked) {
        hitRegions.add({
          id: `win-close-${win.id}`,
          x: bx,
          y: by,
          w: CLOSE_BOX_SIZE,
          h: CLOSE_BOX_SIZE,
          onMouseDown: () => {
            this.closeBoxPressed = win.id;
            callbacks.scheduleRender();
          },
          onMouseUp: (lx: number, ly: number) => {
            const stillInBox =
              lx >= 0 && lx < CLOSE_BOX_SIZE && ly >= 0 && ly < CLOSE_BOX_SIZE;
            this.closeBoxPressed = null;
            if (stillInBox) callbacks.onClose(win.id);
            else callbacks.scheduleRender();
          },
        });
      }

      // --- Zoom box (right side of title bar) ---
      const zbx = x + width - 8 - ZOOM_BOX_SIZE;
      const zby = y + (TITLE_BAR_HEIGHT - ZOOM_BOX_SIZE) / 2;
      const isZoomPressed = this.zoomBoxPressed === win.id;

      canvas.fillRect(
        zbx - 1,
        zby - 1,
        ZOOM_BOX_SIZE + 2,
        ZOOM_BOX_SIZE + 2,
        WHITE
      );
      const zoomSprite = sprites.get("chrome/zoom");
      if (zoomSprite) {
        canvas.blit(zoomSprite, zbx, zby);
      } else {
        canvas.drawRect(zbx, zby, ZOOM_BOX_SIZE, ZOOM_BOX_SIZE, BLACK);
      }

      if (isZoomPressed) {
        canvas.invertRect(
          zbx + 1,
          zby + 1,
          ZOOM_BOX_SIZE - 2,
          ZOOM_BOX_SIZE - 2
        );
      }

      if (!interactionBlocked) {
        hitRegions.add({
          id: `win-zoom-${win.id}`,
          x: zbx,
          y: zby,
          w: ZOOM_BOX_SIZE,
          h: ZOOM_BOX_SIZE,
          onMouseDown: () => {
            // Highlight on press
            this.zoomBoxPressed = win.id;
            callbacks.scheduleRender();
          },
          onMouseUp: (lx: number, ly: number) => {
            // Zoom fires on mouse-up while still in box (Mac behaviour)
            const stillInBox =
              lx >= 0 && lx < ZOOM_BOX_SIZE && ly >= 0 && ly < ZOOM_BOX_SIZE;
            this.zoomBoxPressed = null;
            if (stillInBox) {
              callbacks.onZoom(win.id);
            }
            callbacks.scheduleRender();
          },
        });
      }

      canvas.fillRect(
        titleX - 4,
        y + 1,
        titleW + 8,
        TITLE_BAR_HEIGHT - 2,
        WHITE
      );
    }

    drawBitmapText(canvas, title, titleX, titleY, {
      font: "ChiKareGo",
      color: BLACK,
    });

    // Info bar
    if (win.infoBar) {
      this._drawInfoBar(canvas, win);
    }

    // Vertical scrollbar
    if (win.scrollable) {
      this._drawScrollbar(canvas, win, sprites, hitRegions, callbacks);
    }

    // Horizontal scrollbar + grow box
    if (win.resizable) {
      this._drawHScrollbar(canvas, win, sprites, hitRegions, callbacks);
      this._drawGrowBox(canvas, win, sprites, hitRegions, callbacks);
    }
  }

  /** Draw the drag/resize outline on the canvas after all windows are drawn.
   *
   * Uses the same technique as the original Mac DragGrayRgn / notPatXor:
   * XOR a 50% gray pattern along the outline perimeter. This ensures the
   * outline is always visible regardless of what is underneath (checkerboard,
   * white, black) — any pixel touched is guaranteed to change, and drawing
   * twice restores the original pixels exactly. */
  drawDragOutline(canvas: BitCanvas) {
    const outline = this.getDragOutline();
    if (!outline) return;

    canvas.xorPatternRect(
      outline.x,
      outline.y,
      outline.width,
      outline.height,
      "darkCheckers"
    );
  }

  private _drawInfoBar(canvas: BitCanvas, win: WindowState) {
    const { x, y, width } = win;
    const infoY = y + TITLE_BAR_HEIGHT;
    const items = win.infoBar!;

    canvas.drawHLine(x, infoY + INFO_BAR_HEIGHT - 1, width, BLACK);

    if (items.length > 0) {
      const colW = Math.floor((width - 2) / items.length);
      for (let i = 0; i < items.length; i++) {
        const tw = measureText(items[i], "Geneva9");
        const tx = x + 1 + i * colW + Math.floor((colW - tw) / 2);
        drawBitmapText(canvas, items[i], tx, infoY + 4, {
          font: "Geneva9",
          color: BLACK,
        });
        if (i < items.length - 1) {
          canvas.drawVLine(
            x + 1 + (i + 1) * colW,
            infoY,
            INFO_BAR_HEIGHT - 1,
            BLACK
          );
        }
      }
    }
  }

  private _drawScrollbar(
    canvas: BitCanvas,
    win: WindowState,
    sprites: SpriteRegistry,
    hitRegions: HitRegionMap,
    callbacks: { scheduleRender: () => void }
  ) {
    const headerH = this._headerHeight(win);
    const bodyH = this._bodyHeight(win);

    // Right edge of scrollbar sits on the window's right border (1px overlap).
    // Top overlaps the title-bar bottom border by 1px (Mac convention).
    const sbx = win.x + win.width - SCROLLBAR_WIDTH;
    const sby = win.y + headerH - 1;
    const needsScroll = win.contentHeight > bodyH;

    // Vertical dividing line between content and scrollbar
    canvas.drawVLine(sbx, win.y + headerH, bodyH, BLACK);

    // Arrow sprites are 16×16; their outer border overlaps the window border
    const upSprite = sprites.get("chrome/up");
    if (upSprite) canvas.blit(upSprite, sbx, sby);

    // Down arrow: bottom edge shares the grow-box top border line
    const downTop = win.y + headerH + bodyH - SCROLLBAR_WIDTH + 1;
    const downSprite = sprites.get("chrome/down");
    if (downSprite) canvas.blit(downSprite, sbx, downTop);

    const trackTop = sby + SCROLLBAR_WIDTH;
    const trackHeight = downTop - trackTop;

    hitRegions.add({
      id: `win-scroll-up-${win.id}`,
      x: sbx,
      y: sby,
      w: SCROLLBAR_WIDTH,
      h: SCROLLBAR_WIDTH,
      onMouseDown: () => {
        win.scrollY = Math.max(0, win.scrollY - 12);
        callbacks.scheduleRender();
      },
    });

    hitRegions.add({
      id: `win-scroll-down-${win.id}`,
      x: sbx,
      y: downTop,
      w: SCROLLBAR_WIDTH,
      h: SCROLLBAR_WIDTH,
      onMouseDown: () => {
        const maxScroll = Math.max(0, win.contentHeight - bodyH);
        win.scrollY = Math.min(maxScroll, win.scrollY + 12);
        callbacks.scheduleRender();
      },
    });

    // Track
    if (needsScroll) {
      const trackSprite = sprites.get("scrollbar-bg");
      if (trackSprite) {
        canvas.fillSpriteTile(
          sbx + 1,
          trackTop,
          SCROLLBAR_WIDTH - 1,
          trackHeight,
          trackSprite
        );
      } else {
        canvas.fillPattern(
          sbx + 1,
          trackTop,
          SCROLLBAR_WIDTH - 1,
          trackHeight,
          "gray50"
        );
      }
      // Right border line (the scrollbar overlaps the window border, so we redraw it)
      canvas.drawVLine(sbx + SCROLLBAR_WIDTH - 1, trackTop, trackHeight, BLACK);

      const maxScroll = win.contentHeight - bodyH;
      const thumbH = Math.max(
        12,
        Math.floor((bodyH / win.contentHeight) * trackHeight)
      );
      const thumbY =
        trackTop +
        Math.floor((win.scrollY / maxScroll) * (trackHeight - thumbH));
      canvas.fillRect(sbx + 1, thumbY, SCROLLBAR_WIDTH - 2, thumbH, WHITE);
      canvas.drawRect(sbx + 1, thumbY, SCROLLBAR_WIDTH - 2, thumbH, BLACK);

      hitRegions.add({
        id: `win-scroll-track-${win.id}`,
        x: sbx,
        y: trackTop,
        w: SCROLLBAR_WIDTH,
        h: trackHeight,
        onMouseDown: (_lx: number, ly: number) => {
          this.scrollDragging = {
            windowId: win.id,
            startY: trackTop + ly,
            startScrollY: win.scrollY,
          };
        },
      });
    } else {
      canvas.fillRect(
        sbx + 1,
        trackTop,
        SCROLLBAR_WIDTH - 1,
        trackHeight,
        WHITE
      );
      canvas.drawVLine(sbx + SCROLLBAR_WIDTH - 1, trackTop, trackHeight, BLACK);
    }
  }

  private _drawHScrollbar(
    canvas: BitCanvas,
    win: WindowState,
    sprites: SpriteRegistry,
    hitRegions: HitRegionMap,
    callbacks: { scheduleRender: () => void }
  ) {
    const headerH = this._headerHeight(win);
    const bodyH = this._bodyHeight(win);

    // H-scrollbar top edge sits at the first row below the content area.
    // Its bottom edge overlaps the window's bottom border (1px overlap).
    const hsby = win.y + headerH + bodyH;
    const hsbx = win.x;
    const hsbw = win.width - GROW_BOX_SIZE;
    const sbW = win.scrollable ? SCROLLBAR_WIDTH : 0;
    const contentW = win.width - 1 - sbW;
    const needsScroll = win.contentWidth > contentW;

    // Horizontal dividing line between content and h-scrollbar (the top edge of the bar)
    canvas.drawHLine(win.x, hsby, win.width - GROW_BOX_SIZE, BLACK);

    // Arrow sprites are 16×16
    const leftSprite = sprites.get("chrome/left");
    if (leftSprite) canvas.blit(leftSprite, hsbx, hsby);

    const rightLeft = hsbx + hsbw - SCROLLBAR_WIDTH + 1;
    const rightSprite = sprites.get("chrome/right");
    if (rightSprite) canvas.blit(rightSprite, rightLeft, hsby);

    const trackLeft = hsbx + SCROLLBAR_WIDTH;
    const trackWidth = rightLeft - trackLeft;

    hitRegions.add({
      id: `win-hscroll-left-${win.id}`,
      x: hsbx,
      y: hsby,
      w: SCROLLBAR_WIDTH,
      h: SCROLLBAR_WIDTH,
      onMouseDown: () => {
        win.scrollX = Math.max(0, win.scrollX - 12);
        callbacks.scheduleRender();
      },
    });

    hitRegions.add({
      id: `win-hscroll-right-${win.id}`,
      x: rightLeft,
      y: hsby,
      w: SCROLLBAR_WIDTH,
      h: SCROLLBAR_WIDTH,
      onMouseDown: () => {
        const maxScrollX = Math.max(0, win.contentWidth - contentW);
        win.scrollX = Math.min(maxScrollX, win.scrollX + 12);
        callbacks.scheduleRender();
      },
    });

    if (needsScroll) {
      const trackSprite = sprites.get("scrollbar-bg");
      if (trackSprite) {
        canvas.fillSpriteTile(
          trackLeft,
          hsby + 1,
          trackWidth,
          SCROLLBAR_WIDTH - 2,
          trackSprite
        );
      } else {
        canvas.fillPattern(
          trackLeft,
          hsby + 1,
          trackWidth,
          SCROLLBAR_WIDTH - 2,
          "gray50"
        );
      }

      const maxScrollX = win.contentWidth - contentW;
      const thumbW = Math.max(
        12,
        Math.floor((contentW / win.contentWidth) * trackWidth)
      );
      const thumbX =
        trackLeft +
        Math.floor((win.scrollX / maxScrollX) * (trackWidth - thumbW));
      canvas.fillRect(thumbX, hsby + 1, thumbW, SCROLLBAR_WIDTH - 2, WHITE);
      canvas.drawRect(thumbX, hsby + 1, thumbW, SCROLLBAR_WIDTH - 2, BLACK);

      hitRegions.add({
        id: `win-hscroll-track-${win.id}`,
        x: trackLeft,
        y: hsby,
        w: trackWidth,
        h: SCROLLBAR_WIDTH,
        onMouseDown: (lx: number) => {
          this.hScrollDragging = {
            windowId: win.id,
            startX: trackLeft + lx,
            startScrollX: win.scrollX,
          };
        },
      });
    } else {
      canvas.fillRect(
        trackLeft,
        hsby + 1,
        trackWidth,
        SCROLLBAR_WIDTH - 2,
        WHITE
      );
    }
  }

  private _drawGrowBox(
    canvas: BitCanvas,
    win: WindowState,
    sprites: SpriteRegistry,
    hitRegions: HitRegionMap,
    _callbacks: { scheduleRender: () => void }
  ) {
    const headerH = this._headerHeight(win);
    // Grow box is 16×16, bottom-right corner; outer edge overlaps window borders
    const gbx = win.x + win.width - GROW_BOX_SIZE;
    const gby = win.y + headerH + win.height - GROW_BOX_SIZE;

    const resizeSprite = sprites.get("chrome/resize");
    if (resizeSprite) {
      canvas.blit(resizeSprite, gbx, gby);
    } else {
      canvas.fillRect(gbx, gby, GROW_BOX_SIZE, GROW_BOX_SIZE, WHITE);
      canvas.drawHLine(gbx, gby, GROW_BOX_SIZE, BLACK);
      canvas.drawVLine(gbx, gby, GROW_BOX_SIZE, BLACK);
    }

    hitRegions.add({
      id: `win-growbox-${win.id}`,
      x: gbx,
      y: gby,
      w: GROW_BOX_SIZE,
      h: GROW_BOX_SIZE,
      onMouseDown: (lx: number, ly: number) => {
        this.resizing = {
          windowId: win.id,
          startX: gbx + lx,
          startY: gby + ly,
          startWidth: win.width,
          startHeight: win.height,
          prospectiveWidth: win.width,
          prospectiveHeight: win.height,
        };
      },
    });
  }

  getScrollableBodyHeight(win: WindowState): number {
    return this._bodyHeight(win);
  }
}

export { TITLE_BAR_HEIGHT, SCROLLBAR_WIDTH, INFO_BAR_HEIGHT };
