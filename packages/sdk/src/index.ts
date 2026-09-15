/**
 * @mockintosh/sdk v2 — Solid-only public API for third-party Mockintosh apps.
 *
 * Apps export a Solid component via `defineApp`. Drawing happens through
 * `@mockintosh/ui` (`box` / `text` / `image` / `raster` / `bitmap`). OS services come
 * from `useApp()`.
 */

import { createContext, useContext, type Accessor, type JSX } from "solid-js";
import type { FileSystem } from "@mockintosh/fs";
import type { GrafPort } from "@mockintosh/quickdraw";
import type { Sprite } from "@mockintosh/ui";
import type { MenubarDefinition } from "./menus";
import type { AppScheduler, CameraService, ImageService, VideoService } from "./media";
import type { KernelClient, KernelPermission } from "./kernel";
import type { AppCrypto } from "./crypto";
import type { BrowserService } from "./browser";

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
export { BLACK, WHITE, defineSprite, encodeSprite, fromGrid, toBits, createDitherer } from "@mockintosh/ui";
export type { Sprite, ImageFrame, DitherMode, DitherOptions } from "@mockintosh/ui";
export type {
  ImageService,
  VideoSource,
  VideoService,
  CameraSource,
  CameraService,
  AppScheduler,
} from "./media";
export type { KernelClient, KernelInvokeOptions, KernelPermission, OperationContract } from "./kernel";
export type { AppCrypto } from "./crypto";
export type { BrowserService } from "./browser";
export { encodeQR } from "./qr";
export type { Resource, Job, Diagnostic, ChatMessage, CompleteResult, OpenAITool } from "@mockintosh/protocol";
export { parse, resource, jobSchema } from "@mockintosh/protocol";
export {
  readSpriteFile,
  writeSpriteFile,
  type SpriteFileContent,
  type WriteSpriteFileOptions,
} from "./spriteFile";

/** Classic Alert() icon: System ICON 0 / 1 / 2 (stop / note / caution). */
export type DialogVariant = "stop" | "note" | "caution";

