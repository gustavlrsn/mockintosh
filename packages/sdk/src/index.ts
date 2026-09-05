/**
 * @mockintosh/sdk v2 — Solid-only public API for third-party Mockintosh apps.
 *
 * Apps export a Solid component via `defineApp`. Drawing happens through
 * `@mockintosh/ui` (`box` / `text` / `image` / `raster`). OS services come
 * from `useApp()`.
 */

import { createContext, useContext, type Accessor, type JSX } from "solid-js";
import type { FileSystem } from "@mockintosh/fs";
import type { GrafPort } from "@mockintosh/quickdraw";
import type { Sprite } from "@mockintosh/ui";
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
  type NodeAttributes,
  type FSErrorCode,
} from "@mockintosh/fs";

// The screen is 1-bit: every pixel is one of two inks. Sprites are the
// 1-bit image asset format; `defineSprite` / `fromGrid` build them.
export { BLACK, WHITE, defineSprite, encodeSprite, fromGrid } from "@mockintosh/ui";
export type { Sprite } from "@mockintosh/ui";
export {
  readSpriteFile,
  writeSpriteFile,
  type SpriteFileContent,
  type WriteSpriteFileOptions,
} from "./spriteFile";

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

/** A 1-bit image to print: 1 byte per pixel, `1` = black (a `Sprite` qualifies). */
export interface PrintableImage {
  width: number;
  height: number;
  data: Uint8Array;
}

export interface PrintPictureOptions {
  /** Text printed beneath the picture, centred, in the menu font. */
  caption?: string;
  /** Integer enlargement of the picture (default 2). */
  scale?: number;
}

/**
 * System printer (a thermal receipt printer). Present on `useApp()` only when
 * the platform can reach one; apps that print should hide the feature when
 * `print` is undefined.
 */
export interface PrintService {
  /** Paper width in dots — 576 for 80 mm paper at 203 dpi. */
  readonly paperWidth: number;
  /** Whether a printer is connected. Reactive; read it inside JSX or effects. */
  connected(): boolean;
  /**
   * Connect to a printer. On the web this opens the browser's USB device
   * picker, so it must run from a user gesture such as a button click.
   */
  connect(): Promise<void>;
  /** Print a picture as a polaroid-style card with an optional caption. Connects first if needed. */
  printPicture(image: PrintableImage, options?: PrintPictureOptions): Promise<void>;
  /**
   * Draw a page `height` dots tall with QuickDraw and print it. `port` is the
   * current port while `draw` runs and is `paperWidth` wide.
   */
  printPage(height: number, draw: (port: GrafPort, size: { width: number; height: number }) => void): Promise<void>;
}

export interface AppProps {
  getSprite(name: string): Sprite | undefined;
  storage: AppStorage;
  os: {
    openWindow(appId: string, props?: Record<string, unknown>): void;
    closeWindow(windowId: string): void;
    showDialog(options: DialogOptions): Promise<string | null>;
  };
  fetch?: FetchFunction;
  env: {
    origin: string;
  };
}

/** Request options an app may pass to `fetch` — the portable subset of `RequestInit`. */
export interface FetchRequest {
  method?: string;
  headers?: Record<string, string>;
  body?: string | Uint8Array;
}

/** The response surface apps may rely on — the portable subset of `Response`. */
export interface FetchResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly headers: { get(name: string): string | null };
  text(): Promise<string>;
  json(): Promise<unknown>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

/**
 * Network access as the platform provides it. The browser's `fetch`
 * satisfies this; a microcontroller supplies its own HTTP client.
 */
export type FetchFunction = (url: string, options?: FetchRequest) => Promise<FetchResponse>;

/**
 * Something an app needs from the machine that not every Mockintosh has.
 * Service capabilities (`network`, `clipboard`, `printer`) follow from the
 * platform's services; the rest are host features the platform declares.
 *
 * - `network`   — `useApp().fetch` is available
 * - `clipboard` — copy and paste work
 * - `printer`   — `useApp().print` is available
 * - `camera`    — live camera frames can be captured
 * - `video`     — compressed video can be decoded and played
 * - `images`    — PNG/JPEG and similar raster formats can be decoded
 * - `browser`   — the OS runs inside a web browser the app may use directly (DOM, OAuth redirects, …)
 */
export type Capability =
  | "network"
  | "clipboard"
  | "printer"
  | "camera"
  | "video"
  | "images"
  | "browser";

export interface SolidApp<P extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  title: string;
  icon: string;
  /**
   * Capabilities the app cannot work without. The OS refuses to launch the
   * app on a platform that lacks any of them and tells the user why, instead
   * of the app failing at runtime. Omit when the app runs anywhere.
   */
  requires?: Capability[];
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
  /**
   * Sprites the app draws by name (`<image src>`, `getSprite`) — including
   * its own `icon`. Registered with the OS alongside the app; keys should be
   * prefixed with the app id to avoid clashing with built-ins.
   */
  sprites?: Record<string, Sprite>;
  Component: (props: P) => JSX.Element;
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

/**
 * The window a component is mounted in. Sizes are reactive accessors — read
 * them inside JSX or effects; a component that fills the window is
 * `<box width={window.width()} height={window.height()}>`.
 */
export interface AppWindow {
  readonly id: string;
  /** Content width in pixels (excluding chrome). */
  width: Accessor<number>;
  /** Content height in pixels. */
  height: Accessor<number>;
  /** Whether this is the frontmost window. */
  isActive: Accessor<boolean>;
  /** Current vertical scroll offset of the content, when `scrollable`. */
  scrollY: Accessor<number>;
  setTitle(title: string): void;
  close(): void;
}

export interface AppServices {
  getSprite(name: string): Sprite | undefined;
  storage: AppStorage;
  fs: AppFileSystem;
  /** The window this component is mounted in. */
  window: AppWindow;
  os: AppProps["os"];
  fetch?: AppProps["fetch"];
  env: AppProps["env"];
  /**
   * What this Macintosh can do. Apps that work with or without a feature
   * check here instead of declaring it in `requires`.
   */
  capabilities: ReadonlySet<Capability>;
  /** The system printer, when this platform has one. */
  print?: PrintService;
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

export {
  measureText,
  type Ink,
  type RasterSurface,
  type RasterPaintRect,
  type RasterPaintFn,
} from "@mockintosh/ui";

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
  /** Same as `SolidApp.requires`; lets the OS skip loading a bundle it cannot run. */
  requires?: Capability[];
}
