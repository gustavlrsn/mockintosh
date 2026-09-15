import { ServiceError } from "./errors";
import type { MenubarActionItem, MenubarDefinition, MenubarRadioGroupDef } from "@mockintosh/sdk";
import type { OSServices } from "../context";
import { FINDER_APP_ID, getActiveAppId, getMenubarMenus, setOpenMenuIndex, setHighlightedMenuItem } from "../state";
import { getApp } from "../apps";
import { openAppAboutBox } from "../components/AppAboutBox.solid";
import { openAboutBox } from "../../../apps/finder/AboutBox";
import { openControlPanel } from "../../../apps/finder/ControlPanel";

/** The Apple menu's title: the Apple logo glyph. */
export const APPLE_MENU_LABEL = "\uF8FF";

/** The Finder's About item; the About box it opens is a Finder window. */
export const ABOUT_THIS_MACINTOSH_LABEL = "About This Macintosh…";

/**
 * The first Apple-menu item belongs to the frontmost application: "About
 * <app>…", or "About This Macintosh…" when that is the Finder. It is never
 * disabled — an app that declares no `about` gets the standard OS box.
 */
export function aboutMenuItem(os: OSServices): MenubarActionItem {
  const appId = getActiveAppId();
  if (appId === FINDER_APP_ID) return { label: ABOUT_THIS_MACINTOSH_LABEL, onClick: () => openAboutBox(os) };
  const app = getApp(appId);
  return {
    label: `About ${app?.title ?? appId}…`,
    onClick: () => { if (app) openAppAboutBox(os, app); },
  };
}

export function appleMenu(os: OSServices): MenubarDefinition {
  return {
    label: APPLE_MENU_LABEL,
    items: [aboutMenuItem(os), {
      type: "separator"
    }, {
      label: "Control Panel",
      onClick: () => openControlPanel(os)
    }, {
      label: "Icon Gallery",
      onClick: () => os.openApp("icon_gallery")
    }, {
      label: "MacPaint",
      onClick: () => os.openApp("macpaint")
    }, {
      label: "Terminal",
      onClick: () => os.openApp("terminal")
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
/** Every menu in the menubar right now: the Apple menu, then the active app's. */
export function menus(os: OSServices) {
  return [appleMenu(os), ...getMenubarMenus()];
}
export function runNamedMenu(os: OSServices, menu: string, label: string) {
  const matches = menus(os).filter(m => m.label === menu);
  if (matches.length !== 1) throw new ServiceError(matches.length ? "ambiguity" : "missing-resource", "Menu must match exactly once");
  const actions: (() => void)[] = [];
  for (const item of matches[0].items) {
    if ("label" in item && item.label === label) actions.push(() => runMenuItem(item as MenubarActionItem));
    if ("type" in item && item.type === "radiogroup") for (const option of item.items) if (option.label === label) actions.push(() => runRadioItem(item, option.value));
  }
  if (actions.length !== 1) throw new ServiceError(actions.length ? "ambiguity" : "missing-resource", "Menu item must match exactly once");
  actions[0]();
}
