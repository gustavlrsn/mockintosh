import { BitCanvas, BLACK, WHITE } from "./BitCanvas";
import { AppContext } from "./AppContext";
import { drawBitmapText, measureText } from "./fontAdapter";
import { OSEvent } from "./EventManager";
import { SpriteRegistry } from "./SpriteRegistry";
import { HitRegionMap } from "./HitRegion";

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
}

export interface WindowManagerConfig {
  screenWidth: number;
  screenHeight: number;
  menubarHeight: number;
}

const TITLE_BAR_HEIGHT = 20;
const INFO_BAR_HEIGHT = 20;
const SCROLLBAR_WIDTH = 15;
const SHADOW_SIZE = 1;
const CLOSE_BOX_SIZE = 11;
const GROW_BOX_SIZE = 15;

export class WindowManager {
  windows: WindowState[] = [];
  private config: WindowManagerConfig;
  private dragging: {
    windowId: string;
    offsetX: number;
    offsetY: number;
  } | null = null;
  private resizing: {
    windowId: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
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

  constructor(config: WindowManagerConfig) {
    this.config = config;
  }

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
    this.windows.push({
      ...win,
      scrollY: win.scrollY ?? 0,
      scrollX: win.scrollX ?? 0,
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
    return new AppContext(canvas, r.x, r.y, r.w, r.h, win.scrollY, hitRegions);
  }

  toContentLocal(
    win: WindowState,
    x: number,
    y: number
  ): { x: number; y: number } {
    const r = this.getContentRect(win);
    return { x: x - r.x, y: y - r.y + win.scrollY };
  }

  // --- Drag/resize handling (still needs imperative handling for continuous updates) ---

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

    if (this.resizing) {
      const win = this.windows.find((w) => w.id === this.resizing!.windowId);
      if (win) {
        const dx = x - this.resizing.startX;
        const dy = y - this.resizing.startY;
        win.width = Math.max(win.minWidth, this.resizing.startWidth + dx);
        win.height = Math.max(win.minHeight, this.resizing.startHeight + dy);
      }
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
      this.dragging = null;
      return { consumed: true };
    }
    if (this.resizing) {
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

  handleScroll(win: WindowState, deltaY: number) {
    const bodyH = this._bodyHeight(win);
    const maxScroll = Math.max(0, win.contentHeight - bodyH);
    win.scrollY = Math.max(0, Math.min(maxScroll, win.scrollY + deltaY));
  }

  // --- Rendering with hit regions ---

  drawWindowChrome(
    canvas: BitCanvas,
    win: WindowState,
    sprites: SpriteRegistry,
    hitRegions: HitRegionMap,
    callbacks: {
      onClose: (id: string) => void;
      onBringToFront: (id: string) => void;
      onContentEvent: (id: string, event: OSEvent) => void;
      scheduleRender: () => void;
    }
  ) {
    const { x, y, width, title, active } = win;
    const headerH = this._headerHeight(win);
    const totalHeight = headerH + win.height;

    // --- Register hit regions first, in z-order (lowest first) ---

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
          x: lx,
          y: ly + win.scrollY,
        });
      },
      onMouseUp: (lx: number, ly: number) => {
        callbacks.onContentEvent(win.id, {
          type: "mouseUp",
          x: lx,
          y: ly + win.scrollY,
        });
      },
      onDoubleClick: (lx: number, ly: number) => {
        callbacks.onContentEvent(win.id, {
          type: "doubleClick",
          x: lx,
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
        };
      },
    });

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

      const bx = x + 8;
      const by = y + (TITLE_BAR_HEIGHT - CLOSE_BOX_SIZE) / 2;
      canvas.fillRect(
        bx - 1,
        by - 1,
        CLOSE_BOX_SIZE + 2,
        CLOSE_BOX_SIZE + 2,
        WHITE
      );
      canvas.drawRect(bx, by, CLOSE_BOX_SIZE, CLOSE_BOX_SIZE, BLACK);

