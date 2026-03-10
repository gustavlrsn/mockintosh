import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { measureText } from "../lib/canvas/fontAdapter";
import { OSEvent } from "../lib/toolbox/EventManager";
import { MenubarDefinition } from "../lib/toolbox/MenuManager";
import { FileManager } from "../lib/toolbox/FileManager";
import { OSServices } from "../lib/canvas/OSServices";
import {
  DeckerCard,
  DeckerCore,
  DeckerDeck,
  DeckerImageLike,
  DeckerRect,
  DeckerRuntimeObject,
  DeckerWidget,
  DeckerValue,
  getDeckerCore,
} from "../lib/decker/core";
import { hasDeckerFont, registerDeckerFont } from "../lib/fonts/DeckerFontRegistry";
import {
  argbToRgba,
  pixelToARGB,
  resolveAnimPattern,
  DEFAULT_COLORS_ARGB,
} from "../lib/decker/pixelFormat";

type DeckerMode = "interact" | "widgets" | "draw";

/** AppBuilder hook slot can occasionally disagree with the radiogroup label; default to interact. */
function normalizeDeckerMode(raw: DeckerMode | undefined | null): DeckerMode {
  return raw === "widgets" || raw === "draw" ? raw : "interact";
}

interface DeckerDocumentState {
  deck: DeckerDeck | null;
  fileId: string | null;
  fileName: string;
  sourceFormat: "deck" | "html";
  dirty: boolean;
  error: string | null;
  transition: TransitionState | null;
  focusedField: FocusedFieldState | null;
  gridEdit: GridEditState | null;
}

interface WidgetHit {
  index: number;
  widget: DeckerWidget;
  rect: DeckerRect;
}

interface WidgetDragState {
  widget: DeckerWidget;
  startX: number;
  startY: number;
  origin: DeckerRect;
}

interface TransitionState {
  fromIndex: number;
  toIndex: number;
  delayFrames: number;
  name: string;
  startFrame: number;
}

interface FocusedFieldState {
  widgetIndex: number;
  caretOffset: number;
}

interface GridEditState {
  widgetIndex: number;
  row: number;
  col: number;
  text: string;
  caretOffset: number;
}

const DECKER = getDeckerCore();
const BLANK_DECK_SOURCE =
  "{deck}\nversion:1\ncard:0\nsize:[512,342]\n\n{card:home}\n{widgets}\n";

/** Default animation frames for patterns 28-31 (from lil.js DEFAULT_ANIMS). */
const DEFAULT_ANIMS: number[][] = [
  [13, 9, 5, 1, 5, 9],
  [4, 4, 8, 14, 14, 8],
  [18, 18, 20, 19, 19, 20],
  [0, 0, 0, 0, 1, 1, 1, 1],
];

function getPatternAnim(deck: DeckerDeck): number[][] | null {
  const patterns = DECKER.getField(deck, "patterns") as
    | { anim?: unknown }
    | undefined;
  if (!patterns?.anim || typeof patterns.anim !== "object") return null;
  try {
    const outer = DECKER.dictValues(patterns.anim as DeckerValue);
    return outer.map((row: DeckerValue) => {
      const cells = DECKER.dictValues(row as DeckerValue);
      return cells.map((c: DeckerValue) =>
        Math.max(0, Math.min(47, Math.floor(DECKER.getNumber(c)) || 0))
      );
    });
  } catch {
    return null;
  }
}

/**
 * Cache: image object → Map<cacheKey, ImageData>
 * cacheKey encodes frameSlot (animated patterns cycle every 4 frames),
 * screenOffset, and palette identity so static images hit on every frame.
 */
const imageDataCache = new WeakMap<object, Map<string, ImageData>>();

function imageCacheKey(
  palette: Uint8Array | null,
  frameSlot: number,
  offsetX: number,
  offsetY: number
): string {
  // Palette identity: use object reference index via a secondary WeakMap
  return `${paletteId(palette)}:${frameSlot}:${offsetX}:${offsetY}`;
}

const paletteIds = new WeakMap<Uint8Array, number>();
let nextPaletteId = 1;
function paletteId(pal: Uint8Array | null): number {
  if (!pal) return 0;
  let id = paletteIds.get(pal);
  if (id === undefined) { id = nextPaletteId++; paletteIds.set(pal, id); }
  return id;
}

function imageToImageData(
  image: DeckerImageLike,
  palette: Uint8Array | null,
  deck: DeckerDeck | null,
  frame: number,
  screenOffsetX = 0,
  screenOffsetY = 0
): ImageData {
  const anim = deck ? getPatternAnim(deck) ?? DEFAULT_ANIMS : DEFAULT_ANIMS;
  // Animated patterns (28-31) cycle every 4 frames; use frameSlot as cache key.
  const frameSlot = Math.floor(frame / 4);
  const key = imageCacheKey(palette, frameSlot, screenOffsetX, screenOffsetY);

  let byKey = imageDataCache.get(image as object);
  if (!byKey) { byKey = new Map(); imageDataCache.set(image as object, byKey); }
  const cached = byKey.get(key);
  if (cached) return cached;

  const { x: width, y: height } = image.size;
  const imageData = new ImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = image.pix[x + y * width];
      const [r, g, b, a] = argbToRgba(
        pixelToARGB(palette, src, screenOffsetX + x, screenOffsetY + y, anim, frame)
      );
      const offset = (x + y * width) * 4;
      imageData.data[offset] = r;
      imageData.data[offset + 1] = g;
      imageData.data[offset + 2] = b;
      imageData.data[offset + 3] = a;
    }
  }
  byKey.set(key, imageData);
  return imageData;
}

function paletteForDeck(deck: DeckerDeck): Uint8Array | null {
  const patterns = DECKER.getField(deck, "patterns") as
    | { pal?: { pix?: Uint8Array } }
    | undefined;
  return patterns?.pal?.pix ?? null;
}