export interface DialogOptions {
  message: string;
  buttons?: string[];
  showInput?: boolean;
  inputDefault?: string;
  /** Which alert icon to show. Defaults to `stop`. */
  variant?: DialogVariant;
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

/**
 * The window definitions an app may ask for — the Macintosh `procID`s of
 * `NewWindow`, in spirit:
 *
 * - `document`   — title bar with close and zoom boxes; grow box and scroll
 *                  bars when the window is `resizable` / `scrollable`
 *                  (`documentProc` / `zoomDocProc`)
 * - `dialog`     — title bar with a close box, no zoom, fixed size
 *                  (`movableDBoxProc`)
 * - `utility`    — like `dialog` but floats above document windows
 *                  (`rDocProc`; tool palettes)
 * - `plain`      — a bare 1px frame, no title bar, cannot be moved
 *                  (`plainDBox`)
 * - `alert`      — square double frame (1px / 2px white / 2px), system-modal:
 *                  every other window ignores input until it closes (`dBoxProc`)
 * - `fullscreen` — no chrome at all; covers the whole screen, menubar
 *                  included. The menubar's ⌘ shortcuts still work, so an app
 *                  in full screen must offer a way back — a shortcut, a
 *                  visible "Menu Bar" button, or both (Macintosh HIG).
 */
export type WindowKind = "document" | "dialog" | "utility" | "plain" | "alert" | "fullscreen";

/**
 * What an app asks for when it opens a window. Everything is optional: the
 * defaults come from the app's `defineApp` (`defaultSize`, `windowKind`,
 * `scrollable`, `resizable`, `minSize`, `title`, `Component`), so
 * `openWindow()` with no argument opens the app's main window.
 */
export interface WindowSpec<P extends Record<string, unknown> = Record<string, unknown>> {
  kind?: WindowKind;
  title?: string;
  /** Content size in pixels. Ignored for `fullscreen`, which is the screen. */
  size?: { width: number; height: number };
  /** Screen position of the window's top-left corner; staggered by the OS when omitted. */
  position?: { x: number; y: number };
  scrollable?: boolean;
  resizable?: boolean;
  minSize?: { width: number; height: number };
  /** The content to mount; the app's `Component` when omitted. */
  Component?: (props: P) => JSX.Element;
  /** Props for the component. */
  props?: P;
}

/**
 * Everything an app can do that does not depend on being inside a window:
 * what `onOpen` receives, and what `useApp()` extends with the window it is
 * mounted in.
 */
export interface AppContext {
  /** Cleanup on app instance stop/restart. Solid component cleanup remains automatic. */
  onCleanup?(cleanup: () => void): void;
  /** Explicitly retain an instance for background work; release when it finishes. */
  keepAlive?(): () => void;
  getSprite(name: string): Sprite | undefined;
  storage: AppStorage;
  fs: AppFileSystem;
  os: {
    /** Open another app, as the Finder would when its icon is double-clicked. */
    openApp(appId: string, props?: Record<string, unknown>): void;
    /** @deprecated Renamed `openApp`; this opens an *app*, which decides about its windows. */
    openWindow(appId: string, props?: Record<string, unknown>): void;
    closeWindow(windowId: string): void;
    showDialog(options: DialogOptions): Promise<string | null>;
  };
  /**
   * Open one of this app's windows. Returns the new window's id, which
   * `os.closeWindow` accepts.
   */
  openWindow<P extends Record<string, unknown>>(spec?: WindowSpec<P>): string;
  fetch?: FetchFunction;
  env: {
    origin: string;
    config: Readonly<Record<string, string>>;
  };
  crypto: AppCrypto;
  browser?: BrowserService;
  /**
   * What this Macintosh can do. Apps that work with or without a feature
   * check here instead of declaring it in `requires`.
   */
  capabilities: ReadonlySet<Capability>;
  /** The system printer, when this platform has one. */
  print?: PrintService;
  /** Decode PNG/JPEG/GIF, when this platform can. */
  images?: ImageService;
  /** Play compressed video, when this platform can. */
  video?: VideoService;
  /** Live camera frames, when this platform can. */
  camera?: CameraService;
  /** Frame clock and monotonic time. */
  scheduler: AppScheduler;
  /** Kernel traps, when the app declared `permissions`. */
  kernel?: KernelClient;
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
 * - `camera`    — `useApp().camera` is available
 * - `video`     — `useApp().video` is available
 * - `images`    — `useApp().images` is available
 * - `browser`   — `useApp().browser` is available (`openExternal`, `authorize`, `loadScript`)
 */
export type Capability =
  | "network"
  | "clipboard"
  | "printer"
  | "camera"
  | "video"
  | "images"
  | "browser";

/**
 * What "About <app>…" — the first Apple-menu item while the app is frontmost —
 * shows. Everything is optional: with nothing declared the OS draws a standard
 * About box from the app's `title` and `icon`; `version` and `description` add
 * lines to that box; `Component` replaces it entirely and is mounted in a
 * fixed-size `dialog` window of `size` (the OS default when omitted).
 */
export interface AppAbout {
  /** Custom About-box content; receives no props. */
  Component?: (props: Record<string, unknown>) => JSX.Element;
  /** Content size of the About window when `Component` needs a particular one. */
  size?: { width: number; height: number };
  /** Shown as "Version <version>" in the standard box. */
  version?: string;
  /** A sentence or two about the app, wrapped in the standard box. */
  description?: string;
}

export interface SolidApp<P extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  title: string;
  icon: string;
  /** The app's About box, opened from the Apple menu. See `AppAbout`. */
  about?: AppAbout;
  /**
   * Capabilities the app cannot work without. The OS refuses to launch the
   * app on a platform that lacks any of them and tells the user why, instead
   * of the app failing at runtime. Omit when the app runs anywhere.
   */
  requires?: Capability[];
  /**
   * Kernel traps this app may call. The OS creates a granted session for the
   * instance and exposes it as `useApp().kernel`. `kernel:*` is every trap.
   */
  permissions?: KernelPermission[];
  /** Content size of the main window. */
  defaultSize: { width: number; height: number };
  /** Kind of the main window (default `document`). */
  windowKind?: WindowKind;
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
  /** Content of the app's main window. */
  Component: (props: P) => JSX.Element;
  /**
   * What happens when the user opens the app — its `main`. The OS calls it
   * when the app's icon is double-clicked (`props` is `{}`) or a document it
   * handles is opened (`props` is `FileDocumentProps`), after checking
   * `requires` and after bringing an already-open matching window to the
   * front instead. The default opens the main window: `app.openWindow({ props })`.
   *
   * An app that should decide for itself — start in full screen, put up a
   * dialog first, or open no window at all — supplies this and opens whatever
   * it wants through `app.openWindow`. It runs outside any component, so it
   * is a place for opening windows, not for creating effects.
   */
  onOpen?(app: AppContext, props: P): void;
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
  /** The window's current kind; `fullscreen` while `setFullScreen(true)` is in effect. */
  kind: Accessor<WindowKind>;
  /** Height of the scrollable document; drives the window scrollbar thumb. */
  setContentSize(width: number, height: number): void;
  setTitle(title: string): void;
  /**
   * Make this window cover the whole screen, menubar included, keeping its
   * content mounted; `false` gives it back the kind and bounds it had before.
   * A window that was *opened* as `fullscreen` has nothing to go back to and
   * stays as it is — close it instead.
   */
  setFullScreen(on: boolean): void;
  close(): void;
}

export interface AppServices extends AppContext {
  /** The window this component is mounted in. */
  window: AppWindow;
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

export { WindowHeader, WindowFooter, WindowSlotsContext } from "./windowBands";
export type { WindowBandView, WindowSlots } from "./windowBands";

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

export { Markdown, parseMarkdown } from "./markdown";
export type { MarkdownProps, LayoutNode, InlineSegment } from "./markdown";

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
