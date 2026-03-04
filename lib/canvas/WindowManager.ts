import { BitCanvas, BLACK, WHITE } from "./BitCanvas";
import { AppContext } from "./AppContext";
import { drawBitmapText, measureText } from "./fontAdapter";
import { OSEvent } from "./EventManager";
import { SpriteRegistry } from "./SpriteRegistry";

export interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  contentHeight: number;
  scrollY: number;
  scrollX: number;
  contentWidth: number;
  active: boolean;
  appId: string;
  props: any;
  /** Whether the window shows a vertical scrollbar */
  scrollable: boolean;
  /** Whether the window can be resized via the grow box */
  resizable: boolean;
  /** Minimum window size (only relevant if resizable) */
  minWidth: number;
  minHeight: number;
  /** Whether to show the info bar below the title bar */
  infoBar?: string[];
}

export interface WindowManagerConfig {
  screenWidth: number;
  screenHeight: number;
  menubarHeight: number;
}

const TITLE_BAR_HEIGHT = 20;
const SCROLLBAR_WIDTH = 15;
const SHADOW_SIZE = 1;
const CLOSE_BOX_SIZE = 11;

export class WindowManager {
  windows: WindowState[] = [];
  private config: WindowManagerConfig;
  private dragging: {
    windowId: string;
    offsetX: number;
    offsetY: number;
  } | null = null;
  private scrollDragging: {
    windowId: string;
    startY: number;
    startScrollY: number;
  } | null = null;

  constructor(config: WindowManagerConfig) {
    this.config = config;
  }

  openWindow(
    win: Omit<WindowState, "active" | "scrollY"> & { scrollY?: number }
  ) {
    const existing = this.windows.find((w) => w.id === win.id);
    if (existing) {
      this.bringToFront(win.id);
      return;
    }
    this.windows.push({
      ...win,
      scrollY: win.scrollY ?? 0,
      active: true,
    });
    this._updateActive();
  }

  closeWindow(id: string) {
    this.windows = this.windows.filter((w) => w.id !== id);
    this._updateActive();
  }

  bringToFront(id: string) {
    const idx = this.windows.findIndex((w) => w.id === id);
    if (idx < 0 || idx === this.windows.length - 1) return;
    const [win] = this.windows.splice(idx, 1);
    this.windows.push(win);
    this._updateActive();
  }

  getActiveWindow(): WindowState | null {
    return this.windows.length ? this.windows[this.windows.length - 1] : null;
  }

  private _updateActive() {
    for (let i = 0; i < this.windows.length; i++) {
      this.windows[i].active = i === this.windows.length - 1;
    }
  }

  /** Hit-test: returns the window ID at (x, y), or null for desktop/menubar */
  hitTest(x: number, y: number): string | null {
    // Iterate from top (last) to bottom (first)
    for (let i = this.windows.length - 1; i >= 0; i--) {
      const w = this.windows[i];
      const totalW = w.width + SHADOW_SIZE;
      const totalH = w.height + TITLE_BAR_HEIGHT + SHADOW_SIZE;
      if (x >= w.x && x < w.x + totalW && y >= w.y && y < w.y + totalH) {
        return w.id;
      }
    }
    return null;
  }

  /** Check if a click is on the close box of a window */
  isCloseBoxClick(win: WindowState, x: number, y: number): boolean {
    const bx = win.x + 8;
    const by = win.y + (TITLE_BAR_HEIGHT - CLOSE_BOX_SIZE) / 2;
    return (
      x >= bx && x < bx + CLOSE_BOX_SIZE && y >= by && y < by + CLOSE_BOX_SIZE
    );
  }

  /** Check if a click is on the title bar (for dragging) */
  isTitleBarClick(win: WindowState, x: number, y: number): boolean {
    return (
      x >= win.x &&
      x < win.x + win.width &&
      y >= win.y &&
      y < win.y + TITLE_BAR_HEIGHT
    );
  }

  /** Check if click is on the scrollbar area */
  isScrollbarClick(win: WindowState, x: number, y: number): boolean {
    if (!win.scrollable) return false;
    const sbx = win.x + win.width - SCROLLBAR_WIDTH;
    const sby = win.y + TITLE_BAR_HEIGHT;
    return (
      x >= sbx && x < sbx + SCROLLBAR_WIDTH && y >= sby && y < sby + win.height
    );
  }

  /** Get the content area rect for a window (local to screen) */
  getContentRect(win: WindowState): {
    x: number;
    y: number;
    w: number;
    h: number;
  } {
    const sbW = win.scrollable ? SCROLLBAR_WIDTH : 0;
    return {
      x: win.x + 1,
      y: win.y + TITLE_BAR_HEIGHT,
      w: win.width - 2 - sbW,
      h: win.height,
    };
  }

