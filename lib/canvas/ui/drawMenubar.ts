import { BitCanvas, BLACK, WHITE, Sprite } from "../BitCanvas";
import { drawBitmapText, measureText } from "../fontAdapter";
import { HitRegionMap } from "../HitRegion";

export interface MenubarDefinition {
  label: string;
  items: MenubarItemDef[];
}

export type MenubarItemDef =
  | MenubarActionItem
  | MenubarRadioGroupDef
  | { type: "separator" };

export interface MenubarActionItem {
  type?: "action";
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export interface MenubarRadioGroupDef {
  type: "radiogroup";
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string; disabled?: boolean }[];
}

export interface MenubarState {
  menus: MenubarDefinition[];
  openMenuIndex: number | null;
  highlightedItem: number | null;
}

const MENUBAR_HEIGHT = 20;
const ITEM_HEIGHT = 16;
const MENU_PADDING = 4;
const SEPARATOR_HEIGHT = 8;

const APPLE_MENU_WIDTH = 24;

export function createMenubarState(menus: MenubarDefinition[]): MenubarState {
  return { menus, openMenuIndex: null, highlightedItem: null };
}

function isAppleMenu(label: string): boolean {
  return label === "\uF8FF";
}

function getMenuWidth(menu: MenubarDefinition): number {
  let maxW = 0;
  for (const item of menu.items) {
    if ("type" in item && item.type === "separator") continue;
    if ("type" in item && item.type === "radiogroup") {
      for (const ri of item.items) {
        maxW = Math.max(maxW, measureText(ri.label, "ChiKareGo") + 24);
      }
    } else {
      const ai = item as MenubarActionItem;
      let w = measureText(ai.label, "ChiKareGo") + 12;
      if (ai.shortcut) w += measureText(ai.shortcut, "ChiKareGo") + 20;
      maxW = Math.max(maxW, w);
    }
  }
  return Math.max(maxW + MENU_PADDING * 2, 100);
}

interface FlatItem {
  label: string;
  disabled?: boolean;
  shortcut?: string;
  isRadio?: boolean;
  radioChecked?: boolean;
  isSeparator?: boolean;
  onClick?: () => void;
}

function flattenItems(menu: MenubarDefinition): FlatItem[] {
  const flat: FlatItem[] = [];
  for (const item of menu.items) {
    if ("type" in item && item.type === "separator") {
      flat.push({ label: "", isSeparator: true });
    } else if ("type" in item && item.type === "radiogroup") {
      const rg = item as MenubarRadioGroupDef;
      for (const ri of rg.items) {
        flat.push({
          label: ri.label,
          disabled: ri.disabled,
          isRadio: true,
          radioChecked: rg.value === ri.value,
          onClick: () => rg.onValueChange(ri.value),
        });
      }
    } else {
      const ai = item as MenubarActionItem;
      flat.push({
        label: ai.label,
        disabled: ai.disabled,
        shortcut: ai.shortcut,
        onClick: ai.onClick,
      });
    }
  }
  return flat;
}

