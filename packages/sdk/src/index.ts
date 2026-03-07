/**
 * @mockintosh/sdk — Public API for third-party Mockintosh apps.
 *
 * Third-party apps import types, interfaces, and sprite utilities from this
 * package. The actual runtime implementations (AppBuilder, AppContext) are
 * provided by the OS when the app is loaded.
 */

// ---------------------------------------------------------------------------
// Core value constants
// ---------------------------------------------------------------------------

export const BLACK = 1;
export const WHITE = 0;

// ---------------------------------------------------------------------------
// Sprite types and utilities
// ---------------------------------------------------------------------------

export interface Sprite {
  width: number;
  height: number;
  data: Uint8Array;
  mask?: Uint8Array;
}

/**
 * Decode a base64-encoded 2bpp sprite.
 * Pixel encoding: 00=transparent, 01=white, 10=black, 11=reserved.
 */
export function defineSprite(
  width: number,
  height: number,
  b64: string
): Sprite {
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

/**
 * Create a sprite from an ASCII grid.
 * '#' = black (opaque), '.' = transparent, ' ' = white (opaque).
 */
export function fromGrid(
  width: number,
  height: number,
  rows: string[]
): Sprite {
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

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export interface OSEvent {
  type:
    | "mouseDown"
    | "mouseUp"
    | "mouseMove"
    | "doubleClick"
    | "scroll"
    | "keyDown"
    | "keyUp";
  x?: number;
  y?: number;
  button?: number;
  deltaY?: number;
  key?: string;
  code?: string;
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

export interface WindowSize {
  width: number;
  height: number;
  contentOriginX?: number;
  contentOriginY?: number;
}

// ---------------------------------------------------------------------------
// Pattern type
// ---------------------------------------------------------------------------

export type PatternName =
  | "black"
  | "white"
  | "checkers"
  | "stripes"
  | "gray25"
  | "gray50"
  | "gray75"
  | "darkCheckers";

// ---------------------------------------------------------------------------
// Font types
// ---------------------------------------------------------------------------

export type FontName = "Geneva9" | "ChiKareGo";

// ---------------------------------------------------------------------------
// Menubar types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// TextInput types
// ---------------------------------------------------------------------------

export interface TextInputState {
  value: string;
  cursor: number;
  selectionStart: number | null;
  scrollOffset: number;
  focused: boolean;
}

// ---------------------------------------------------------------------------
// AppBuilder interface (provided at runtime by the OS)
// ---------------------------------------------------------------------------

export interface AppBuilder {
  resetForRender(): void;
  flushEffects(): void;
  destroy(): void;
  setRenderFunction(fn: () => void): void;
  scheduleRender(): void;
  useState<T>(
    initial: T | (() => T)
  ): [T, (value: T | ((prev: T) => T)) => void];
  useEffect(fn: () => (() => void) | void, deps?: any[]): void;
  useMemo<T>(fn: () => T, deps: any[]): T;
  useRef<T>(initial: T): { current: T };
}

// ---------------------------------------------------------------------------
// ScrollArea
// ---------------------------------------------------------------------------

export interface ScrollAreaOptions {
  contentHeight: number;
  scrollOffset: number;
  onScroll: (newOffset: number) => void;
  /** When set, a resize handle is drawn at the bottom-right corner of the scroll
   *  area. Dragging it resizes the window. */
  resize?: "both" | "vertical" | "horizontal";
}

// ---------------------------------------------------------------------------
// AppContext interface (provided at runtime by the OS)
// ---------------------------------------------------------------------------

export interface TextOptions {
  font?: FontName;
  color?: number;
  align?: "left" | "center" | "right";
}

export interface ButtonOptions {
  x: number;
  y: number;
  label: string;
  id?: string;
  onClick?: () => void;
  onMouseDown?: () => void;
  width?: number;
  disabled?: boolean;
  pressed?: boolean;
}

export interface TextBlockOptions {
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  font?: FontName;
  color?: number;
  lineSpacing?: number;
}

export interface AppContext {
  readonly width: number;
  readonly height: number;
  readonly scrollY: number;
  readonly scrollX: number;
  release(): void;
  setPixel(x: number, y: number, color?: number): void;
  getPixel(x: number, y: number): number;
  drawHLine(x: number, y: number, w: number, color?: number): void;
  drawVLine(x: number, y: number, h: number, color?: number): void;
  drawDottedHLine(x: number, y: number, w: number, color?: number): void;
  drawDottedVLine(x: number, y: number, h: number, color?: number): void;
  drawRect(x: number, y: number, w: number, h: number, color?: number): void;
  fillRect(x: number, y: number, w: number, h: number, color?: number): void;
  fillPattern(
    x: number,
    y: number,
    w: number,
    h: number,
    pattern: PatternName | Uint8Array
  ): void;
  invertRect(x: number, y: number, w: number, h: number): void;
  blit(sprite: Sprite, x: number, y: number): void;
  blitInverted(sprite: Sprite, x: number, y: number): void;
  blitShadowOutline(sprite: Sprite, x: number, y: number): void;
  blitImageData(imageData: ImageData, x: number, y: number): void;
  blit1bitPixels(
    src: Uint8Array,
    srcW: number,
    srcH: number,
    x: number,
    y: number
  ): void;
  pushClip(x: number, y: number, w: number, h: number): void;
  popClip(): void;
  drawText(text: string, x: number, y: number, opts?: TextOptions): void;
  drawButton(btn: ButtonOptions): {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  drawTextInput(
    state: TextInputState,
    x: number,
    y: number,
    width: number,
    height?: number,
    options?: { id?: string; onChange?: () => void }
  ): void;
  drawTextBlock(opts: TextBlockOptions): number;
  measureTextBlock(
    text: string,
    maxWidth: number,
    font?: FontName,
    lineSpacing?: number
  ): number;
  scrollArea(
    id: string,
    rect: { x: number; y: number; w: number; h: number },
    opts: ScrollAreaOptions,
    drawContent: (ctx: AppContext) => void
  ): void;
  clear(color?: number): void;
  hitRegion(
    id: string,
    rect: { x: number; y: number; w: number; h: number },
    callbacks: {
      onClick?: (lx: number, ly: number) => void;
      onMouseDown?: (lx: number, ly: number) => void;
      onMouseUp?: (lx: number, ly: number) => void;
      onDoubleClick?: (lx: number, ly: number) => void;
      onDrag?: (absX: number, absY: number) => void;
    }
  ): void;
}

// ---------------------------------------------------------------------------
// Font measurement utilities
// ---------------------------------------------------------------------------

/**
 * Font measurement functions are injected by the OS runtime. In an external
 * app repo, these are available after the SDK is initialized by the OS loader.
 * During development in the monorepo, they resolve to the real implementations
 * via workspace linking.
 *
 * For apps that need measurements at module scope (e.g. layout constants),
 * use `AppBuilder.useMemo()` to defer the calculation to render time when
 * fonts are guaranteed to be loaded.
 */

let _measureText: (text: string, font?: FontName) => number = () => 0;
let _getLineHeight: (font: FontName) => number = () => 10;

export function measureText(text: string, font?: FontName): number {
  return _measureText(text, font);
}

export function getLineHeight(font: FontName): number {
  return _getLineHeight(font);
}

/** @internal Called by the OS to inject the real font measurement functions. */
export function __injectFontFunctions(
  measure: (text: string, font?: FontName) => number,
  lineHeight: (font: FontName) => number
): void {
  _measureText = measure;
  _getLineHeight = lineHeight;
}

// ---------------------------------------------------------------------------
// Dialog options
// ---------------------------------------------------------------------------

export interface DialogOptions {
  message: string;
  buttons?: string[];
  showInput?: boolean;
  inputDefault?: string;
}

// ---------------------------------------------------------------------------
// AppProps — typed interface for what the OS provides to third-party apps
// ---------------------------------------------------------------------------

export interface AppProps {
  /** Look up a sprite by name (OS sprites + app's own sprites). */
  getSprite(name: string): Sprite | undefined;

  /** Persistent key-value storage, namespaced per app. */
  storage: {
    read(key: string): Promise<string | null>;
    write(key: string, value: string): Promise<void>;
    list(): Promise<string[]>;
  };

  /** OS windowing services. */
  os: {
    openWindow(appId: string, props?: any): void;
    closeWindow(windowId: string): void;
    showDialog(options: DialogOptions): Promise<string | null>;
  };

  /** Network access (requires "network" permission). */
  fetch?(url: string, options?: RequestInit): Promise<Response>;

  /** Open a popup window (requires "network" permission). */
  openPopup?(url: string, options?: { width?: number; height?: number }): void;

  /** Listen for postMessage from opened popups. Returns an unsubscribe function. */
  onPopupMessage?(callback: (data: any) => void): () => void;

  /** Load an external script (requires "script" permission). */
  loadScript?(url: string): Promise<void>;

  /** Access a global set by a loaded script (requires "script" permission). */
  getGlobal?(name: string): any;

  /** Environment information. */
  env: {
    origin: string;
  };
}

// ---------------------------------------------------------------------------
// App interface — the contract for third-party apps
// ---------------------------------------------------------------------------

export interface App {
  id: string;
  title: string;
  icon: string;
  defaultSize: { width: number; height: number };
  scrollable?: boolean;
  resizable?: boolean;
  minSize?: { width: number; height: number };

  render(app: AppBuilder, ctx: AppContext, props: AppProps): void;

  onEvent?(
    app: AppBuilder,
    event: OSEvent,
    props: AppProps,
    size: WindowSize
  ): void;

  onOpen?(app: AppBuilder, props: AppProps): void;
  onClose?(app: AppBuilder): void;

  getMenubar?(app: AppBuilder, props: AppProps): MenubarDefinition[];

  getContentHeight?(app: AppBuilder, props: AppProps, size: WindowSize): number;
  getContentWidth?(app: AppBuilder, props: AppProps, size: WindowSize): number;
  getInfoBar?(app: AppBuilder, props: AppProps): string[] | null;
}

// ---------------------------------------------------------------------------
// App manifest (used in mockintosh.json and the registry)
// ---------------------------------------------------------------------------

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