const BUILTIN_FONT_NAMES = new Set(["body", "menu", "mono"]);

/** Register any custom fonts embedded in the deck into the Mockintosh font registry. */
function registerEmbeddedFonts(deck: DeckerDeck): void {
  const fontsDict = DECKER.getField(deck, "fonts");
  const names = DECKER.dictKeys(fontsDict);
  const values = DECKER.dictValues<DeckerValue>(fontsDict);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    if (BUILTIN_FONT_NAMES.has(name) || hasDeckerFont(name)) continue;
    const fontObj = values[i];
    if (!fontObj || !DECKER.isFont(fontObj)) continue;
    try {
      const encoded = DECKER.writeFontEncoded(fontObj);
      if (encoded) registerDeckerFont(name, encoded);
    } catch {
      // Non-critical: skip fonts that fail to encode.
    }
  }
}

function stringField(
  target: DeckerRuntimeObject,
  key: string,
  fallback = ""
): string {
  const value = DECKER.getField(target, key);
  const text = DECKER.getString(value);
  return text || fallback;
}

function numberField(
  target: DeckerRuntimeObject,
  key: string,
  fallback = 0
): number {
  const value = DECKER.getField(target, key);
  const number = DECKER.getNumber(value);
  return Number.isFinite(number) ? number : fallback;
}

function boolField(
  target: DeckerRuntimeObject,
  key: string,
  fallback = false
): boolean {
  const value = DECKER.getField(target, key);
  if (value == null) return fallback;
  return DECKER.getBoolean(value);
}

function pairField(
  target: DeckerRuntimeObject,
  key: string,
  fallback: DeckerRect = { x: 0, y: 0, w: 0, h: 0 }
): DeckerRect {
  const value = DECKER.getField(target, key);
  if (value == null) return fallback;
  return DECKER.getPair(value);
}

function fontField(target: DeckerRuntimeObject, fallback: string): string {
  const fontName = stringField(target, "font", fallback);
  return hasDeckerFont(fontName) ? fontName : fallback;
}

function widgetRect(
  widget: DeckerWidget,
  offsetX = 0,
  offsetY = 0
): DeckerRect {
  const pos = pairField(widget, "pos");
  const size = pairField(widget, "size");
  return { x: offsetX + pos.x, y: offsetY + pos.y, w: size.x, h: size.y };
}

function pointInRect(rect: DeckerRect, x: number, y: number): boolean {
  return (
    x >= rect.x && y >= rect.y && x < rect.x + rect.w && y < rect.y + rect.h
  );
}

function drawButton(
  ctx: WindowContext,
  widget: DeckerWidget,
  rect: DeckerRect,
  selected: boolean
): void {
  const show = stringField(widget, "show", "solid");
  const style = stringField(widget, "style", "round");
  const label = stringField(widget, "text");
  const checked = boolField(widget, "value");
  const font = fontField(widget, "menu");

  // show=='none' is filtered upstream; 'invert' swaps fg/bg
  const transparent = show === "transparent" || show === "none";
  const invert = show === "invert";
  const fg = BLACK;
  const bg = WHITE;

  if (style === "invisible") {
    // Invisible buttons are transparent hotspots — draw text only, no background or border.
    if (label) {
      const textX = rect.x + Math.max(2, Math.floor((rect.w - measureText(label, font)) / 2));
      const textY = rect.y + Math.max(1, Math.floor((rect.h - 10) / 2));
      ctx.drawText(label, textX, textY, { font, color: fg });
    }
    if (selected) ctx.invertRect(rect.x, rect.y, rect.w, rect.h);
    return;
  }

  if (style === "check" || style === "radio") {
    if (!transparent) ctx.fillRect(rect.x, rect.y, rect.w, rect.h, bg);
    const boxSize = 11;
    const boxY = rect.y + Math.floor((rect.h - boxSize) / 2);
    ctx.drawRect(rect.x, boxY, boxSize, boxSize, fg);
    if (checked) {
      if (style === "check") {
        ctx.drawText("✓", rect.x + 1, boxY, { font: "body", color: fg });
      } else {
        ctx.fillRect(rect.x + 3, boxY + 3, 5, 5, fg);
      }
    }
    ctx.drawText(label, rect.x + boxSize + 4, rect.y + Math.floor((rect.h - 10) / 2), { font, color: fg });
    if (selected) ctx.invertRect(rect.x, rect.y, rect.w, rect.h);
    return;
  }

  // rect style: flat button with drop-shadow (bottom/right 1-pixel shadow line)
  if (style === "rect") {
    const bx = rect.x, by = rect.y, bw = rect.w - 1, bh = rect.h - 1;
    if (!transparent) ctx.fillRect(bx, by, bw, bh, invert ? fg : bg);
    ctx.drawRect(bx, by, bw, bh, invert ? bg : fg);
    // shadow lines
    ctx.drawHLine(bx + 2, by + bh, bw - 1, fg);
    ctx.drawVLine(bx + bw, by + 2, bh - 1, fg);
    const textW = measureText(label, font);
    ctx.drawText(label, bx + Math.max(3, Math.floor((bw - textW) / 2)), by + Math.max(1, Math.floor((bh - 10) / 2)), { font, color: invert ? bg : fg });
    if (selected) ctx.invertRect(bx, by, bw, bh);
    return;
  }

  // round (default) style
  if (!transparent) ctx.fillRect(rect.x, rect.y, rect.w, rect.h, invert ? fg : bg);
  ctx.drawRect(rect.x, rect.y, rect.w, rect.h, invert ? bg : fg);
  const textW = measureText(label, font);
  const textX = rect.x + Math.max(3, Math.floor((rect.w - textW) / 2));
  const textY = rect.y + Math.max(1, Math.floor((rect.h - 10) / 2));
  ctx.drawText(label, textX, textY, { font, color: invert ? bg : fg });
  if (selected) ctx.invertRect(rect.x, rect.y, rect.w, rect.h);
}

