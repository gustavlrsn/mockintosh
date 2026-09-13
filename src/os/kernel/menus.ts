import { ServiceError } from "./errors";
import type { MenubarActionItem, MenubarDefinition, MenubarRadioGroupDef } from "@mockintosh/sdk";
import { getMenubarMenus, setOpenMenuIndex, setHighlightedMenuItem } from "../state";
export function appleMenu(openApp: (id: string) => void): MenubarDefinition {
  return {
    label: "\uF8FF",
    items: [{
      label: "About Mockintosh",
      onClick: () => openApp("about")
    }, {
      type: "separator"
    }, {
      label: "Control Panel",
      onClick: () => openApp("control_panel")
    }, {
      label: "Terminal",
      onClick: () => openApp("terminal")
    }, {
      label: "Chooser",
      disabled: true
    }, {
      label: "Find File",
      disabled: true
    }, {
      label: "Scrapbook",
      disabled: true
    }, {
      type: "separator"
    }, {
      label: "Puzzle",
      disabled: true
    }]
  };
}
export function runMenuItem(item: MenubarActionItem) {
  if (item.disabled || !item.onClick) throw new ServiceError("permission", "Menu item is unavailable");
  setOpenMenuIndex(null);
  setHighlightedMenuItem(null);
  item.onClick();
}
export function runRadioItem(group: MenubarRadioGroupDef, value: string) {
  if (!group.items.some(item => item.value === value)) throw new ServiceError("invalid-argument", "Unknown menu value");
  setOpenMenuIndex(null);
  setHighlightedMenuItem(null);
  group.onValueChange(value);
}
export function menus(openApp: (id: string) => void) {
  return [appleMenu(openApp), ...getMenubarMenus()];
}
export function runNamedMenu(openApp: (id: string) => void, menu: string, label: string) {
  const matches = menus(openApp).filter(m => m.label === menu);
  if (matches.length !== 1) throw new ServiceError(matches.length ? "ambiguity" : "missing-resource", "Menu must match exactly once");
  const actions: (() => void)[] = [];
  for (const item of matches[0].items) {
    if ("label" in item && item.label === label) actions.push(() => runMenuItem(item as MenubarActionItem));
    if ("type" in item && item.type === "radiogroup") for (const option of item.items) if (option.label === label) actions.push(() => runRadioItem(item, option.value));
  }
  if (actions.length !== 1) throw new ServiceError(actions.length ? "ambiguity" : "missing-resource", "Menu item must match exactly once");
  actions[0]();
}