  /** Create an AppContext for a window's content area */
  createAppContext(canvas: BitCanvas, win: WindowState): AppContext {
    const r = this.getContentRect(win);
    return new AppContext(canvas, r.x, r.y, r.w, r.h, win.scrollY);
  }

  /** Convert screen coordinates to content-local coordinates */
  toContentLocal(
    win: WindowState,
    x: number,
    y: number
  ): { x: number; y: number } {
    const r = this.getContentRect(win);
    return { x: x - r.x, y: y - r.y + win.scrollY };
  }

  // --- Input handling ---

  handleMouseDown(
    x: number,
    y: number
  ): { consumed: boolean; windowId?: string; contentEvent?: OSEvent } {
    const id = this.hitTest(x, y);
    if (!id) return { consumed: false };

    this.bringToFront(id);
    const win = this.windows.find((w) => w.id === id)!;

    if (this.isCloseBoxClick(win, x, y)) {
      this.closeWindow(id);
      return { consumed: true, windowId: id };
    }

    if (this.isTitleBarClick(win, x, y)) {
      this.dragging = { windowId: id, offsetX: x - win.x, offsetY: y - win.y };
      return { consumed: true, windowId: id };
    }

    if (this.isScrollbarClick(win, x, y)) {
      this._handleScrollClick(win, x, y);
      return { consumed: true, windowId: id };
    }

    // Content area click — forward to app
    const local = this.toContentLocal(win, x, y);
    return {
      consumed: true,
      windowId: id,
      contentEvent: { type: "mouseDown", x: local.x, y: local.y },
    };
  }

  handleMouseUp(
    x: number,
    y: number
  ): { consumed: boolean; windowId?: string; contentEvent?: OSEvent } {
    if (this.dragging) {
      this.dragging = null;
      return { consumed: true };
    }
    if (this.scrollDragging) {
      this.scrollDragging = null;
      return { consumed: true };
    }

    const id = this.hitTest(x, y);
    if (!id) return { consumed: false };
    const win = this.windows.find((w) => w.id === id)!;
    const local = this.toContentLocal(win, x, y);
    return {
      consumed: true,
      windowId: id,
      contentEvent: { type: "mouseUp", x: local.x, y: local.y },
    };
  }