function drawField(
  ctx: WindowContext,
  widget: DeckerWidget,
  rect: DeckerRect,
  selected: boolean,
  focused: boolean,
  caretOffset: number
): void {
  const show = stringField(widget, "show", "solid");
  const invert = show === "invert";

  // Background fill (skip for transparent/none)
  if (show !== "transparent" && show !== "none") {
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h, invert ? BLACK : WHITE);
  }

  if (boolField(widget, "border", true)) {
    ctx.drawRect(rect.x, rect.y, rect.w, rect.h, invert ? WHITE : BLACK);
  }
  const text = DECKER.getString(DECKER.getField(widget, "value"));
  const font = fontField(
    widget,
    stringField(widget, "style", "rich") === "code" ? "mono" : "body"
  );
  ctx.drawTextBlock({
    text,
    x: rect.x + 3,
    y: rect.y + 3,
    maxWidth: Math.max(1, rect.w - 6),
    font,
    color: invert ? WHITE : BLACK,
  });
  if (focused && !boolField(widget, "locked")) {
    const beforeCaret = text.slice(0, caretOffset);
    const caretX = rect.x + 3 + measureText(beforeCaret, font);
    const lineHeight = 12;
    ctx.drawVLine(caretX, rect.y + 3, lineHeight, invert ? WHITE : BLACK);
  }
  if (selected) {
    ctx.invertRect(rect.x, rect.y, rect.w, rect.h);
  }
}

function drawSlider(
  ctx: WindowContext,
  widget: DeckerWidget,
  rect: DeckerRect,
  selected: boolean
): void {
  const interval = DECKER.dictValues<DeckerValue>(
    DECKER.getField(widget, "interval")
  );
  const min = interval.length > 0 ? DECKER.getNumber(interval[0]) : 0;
  const max = interval.length > 1 ? DECKER.getNumber(interval[1]) : 100;
  const value = numberField(widget, "value", min);
  const ratio =
    max === min ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min)));
  const knobX = rect.x + Math.floor(ratio * Math.max(0, rect.w - 8));
  const midY = rect.y + Math.floor(rect.h / 2);
  ctx.drawRect(rect.x, rect.y, rect.w, rect.h, BLACK);
  ctx.drawHLine(rect.x + 2, midY, Math.max(0, rect.w - 4), BLACK);
  ctx.fillRect(knobX, rect.y + 2, 8, Math.max(4, rect.h - 4), BLACK);
  if (selected) {
    ctx.invertRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
  }
}

function drawGrid(
  ctx: WindowContext,
  widget: DeckerWidget,
  rect: DeckerRect,
  selected: boolean
): void {
  const show = stringField(widget, "show", "solid");
  const invert = show === "invert";
  const fg = invert ? WHITE : BLACK;
  const bg = invert ? BLACK : WHITE;

  if (show !== "transparent") ctx.fillRect(rect.x, rect.y, rect.w, rect.h, bg);

  const value = DECKER.getField(widget, "value");
  const columns = DECKER.dictKeys(value);
  const columnValues = DECKER.dictValues<DeckerValue>(value);
  const rowCount =
    columnValues.length > 0 ? DECKER.dictValues(columnValues[0]).length : 0;

  const hasLines = boolField(widget, "lines");
  const hasHeaders = boolField(widget, "headers", true);
  const widths = DECKER.dictValues<DeckerValue>(DECKER.getField(widget, "widths") ?? ({} as DeckerValue))
    .map((v) => DECKER.getNumber(v));

  // Row height mirrors upstream: font_h(body=11) + (lines?5:3) = 14 or 16
  const HEADER_H = 16; // font_h(body)+5
  const ROW_H = hasLines ? 16 : 14;
  const headerOffset = hasHeaders ? HEADER_H : 0;
  const totalCols = columns.length;

  // Compute column widths: distribute remaining space among -1 (auto) columns
  const colWidths: number[] = [];
  let fixedTotal = 0;
  let autoCount = 0;
  for (let i = 0; i < totalCols; i++) {
    const w = i < widths.length ? widths[i] : -1;
    if (w >= 0) { colWidths[i] = w; fixedTotal += w; }
    else { colWidths[i] = -1; autoCount++; }
  }
  const autoW = autoCount > 0 ? Math.floor((rect.w - fixedTotal) / autoCount) : 0;
  for (let i = 0; i < totalCols; i++) {
    if (colWidths[i] < 0) colWidths[i] = autoW;
  }

  ctx.drawRect(rect.x, rect.y, rect.w, rect.h, fg);

  if (hasHeaders && columns.length > 0) {
    ctx.fillRect(rect.x, rect.y, rect.w, headerOffset, fg);
    let cx = rect.x;
    for (let i = 0; i < columns.length; i++) {
      ctx.drawText(columns[i], cx + 3, rect.y + 2, { font: "body", color: bg });
      cx += colWidths[i];
      if (i < columns.length - 1) ctx.drawVLine(cx, rect.y, headerOffset, bg);
    }
    ctx.drawHLine(rect.x, rect.y + headerOffset, rect.w, fg);
  }

  const visibleRows = Math.max(0, Math.floor((rect.h - headerOffset) / ROW_H));
  for (let row = 0; row < Math.min(rowCount, visibleRows); row++) {
    const rowY = rect.y + headerOffset + row * ROW_H;
    let cx = rect.x;
    for (let col = 0; col < columns.length; col++) {
      const cellArray = DECKER.dictValues<DeckerValue>(columnValues[col]);
      const cell = row < cellArray.length ? DECKER.getString(cellArray[row]) : "";
      ctx.drawText(cell, cx + 2, rowY + 2, { font: "mono", color: fg });
      cx += colWidths[col];
      if (hasLines && col < columns.length - 1) {
        ctx.drawVLine(cx, rowY, ROW_H, fg);
      }
    }
    if (hasLines) ctx.drawHLine(rect.x, rowY + ROW_H, rect.w, fg);
  }

  if (selected) {
    ctx.invertRect(rect.x, rect.y, rect.w, rect.h);
  }
}

