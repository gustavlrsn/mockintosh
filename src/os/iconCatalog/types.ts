/**
 * System 7 icon family — the members that share one resource ID in a suitcase.
 * `Sprite` stays 1-bit; color members are raw indexed pixels for a future PixMap.
 */
import type { Sprite } from "@mockintosh/ui";

export type IconGroup = "system" | "finder" | "update" | "cdev" | "app" | "stack";

export interface IconFamily {
  source: string;
  group: IconGroup;
  id: number;
  name: string;
  icn?: Sprite;
  ics?: Sprite;
  icon?: Sprite;
  sicn?: Sprite[];
  icl4?: Uint8Array;
  icl8?: Uint8Array;
  ics4?: Uint8Array;
  ics8?: Uint8Array;
}

export interface CatalogFamilyRecord {
  source: string;
  group: IconGroup;
  id: number;
  name: string;
  icn?: string;
  ics?: string;
  icon?: string;
  sicn?: string[];
  icl4?: string;
  icl8?: string;
  ics4?: string;
  ics8?: string;
}

export interface CatalogFile {
  release: string;
  image: string;
  families: CatalogFamilyRecord[];
}