export function drawMenubar(
  canvas: BitCanvas,
  state: MenubarState,
  appleSprite: Sprite | undefined,
  screenWidth: number,
  hitRegions: HitRegionMap,
  scheduleRender: () => void
) {
  // Background
  canvas.fillRect(0, 0, screenWidth, MENUBAR_HEIGHT, WHITE);
  canvas.drawHLine(0, MENUBAR_HEIGHT - 1, screenWidth, BLACK);

  // Apple icon
  if (appleSprite) {
    canvas.blit(appleSprite, 10, 4);
  }

  // Menubar background region (lowest z-order — catches clicks in empty menubar area)
  hitRegions.add({
    id: "menubar-bg",
    x: 0,
    y: 0,
    w: screenWidth,
    h: MENUBAR_HEIGHT,
    onMouseDown: () => {
      if (state.openMenuIndex !== null) {
        state.openMenuIndex = null;
        state.highlightedItem = null;
        scheduleRender();
      }
    },
    onMouseEnter: () => {
      if (state.openMenuIndex !== null && state.highlightedItem !== null) {
        state.highlightedItem = null;
        scheduleRender();
      }
    },
  });

  // Menu labels
  const hasAppleMenu =
    state.menus.length > 0 && isAppleMenu(state.menus[0].label);
  let x = APPLE_MENU_WIDTH + 8;

  for (let i = 0; i < state.menus.length; i++) {
    const menuIndex = i;
    const menu = state.menus[i];
    const isOpen = state.openMenuIndex === i;

    if (i === 0 && hasAppleMenu) {
      if (isOpen) {
        canvas.fillRect(4, 0, APPLE_MENU_WIDTH, MENUBAR_HEIGHT - 1, BLACK);
        if (appleSprite) {
          canvas.blitInverted(appleSprite, 10, 4);
        }
      }
      hitRegions.add({
        id: `menubar-label-${i}`,
        x: 4,
        y: 0,
        w: APPLE_MENU_WIDTH,
        h: MENUBAR_HEIGHT,
        onMouseDown: () => {
          if (state.openMenuIndex === menuIndex) {
            state.openMenuIndex = null;
            state.highlightedItem = null;
          } else {
            state.openMenuIndex = menuIndex;
            state.highlightedItem = null;
          }
          scheduleRender();
        },
        onMouseEnter: () => {
          if (
            state.openMenuIndex !== null &&
            state.openMenuIndex !== menuIndex
          ) {
            state.openMenuIndex = menuIndex;
            state.highlightedItem = null;
            scheduleRender();
          }
        },
      });
      continue;
    }

    const textW = measureText(menu.label, "ChiKareGo");
    const labelX = x - 5;
    const labelW = textW + 14;

    if (isOpen) {
      canvas.fillRect(labelX, 0, labelW, MENUBAR_HEIGHT - 1, BLACK);
      drawBitmapText(canvas, menu.label, x, 2, {
        font: "ChiKareGo",
        color: WHITE,
      });
    } else {
      drawBitmapText(canvas, menu.label, x, 2, {
        font: "ChiKareGo",
        color: BLACK,
      });
    }

    hitRegions.add({
      id: `menubar-label-${i}`,
      x: labelX,
      y: 0,
      w: labelW,
      h: MENUBAR_HEIGHT,
      onMouseDown: () => {
        if (state.openMenuIndex === menuIndex) {
          state.openMenuIndex = null;
          state.highlightedItem = null;
        } else {
          state.openMenuIndex = menuIndex;
          state.highlightedItem = null;
        }
        scheduleRender();
      },
      onMouseEnter: () => {
        if (state.openMenuIndex !== null && state.openMenuIndex !== menuIndex) {
          state.openMenuIndex = menuIndex;
          state.highlightedItem = null;
          scheduleRender();
        }
      },
    });

    x += textW + 14;
  }

  // Draw open dropdown and register item regions
  if (state.openMenuIndex !== null) {
    const menu = state.menus[state.openMenuIndex];
    const mx = _getMenuX(state, state.openMenuIndex, hasAppleMenu);
    const mw = getMenuWidth(menu);
    const items = flattenItems(menu);
    const mh =
      items.reduce(
        (h, it) => h + (it.isSeparator ? SEPARATOR_HEIGHT : ITEM_HEIGHT),
        0
      ) + 2;

    // Shadow
    canvas.fillRect(mx + 1, MENUBAR_HEIGHT + mh, mw, 1, BLACK);
    canvas.fillRect(mx + mw, MENUBAR_HEIGHT + 1, 1, mh, BLACK);

    // Background
    canvas.fillRect(mx, MENUBAR_HEIGHT, mw, mh, WHITE);
    canvas.drawRect(mx, MENUBAR_HEIGHT, mw, mh, BLACK);
    canvas.drawHLine(mx, MENUBAR_HEIGHT, mw, WHITE);

    // Dropdown background (lowest z-order within dropdown — registered before items)
    hitRegions.add({
      id: "menubar-dropdown-bg",
      x: mx,
      y: MENUBAR_HEIGHT,
      w: mw,
      h: mh,
    });

    let iy = MENUBAR_HEIGHT + 1;
    for (let j = 0; j < items.length; j++) {
      const it = items[j];
      if (it.isSeparator) {
        canvas.drawDottedHLine(
          mx + 1,
          iy + SEPARATOR_HEIGHT / 2,
          mw - 2,
          BLACK
        );
        iy += SEPARATOR_HEIGHT;
        continue;
      }

      const itemIndex = j;
      const highlighted = state.highlightedItem === j && !it.disabled;
      if (highlighted) {
        canvas.fillRect(mx + 1, iy, mw - 2, ITEM_HEIGHT, BLACK);
      }

      const textColor = highlighted ? WHITE : BLACK;
      const textX = mx + MENU_PADDING + (it.isRadio ? 16 : 0);
      drawBitmapText(canvas, it.label, textX, iy, {
        font: "ChiKareGo",
        color: textColor,
        height: ITEM_HEIGHT,
      });

      if (it.shortcut) {
        const sw = measureText(it.shortcut, "ChiKareGo");
        drawBitmapText(
          canvas,
          it.shortcut,
          mx + mw - MENU_PADDING - sw - 2,
          iy,
          {
            font: "ChiKareGo",
            color: textColor,
            height: ITEM_HEIGHT,
          }
        );
      }

      if (it.isRadio && it.radioChecked) {
        const bx = mx + MENU_PADDING + 4;
        const by = iy + 6;
        canvas.setPixel(bx, by, textColor);
        canvas.drawHLine(bx - 1, by + 1, 3, textColor);
        canvas.setPixel(bx, by + 2, textColor);
      }

      if (it.disabled && !highlighted) {
        canvas.maskPattern(mx + 1, iy, mw - 2, ITEM_HEIGHT, "gray50");
      }

      hitRegions.add({
        id: `menubar-item-${j}`,
        x: mx,
        y: iy,
        w: mw,
        h: ITEM_HEIGHT,
        onMouseEnter: () => {
          if (state.highlightedItem !== itemIndex) {
            state.highlightedItem = itemIndex;
            scheduleRender();
          }
        },
        onMouseUp: () => {
          if (!it.disabled && it.onClick) {
            state.openMenuIndex = null;
            state.highlightedItem = null;
            it.onClick();
            scheduleRender();
          }
        },
      });

      iy += ITEM_HEIGHT;
    }
  }
}

function _getMenuX(
  state: MenubarState,
  index: number,
  hasAppleMenu: boolean
): number {
  let x = APPLE_MENU_WIDTH + 8;
  for (let i = 0; i < index; i++) {
    if (i === 0 && hasAppleMenu) continue;
    x += measureText(state.menus[i].label, "ChiKareGo") + 14;
  }
  if (index === 0 && hasAppleMenu) {
    return 6;
  }
  return x;
}

export { MENUBAR_HEIGHT };