function drawCanvas(
  ctx: WindowContext,
  deck: DeckerDeck,
  widget: DeckerWidget,
  rect: DeckerRect,
  selected: boolean,
  frame: number
): void {
  if (boolField(widget, "border", true)) {
    ctx.drawRect(rect.x, rect.y, rect.w, rect.h, BLACK);
  }
  const image = DECKER.getField(widget, "image");
  if (DECKER.isImage(image)) {
    ctx.blitImageData(
      imageToImageData(image, paletteForDeck(deck), deck, frame, rect.x, rect.y),
      rect.x,
      rect.y
    );
  }
  if (selected) {
    ctx.invertRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
  }
}

function renderWidgets(
  ctx: WindowContext,
  deck: DeckerDeck,
  widgets: DeckerWidget[],
  hits: WidgetHit[],
  selectedWidgetIndex: number,
  frame: number,
  focusedField: FocusedFieldState | null,
  offsetX = 0,
  offsetY = 0
): void {
  for (let i = 0; i < widgets.length; i++) {
    const widget = widgets[i];
    const show = stringField(widget, "show", "solid");
    if (show === "none") continue;

    const rect = widgetRect(widget, offsetX, offsetY);
    const selected = i === selectedWidgetIndex;
    hits.push({ index: i, widget, rect });

    if (DECKER.isButton(widget)) {
      drawButton(ctx, widget, rect, selected);
      continue;
    }
    if (DECKER.isField(widget)) {
      const focused = focusedField?.widgetIndex === i;
      drawField(
        ctx,
        widget,
        rect,
        selected,
        focused,
        focused ? focusedField!.caretOffset : 0
      );
      continue;
    }
    if (DECKER.isSlider(widget)) {
      drawSlider(ctx, widget, rect, selected);
      continue;
    }
    if (DECKER.isGrid(widget)) {
      drawGrid(ctx, widget, rect, selected);
      continue;
    }
    if (DECKER.isCanvas(widget)) {
      drawCanvas(ctx, deck, widget, rect, selected, frame);
      continue;
    }
    if (DECKER.isContraption(widget)) {
      const innerImage = DECKER.getField(widget, "image");
      if (DECKER.isImage(innerImage)) {
        ctx.blitImageData(
          imageToImageData(
            innerImage,
            paletteForDeck(deck),
            deck,
            frame,
            rect.x,
            rect.y
          ),
          rect.x,
          rect.y
        );
      }
      renderWidgets(
        ctx,
        deck,
        DECKER.widgets(widget as DeckerCard),
        hits,
        selected ? 0 : -1,
        frame,
        null,
        rect.x,
        rect.y
      );
    }
  }
}

async function saveDocument(
  state: DeckerDocumentState,
  setState: (
    value:
      | DeckerDocumentState
      | ((prev: DeckerDocumentState) => DeckerDocumentState)
  ) => void,
  props: any
): Promise<void> {
  if (!state.deck) return;
  const fs: FileManager | undefined = props._fs;
  const os: OSServices | undefined = props._os;
  if (!fs || !os) return;

  let fileId = state.fileId;
  let fileName = state.fileName;

  if (!fileId) {
    const entered = await os.showDialog({
      message: "Save the current Decker document to the internal filesystem.",
      buttons: ["Cancel", "Save"],
      showInput: true,
      inputDefault: fileName || "Untitled.deck",
    });
    if (!entered || entered === "Cancel") return;
    fileName = entered;
  }

  const existing = fileId ? fs.getNode(fileId) : null;
  const parent =
    existing?.parentId ??
    fs.findByName(
      fs.findByName("__root__", "Mockintosh HD")?.id ?? "__root__",
      "Development"
    )?.id ??
    fs.findByName("__root__", "Mockintosh HD")?.id ??
    "__root__";

  const html =
    fileName.toLowerCase().endsWith(".html") || state.sourceFormat === "html";
  const content = DECKER.writeDeck(state.deck, html);
  const written = await fs.writeFile(parent, fileName, content, "text");

  setState((prev) => ({
    ...prev,
    fileId: written.id,
    fileName: written.name,
    sourceFormat: html ? "html" : "deck",
    dirty: false,
  }));
}

