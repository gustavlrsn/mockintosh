import { BitCanvas, BLACK, WHITE, Sprite } from "../BitCanvas";
import { drawBitmapText, measureText } from "../fontAdapter";
import { SpriteRegistry } from "../SpriteRegistry";

export interface DesktopIcon {
  title: string;
  img: string;
  type: string;
  payload?: any;
  menubar?: any;
  defaultPosition?: { x: number; y: number };
}

export interface DesktopState {
  icons: DesktopIcon[];
  selectedIndex: number | null;
  /** Set of window IDs that are currently open, used for shadow-outline on icons */
  openWindowTitles: Set<string>;
}

const ICON_CELL_W = 84;
const ICON_CELL_H = 64;
const ICON_SIZE = 32;
const GRID_COLS = 6;
const GRID_ROWS = 5;

export function createDesktopState(icons: DesktopIcon[]): DesktopState {
  return {
    icons,
    selectedIndex: null,
    openWindowTitles: new Set(),
  };
}

/**
 * Draw the desktop background (checkerboard) and icons.
 */
export function drawDesktop(
  canvas: BitCanvas,
  state: DesktopState,
  sprites: SpriteRegistry,
  screenWidth: number,
  screenHeight: number,
  menubarHeight: number
) {
  // Checkerboard background
  canvas.fillPattern(0, menubarHeight, screenWidth, screenHeight - menubarHeight, "checkers");

  // Draw icons right-to-left, top-to-bottom (RTL grid like the original Mac)
  for (let i = 0; i < state.icons.length; i++) {
    const icon = state.icons[i];
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);

    // RTL: rightmost column first
    const cellX = screenWidth - (col + 1) * ICON_CELL_W;
    const cellY = menubarHeight + row * ICON_CELL_H + 8;

    const selected = state.selectedIndex === i;
    const isOpen = state.openWindowTitles.has(icon.title);

    // Icon sprite
    const sprite = sprites.get(icon.img);
    if (sprite) {
      const ix = cellX + Math.floor((ICON_CELL_W - ICON_SIZE) / 2);
      const iy = cellY;

      if (isOpen) {
        canvas.blitShadowOutline(sprite, ix, iy);
      } else if (selected) {
        canvas.blitInverted(sprite, ix, iy);
      } else {
        canvas.blit(sprite, ix, iy);
      }
    }

    // Label
    const textW = measureText(icon.title, "Geneva9");
    const labelX = cellX + Math.floor((ICON_CELL_W - textW) / 2) - 2;
    const labelY = cellY + ICON_SIZE + 2;

    if (selected) {
      // Inverted label
      drawBitmapText(canvas, icon.title, labelX, labelY, {
        font: "Geneva9",
        color: WHITE,
        bg: BLACK,
        width: textW + 4,
        align: "center",
      });
    } else {
      drawBitmapText(canvas, icon.title, labelX, labelY, {
        font: "Geneva9",
        color: BLACK,
        bg: WHITE,
        width: textW + 4,
        align: "center",
      });
    }
  }
}

/**
 * Hit-test desktop icons. Returns the icon index or -1.
 */
export function desktopHitTest(
  state: DesktopState,
  x: number,
  y: number,
  screenWidth: number,
  menubarHeight: number
): number {
  for (let i = 0; i < state.icons.length; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const cellX = screenWidth - (col + 1) * ICON_CELL_W;
    const cellY = menubarHeight + row * ICON_CELL_H + 8;

    if (
      x >= cellX && x < cellX + ICON_CELL_W &&
      y >= cellY && y < cellY + ICON_CELL_H
    ) {
      return i;
    }
  }
  return -1;
}
