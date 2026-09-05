/**
 * Menubar definition types — shared by the OS shell (which draws them) and
 * apps (which declare them). This is the single source of truth; the OS
 * imports these from `@mockintosh/sdk`.
 */

/** One pull-down menu: its title in the menubar and its items. */
export interface MenubarDefinition {
  label: string;
  items: MenubarItemDef[];
}

export type MenubarItemDef =
  | MenubarActionItem
  | MenubarRadioGroupDef
  | MenubarSeparator;

/** A clickable command. `shortcut` is a single character, shown and bound as ⌘+key. */
export interface MenubarActionItem {
  type?: "action";
  label: string;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
}

/** A mutually exclusive group; the item whose `value` matches is checked. */
export interface MenubarRadioGroupDef {
  type: "radiogroup";
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string; disabled?: boolean }[];
}

export interface MenubarSeparator {
  type: "separator";
}
