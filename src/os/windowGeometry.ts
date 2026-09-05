/**
 * Window chrome geometry — the single source of truth for frame, title bar,
 * info bar and scrollbar metrics.
 *
 * Model: `win.x / win.y / win.width` and `windowTotalHeight()` describe the
 * OUTER frame. The body box draws the 1px frame as its border and every other
 * chrome element is laid out in the frame's interior; `@mockintosh/ui` insets
 * children by the border and clips them to it, so nothing inside a window can
 * ever paint over its frame.
 *
 * Classic Mac scrollbars and the grow box are 16px bands that *include* the
 * frame line they sit against, so their 16px sprites are placed on the last
 * interior column/row and get clipped by the frame.
 */

import type { OSWindow } from "./state";

export const FRAME       = 1;    // window frame line
export const TITLE_BAR_H = 20;   // outer: top frame + stripes + separator line
export const INFO_BAR_H  = 20;   // includes its bottom separator line
export const SB_W        = 16;   // scrollbar band, including the frame line it shares
export const SHADOW      = 1;
export const CLOSE_SIZE  = 11;
export const ZOOM_SIZE   = 11;
export const GROW_SIZE   = 16;

/** Scrollbar / grow-box footprint inside the frame. */
export const SB_INNER = SB_W - FRAME;

export interface ScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function hasInfoBar(win: OSWindow): boolean {
  return !!win.infoBar && win.infoBar.length > 0;
}

/** Outer height of the header (title bar + optional info bar). */
export function windowHeaderHeight(win: OSWindow): number {
  return TITLE_BAR_H + (hasInfoBar(win) ? INFO_BAR_H : 0);
}

/** Outer frame height. */
export function windowTotalHeight(win: OSWindow): number {
  return windowHeaderHeight(win) + win.height + (win.scrollable ? SB_W : FRAME);
}

/** Width available to the window's content component. */
export function windowContentWidth(win: OSWindow): number {
  const reserved = win.scrollable || win.resizable ? SB_INNER : 0;
  return win.width - 2 * FRAME - reserved;
}

/**
 * Screen-space rectangle of the content viewport (inside the frame, below the
 * header, left of the scrollbar). Content coordinate (0,0) maps to (x, y) at
 * scroll offset 0.
 */
export function windowContentRect(win: OSWindow): ScreenRect {
  return {
    x: win.x + FRAME,
    y: win.y + windowHeaderHeight(win),
    width: windowContentWidth(win),
    height: win.height,
  };
}
