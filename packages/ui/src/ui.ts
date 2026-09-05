/**
 * createUI — framework entrypoint.
 *
 * The host provides only a pixel buffer and dimensions.
 * createUI() initialises QuickDraw, decodes the built-in fonts,
 * installs the font bridge, and returns a UIInstance ready to render.
 *
 * Single-instance constraint: `_setRepaintHook` and QuickDraw's
 * `globals._fontMeasure` are module-level. One createUI() per process.
 */

import { render, _setRepaintHook } from "./renderer";
import { createNode } from "./nodes";
import { computeLayout } from "./layout";
import { createMeasureFunc, MeasureContext } from "./measure";
import { createDrawContext, drawTree } from "./draw";
import { createFocusManager, applyAutoFocus } from "./focus";
import { FocusContext } from "./focusContext";
import { installFontBridge } from "./fonts/bridge";
import { registerFont as registerFontInRegistry } from "./fonts/registry";
import { measureText } from "./fonts/bridge";
import { createPointerDispatcher, type PointerDispatcher, type PointerType } from "./pointer";
import type { CanvasNode, Modifiers } from "./nodes";
import type { FocusManager } from "./focus";
import type { GrafPort } from "@mockintosh/quickdraw";
import type { JSX } from "solid-js";
import { createComponent as solidCreateComponent } from "solid-js";

export interface UIConfig {
  pixels: Uint8Array;
  width: number;
  height: number;
  /**
   * Called whenever the Solid tree changes (property update, node insert/remove,
   * text change). The host should schedule a repaint when this fires.
   * Defaults to a no-op if not provided.
   */
  scheduleRender?: () => void;
}

export interface UIInstance {
  /**
   * Mount a Solid component tree. Returns a cleanup function that
   * unmounts the tree and stops reactive effects.
   */
  render(component: () => JSX.Element): () => void;

  /**
   * Run one frame: compute layout → draw.
   * The host calls this every dirty frame and flushes `pixels` to screen.
   */
  frame(): void;

  /**
   * Dispatch a pointer event. Hit-tests the live node tree with capture.
   */
  dispatchPointer(
    type: PointerType,
    x: number,
    y: number,
    extras?: { deltaY?: number }
  ): void;

  /**
   * Dispatch a keyboard event to the currently focused element.
   */
  dispatchKeyboard(
    type: "keydown" | "keyup" | "keypress",
    key: string,
    modifiers?: Partial<Modifiers>
  ): void;

  /**
   * Register a custom font from a %%FNT0 / %%FNT1 data block string.
   * Custom fonts can override built-in names (body, menu, mono).
   */
  registerFont(name: string, data: string): void;

  readonly root: CanvasNode;
  readonly focusManager: FocusManager;
  /** The GrafPort that drawTree paints into — same pixels as the host buffer. */
  readonly port: GrafPort;
}

const DEFAULT_MODIFIERS: Modifiers = {
  shift: false,
  ctrl: false,
  alt: false,
  meta: false,
};

export function createUI(config: UIConfig): UIInstance {
  const { pixels, width, height } = config;
  const scheduleRender = config.scheduleRender ?? (() => {});

  _setRepaintHook(scheduleRender);

  installFontBridge();

  const drawCtx = createDrawContext(pixels, width, height);

  const root = createNode("_root");
  root.style.width = width;
  root.style.height = height;
  root.layout = { x: 0, y: 0, width, height };

  const focusManager = createFocusManager(root);
  drawCtx.focusManager = focusManager;

  const measureFunc = createMeasureFunc();
  const measureApi = { measureText };

  const pointer: PointerDispatcher = createPointerDispatcher(root, focusManager);

  let autoFocusApplied = false;

  const instance: UIInstance = {
    render(component: () => JSX.Element): () => void {
      const focusContextValue = {
        manager: focusManager,
        getNode: () => null,
      };

      const cleanup = render(
        () =>
          solidCreateComponent(MeasureContext.Provider, {
            value: measureApi,
            get children() {
              return solidCreateComponent(FocusContext.Provider, {
                value: focusContextValue,
                get children() {
                  return component();
                },
              });
            },
          }) as unknown as CanvasNode,
        root
      );

      if (!autoFocusApplied) {
        autoFocusApplied = true;
        Promise.resolve().then(() => applyAutoFocus(root, focusManager));
      }

      return cleanup;
    },

    frame(): void {
      if (root._dirty) {
        computeLayout(root, width, height, measureFunc);
      }
      drawTree(root, drawCtx);
    },

    dispatchPointer(type, x, y, extras) {
      pointer.dispatch(type, x, y, extras);
    },

    dispatchKeyboard(
      type: "keydown" | "keyup" | "keypress",
      key: string,
      modifiers?: Partial<Modifiers>
    ): void {
      const mods: Modifiers = { ...DEFAULT_MODIFIERS, ...modifiers };
      focusManager.dispatchKeyboard(type, key, mods);
    },

    registerFont(name: string, data: string): void {
      registerFontInRegistry(name, data);
    },

    get root(): CanvasNode {
      return root;
    },

    get focusManager(): FocusManager {
      return focusManager;
    },

    get port(): GrafPort {
      return drawCtx.port;
    },
  };

  return instance;
}
