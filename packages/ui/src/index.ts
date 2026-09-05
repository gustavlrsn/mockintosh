// -------------------------------------------------------------------------
// Framework lifecycle
// -------------------------------------------------------------------------
export { createUI } from "./ui";
export type { UIInstance, UIConfig } from "./ui";

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------
export type {
  LayoutStyle,
  LayoutRect,
  PatternName,
  BoxProps,
  TextProps,
  TextAlign,
  TextVerticalAlign,
  ImageProps,
  RasterProps,
  RasterPaintFn,
  RasterPaintRect,
  ImageSource,
  CanvasNode,
  EventHandlers,
  MouseEventHandlers,
  PointerCaptureEvent,
  KeyboardEventHandlers,
  FocusEventHandlers,
  Modifiers,
  HitRect,
  HitMask,
} from "./nodes";

export { createPointerDispatcher, hitTest } from "./pointer";
export type { PointerType, PointerDispatcher } from "./pointer";
export { collectHitRects, createDrawContext, drawTree } from "./draw";

// -------------------------------------------------------------------------
// Layout
// -------------------------------------------------------------------------
export { computeLayout } from "./layout";
export type { MeasureFunc } from "./layout";

// -------------------------------------------------------------------------
// Framework components
// -------------------------------------------------------------------------
export { Button } from "./components/Button";
export type { ButtonProps } from "./components/Button";
export { TextInput } from "./components/TextInput";
export type { TextInputProps } from "./components/TextInput";
export { Checkbox } from "./components/Checkbox";
export type { CheckboxProps } from "./components/Checkbox";
export { Divider, Spacer, ScrollView } from "./components/utilities";
export type { ScrollViewProps } from "./components/utilities";

// -------------------------------------------------------------------------
// Hooks
// -------------------------------------------------------------------------
export { useFocus, getFocusManager } from "./focusContext";
export { useMeasure } from "./measure";

// -------------------------------------------------------------------------
// Font registration (for custom fonts beyond the built-in body/menu/mono)
// -------------------------------------------------------------------------
export { registerFont, listFonts, getFont, requireFont } from "./fonts/registry";
export { measureText } from "./fonts/bridge";
export { COMMAND_KEY, CHECK_MARK, BULLET } from "./fonts/extraGlyphs";

// -------------------------------------------------------------------------
// Solid re-exports
// -------------------------------------------------------------------------
export {
  createSignal,
  createEffect,
  createMemo,
  createContext,
  useContext,
  onCleanup,
  onMount,
  batch,
} from "solid-js";
export { Show, For, Index, Switch, Match } from "solid-js";
export { createStore } from "solid-js/store";

// -------------------------------------------------------------------------
// JSX — side-effect import to augment JSX namespace
// -------------------------------------------------------------------------
import "./jsx.d.ts";
