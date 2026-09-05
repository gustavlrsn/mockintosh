/**
 * @mockintosh/sdk v2 — Solid-only public API for third-party Mockintosh apps.
 *
 * Apps export a Solid component via `defineApp`. Drawing happens through
 * `@mockintosh/ui` (`box` / `text` / `image` / `raster`). OS services come
 * from `useApp()`.
 */

import { createContext, useContext } from "solid-js";
import type { MenubarDefinition } from "./menus";

export type {
  MenubarDefinition,
  MenubarItemDef,
  MenubarActionItem,
  MenubarRadioGroupDef,
  MenubarSeparator,
} from "./menus";

export const BLACK = 1;
export const WHITE = 0;
export const RED = 2;
export const GREEN = 3;
export const BLUE = 4;
export const CYAN = 5;
export const MAGENTA = 6;
export const YELLOW = 7;
export const ORANGE = 8;
export const PURPLE = 9;
export const BROWN = 10;
export const TAN = 11;
export const LIGHT_GRAY = 12;
export const MEDIUM_GRAY = 13;
export const DARK_GRAY = 14;
export const PINK = 15;

export interface Sprite {
  width: number;
  height: number;
  data: Uint8Array;
  mask?: Uint8Array;
}

/** Decode a base64-encoded 2bpp sprite (00=transparent, 01=white, 10=black). */
export function defineSprite(width: number, height: number, b64: string): Sprite {
  const raw = atob(b64);
  const total = width * height;
  const data = new Uint8Array(total);
  const mask = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    const byteIdx = i >> 2;
    const shift = 6 - (i & 3) * 2;
    const val = (raw.charCodeAt(byteIdx) >> shift) & 0x03;
    data[i] = val === 2 ? BLACK : WHITE;
    mask[i] = val === 0 ? 0 : 1;
  }
  return { width, height, data, mask };
}

/** Create a sprite from an ASCII grid: '#' black, '.' transparent, ' ' white. */
export function fromGrid(width: number, height: number, rows: string[]): Sprite {
  const data = new Uint8Array(width * height);
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const row = rows[y] || "";
    for (let x = 0; x < width; x++) {
      const ch = row[x] || ".";
      if (ch === "#") {
        data[y * width + x] = BLACK;
        mask[y * width + x] = 1;
      } else if (ch === ".") {
        data[y * width + x] = WHITE;
        mask[y * width + x] = 0;
      } else {
        data[y * width + x] = WHITE;
        mask[y * width + x] = 1;
      }
    }
  }
  return { width, height, data, mask };
}

export interface DialogOptions {
  message: string;
  buttons?: string[];
  showInput?: boolean;
  inputDefault?: string;
}

export interface AppProps {
  getSprite(name: string): Sprite | undefined;
  storage: {
    read(key: string): Promise<string | null>;
    write(key: string, value: string): Promise<void>;
    list(): Promise<string[]>;
  };
  os: {
    openWindow(appId: string, props?: Record<string, unknown>): void;
    closeWindow(windowId: string): void;
    showDialog(options: DialogOptions): Promise<string | null>;
  };
  fetch?(url: string, options?: RequestInit): Promise<Response>;
  env: {
    origin: string;
  };
}

export interface SolidApp<P extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  title: string;
  icon: string;
  defaultSize: { width: number; height: number };
  windowKind?: "document" | "dialog" | "alert" | "utility";
  scrollable?: boolean;
  resizable?: boolean;
  minSize?: { width: number; height: number };
  singleInstance?: boolean;
  /**
   * The app's menubar, shown whenever one of its windows is active. Declared
   * once for the whole app; for menus that depend on component state use
   * `useApp().setMenus` from inside the component instead.
   */
  menus?: MenubarDefinition[];
  Component: (props: P) => unknown;
}

export function defineApp<P extends Record<string, unknown>>(app: SolidApp<P>): SolidApp<P> {
  return app;
}

export interface AppServices {
  getSprite(name: string): Sprite | undefined;
  storage: AppProps["storage"];
  os: AppProps["os"];
  fetch?: AppProps["fetch"];
  env: AppProps["env"];
  /**
   * Set the menubar for the window this component is mounted in. It replaces
   * the app-level `menus` while this window is active, so each window's menus
   * can close over that window's own state. Call it from an effect to keep
   * `disabled` flags and radio values in sync.
   */
  setMenus(menus: MenubarDefinition[]): void;
}

/**
 * Host-only: the OS provides one `AppServices` per window through this
 * context; `useApp()` reads it, so every window sees its own services.
 */
export const AppServicesContext = createContext<AppServices | null>(null);

export function useApp(): AppServices {
  const services = useContext(AppServicesContext);
  if (!services) {
    throw new Error("useApp() must be called inside a Mockintosh app window");
  }
  return services;
}

export { measureText } from "@mockintosh/ui";

export {
  createSignal,
  createEffect,
  createMemo,
  createContext,
  useContext,
  onCleanup,
  onMount,
  Show,
  For,
  Button,
  TextInput,
  Checkbox,
} from "@mockintosh/ui";

export interface AppManifest {
  id: string;
  title: string;
  description: string;
  icon: string;
  author: string;
  version: string;
  sdk: string;
  permissions: string[];
  entry: string;
}
