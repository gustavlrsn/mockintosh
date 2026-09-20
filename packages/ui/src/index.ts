/**
 * `@mockintosh/ui` — 1-bit Solid canvas kit (site: ui.mockintosh.com).
 *
 * Engine: host elements + createUI + layout/draw/pointer/focus/fonts.
 * Algorithms: dither, sprites, PNG (no Solid).
 * Widgets: Solid compositions of host elements (`./widgets`).
 * Host adapters: `@mockintosh/ui/web`, `@mockintosh/ui/vite`.
 */

// -------------------------------------------------------------------------
// Engine
// -------------------------------------------------------------------------
export { createUI } from "./ui";
export type { UIInstance, UIConfig } from "./ui";
export { useUIServices } from "./services";
export type { UIServices, UIClipboard, UIImageService, ImageDecodeOptions } from "./services";
export { useTheme, useRadius, themeRadius, RADIUS_SCALES, RADIUS_PX, DEFAULT_THEME } from "./theme";
export type { UITheme, RadiusScale, RadiusStep } from "./theme";

export type {
  LayoutStyle,
  LayoutRect,
  PatternName,
  PatternBits,
  Fill,
  DitherGradientFill,
  DitherGradientInit,
  GradientDirection,
  GradientKeyword,
  GradientKind,
  GradientAt,
  Ink,
  BoxProps,
  TextProps,
  TextAlign,
  TextVerticalAlign,
  ImageProps,
  RasterProps,
  BitmapProps,
  RasterPaintFn,
  RasterPaintRect,
  RasterSurface,
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
export { ditherGradient, isDitherGradientFill, textWraps } from "./nodes";

export {
  createPointerDispatcher,
  createDoubleClickTracker,
  hitTest,
  DOUBLE_CLICK_MS,
  DOUBLE_CLICK_DIST,
} from "./pointer";
export type { PointerType, PointerDispatcher } from "./pointer";
export { cursorAt, cursorOf, cssCursor, isNamedCursor, DEFAULT_CURSOR } from "./cursor";
export type { CursorName, NamedCursor, CursorCSSTable } from "./cursor";
export {
  cursorFromFace,
  faceFromCursor,
  blitQuickdrawCursor,
  blitCursorFace,
  cssCursorFromFace,
  cssTableFromFaces,
  resolveCursorFace,
} from "./cursorFace";
export type { CursorFace, CursorFaceTable } from "./cursorFace";
export { MAC_CURSOR_FACES, resolveMacCursorFace } from "./cursors/mac";
export type { MacCursorName } from "./cursors/mac";
export { encodePng1bit, encodePngRgba } from "./png";
export { collectHitRects, createDrawContext, drawTree, patternBits } from "./draw";
export { computeLayout } from "./layout";
export type { MeasureFunc } from "./layout";
export { useFocus, getFocusManager } from "./focusContext";
export { useMeasure } from "./measure";
export { registerFont, listFonts, listFontSizes, listFontFamilies, getFont, requireFont, defaultFontSize } from "./fonts/registry";
export type { FontFamilyInfo } from "./fonts/registry";
export { resolveFont, fontStyleFromProps, fontFromProps, textFace } from "./fonts/style";
export type { FontStyle } from "./fonts/style";
export { measureText, fontLineHeight, drawString } from "./fonts/bridge";
export { faceMetrics, faceMetricsByName, alignmentHeight, cdefBaseline, middleCellTop } from "./fonts/metrics";
export type { FontFaceMetrics, FontInfo } from "./fonts/metrics";
export { COMMAND_KEY, CHECK_MARK, BULLET } from "./fonts/extraGlyphs";
export { textSelectionOf, selectedPlainText } from "./selectable";
export type { TextSelection } from "./selectable";
export { inspectTree, type InspectionNode, type SemanticMetadata } from "./inspection";
export type { JSX, HostProps } from "./jsx-runtime";

// -------------------------------------------------------------------------
// Algorithms
// -------------------------------------------------------------------------
export { BLACK, WHITE, defineSprite, encodeSprite, fromGrid } from "./sprite";
export type { Sprite } from "./sprite";
export { toBits, createDitherer, coverFrame, rasterizeFrame, isImageFrame, isDitheredAsset } from "./dither";
export { rasterizeDitherGradient, gradientT, fillGradientT, gradientDegrees, gradientAt } from "./ditherGradient";
export type { ImageFrame, DitherMode, DitherOptions, CoverFrameOptions, DitheredAsset } from "./dither";
export {
  ASCII_TILE,
  ASCII_MATCH_MODES,
  ASCII_PUNCH_MIN,
  ASCII_PUNCH_MAX,
  ASCII_PUNCH_DEFAULT,
  ASCII_DIRECTIONAL_DEFAULT,
  ASCII_NORMALIZE_DEFAULT,
  ASCII_DIFFUSE_DEFAULT,
  BASELINE_ASCII,
  resolveAsciiOptions,
  isBaselineAscii,
  asciiOptionsRevision,
  asciiToBits,
  createAsciiDitherer,
  listAsciiGlyphs,
  renderAsciiGlyphAtlas,
} from "./asciiDither";
export type { AsciiMatchMode, AsciiDitherOptions, ResolvedAsciiOptions } from "./asciiDither";
export { decodeBase64 } from "./base64";

// -------------------------------------------------------------------------
// Widgets
// -------------------------------------------------------------------------
export {
  Accordion,
  Attachment,
  Avatar,
  Badge,
  Breadcrumb,
  Bubble,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Disclosure,
  Dithered,
  Empty,
  Field,
  InputGroup,
  Item,
  Kbd,
  Label,
  Marker,
  Menu,
  Message,
  MessageScroller,
  Note,
  Overlay,
  Pagination,
  Popover,
  Progress,
  Questionnaire,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  TextInput,
  TextEditor,
  Toggle,
  ToggleGroup,
  Tooltip,
  Divider,
  Spacer,
  ScrollView,
} from "./widgets";
export type {
  AccordionProps,
  AccordionEntry,
  AttachmentProps,
  AttachmentState,
  AvatarProps,
  BadgeProps,
  BreadcrumbProps,
  BreadcrumbItem,
  BubbleProps,
  ButtonProps,
  ButtonGroupProps,
  CardProps,
  CheckboxProps,
  DisclosureProps,
  DitheredProps,
  DitheredSrc,
  EmptyProps,
  FieldProps,
  InputGroupProps,
  ItemProps,
  KbdProps,
  LabelProps,
  MarkerProps,
  MenuProps,
  MenuItem,
  MessageProps,
  MessageScrollerProps,
  NoteProps,
  OverlayProps,
  OverlaySide,
  OverlayAlign,
  NoteVariant,
  PaginationProps,
  PopoverProps,
  ProgressProps,
  QuestionnaireProps,
  QuestionnaireStep,
  QuestionnaireChoice,
  RadioProps,
  RadioGroupProps,
  RadioOption,
  SelectProps,
  SelectOption,
  SliderProps,
  SpinnerProps,
  SwitchProps,
  TableProps,
  TabsProps,
  TabItem,
  TextInputProps,
  TextEditorProps,
  ToggleProps,
  ToggleGroupProps,
  ToggleOption,
  TooltipProps,
  ScrollViewProps,
} from "./widgets";

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
  onSettled,
  flush,
  runWithOwner,
  createStore,
  reconcile,
  snapshot,
  storePath,
  merge,
  omit,
  Loading,
  Errored,
  isPending,
  latest,
  refresh,
  action,
  createOptimistic,
  createOptimisticStore,
} from "solid-js";
export { Show, For, Match } from "solid-js";
/** Solid control-flow `Switch` is `import { Switch } from "solid-js"`. The kit `Switch` is the on/off widget. */
