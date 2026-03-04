import { BitCanvas, BLACK, WHITE, Sprite } from "../BitCanvas";
import { drawBitmapText, measureText, getLineHeight } from "../fontAdapter";
import { SpriteRegistry } from "../SpriteRegistry";
import { OSEvent } from "../EventManager";

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

export function createMenubarState(menus: MenubarDefinition[]): MenubarState {
  return { menus, openMenuIndex: null, highlightedItem: null };
}

function getMenuX(state: MenubarState, index: number): number {
  let x = 28; // after apple icon
  for (let i = 0; i < index; i++) {
    x += measureText(state.menus[i].label, "ChiKareGo") + 14;
  }
  return x;
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

function flattenItems(menu: MenubarDefinition): Array<{ label: string; disabled?: boolean; shortcut?: string; isRadio?: boolean; radioChecked?: boolean; isSeparator?: boolean; onClick?: () => void }> {
  const flat: any[] = [];
  for (const item of menu.items) {
    if ("type" in item && item.type === "separator") {
      flat.push({ isSeparator: true });
    } else if ("type" in item && item.type === "radiogroup") {
      const rg = item as MenubarRadioGroupDef;
      for (const ri of rg.items) {
        flat.push({
          label: ri.label,
          disabled: ri.disabled,
          isRadio: true,
          radioChecked: rg.value === ri.label,
          onClick: () => rg.onValueChange(ri.label),
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
  screenWidth: number
) {
  // Background
  canvas.fillRect(0, 0, screenWidth, MENUBAR_HEIGHT, WHITE);
  canvas.drawHLine(0, MENUBAR_HEIGHT - 1, screenWidth, BLACK);

  // Apple icon
  if (appleSprite) {
    canvas.blit(appleSprite, 10, 4);
  }

  // Menu labels
  let x = 28;
  for (let i = 0; i < state.menus.length; i++) {
    const menu = state.menus[i];
    const textW = measureText(menu.label, "ChiKareGo");
    const isOpen = state.openMenuIndex === i;

    if (isOpen) {
      canvas.fillRect(x - 5, 0, textW + 14, MENUBAR_HEIGHT - 1, BLACK);
      drawBitmapText(canvas, menu.label, x, 2, { font: "ChiKareGo", color: WHITE });
    } else {
      drawBitmapText(canvas, menu.label, x, 2, { font: "ChiKareGo", color: BLACK });
    }
    x += textW + 14;
  }

  // Draw open dropdown
  if (state.openMenuIndex !== null) {
    const menu = state.menus[state.openMenuIndex];
    const mx = getMenuX(state, state.openMenuIndex);
    const mw = getMenuWidth(menu);
    const items = flattenItems(menu);
    const mh = items.reduce((h, it) => h + (it.isSeparator ? SEPARATOR_HEIGHT : ITEM_HEIGHT), 0) + 2;

    // Shadow
    canvas.fillRect(mx + 1, MENUBAR_HEIGHT + mh, mw, 1, BLACK);
    canvas.fillRect(mx + mw, MENUBAR_HEIGHT + 1, 1, mh, BLACK);

    // Background
    canvas.fillRect(mx, MENUBAR_HEIGHT, mw, mh, WHITE);
    canvas.drawRect(mx, MENUBAR_HEIGHT, mw, mh, BLACK);
    canvas.drawHLine(mx, MENUBAR_HEIGHT, mw, WHITE); // erase top border to merge with menubar

    let iy = MENUBAR_HEIGHT + 1;
    for (let j = 0; j < items.length; j++) {
      const it = items[j];
      if (it.isSeparator) {
        canvas.drawDottedHLine(mx + 1, iy + SEPARATOR_HEIGHT / 2, mw - 2, BLACK);
        iy += SEPARATOR_HEIGHT;
        continue;
      }

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
        drawBitmapText(canvas, it.shortcut, mx + mw - MENU_PADDING - sw - 2, iy, {
          font: "ChiKareGo",
          color: textColor,
          height: ITEM_HEIGHT,
        });
      }

      if (it.isRadio && it.radioChecked) {
        // Draw a bullet/diamond indicator
        const bx = mx + MENU_PADDING + 4;
        const by = iy + 6;
        canvas.setPixel(bx, by, textColor);
        canvas.drawHLine(bx - 1, by + 1, 3, textColor);
        canvas.setPixel(bx, by + 2, textColor);
      }

      if (it.disabled && !highlighted) {
        canvas.fillPattern(mx + 1, iy, mw - 2, ITEM_HEIGHT, "gray50");
      }

      iy += ITEM_HEIGHT;
    }
  }
}

export function menubarHitTest(
  state: MenubarState,
  x: number,
  y: number,
  screenWidth: number
): { type: "label"; index: number } | { type: "item"; index: number } | { type: "outside" } | { type: "menubar" } {
  // In the menubar area
  if (y < MENUBAR_HEIGHT) {
    let lx = 28;
    for (let i = 0; i < state.menus.length; i++) {
      const w = measureText(state.menus[i].label, "ChiKareGo") + 14;
      if (x >= lx - 5 && x < lx + w - 5) {
        return { type: "label", index: i };
      }
      lx += w;
    }
    return { type: "menubar" };
  }

  // In the dropdown area
  if (state.openMenuIndex !== null) {
    const menu = state.menus[state.openMenuIndex];
    const mx = getMenuX(state, state.openMenuIndex);
    const mw = getMenuWidth(menu);
    const items = flattenItems(menu);
    let iy = MENUBAR_HEIGHT + 1;
    for (let j = 0; j < items.length; j++) {
      const it = items[j];
      const ih = it.isSeparator ? SEPARATOR_HEIGHT : ITEM_HEIGHT;
      if (x >= mx && x < mx + mw && y >= iy && y < iy + ih) {
        if (!it.isSeparator) return { type: "item", index: j };
      }
      iy += ih;
    }
  }

  return { type: "outside" };
}

export function handleMenubarEvent(
  state: MenubarState,
  event: OSEvent,
  screenWidth: number
): { handled: boolean; action?: () => void; stateChanged: boolean } {
  if (event.type === "mouseDown" || event.type === "mouseMove") {
    const hit = menubarHitTest(state, event.x!, event.y!, screenWidth);

    if (hit.type === "label") {
      const changed = state.openMenuIndex !== hit.index;
      if (event.type === "mouseDown" && state.openMenuIndex === hit.index) {
        state.openMenuIndex = null;
        state.highlightedItem = null;
        return { handled: true, stateChanged: true };
      }
      state.openMenuIndex = hit.index;
      state.highlightedItem = null;
      return { handled: true, stateChanged: changed };
    }

    if (hit.type === "item" && state.openMenuIndex !== null) {
      const changed = state.highlightedItem !== hit.index;
      state.highlightedItem = hit.index;
      return { handled: true, stateChanged: changed };
    }

    if (event.type === "mouseDown" && hit.type === "outside") {
      if (state.openMenuIndex !== null) {
        state.openMenuIndex = null;
        state.highlightedItem = null;
        return { handled: true, stateChanged: true };
      }
    }

    if (hit.type === "menubar") {
      if (state.openMenuIndex !== null) {
        state.highlightedItem = null;
        return { handled: true, stateChanged: true };
      }
    }
  }

  if (event.type === "mouseUp" && state.openMenuIndex !== null && state.highlightedItem !== null) {
    const menu = state.menus[state.openMenuIndex];
    const items = flattenItems(menu);
    const item = items[state.highlightedItem];
    state.openMenuIndex = null;
    state.highlightedItem = null;
    if (item && !item.disabled && !item.isSeparator && item.onClick) {
      return { handled: true, action: item.onClick, stateChanged: true };
    }
    return { handled: true, stateChanged: true };
  }

  return { handled: false, stateChanged: false };
}

export { MENUBAR_HEIGHT };