  handleMouseMove(
    x: number,
    y: number
  ): { consumed: boolean; windowId?: string; contentEvent?: OSEvent } {
    if (this.dragging) {
      const win = this.windows.find((w) => w.id === this.dragging!.windowId);
      if (win) {
        win.x = x - this.dragging.offsetX;
        win.y = Math.max(this.config.menubarHeight, y - this.dragging.offsetY);
      }
      return { consumed: true };
    }

    if (this.scrollDragging) {
      const win = this.windows.find(
        (w) => w.id === this.scrollDragging!.windowId
      );
      if (win) {
        const trackH = win.height - 30; // minus arrows
        const maxScroll = Math.max(0, win.contentHeight - win.height);
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

    const id = this.hitTest(x, y);
    if (!id) return { consumed: false };
    const win = this.windows.find((w) => w.id === id)!;
    const local = this.toContentLocal(win, x, y);
    return {
      consumed: true,
      windowId: id,
      contentEvent: { type: "mouseMove", x: local.x, y: local.y },
    };
  }

  handleDoubleClick(
    x: number,
    y: number
  ): { consumed: boolean; windowId?: string; contentEvent?: OSEvent } {
    const id = this.hitTest(x, y);
    if (!id) return { consumed: false };
    const win = this.windows.find((w) => w.id === id)!;
    if (this.isTitleBarClick(win, x, y))
      return { consumed: true, windowId: id };
    const local = this.toContentLocal(win, x, y);
    return {
      consumed: true,
      windowId: id,
      contentEvent: { type: "doubleClick", x: local.x, y: local.y },
    };
  }

  private _handleScrollClick(win: WindowState, x: number, y: number) {
    const maxScroll = Math.max(0, win.contentHeight - win.height);
    const sbTop = win.y + TITLE_BAR_HEIGHT;
    const relY = y - sbTop;

    if (relY < 15) {
      // Up arrow
      win.scrollY = Math.max(0, win.scrollY - 12);
    } else if (relY > win.height - 15) {
      // Down arrow
      win.scrollY = Math.min(maxScroll, win.scrollY + 12);
    } else {
      // Track — start drag
      this.scrollDragging = {
        windowId: win.id,
        startY: y,
        startScrollY: win.scrollY,
      };
    }
  }

  // --- Rendering ---

  drawAllWindows(canvas: BitCanvas, sprites: SpriteRegistry) {
    for (const win of this.windows) {
      this.drawWindowChrome(canvas, win, sprites);
    }
  }

  drawWindowChrome(
    canvas: BitCanvas,
    win: WindowState,
    sprites: SpriteRegistry
  ) {
    const { x, y, width, title, active } = win;
    const totalHeight = TITLE_BAR_HEIGHT + win.height;

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

    // Title bar stripes (when active)
    if (active) {
      // Left stripes
      const closeBoxRight = x + 8 + CLOSE_BOX_SIZE + 2;
      const titleTextWidth = measureText(title, "ChiKareGo");
      const titleCenter = x + width / 2;
      const titleLeft = titleCenter - titleTextWidth / 2 - 4;
      const titleRight = titleCenter + titleTextWidth / 2 + 4;

      canvas.fillPattern(
        x + 1,
        y + 1,
        closeBoxRight - x - 2,
        TITLE_BAR_HEIGHT - 2,
        "stripes"
      );
      if (titleLeft > closeBoxRight + 2) {
        canvas.fillPattern(
          closeBoxRight + 1,
          y + 1,
          titleLeft - closeBoxRight - 2,
          TITLE_BAR_HEIGHT - 2,
          "stripes"
        );
      }
      // Right stripes
      if (titleRight < x + width - 2) {
        canvas.fillPattern(
          titleRight,
          y + 1,
          x + width - 1 - titleRight,
          TITLE_BAR_HEIGHT - 2,
          "stripes"
        );
      }
    }

    // Close box
    if (active) {
      const bx = x + 8;
      const by = y + (TITLE_BAR_HEIGHT - CLOSE_BOX_SIZE) / 2;
      canvas.fillRect(bx, by, CLOSE_BOX_SIZE, CLOSE_BOX_SIZE, WHITE);
      canvas.drawRect(bx, by, CLOSE_BOX_SIZE, CLOSE_BOX_SIZE, BLACK);
    }

    // Title text
    const titleW = measureText(title, "ChiKareGo");
    const titleX = x + Math.floor((width - titleW) / 2);
    const titleY = y + 2;
    // Clear area behind title text
    canvas.fillRect(titleX - 3, y + 1, titleW + 6, TITLE_BAR_HEIGHT - 2, WHITE);
    drawBitmapText(canvas, title, titleX, titleY, {
      font: "ChiKareGo",
      color: BLACK,
    });

    // Scrollbar
    if (win.scrollable) {
      this._drawScrollbar(canvas, win);
    }
  }

  private _drawScrollbar(canvas: BitCanvas, win: WindowState) {
    const sbx = win.x + win.width - SCROLLBAR_WIDTH - 1;
    const sby = win.y + TITLE_BAR_HEIGHT;
    const sbh = win.height;

    // Scrollbar border
    canvas.drawVLine(sbx, sby, sbh, BLACK);

    // Up arrow
    canvas.fillRect(sbx + 1, sby, SCROLLBAR_WIDTH - 1, 15, WHITE);
    canvas.drawHLine(sbx, sby + 14, SCROLLBAR_WIDTH, BLACK);
    // Simple up arrow glyph
    const arrowCx = sbx + 7;
    canvas.setPixel(arrowCx, sby + 4, BLACK);
    canvas.drawHLine(arrowCx - 1, sby + 5, 3, BLACK);
    canvas.drawHLine(arrowCx - 2, sby + 6, 5, BLACK);
    canvas.drawHLine(arrowCx - 3, sby + 7, 7, BLACK);

    // Down arrow
    const downTop = sby + sbh - 15;
    canvas.fillRect(sbx + 1, downTop, SCROLLBAR_WIDTH - 1, 15, WHITE);
    canvas.drawHLine(sbx, downTop, SCROLLBAR_WIDTH, BLACK);
    canvas.setPixel(arrowCx, downTop + 10, BLACK);
    canvas.drawHLine(arrowCx - 1, downTop + 9, 3, BLACK);
    canvas.drawHLine(arrowCx - 2, downTop + 8, 5, BLACK);
    canvas.drawHLine(arrowCx - 3, downTop + 7, 7, BLACK);

    // Track
    const trackTop = sby + 15;
    const trackHeight = sbh - 30;
    canvas.fillPattern(
      sbx + 1,
      trackTop,
      SCROLLBAR_WIDTH - 1,
      trackHeight,
      "gray50"
    );

    // Thumb
    if (win.contentHeight > win.height) {
      const maxScroll = win.contentHeight - win.height;
      const thumbH = Math.max(
        12,
        Math.floor((win.height / win.contentHeight) * trackHeight)
      );
      const thumbY =
        trackTop +
        Math.floor((win.scrollY / maxScroll) * (trackHeight - thumbH));
      canvas.fillRect(sbx + 1, thumbY, SCROLLBAR_WIDTH - 2, thumbH, WHITE);
      canvas.drawRect(sbx + 1, thumbY, SCROLLBAR_WIDTH - 2, thumbH, BLACK);
    }
  }
}

export { TITLE_BAR_HEIGHT, SCROLLBAR_WIDTH };