      // Close box hit region (highest z in title bar area)
      hitRegions.add({
        id: `win-close-${win.id}`,
        x: bx,
        y: by,
        w: CLOSE_BOX_SIZE,
        h: CLOSE_BOX_SIZE,
        onMouseDown: () => callbacks.onClose(win.id),
      });

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
      this._drawScrollbar(canvas, win, hitRegions, callbacks);
    }

    // Horizontal scrollbar + grow box
    if (win.resizable) {
      this._drawHScrollbar(canvas, win, hitRegions, callbacks);
      this._drawGrowBox(canvas, win, hitRegions, callbacks);
    }
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
    hitRegions: HitRegionMap,
    callbacks: { scheduleRender: () => void }
  ) {
    const headerH = this._headerHeight(win);
    const bodyH = this._bodyHeight(win);
    const sbx = win.x + win.width - SCROLLBAR_WIDTH - 1;
    const sby = win.y + headerH;
    const needsScroll = win.contentHeight > bodyH;

    canvas.drawVLine(sbx, sby, bodyH, BLACK);

    const trackTop = sby + 15;
    const trackHeight = bodyH - 30;

    // Up arrow
    canvas.fillRect(sbx + 1, sby, SCROLLBAR_WIDTH - 1, 15, WHITE);
    canvas.drawHLine(sbx, sby + 14, SCROLLBAR_WIDTH, BLACK);
    const arrowCx = sbx + 7;
    canvas.setPixel(arrowCx, sby + 4, BLACK);
    canvas.drawHLine(arrowCx - 1, sby + 5, 3, BLACK);
    canvas.drawHLine(arrowCx - 2, sby + 6, 5, BLACK);
    canvas.drawHLine(arrowCx - 3, sby + 7, 7, BLACK);

    hitRegions.add({
      id: `win-scroll-up-${win.id}`,
      x: sbx,
      y: sby,
      w: SCROLLBAR_WIDTH,
      h: 15,
      onMouseDown: () => {
        win.scrollY = Math.max(0, win.scrollY - 12);
        callbacks.scheduleRender();
      },
    });

    // Down arrow
    const downTop = sby + bodyH - 15;
    canvas.fillRect(sbx + 1, downTop, SCROLLBAR_WIDTH - 1, 15, WHITE);
    canvas.drawHLine(sbx, downTop, SCROLLBAR_WIDTH, BLACK);
    canvas.setPixel(arrowCx, downTop + 10, BLACK);
    canvas.drawHLine(arrowCx - 1, downTop + 9, 3, BLACK);
    canvas.drawHLine(arrowCx - 2, downTop + 8, 5, BLACK);
    canvas.drawHLine(arrowCx - 3, downTop + 7, 7, BLACK);

    hitRegions.add({
      id: `win-scroll-down-${win.id}`,
      x: sbx,
      y: downTop,
      w: SCROLLBAR_WIDTH,
      h: 15,
      onMouseDown: () => {
        const maxScroll = Math.max(0, win.contentHeight - bodyH);
        win.scrollY = Math.min(maxScroll, win.scrollY + 12);
        callbacks.scheduleRender();
      },
    });

    // Track
    if (needsScroll) {
      canvas.fillPattern(
        sbx + 1,
        trackTop,
        SCROLLBAR_WIDTH - 1,
        trackHeight,
        "gray50"
      );

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
    }
  }

  private _drawHScrollbar(
    canvas: BitCanvas,
    win: WindowState,
    hitRegions: HitRegionMap,
    callbacks: { scheduleRender: () => void }
  ) {
    const headerH = this._headerHeight(win);
    const bodyH = this._bodyHeight(win);
    const hsby = win.y + headerH + bodyH;
    const hsbx = win.x;
    const hsbw = win.width - GROW_BOX_SIZE;
    const sbW = win.scrollable ? SCROLLBAR_WIDTH : 0;
    const contentW = win.width - 2 - sbW;
    const needsScroll = win.contentWidth > contentW;

    canvas.drawHLine(hsbx, hsby, hsbw, BLACK);

    const trackLeft = hsbx + 15;
    const trackWidth = hsbw - 30;

    // Left arrow
    canvas.fillRect(hsbx + 1, hsby + 1, 14, SCROLLBAR_WIDTH - 2, WHITE);
    canvas.drawVLine(hsbx + 14, hsby, SCROLLBAR_WIDTH, BLACK);
    const arrowCy = hsby + 7;
    canvas.setPixel(hsbx + 4, arrowCy, BLACK);
    canvas.drawVLine(hsbx + 5, arrowCy - 1, 3, BLACK);
    canvas.drawVLine(hsbx + 6, arrowCy - 2, 5, BLACK);
    canvas.drawVLine(hsbx + 7, arrowCy - 3, 7, BLACK);

    hitRegions.add({
      id: `win-hscroll-left-${win.id}`,
      x: hsbx,
      y: hsby,
      w: 15,
      h: SCROLLBAR_WIDTH,
      onMouseDown: () => {
        win.scrollX = Math.max(0, win.scrollX - 12);
        callbacks.scheduleRender();
      },
    });

    // Right arrow
    const rightLeft = hsbx + hsbw - 15;
    canvas.fillRect(rightLeft + 1, hsby + 1, 14, SCROLLBAR_WIDTH - 2, WHITE);
    canvas.drawVLine(rightLeft, hsby, SCROLLBAR_WIDTH, BLACK);
    canvas.setPixel(rightLeft + 10, arrowCy, BLACK);
    canvas.drawVLine(rightLeft + 9, arrowCy - 1, 3, BLACK);
    canvas.drawVLine(rightLeft + 8, arrowCy - 2, 5, BLACK);
    canvas.drawVLine(rightLeft + 7, arrowCy - 3, 7, BLACK);

    hitRegions.add({
      id: `win-hscroll-right-${win.id}`,
      x: rightLeft,
      y: hsby,
      w: 15,
      h: SCROLLBAR_WIDTH,
      onMouseDown: () => {
        const maxScrollX = Math.max(0, win.contentWidth - contentW);
        win.scrollX = Math.min(maxScrollX, win.scrollX + 12);
        callbacks.scheduleRender();
      },
    });

    if (needsScroll) {
      canvas.fillPattern(
        trackLeft,
        hsby + 1,
        trackWidth,
        SCROLLBAR_WIDTH - 2,
        "gray50"
      );

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
    hitRegions: HitRegionMap,
    callbacks: { scheduleRender: () => void }
  ) {
    const headerH = this._headerHeight(win);
    const gbx = win.x + win.width - GROW_BOX_SIZE;
    const gby = win.y + headerH + win.height - GROW_BOX_SIZE;

    canvas.fillRect(gbx, gby, GROW_BOX_SIZE, GROW_BOX_SIZE, WHITE);
    canvas.drawHLine(gbx, gby, GROW_BOX_SIZE, BLACK);
    canvas.drawVLine(gbx, gby, GROW_BOX_SIZE, BLACK);
    canvas.drawRect(gbx + 2, gby + 6, 7, 7, BLACK);
    canvas.fillRect(gbx + 5, gby + 3, 7, 7, WHITE);
    canvas.drawRect(gbx + 5, gby + 3, 7, 7, BLACK);

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
        };
      },
    });
  }

  getScrollableBodyHeight(win: WindowState): number {
    return this._bodyHeight(win);
  }
}

export { TITLE_BAR_HEIGHT, SCROLLBAR_WIDTH, INFO_BAR_HEIGHT };