export const DeckerApp: SystemApp = {
  id: "decker",
  title: "Decker",
  icon: "icon/computer",
  defaultSize: { width: 512, height: 342 },
  windowKind: "presentation",
  scrollable: false,
  resizable: false,

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const [docState, setDocState] = app.useState<DeckerDocumentState>({
      deck: null,
      fileId: props.fileId ?? null,
      fileName: props.title ?? props.fileName ?? "Untitled.deck",
      sourceFormat: "deck",
      dirty: false,
      error: null,
      transition: null,
      focusedField: null,
      gridEdit: null,
    });
    const [modeRaw] = app.useState<DeckerMode>("interact");
    const mode = normalizeDeckerMode(modeRaw);
    const [selectedWidgetIndex, setSelectedWidgetIndex] = app.useState(-1);
    const widgetHitsRef = app.useRef<WidgetHit[]>([]);
    app.useRef<WidgetDragState | null>(null);
    const frameCountRef = app.useRef(0);
    const setDocStateRef = app.useRef(setDocState);
    setDocStateRef.current = setDocState;

    app.useEffect(() => {
      if (!docState.deck) return;
      DECKER.setGoNotify?.((deck, dest, t, _url, delay) => {
        if (typeof dest !== "number" || dest < 0) return;
        const fromIndex = DECKER.getCardIndex(deck);
        const delayFrames =
          delay != null
            ? Math.max(1, Math.floor(DECKER.getNumber(delay as DeckerValue)))
            : 30;
        const name =
          typeof t === "string"
            ? t
            : t != null
            ? DECKER.getString(t as DeckerValue)
            : "";
        setDocStateRef.current?.((prev) => ({
          ...prev,
          transition: {
            fromIndex,
            toIndex: dest,
            delayFrames,
            name: name || "WipeRight",
            startFrame: frameCountRef.current + 1,
          },
        }));
      });
      const os: OSServices | undefined = props._os;
      DECKER.setHostPrimitives?.({
        alert: (args) => {
          if (os) {
            const msg = args.length ? DECKER.getString(args[0]) : "";
            void os.showDialog({ message: String(msg), buttons: ["OK"] });
          }
        },
        open: () => DECKER.makeString(""),
        save: () => undefined,
      });
    }, [docState.deck]);

    app.useEffect(() => {
      let cancelled = false;

      const load = async () => {
        try {
          const fs: FileManager | undefined = props._fs;
          let source = props.initialSource ?? BLANK_DECK_SOURCE;
          let fileName = props.title ?? props.fileName ?? "Untitled.deck";
          if (fs && props.fileId) {
            const raw = await fs.readFile(props.fileId);
            if (raw) source = raw;
            const node = fs.getNode(props.fileId);
            if (node?.kind === "file") fileName = node.name;
          }

          const deck = DECKER.readDeck(source);
          if (cancelled) return;
          registerEmbeddedFonts(deck);
          setSelectedWidgetIndex(-1);
          setDocState({
            deck,
            fileId: props.fileId ?? null,
            fileName,
            sourceFormat:
              fileName.toLowerCase().endsWith(".html") ||
              source.includes('language="decker"')
                ? "html"
                : "deck",
            dirty: false,
            error: null,
            transition: null,
            focusedField: null,
            gridEdit: null,
          });
        } catch (error) {
          if (cancelled) return;
          setDocState((prev) => ({
            ...prev,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load Decker file.",
          }));
        }
      };

      void load();
      return () => {
        cancelled = true;
      };
    }, [props.fileId, props.initialSource]);

    const cards = docState.deck ? DECKER.cards(docState.deck) : [];
    const currentCardIndex = docState.deck
      ? Math.max(
          0,
          Math.min(DECKER.getCardIndex(docState.deck), cards.length - 1)
        )
      : 0;
    const card = cards[currentCardIndex] ?? cards[0] ?? null;

    app.useEffect(() => {
      if (!docState.deck) return;
      let rafId: number;
      const loop = () => {
        DECKER.tick();
        app.scheduleRender();
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafId);
    }, [docState.deck]);

    const lastViewedCardRef = app.useRef<number>(-1);
    app.useEffect(() => {
      if (!docState.deck || !card) return;
      if (lastViewedCardRef.current === currentCardIndex) return;
      lastViewedCardRef.current = currentCardIndex;
      DECKER.fireEventAsync(card, "view", undefined);
      DECKER.tick();
    }, [docState.deck, card, currentCardIndex]);

    ctx.clear(WHITE);
    widgetHitsRef.current = [];

    if (docState.error) {
      ctx.drawTextBlock({
        text: docState.error,
        x: 8,
        y: 24,
        maxWidth: ctx.width - 16,
        font: "body",
        color: BLACK,
      });
      return;
    }

    if (!docState.deck) {
      ctx.drawText("Loading Decker...", 8, 24, { font: "body", color: BLACK });
      return;
    }

    if (!card) {
      ctx.drawText("This deck has no cards.", 8, 24, {
        font: "body",
        color: BLACK,
      });
      return;
    }

    frameCountRef.current += 1;
    const frame = frameCountRef.current;

    const trans = docState.transition;
    const deckSize = pairField(docState.deck, "size");
    const deckW = deckSize.x;
    const deckH = deckSize.y;
    if (trans) {
      const elapsed = frame - trans.startFrame;
      if (elapsed >= trans.delayFrames) {
        setDocState((prev) => ({ ...prev, transition: null }));
      } else {
        const tween = elapsed / trans.delayFrames;
        ctx.clear(WHITE);

        // Compute clip rect based on transition name.
        // Without framebuffer snapshots we approximate by revealing the destination card
        // from the appropriate direction.
        const name = (trans.name || "WipeRight").toLowerCase();
        let clipX = 0, clipY = 0, clipW = deckW, clipH = deckH;
        if (name === "wiperight" || name === "slideleft") {
          // Reveal left to right
          clipW = Math.ceil(deckW * tween);
        } else if (name === "wipeleft" || name === "slideright") {
          // Reveal right to left
          clipX = Math.floor(deckW * (1 - tween));
          clipW = deckW - clipX;
        } else if (name === "wipedown" || name === "slideup") {
          // Reveal top to bottom
          clipH = Math.ceil(deckH * tween);
        } else if (name === "wipeup" || name === "slidedown") {
          // Reveal bottom to top
          clipY = Math.floor(deckH * (1 - tween));
          clipH = deckH - clipY;
        } else {
          // Default: wipe right
          clipW = Math.ceil(deckW * tween);
        }

        if (clipW > 0 && clipH > 0) {
          ctx.pushClip(clipX, clipY, clipW, clipH);
          const bg = DECKER.getField(card, "image");
          if (DECKER.isImage(bg)) {
            ctx.blitImageData(
              imageToImageData(
                bg,
                paletteForDeck(docState.deck),
                docState.deck,
                frame
              ),
              0,
              0
            );
          }
          renderWidgets(
            ctx,
            docState.deck,
            DECKER.widgets(card),
            widgetHitsRef.current,
            mode === "widgets" ? selectedWidgetIndex : -1,
            frame,
            docState.focusedField
          );
          ctx.popClip();
        }
        if (mode === "draw") {
          ctx.fillRect(8, 8, 196, 18, WHITE);
          ctx.drawRect(8, 8, 196, 18, BLACK);
          ctx.drawText(
            "Draw mode shell is native; tools follow next.",
            12,
            11,
            { font: "body", color: BLACK }
          );
        }
        return;
      }
    }

    const background = DECKER.getField(card, "image");
    if (DECKER.isImage(background)) {
      ctx.blitImageData(
        imageToImageData(
          background,
          paletteForDeck(docState.deck),
          docState.deck,
          frame
        ),
        0,
        0
      );
    }

    renderWidgets(
      ctx,
      docState.deck,
      DECKER.widgets(card),
      widgetHitsRef.current,
      mode === "widgets" ? selectedWidgetIndex : -1,
      frame,
      docState.focusedField
    );

    const gridEdit = docState.gridEdit;
    if (gridEdit && gridEdit.widgetIndex < DECKER.widgets(card).length) {
      const gridWidget = DECKER.widgets(card)[gridEdit.widgetIndex];
      if (DECKER.isGrid(gridWidget)) {
        const rect = widgetRect(gridWidget);
        const value = DECKER.getField(gridWidget, "value");
        const columns = DECKER.dictKeys(value);
        const colCount = columns.length;
        const colW = colCount > 0 ? Math.floor(rect.w / colCount) : rect.w;
        const cellX = rect.x + gridEdit.col * colW;
        const cellY = rect.y + 16 + gridEdit.row * 12;
        const cellW = colW;
        const cellH = 12;
        ctx.fillRect(cellX, cellY, cellW, cellH, WHITE);
        ctx.drawRect(cellX, cellY, cellW, cellH, BLACK);
        ctx.pushClip(cellX + 2, cellY, Math.max(0, cellW - 4), cellH);
        ctx.drawText(gridEdit.text, cellX + 2, cellY + 1, {
          font: "body",
          color: BLACK,
        });
        const beforeCaret = gridEdit.text.slice(0, gridEdit.caretOffset);
        const caretX = cellX + 2 + measureText(beforeCaret, "body");
        ctx.drawVLine(caretX, cellY + 1, 10, BLACK);
        ctx.popClip();
      }
    }

    if (mode === "draw") {
      ctx.fillRect(8, 8, 196, 18, WHITE);
      ctx.drawRect(8, 8, 196, 18, BLACK);
      ctx.drawText("Draw mode shell is native; tools follow next.", 12, 11, {
        font: "body",
        color: BLACK,
      });
    }
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any, _size: WindowSize) {
    const [docState, setDocState] = app.useState<DeckerDocumentState>({
      deck: null,
      fileId: props.fileId ?? null,
      fileName: props.title ?? props.fileName ?? "Untitled.deck",
      sourceFormat: "deck",
      dirty: false,
      error: null,
      transition: null,
      focusedField: null,
      gridEdit: null,
    });
    const [modeRaw, setMode] = app.useState<DeckerMode>("interact");
    const mode = normalizeDeckerMode(modeRaw);
    const [selectedWidgetIndex, setSelectedWidgetIndex] = app.useState(-1);
    const widgetHitsRef = app.useRef<WidgetHit[]>([]);
    const dragRef = app.useRef<WidgetDragState | null>(null);

    if (!docState.deck) return;

    if (event.type === "mouseMove" && mode === "widgets" && dragRef.current) {
      const dx = (event.x ?? 0) - dragRef.current.startX;
      const dy = (event.y ?? 0) - dragRef.current.startY;
      DECKER.setField(
        dragRef.current.widget,
        "pos",
        DECKER.makePair(
          dragRef.current.origin.x + dx,
          dragRef.current.origin.y + dy
        )
      );
      setDocState((prev) => ({ ...prev, dirty: true }));
      return;
    }

    if (event.type === "mouseUp" && mode === "widgets") {
      dragRef.current = null;
      return;
    }

    if (event.type === "keyDown") {
      if (event.key === "1") setMode("interact");
      if (event.key === "2") setMode("widgets");
      if (event.key === "3") setMode("draw");

      const cards = DECKER.cards(docState.deck);
      const currentCardIndex = Math.max(
        0,
        Math.min(DECKER.getCardIndex(docState.deck), cards.length - 1)
      );
      const card = cards[currentCardIndex];
      const widgets = card ? DECKER.widgets(card) : [];
      const ge = docState.gridEdit;

      if (ge && ge.widgetIndex < widgets.length) {
        const gridWidget = widgets[ge.widgetIndex];
        if (DECKER.isGrid(gridWidget)) {
          if (event.key === "Escape") {
            setDocState((prev) => ({ ...prev, gridEdit: null }));
            return;
          }
          if (event.key === "Enter") {
            DECKER.setGridCell?.(gridWidget, ge.col, ge.row, ge.text);
            setDocState((prev) => ({ ...prev, gridEdit: null, dirty: true }));
            return;
          }
          let newText = ge.text;
          let newCaret = ge.caretOffset;
          if (event.key === "Backspace") {
            if (newCaret > 0) {
              newText =
                ge.text.slice(0, newCaret - 1) + ge.text.slice(newCaret);
              newCaret--;
            }
          } else if (event.key === "Delete") {
            if (newCaret < ge.text.length) {
              newText =
                ge.text.slice(0, newCaret) + ge.text.slice(newCaret + 1);
            }
          } else if (event.key === "ArrowLeft") {
            newCaret = Math.max(0, ge.caretOffset - 1);
            setDocState((prev) => ({
              ...prev,
              gridEdit: { ...ge, caretOffset: newCaret },
            }));
            return;
          } else if (event.key === "ArrowRight") {
            newCaret = Math.min(ge.text.length, ge.caretOffset + 1);
            setDocState((prev) => ({
              ...prev,
              gridEdit: { ...ge, caretOffset: newCaret },
            }));
            return;
          } else if (
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey
          ) {
            newText =
              ge.text.slice(0, ge.caretOffset) +
              event.key +
              ge.text.slice(ge.caretOffset);
            newCaret = ge.caretOffset + 1;
          } else {
            return;
          }
          setDocState((prev) => ({
            ...prev,
            gridEdit: { ...ge, text: newText, caretOffset: newCaret },
            dirty: true,
          }));
          return;
        }
      }

      const focused = docState.focusedField;

      if (focused && focused.widgetIndex < widgets.length) {
        const w = widgets[focused.widgetIndex];
        if (DECKER.isField(w) && !boolField(w, "locked")) {
          const text = DECKER.getString(DECKER.getField(w, "value"));
          let newText = text;
          let newCaret = focused.caretOffset;

          if (event.key === "Tab") {
            const dir = event.shiftKey ? -1 : 1;
            let next =
              (focused.widgetIndex + dir + widgets.length) % widgets.length;
            for (let i = 0; i < widgets.length; i++) {
              const ww = widgets[next];
              if (
                DECKER.isField(ww) ||
                DECKER.isGrid(ww) ||
                DECKER.isButton(ww)
              ) {
                const caret =
                  DECKER.isField(ww) && !boolField(ww, "locked")
                    ? DECKER.getString(DECKER.getField(ww, "value")).length
                    : 0;
                setDocState((prev) => ({
                  ...prev,
                  focusedField: { widgetIndex: next, caretOffset: caret },
                }));
                return;
              }
              next = (next + dir + widgets.length) % widgets.length;
            }
            setDocState((prev) => ({ ...prev, focusedField: null }));
            return;
          }

          if (event.key === "Backspace") {
            if (newCaret > 0) {
              newText = text.slice(0, newCaret - 1) + text.slice(newCaret);
              newCaret--;
            }
          } else if (event.key === "Delete") {
            if (newCaret < text.length) {
              newText = text.slice(0, newCaret) + text.slice(newCaret + 1);
            }
          } else if (event.key === "ArrowLeft") {
            newCaret = Math.max(0, newCaret - 1);
            setDocState((prev) => ({
              ...prev,
              focusedField: {
                widgetIndex: focused.widgetIndex,
                caretOffset: newCaret,
              },
              dirty: true,
            }));
            return;
          } else if (event.key === "ArrowRight") {
            newCaret = Math.min(text.length, newCaret + 1);
            setDocState((prev) => ({
              ...prev,
              focusedField: {
                widgetIndex: focused.widgetIndex,
                caretOffset: newCaret,
              },
              dirty: true,
            }));
            return;
          } else if (
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey
          ) {
            newText =
              text.slice(0, newCaret) + event.key + text.slice(newCaret);
            newCaret++;
          } else {
            return;
          }

          DECKER.setField(w, "value", DECKER.makeString(newText));
          setDocState((prev) => ({
            ...prev,
            focusedField: {
              widgetIndex: focused.widgetIndex,
              caretOffset: newCaret,
            },
            dirty: true,
          }));
          return;
        }
      }

      if (event.key === "ArrowRight") {
        const next = Math.min(cards.length - 1, currentCardIndex + 1);
        DECKER.setField(docState.deck, "card", DECKER.makeNumber(next));
        setDocState((prev) => ({ ...prev, focusedField: null }));
      }
      if (event.key === "ArrowLeft") {
        const prevCard = Math.max(0, currentCardIndex - 1);
        DECKER.setField(docState.deck, "card", DECKER.makeNumber(prevCard));
        setDocState((prev) => ({ ...prev, focusedField: null }));
      }
      return;
    }

    if (event.type !== "mouseDown") return;
    const x = event.x ?? 0;
    const y = event.y ?? 0;
    const cards = DECKER.cards(docState.deck);
    const currentCardIndex = Math.max(
      0,
      Math.min(DECKER.getCardIndex(docState.deck), cards.length - 1)
    );
    const card = cards[currentCardIndex];
    const widgets = card ? DECKER.widgets(card) : [];
    const hits: WidgetHit[] = [];
    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      if (stringField(widget, "show", "solid") === "none") continue;
      const rect = widgetRect(widget);
      hits.push({ index: i, widget, rect });
    }

    const under = hits.filter((h) => pointInRect(h.rect, x, y));
    if (under.length === 0) {
      if (mode !== "widgets" && mode !== "draw") {
        setDocState((prev) => ({ ...prev, focusedField: null, gridEdit: null }));
      }
      return;
    }

    if (mode === "widgets") {
      under.sort((a, b) => b.index - a.index);
      const hit = under[0];
      setSelectedWidgetIndex(hit.index);
      dragRef.current = {
        widget: hit.widget,
        startX: x,
        startY: y,
        origin: pairField(hit.widget, "pos"),
      };
      return;
    }

    if (mode === "draw") {
      return;
    }

    // Interact (default): prefer buttons/canvases over overlapping fields so clicks run scripts.
    under.sort((a, b) => {
      const pri = (w: DeckerWidget) => {
        if (DECKER.isButton(w)) return 0;
        if (DECKER.isCanvas(w)) return 1;
        if (DECKER.isSlider(w)) return 2;
        if (DECKER.isGrid(w)) return 3;
        if (DECKER.isField(w)) return 4;
        return 5;
      };
      const d = pri(a.widget) - pri(b.widget);
      if (d !== 0) return d;
      return b.index - a.index;
    });
    const hit = under[0];

    if (DECKER.isField(hit.widget) && !boolField(hit.widget, "locked")) {
      const text = DECKER.getString(DECKER.getField(hit.widget, "value"));
      setDocState((prev) => ({
        ...prev,
        focusedField: { widgetIndex: hit.index, caretOffset: text.length },
        gridEdit: null,
        dirty: true,
      }));
      return;
    }
    if (DECKER.isGrid(hit.widget) && !boolField(hit.widget, "locked")) {
      const value = DECKER.getField(hit.widget, "value");
      const columns = DECKER.dictKeys(value);
      const columnValues = DECKER.dictValues<DeckerValue>(value);
      const colCount = columns.length;
      const colW =
        colCount > 0 ? Math.floor(hit.rect.w / colCount) : hit.rect.w;
      const localX = x - hit.rect.x;
      const localY = y - hit.rect.y;
      const row = Math.max(0, Math.floor((localY - 16) / 12));
      const col = Math.max(
        0,
        Math.min(colCount - 1, Math.floor(localX / colW))
      );
      let cellText = "";
      if (columnValues[col]) {
        const rowValues = DECKER.dictValues<DeckerValue>(columnValues[col]);
        const cell = rowValues[row];
        cellText = cell != null ? DECKER.getString(cell) : "";
      }
      setDocState((prev) => ({
        ...prev,
        focusedField: null,
        gridEdit: {
          widgetIndex: hit.index,
          row,
          col,
          text: cellText,
          caretOffset: cellText.length,
        },
        dirty: true,
      }));
      return;
    }
    setDocState((prev) => ({
      ...prev,
      focusedField: null,
      gridEdit: null,
    }));
    if (
      DECKER.isButton(hit.widget) &&
      stringField(hit.widget, "style") === "check"
    ) {
      const nextValue = boolField(hit.widget, "value") ? 0 : 1;
      DECKER.setField(hit.widget, "value", DECKER.makeNumber(nextValue));
    }
    let clickArg: DeckerValue | undefined;
    if (DECKER.isCanvas(hit.widget)) {
      clickArg = DECKER.makePair(x - hit.rect.x, y - hit.rect.y);
    } else if (DECKER.isGrid(hit.widget)) {
      const row = Math.max(0, Math.floor((y - hit.rect.y - 16) / 12));
      clickArg = DECKER.makeNumber(row);
    }
    DECKER.fireEventAsync(hit.widget, "click", clickArg);
    DECKER.tick();

    setDocState((prev) => ({ ...prev, dirty: true }));
  },

  getMenubar(app: AppBuilder, props: any): MenubarDefinition[] {
    const [docState, setDocState] = app.useState<DeckerDocumentState>({
      deck: null,
      fileId: props.fileId ?? null,
      fileName: props.title ?? props.fileName ?? "Untitled.deck",
      sourceFormat: "deck",
      dirty: false,
      error: null,
      transition: null,
      focusedField: null,
      gridEdit: null,
    });
    const [modeRaw, setMode] = app.useState<DeckerMode>("interact");
    const mode = normalizeDeckerMode(modeRaw);
    const [selectedWidgetIndex] = app.useState(-1);
    app.useRef<WidgetHit[]>([]);
    app.useRef<WidgetDragState | null>(null);

    const cards = docState.deck ? DECKER.cards(docState.deck) : [];
    const currentCardIndex = docState.deck
      ? Math.max(
          0,
          Math.min(DECKER.getCardIndex(docState.deck), cards.length - 1)
        )
      : 0;
    const activeCard = cards[currentCardIndex] ?? cards[0] ?? null;
    const activeWidget =
      activeCard && selectedWidgetIndex >= 0
        ? DECKER.widgets(activeCard)[selectedWidgetIndex] ?? null
        : null;

    const markDirty = () =>
      setDocState((prev) => ({
        ...prev,
        dirty: true,
      }));

    const toggleNumericFlag = (key: string) => {
      if (!activeWidget) return;
      const next = boolField(activeWidget, key) ? 0 : 1;
      DECKER.setField(activeWidget, key, DECKER.makeNumber(next));
      markDirty();
    };

    const setShowMode = (value: string) => {
      if (!activeWidget) return;
      DECKER.setField(activeWidget, "show", DECKER.makeString(value));
      markDirty();
    };

    return [
      {
        label: "File",
        items: [
          {
            label: "Save",
            shortcut: "S",
            disabled: !docState.deck,
            onClick: () => {
              void saveDocument(docState, setDocState, props);
            },
          },
        ],
      },
      {
        label: "View",
        items: [
          {
            type: "radiogroup",
            value: mode,
            onValueChange: (value: string) => setMode(value as DeckerMode),
            items: [
              { label: "Interact", value: "interact" },
              { label: "Widgets", value: "widgets" },
              { label: "Draw", value: "draw" },
            ],
          },
        ],
      },
      {
        label: "Cards",
        items: [
          {
            label: "Previous Card",
            shortcut: "[",
            disabled: currentCardIndex <= 0,
            onClick: () => {
              if (!docState.deck) return;
              const next = Math.max(0, currentCardIndex - 1);
              DECKER.setField(docState.deck, "card", DECKER.makeNumber(next));
              markDirty();
            },
          },
          {
            label: "Next Card",
            shortcut: "]",
            disabled:
              !docState.deck ||
              currentCardIndex >= Math.max(0, cards.length - 1),
            onClick: () => {
              if (!docState.deck) return;
              const next = Math.min(cards.length - 1, currentCardIndex + 1);
              DECKER.setField(docState.deck, "card", DECKER.makeNumber(next));
              markDirty();
            },
          },
        ],
      },
      {
        label: "Widget",
        items: [
          {
            label: "Toggle Locked",
            disabled: mode !== "widgets" || !activeWidget,
            onClick: () => toggleNumericFlag("locked"),
          },
          {
            label: "Toggle Animated",
            disabled: mode !== "widgets" || !activeWidget,
            onClick: () => toggleNumericFlag("animated"),
          },
          {
            label: "Toggle Volatile",
            disabled: mode !== "widgets" || !activeWidget,
            onClick: () => toggleNumericFlag("volatile"),
          },
          { type: "separator" },
          {
            label: "Show Solid",
            disabled: mode !== "widgets" || !activeWidget,
            onClick: () => setShowMode("solid"),
          },
          {
            label: "Show Transparent",
            disabled: mode !== "widgets" || !activeWidget,
            onClick: () => setShowMode("transparent"),
          },
          {
            label: "Show Invert",
            disabled: mode !== "widgets" || !activeWidget,
            onClick: () => setShowMode("invert"),
          },
          {
            label: "Show None",
            disabled: mode !== "widgets" || !activeWidget,
            onClick: () => setShowMode("none"),
          },
        ],
      },
    ];
  },
};
