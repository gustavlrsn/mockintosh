/**
 * @mockintosh/sdk v2 — Solid-only public API for third-party Mockintosh apps.
 *
 * Apps export a Solid component via `defineApp`. Drawing happens through
 * `@mockintosh/ui` (`box` / `text` / `image` / `raster`). OS services come
 * from `useApp()`.
 */

import { createContext, useContext } from "solid-js";
import type { FileSystem } from "@mockintosh/fs";
import type { MenubarDefinition } from "./menus";

export type {
  MenubarDefinition,
  MenubarItemDef,
  MenubarActionItem,
  MenubarRadioGroupDef,
  MenubarSeparator,
} from "./menus";

// File-system vocabulary, re-exported so apps never import @mockintosh/fs
// directly (the OS owns the one FileSystem instance; apps reach it via
// `useApp().fs`).
export {
  MIME,
  ROOT_ID,
  FSError,
  isFSError,
  inferMimeType,
  isTextType,
  type NodeId,
  type NodeRole,
  type FSNode,
  type FSFile,
  type FSDirectory,
  type FileContent,
  type WriteFileOptions,
  type FSErrorCode,
} from "@mockintosh/fs";

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

/**
 * Per-app key/value storage. Keys are file names inside the app's own folder
 * (`System Folder/Preferences/<appId>/`), so the user can see and delete an
 * app's data from the Finder.
 */
export interface AppStorage {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  list(): Promise<string[]>;
}

/**
 * The shared file system as seen by apps: reactive catalog reads (call them
 * inside memos/effects), content access, and mutations. Well-known folders
 * are found by role (`fs.locate("desktop")`), never by name.
 */
export type AppFileSystem = Pick<
  FileSystem,
  | "node"
  | "file"
  | "directory"
  | "exists"
  | "children"
  | "childCount"
  | "child"
  | "resolve"
  | "pathOf"
  | "locate"
  | "volumes"
  | "volumeOf"
  | "readBytes"
  | "readText"
  | "readJSON"
  | "mkdir"
  | "writeFile"
  | "writeJSON"
  | "rename"
  | "move"
  | "remove"
  | "batch"
>;

export interface AppProps {
  getSprite(name: string): Sprite | undefined;
  storage: AppStorage;
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
  /**
   * MIME types this app opens. When the user opens such a file from the
   * Finder, the OS launches the app with `FileDocumentProps` merged into its
   * props. The first registered app for a type wins.
   */
  fileTypes?: string[];
  Component: (props: P) => unknown;
}

/** Props the OS passes when an app is launched to open a file. */
export interface FileDocumentProps {
  /** File-system node id — read it with `useApp().fs.readText(fileId)`. */
  fileId: string;
  /** The file's name, suitable as a window title. */
  title: string;
}

export function defineApp<P extends Record<string, unknown>>(app: SolidApp<P>): SolidApp<P> {
  return app;
}

export interface AppServices {
  getSprite(name: string): Sprite | undefined;
  storage: AppStorage;
  fs: AppFileSystem;
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
