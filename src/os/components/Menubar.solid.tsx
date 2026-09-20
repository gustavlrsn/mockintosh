import { appleMenu, runMenuItem, runRadioItem } from "../kernel/menus";
import { For, Show, createMemo } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { measureText, COMMAND_KEY, CHECK_MARK } from "@mockintosh/ui";
import { useOS } from "../context";
import {
  getMenubarMenus,
  getOpenMenuIndex,
  setOpenMenuIndex,
  getHighlightedMenuItem,
  setHighlightedMenuItem,
} from "../state";
import type { MenubarDefinition, MenubarItemDef, MenubarActionItem, MenubarRadioGroupDef } from "@mockintosh/sdk";

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------
const MENUBAR_H     = 20;
const ITEM_H        = 16;
const MENU_PADDING  = 4;
const SEPARATOR_H   = 8;
const LABEL_PAD     = 12;   // horizontal padding inside each menu title
const APPLE_W       = 24;   // Apple menu is wider than label alone
const MENU_FONT     = "menu";
const CHECK_COL_W   = 14;       // fixed column for the radio-group check mark so labels align

interface MenubarProps {
  height: number;
  menus: MenubarDefinition[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function menuTitleWidth(label: string): number {
  return measureText(label, MENU_FONT) + LABEL_PAD * 2;
}

function menuDropdownWidth(menu: MenubarDefinition): number {
  let max = 80;
  for (const item of menu.items) {
    if ("label" in item && item.label) {
      const w = measureText(item.label, MENU_FONT);
      const shortcut = "shortcut" in item ? (item as MenubarActionItem).shortcut : undefined;
      const sw = shortcut ? measureText(`${COMMAND_KEY}${shortcut}`, MENU_FONT) + 16 : 0;
      max = Math.max(max, w + sw + 32);
    } else if ((item as MenubarRadioGroupDef).type === "radiogroup") {
      for (const ri of (item as MenubarRadioGroupDef).items) {
        max = Math.max(max, CHECK_COL_W + measureText(ri.label, MENU_FONT) + 32);
      }
    }
  }
  return max;
}

function menuDropdownHeight(items: MenubarItemDef[]): number {
  let h = MENU_PADDING * 2;
  for (const item of items) {
    if ((item as any).type === "separator") {
      h += SEPARATOR_H;
    } else if ((item as MenubarRadioGroupDef).type === "radiogroup") {
      h += (item as MenubarRadioGroupDef).items.length * ITEM_H;
    } else {
      h += ITEM_H;
    }
  }
  return h;
}

/** Cumulative x positions of each menu title. */
function computeMenuXOffsets(menus: MenubarDefinition[]): number[] {
  const xs: number[] = [];
  let x = APPLE_W;
  for (const menu of menus) {
    xs.push(x);
    x += menuTitleWidth(menu.label);
  }
  return xs;
}

// ---------------------------------------------------------------------------
// Apple menu items (static — not part of the per-app menu set)
// ---------------------------------------------------------------------------

export function Menubar(props: MenubarProps): JSX.Element {
  const os = useOS();

  const menuXOffsets = createMemo(() => computeMenuXOffsets(props.menus));

  const openIdx   = () => getOpenMenuIndex();
  const openMenu  = () => {
    const idx = openIdx();
    if (idx === -1) return appleMenu(os);
    return idx !== null ? props.menus[idx] ?? null : null;
  };
  const openMenuX = () => openIdx() === -1 ? 0 : (openIdx() !== null ? menuXOffsets()[openIdx()!] : 0);

  function toggleMenu(idx: number) {
    setOpenMenuIndex(openIdx() === idx ? null : idx);
    setHighlightedMenuItem(null);
  }

  function closeMenu() {
    setOpenMenuIndex(null);
    setHighlightedMenuItem(null);
  }

  function runItem(item: MenubarActionItem) {
    closeMenu();
    if (!item.disabled && item.onClick) runMenuItem(item);
  }

  const appleSprite = os.sprites.get("eaten_apple");

  return (
    <box
      position="absolute"
      left={0}
      top={0}
      width={os.resolution.width}
      height={MENUBAR_H}
      background={0}
    >
      {/* Bottom border */}
      <box
        position="absolute"
        left={0}
        top={MENUBAR_H - 1}
        width={os.resolution.width}
        height={1}
        background={1}
      />

      {/* Apple menu */}
      <box
        position="absolute"
        left={0}
        top={0}
        width={APPLE_W}
        height={MENUBAR_H - 1}
        justifyContent="center"
        alignItems="center"
        background={openIdx() === -1 ? 1 : 0}
        semantic={{ name: "Apple", role: "menu" }}
        onClick={() => toggleMenu(-1)}
      >
        <Show
          when={appleSprite}
          fallback={
            <text font="menu" nowrap color={openIdx() === -1 ? 0 : 1} verticalAlign="middle">
              {"\uF8FF"}
            </text>
          }
        >
          {(s) => (
            <image
              width={s().width}
              height={s().height}
              src={{ width: s().width, height: s().height, data: s().data, mask: s().mask }}
              mode={openIdx() === -1 ? "inverted" : "normal"}
            />
          )}
        </Show>
      </box>

      {/* Menu titles */}
      <For each={props.menus}>
        {(menu, idx) => {
          const isOpen = () => openIdx() === idx();
          return (
            <box
              position="absolute"
              left={menuXOffsets()[idx()]}
              top={0}
              width={menuTitleWidth(menu.label)}
              height={MENUBAR_H - 1}
              justifyContent="center"
              background={isOpen() ? 1 : 0}
              semantic={{ name: menu.label, role: "menu" }}
              onClick={() => toggleMenu(idx())}
            >
              <text
                font={MENU_FONT}
                align="center"
                verticalAlign="middle"
                color={isOpen() ? 0 : 1}
                nowrap
              >
                {menu.label}
              </text>
            </box>
          );
        }}
      </For>

      {/* Open dropdown */}
      <Show when={openMenu() !== null && openIdx() !== null}>
        <MenuDropdown
          menu={openMenu()!}
          x={openMenuX()}
          onClose={closeMenu}
          onRun={runItem}
          screenWidth={os.resolution.width}
        />
      </Show>
    </box>
  );
}

// ---------------------------------------------------------------------------
// MenuDropdown
// ---------------------------------------------------------------------------

interface MenuDropdownProps {
  menu: MenubarDefinition;
  x: number;
  screenWidth: number;
  onClose: () => void;
  onRun: (item: MenubarActionItem) => void;
}

function MenuDropdown(props: MenuDropdownProps): JSX.Element {
  const w = menuDropdownWidth(props.menu);
  const h = menuDropdownHeight(props.menu.items);

  // Prevent dropdown from going off the right edge
  const left = Math.min(props.x, props.screenWidth - w - 4);

  const highlighted = getHighlightedMenuItem;

  let itemIndex = 0;
  const itemNodes: JSX.Element[] = [];

  let yOffset = MENU_PADDING;
  for (let i = 0; i < props.menu.items.length; i++) {
    const item = props.menu.items[i];
    const iSelf = i;

    if ((item as any).type === "separator") {
      itemNodes.push(
        <box
          position="absolute"
          left={1}
          top={yOffset + SEPARATOR_H / 2}
          width={w - 2}
          height={1}
          background={1}
        />
      );
      yOffset += SEPARATOR_H;
    } else if ((item as MenubarRadioGroupDef).type === "radiogroup") {
      const rg = item as MenubarRadioGroupDef;
      for (const ri of rg.items) {
        const riSelf = ri;
        const yTop = yOffset;
        const idxSelf = itemIndex++;
        const isHighlighted = () => highlighted() === idxSelf;
        itemNodes.push(
          <box
            position="absolute"
            left={0}
            top={yTop}
            width={w}
            height={ITEM_H}
            background={isHighlighted() ? 1 : 0}
            onMouseEnter={() => setHighlightedMenuItem(idxSelf)}
            onMouseLeave={() => setHighlightedMenuItem(null)}
            onClick={() => {
              props.onClose();
              runRadioItem(rg, riSelf.value);
            }}
          >
            <Show when={riSelf.value === rg.value}>
              <box position="absolute" left={8} top={0} width={CHECK_COL_W} height={ITEM_H} justifyContent="center">
                <text font={MENU_FONT} nowrap color={isHighlighted() ? 0 : 1} verticalAlign="middle">
                  {CHECK_MARK}
                </text>
              </box>
            </Show>
            <box
              position="absolute"
              left={8 + CHECK_COL_W}
              top={0}
              width={w - 16 - CHECK_COL_W}
              height={ITEM_H}
              justifyContent="center"
            >
              <text font={MENU_FONT} nowrap color={isHighlighted() ? 0 : 1} verticalAlign="middle">
                {riSelf.label}
              </text>
            </box>
          </box>
        );
        yOffset += ITEM_H;
      }
    } else {
      const ai = item as MenubarActionItem;
      const yTop = yOffset;
      const idxSelf = itemIndex++;
      const isHighlighted = () => highlighted() === idxSelf;
      itemNodes.push(
        <box
          position="absolute"
          left={0}
          top={yTop}
          width={w}
          height={ITEM_H}
          background={isHighlighted() && !ai.disabled ? 1 : 0}
          onMouseEnter={() => { if (!ai.disabled) setHighlightedMenuItem(idxSelf); }}
          onMouseLeave={() => setHighlightedMenuItem(null)}
          onClick={() => { if (!ai.disabled) props.onRun(ai); }}
        >
          <box position="absolute" left={8} top={0} width={w - 16} height={ITEM_H} justifyContent="center">
            <text font={MENU_FONT} nowrap color={isHighlighted() && !ai.disabled ? 0 : 1}
              stipple={ai.disabled} verticalAlign="middle">
              {ai.label}
            </text>
          </box>
          <Show when={ai.shortcut}>
            <box position="absolute" left={w - 40} top={0} width={36} height={ITEM_H} justifyContent="center">
              <text font={MENU_FONT} nowrap align="right" verticalAlign="middle"
                color={isHighlighted() && !ai.disabled ? 0 : 1}>
                {`${COMMAND_KEY}${ai.shortcut}`}
              </text>
            </box>
          </Show>
        </box>
      );
      yOffset += ITEM_H;
    }
  }

  return (
    <>
      {/* Background overlay to capture clicks outside the menu and close it */}
      <box
        position="absolute"
        left={0}
        top={0}
        width={10000}
        height={10000}
        onClick={() => props.onClose()}
      />

      {/* The dropdown box itself */}
      <box
        position="absolute"
        left={left}
        top={MENUBAR_H - 1}
        width={w}
        height={h}
        background={0}
        borderColor={1}
        borderWidth={1}
      >
        {itemNodes}
      </box>
    </>
  );
}
