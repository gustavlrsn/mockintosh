import { BitCanvas, BLACK, WHITE } from "../BitCanvas";
import { drawBitmapText, measureText } from "../fontAdapter";
import { SpriteRegistry } from "../SpriteRegistry";
import { HitRegionMap } from "../HitRegion";

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
  openWindowTitles: Set<string>;
}

const ICON_CELL_W = 84;
const ICON_CELL_H = 64;
const ICON_SIZE = 32;
const GRID_COLS = 6;

export function createDesktopState(icons: DesktopIcon[]): DesktopState {
  return {
    icons,
    selectedIndex: null,
    openWindowTitles: new Set(),
  };
}

export function drawDesktop(
  canvas: BitCanvas,
  state: DesktopState,
  sprites: SpriteRegistry,
  screenWidth: number,
  screenHeight: number,
  menubarHeight: number,
  hitRegions: HitRegionMap,
  callbacks: {
    onIconClick: (index: number) => void;
    onIconDoubleClick: (index: number) => void;
    onBackgroundClick: () => void;
  }
) {
  // Checkerboard background
  canvas.fillPattern(
    0,
    menubarHeight,
    screenWidth,
    screenHeight - menubarHeight,
    "checkers",
    0,
    0
  );

  // Desktop background: deselect on click (registered first = lowest z-order)
  hitRegions.add({
    id: "desktop-bg",
    x: 0,
    y: menubarHeight,
    w: screenWidth,
    h: screenHeight - menubarHeight,
    onMouseDown: () => callbacks.onBackgroundClick(),
  });

  for (let i = 0; i < state.icons.length; i++) {
    const icon = state.icons[i];
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);

    const cellX = screenWidth - (col + 1) * ICON_CELL_W;
    const cellY = menubarHeight + row * ICON_CELL_H + 8;

    const selected = state.selectedIndex === i;
    const isOpen = state.openWindowTitles.has(icon.title);

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

    const textW = measureText(icon.title, "Geneva9");
    const labelX = cellX + Math.floor((ICON_CELL_W - textW) / 2) - 2;
    const labelY = cellY + ICON_SIZE + 2;

    if (selected) {
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

    const iconIndex = i;
    hitRegions.add({
      id: `desktop-icon-${i}`,
      x: cellX,
      y: cellY,
      w: ICON_CELL_W,
      h: ICON_CELL_H,
      onMouseDown: () => callbacks.onIconClick(iconIndex),
      onDoubleClick: () => callbacks.onIconDoubleClick(iconIndex),
    });
  }
}
