/**
 * createUI — framework entrypoint.
 *
 * The host provides only a pixel buffer and dimensions.
 * createUI() initialises QuickDraw, decodes the built-in fonts,
 * installs the font bridge, and returns a UIInstance ready to render.
 *
 * Single-instance constraint: `_setRepaintHook` and QuickDraw's
 * `installFontManager` are module-level. One createUI() per process.
 */

import { inspectTree, type InspectionNode } from "./inspection";
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
import { type BitMap, type GrafPort } from "@mockintosh/quickdraw";
import { bitMapHeight, bitMapWidth } from "@mockintosh/quickdraw/bits";
import type { JSX } from "solid-js";
import { createComponent as solidCreateComponent } from "solid-js";
import { UIServicesContext, type UIServices } from "./services";

export interface UIConfig {
  /** The packed 1-bit framebuffer to draw into; the tree fills its bounds. */
  screen: BitMap;
  /**
   * Called whenever the Solid tree changes (property update, node insert/remove,
   * text change). The host should schedule a repaint when this fires.
   * Defaults to a no-op if not provided.
   */
  scheduleRender?: () => void;
  /** Host services components may use (clipboard, …). All optional. */
  services?: UIServices;
}

export interface UIInstance {
  inspect(): readonly InspectionNode[];
  /**
   * Mount a Solid component tree. Returns a cleanup function that
   * unmounts the tree and stops reactive effects.
   */
  render(component: () => JSX.Element): () => void;

  /**
   * Run one frame: compute layout → draw.
   * The host calls this every dirty frame and presents `screen` on the display.
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
  /** The GrafPort that drawTree paints into — its portBits is `config.screen`. */
  readonly port: GrafPort;
}

const DEFAULT_MODIFIERS: Modifiers = {
  shift: false,
  ctrl: false,
  alt: false,
  meta: false,
};

export function createUI(config: UIConfig): UIInstance {
  const { screen } = config;
  const services: UIServices = config.services ?? {};
  const width = bitMapWidth(screen);
  const height = bitMapHeight(screen);
  const scheduleRender = config.scheduleRender ?? (() => {});

  _setRepaintHook(scheduleRender);

  installFontBridge();

  const drawCtx = createDrawContext(screen);

  const root = createNode("_root");
  root.style.width = width;
  root.style.height = height;
  root.layout = { x: 0, y: 0, width, height };

  const focusManager = createFocusManager(root);
  drawCtx.focusManager = focusManager;

  const measureFunc = createMeasureFunc();
  const measureApi = { measureText };

  const pointer: PointerDispatcher = createPointerDispatcher(root, focusManager, (error) => services.onError?.(error));

  let autoFocusApplied = false;

  const instance: UIInstance = {
    inspect() { if (root._dirty) computeLayout(root, width, height, measureFunc); return inspectTree(root, focusManager); },
    render(component: () => JSX.Element): () => void {
      let disposed = false;
      const focusContextValue = {
        manager: focusManager,
        getNode: () => null,
      };

      const cleanup = render(
        () =>
          solidCreateComponent(UIServicesContext.Provider, {
            value: services,
            get children() {
              return solidCreateComponent(MeasureContext.Provider, {
                value: measureApi,
                get children() {
                  return solidCreateComponent(FocusContext.Provider, {
                    value: focusContextValue,
                    get children() {
                      return component();
                    },
                  });
                },
              });
            },
          }) as unknown as CanvasNode,
        root
      );

      if (!autoFocusApplied) {
        autoFocusApplied = true;
        Promise.resolve().then(() => { if (!disposed) applyAutoFocus(root, focusManager); });
      }

      return () => { disposed = true; cleanup(); };
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
      try {
        focusManager.dispatchKeyboard(type, key, mods);
      } catch (error) {
        services.onError?.(error);
      }
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
