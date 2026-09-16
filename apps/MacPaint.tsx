import { For, Show, createEffect, createSignal, onSettled } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import {
  defineApp,
  useApp,
  MIME,
  readSpriteFile,
  writeSpriteFile,
  type MenubarItemDef,
  type Sprite,
} from "@mockintosh/sdk";
import type { RasterSurface } from "@mockintosh/ui";
import {
  brushStamp,
  clearRect,
  cloneBitmap,
  createBitmap,
  eraserStamp,
  fillOval,
  fillRectPattern,
  fillRectPixels,
  fillRoundRect,
  floodFill,
  frameOval,
  frameRect,
  frameRoundRect,
  getPixel,
  invertRect,
  normalizeRect,
  plotPattern,
  resizeBitmap,
  setPixel,
  spray,
  strokeLine,
  walkLine,
  type Bitmap,
  type Rect,
} from "./macpaint/engine";
import { APP_ICON, TOOL_ICONS } from "./macpaint/icons";
import { GRAY50_PATTERN, PAINT_PATTERNS, type Pattern } from "./macpaint/patterns";
import {
  PEN_SIZES,
  SHAPE_TOOLS,
  SIZE_TOOLS,
  TOOL_GRID,
  type PenSize,
  type ToolId,
} from "./macpaint/tools";

const TOOLS_W = 37;
const PAT_H = 31;
const CELL = 16;
const UNDO_LIMIT = 16;
const DEFAULT_NAME = "Untitled";

type ShapeStyle = "frame" | "paint";

function pointInRect(x: number, y: number, r: Rect): boolean {
  return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
}

function blitSprite(sprite: Sprite, dst: Bitmap): void {
  const cw = Math.min(sprite.width, dst.width);
  const ch = Math.min(sprite.height, dst.height);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      dst.pixels[y * dst.width + x] = sprite.data[y * sprite.width + x] ? 1 : 0;
    }
  }
}

function drawAnts(surface: RasterSurface, r: Rect): void {
  const x1 = r.x + r.w - 1;
  const y1 = r.y + r.h - 1;
  const plot = (x: number, y: number) => {
    if ((x + y) % 2 === 0) surface.setPixel(x, y, 1);
    else surface.setPixel(x, y, 0);
  };
  for (let x = r.x; x <= x1; x++) {
    plot(x, r.y);
    plot(x, y1);
  }
  for (let y = r.y; y <= y1; y++) {
    plot(r.x, y);
    plot(x1, y);
  }
}

function ToolButton(props: { id: ToolId; selected: boolean; onSelect: () => void }): JSX.Element {
  const icon = TOOL_ICONS[props.id];
  return (
    <box
      width={CELL}
      height={CELL}
      semantic={{ name: `tool-${props.id}`, role: "button", value: props.selected ? "on" : "off" }}
      onClick={props.onSelect}
    >
      <raster
        width={CELL}
        height={CELL}
        revision={props.selected ? 1 : 0}
        onPaint={(surface) => {
          for (let y = 0; y < CELL; y++) {
            for (let x = 0; x < CELL; x++) {
              const i = y * CELL + x;
              const ink = icon.data[i] ? 1 : 0;
              surface.setPixel(x, y, props.selected ? (ink ? 0 : 1) : ink);
            }
          }
        }}
      />
    </box>
  );
}

function MacPaint(props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const win = app.window;
  const { print } = app;

  const [doc, setDoc] = createSignal(createBitmap(8, 8), { ownedWrite: true });
  const [rev, setRev] = createSignal(0);
  const [tool, setTool] = createSignal<ToolId>("pencil");
  const [pattern, setPattern] = createSignal<Pattern>(GRAY50_PATTERN);
  const [penSize, setPenSize] = createSignal<PenSize>(1);
  const [shapeStyle, setShapeStyle] = createSignal<ShapeStyle>("frame");
  const [selection, setSelection] = createSignal<Rect | null>(null);
  const [draftSel, setDraftSel] = createSignal<Rect | null>(null);
  const [dirty, setDirty] = createSignal(false);
  const [canUndo, setCanUndo] = createSignal(false);
  const [fileId, setFileId] = createSignal<string | undefined>(
    typeof props.fileId === "string" ? props.fileId : undefined,
  );
  const [fileName, setFileName] = createSignal<string | undefined>(
    typeof props.title === "string" ? props.title : undefined,
  );

  const undoStack: Bitmap[] = [];
  let stroke: {
    tool: ToolId;
    x0: number;
    y0: number;
    lastX: number;
    lastY: number;
    polarity: 0 | 1;
    snapshot: Bitmap;
  } | null = null;

  const bump = () => setRev((n) => n + 1);

  const viewW = () => Math.max(8, win.width() - TOOLS_W);
  const viewH = () => Math.max(8, win.height() - PAT_H);

  createEffect(
    () => ({ w: viewW(), h: viewH(), cur: doc() }),
    ({ w, h, cur }) => {
      if (cur.width === w && cur.height === h) return;
      setDoc(resizeBitmap(cur, w, h));
      bump();
    },
  );

  createEffect(
    () => ({ dirty: dirty(), name: fileName() ?? DEFAULT_NAME }),
    ({ dirty: isDirty, name }) => win.setTitle(isDirty ? `${name} •` : name),
  );

  function pushUndo(): void {
    undoStack.push(cloneBitmap(doc()));
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
    setCanUndo(true);
  }

  function undo(): void {
    const prev = undoStack.pop();
    if (!prev) return;
    const cur = doc();
    setDoc(
      prev.width === cur.width && prev.height === cur.height
        ? prev
        : resizeBitmap(prev, cur.width, cur.height),
    );
    setCanUndo(undoStack.length > 0);
    setDirty(true);
    setSelection(null);
    setDraftSel(null);
    bump();
  }

  function targetRect(): Rect {
    return selection() ?? { x: 0, y: 0, w: doc().width, h: doc().height };
  }

  function markDirty(): void {
    setDirty(true);
  }

  function previewShape(x: number, y: number): void {
    if (!stroke) return;
    doc().pixels.set(stroke.snapshot.pixels);
    const pat = pattern();
    const ink = (px: number, py: number) => setPixel(doc(), px, py, 1);
    const dither = (px: number, py: number) => plotPattern(doc(), px, py, pat);
    const t = stroke.tool;
    const size = penSize();
    if (t === "line") {
      strokeLine(stroke.x0, stroke.y0, x, y, size, ink);
      return;
    }
    const r = normalizeRect(stroke.x0, stroke.y0, x, y);
    if (shapeStyle() === "paint") {
      if (t === "rect") fillRectPixels(r, dither);
      else if (t === "rrect") fillRoundRect(r, dither);
      else if (t === "oval") fillOval(r, dither);
      return;
    }
    if (t === "rect") frameRect(r, size, ink);
    else if (t === "rrect") frameRoundRect(r, size, ink);
    else if (t === "oval") frameOval(r, size, ink);
  }

  function applyFreehand(x: number, y: number, first: boolean): void {
    if (!stroke) return;
    const t = stroke.tool;
    const pat = pattern();
    const size = penSize();
    const fromX = first ? x : stroke.lastX;
    const fromY = first ? y : stroke.lastY;
    if (t === "pencil") {
      walkLine(fromX, fromY, x, y, (px, py) => setPixel(doc(), px, py, stroke!.polarity));
    } else if (t === "brush") {
      walkLine(fromX, fromY, x, y, (px, py) => brushStamp(doc(), px, py, size, pat));
    } else if (t === "eraser") {
      walkLine(fromX, fromY, x, y, (px, py) => eraserStamp(doc(), px, py, Math.max(4, size * 2)));
    } else if (t === "spray") {
      spray(doc(), x, y, Math.max(6, size * 3), pat);
    } else if (t === "fill" && first) {
      floodFill(doc(), x, y, pat);
    }
    stroke.lastX = x;
    stroke.lastY = y;
  }

  function pointerDown(lx: number, ly: number): void {
    const x = Math.floor(lx);
    const y = Math.floor(ly);
    const t = tool();
    if (t === "select") {
      stroke = { tool: t, x0: x, y0: y, lastX: x, lastY: y, polarity: 0, snapshot: doc() };
      setSelection(null);
      setDraftSel({ x, y, w: 1, h: 1 });
      return;
    }
    pushUndo();
    markDirty();
    setSelection(null);
    setDraftSel(null);
    stroke = {
      tool: t,
      x0: x,
      y0: y,
      lastX: x,
      lastY: y,
      polarity: getPixel(doc(), x, y) ? 0 : 1,
      snapshot: cloneBitmap(doc()),
    };
    if (SHAPE_TOOLS.has(t)) previewShape(x, y);
    else applyFreehand(x, y, true);
    bump();
  }

  function pointerDrag(lx: number, ly: number): void {
    if (!stroke) return;
    const x = Math.floor(lx);
    const y = Math.floor(ly);
    if (stroke.tool === "select") {
      setDraftSel(normalizeRect(stroke.x0, stroke.y0, x, y));
      return;
    }
    if (SHAPE_TOOLS.has(stroke.tool)) previewShape(x, y);
    else applyFreehand(x, y, false);
    bump();
  }

  function pointerUp(lx: number, ly: number): void {
    if (!stroke) return;
    const x = Math.floor(lx);
    const y = Math.floor(ly);
    if (stroke.tool === "select") {
      const r = normalizeRect(stroke.x0, stroke.y0, x, y);
      setDraftSel(null);
      setSelection(r.w > 1 || r.h > 1 ? r : null);
      stroke = null;
      return;
    }
    if (SHAPE_TOOLS.has(stroke.tool)) previewShape(x, y);
    stroke = null;
    bump();
  }

  function desktopSprites() {
    const desktop = app.fs.locate("desktop");
    if (!desktop) return [];
    return app.fs.children(desktop.id).filter((n) => n.kind === "file" && n.type === MIME.sprite);
  }

  async function confirmDiscard(): Promise<boolean> {
    if (!dirty()) return true;
    const choice = await app.os.showDialog({
      message: "Save changes before continuing?",
      buttons: ["Cancel", "Don't Save", "Save"],
      variant: "caution",
    });
    if (choice === "Save") {
      await save();
      return !dirty();
    }
    return choice === "Don't Save";
  }

  async function loadFile(id: string, name: string): Promise<void> {
    const sprite = await readSpriteFile(app.fs, id);
    if (!sprite) {
      await app.os.showDialog({ message: `Couldn't read "${name}".`, variant: "note" });
      return;
    }
    const next = createBitmap(doc().width, doc().height);
    blitSprite(sprite, next);
    setDoc(next);
    setFileId(id);
    setFileName(name);
    setDirty(false);
    undoStack.length = 0;
    setCanUndo(false);
    setSelection(null);
    setDraftSel(null);
    bump();
  }

  async function writeNamed(name: string): Promise<void> {
    const existing = fileId() ? app.fs.file(fileId()!) : undefined;
    const desktop = app.fs.locate("desktop");
    const parentId = existing?.parentId ?? desktop?.id;
    if (!parentId) return;
    const cur = doc();
    const file = await writeSpriteFile(
      app.fs,
      parentId,
      name,
      { width: cur.width, height: cur.height, data: cur.pixels },
      { attributes: { icon: "macpaint/icon" } },
    );
    setFileId(file.id);
    setFileName(name);
    setDirty(false);
  }

  async function saveAs(): Promise<void> {
    const name = await app.os.showDialog({
      message: "Save painting as:",
      buttons: ["Cancel", "Save"],
      showInput: true,
      inputDefault: fileName() ?? DEFAULT_NAME,
      variant: "note",
    });
    const trimmed = name?.trim();
    if (!trimmed) return;
    try {
      await writeNamed(trimmed);
    } catch (err) {
      await app.os.showDialog({
        message: `Couldn't save: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  async function save(): Promise<void> {
    if (fileId() && fileName()) {
      try {
        await writeNamed(fileName()!);
      } catch (err) {
        await app.os.showDialog({
          message: `Couldn't save: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
      return;
    }
    await saveAs();
  }

  async function newPainting(): Promise<void> {
    if (!(await confirmDiscard())) return;
    setDoc(createBitmap(doc().width, doc().height));
    undoStack.length = 0;
    setCanUndo(false);
    setFileId(undefined);
    setFileName(undefined);
    setDirty(false);
    setSelection(null);
    setDraftSel(null);
    bump();
  }

  async function openPainting(): Promise<void> {
    if (!(await confirmDiscard())) return;
    const files = desktopSprites();
    if (files.length === 0) {
      await app.os.showDialog({ message: "No paintings on the desktop.", variant: "note" });
      return;
    }
    if (files.length <= 6) {
      const choice = await app.os.showDialog({
        message: "Open which painting?",
        buttons: [...files.map((f) => f.name), "Cancel"],
        variant: "note",
      });
      if (!choice || choice === "Cancel") return;
      const file = files.find((f) => f.name === choice);
      if (file) await loadFile(file.id, file.name);
      return;
    }
    const typed = await app.os.showDialog({
      message: "Name of a painting on the desktop:",
      buttons: ["Cancel", "Open"],
      showInput: true,
      variant: "note",
    });
    const name = typed?.trim();
    if (!name) return;
    const file = files.find((f) => f.name === name);
    if (!file) {
      await app.os.showDialog({ message: `"${name}" isn't on the desktop.`, variant: "note" });
      return;
    }
    await loadFile(file.id, file.name);
  }

  async function printPainting(): Promise<void> {
    if (!print) return;
    const cur = doc();
    try {
      await print.printPicture(
        { width: cur.width, height: cur.height, data: cur.pixels },
        { caption: fileName() },
      );
    } catch (err) {
      await app.os.showDialog({
        message: `Couldn't print: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  function editFill(): void {
    pushUndo();
    fillRectPattern(doc(), targetRect(), pattern());
    markDirty();
    bump();
  }

  function editInvert(): void {
    pushUndo();
    invertRect(doc(), targetRect());
    markDirty();
    bump();
  }

  function editClear(): void {
    pushUndo();
    clearRect(doc(), targetRect());
    markDirty();
    bump();
  }

  onSettled(() => {
    if (typeof props.fileId !== "string") return;
    void loadFile(props.fileId, typeof props.title === "string" ? props.title : DEFAULT_NAME);
  });

  createEffect(
    () => ({ dirty: dirty(), fileId: fileId(), canUndo: canUndo(), shapeStyle: shapeStyle(), penSize: penSize() }),
    ({ dirty: isDirty, fileId: id, canUndo: undoable, shapeStyle: style, penSize: size }) => {
    const fileItems: MenubarItemDef[] = [
      { label: "New", shortcut: "N", onClick: () => void newPainting() },
      { label: "Open…", shortcut: "O", onClick: () => void openPainting() },
      { type: "separator" },
      { label: "Save", shortcut: "S", onClick: () => void save(), disabled: !isDirty && !!id },
      { label: "Save As…", onClick: () => void saveAs() },
    ];
    if (print) {
      fileItems.push({ type: "separator" }, { label: "Print…", shortcut: "P", onClick: () => void printPainting() });
    }
    app.setMenus([
      {
        label: "File",
        items: fileItems,
      },
      {
        label: "Edit",
        items: [
          { label: "Undo", shortcut: "Z", disabled: !undoable, onClick: undo },
          { type: "separator" },
          { label: "Fill", onClick: editFill },
          { label: "Invert", onClick: editInvert },
          { label: "Clear", onClick: editClear },
        ],
      },
      {
        label: "Goodies",
        items: [
          {
            type: "radiogroup",
            value: style,
            onValueChange: (v) => setShapeStyle(v as ShapeStyle),
            items: [
              { label: "Frame", value: "frame" },
              { label: "Paint", value: "paint" },
            ],
          },
          { type: "separator" },
          {
            type: "radiogroup",
            value: String(size),
            onValueChange: (v) => setPenSize(Number(v) as PenSize),
            items: PEN_SIZES.map((n) => ({ label: `${n}-pixel`, value: String(n) })),
          },
        ],
      },
    ]);
    },
  );

  const ants = () => draftSel() ?? selection();

  return (
    <box width={win.width()} height={win.height()} flexDirection="row" background={0}>
      <box
        width={TOOLS_W - 1}
        height={win.height()}
        padding={2}
        flexDirection="column"
        gap={1}
        background={0}
      >
        <For each={TOOL_GRID}>
          {(row) => (
            <box flexDirection="row" gap={1}>
              <For each={row}>
                {(id) => (
                  <ToolButton id={id} selected={tool() === id} onSelect={() => setTool(id)} />
                )}
              </For>
            </box>
          )}
        </For>
      </box>
      <box width={1} height={win.height()} background={1} />
      <box flexGrow={1} height={win.height()} flexDirection="column">
        <raster
          width={viewW()}
          height={viewH()}
          revision={rev() + (ants() ? 1 : 0)}
          semantic={{ name: "canvas", role: "canvas" }}
          onMouseDown={pointerDown}
          onDrag={pointerDrag}
          onMouseUp={pointerUp}
          onPaint={(surface) => {
            surface.fill(0);
            const cur = doc();
            surface.blitPixels(cur.pixels, cur.width, cur.height);
            const r = ants();
            if (r) drawAnts(surface, r);
          }}
        />
        <box height={1} background={1} />
        <box height={PAT_H - 1} flexDirection="row" alignItems="center" padding={2} gap={3} background={0}>
          <box
            width={24}
            height={24}
            background={pattern()}
            borderColor={1}
            borderWidth={1}
            semantic={{ name: "pattern-current", role: "preview" }}
          />
          <Show when={SIZE_TOOLS.has(tool())}>
            <box flexDirection="row" gap={1} alignItems="center">
              <For each={[...PEN_SIZES]}>
                {(n) => (
                  <box
                    width={12}
                    height={24}
                    justifyContent="center"
                    alignItems="center"
                    background={penSize() === n ? 1 : 0}
                    semantic={{ name: `pen-${n}`, role: "button", value: penSize() === n ? "on" : "off" }}
                    onClick={() => setPenSize(n)}
                  >
                    <box width={8} height={n} background={penSize() === n ? 0 : 1} />
                  </box>
                )}
              </For>
            </box>
          </Show>
          <box flexDirection="column" gap={1}>
            <box flexDirection="row" gap={1}>
              <For each={PAINT_PATTERNS.slice(0, 19)}>
                {(pat, i) => (
                  <box
                    width={10}
                    height={10}
                    background={pat}
                    borderColor={1}
                    borderWidth={pattern() === pat ? 1 : 0}
                    semantic={{ name: `pattern-${i()}`, role: "button" }}
                    onClick={() => setPattern(pat)}
                  />
                )}
              </For>
            </box>
            <box flexDirection="row" gap={1}>
              <For each={PAINT_PATTERNS.slice(19)}>
                {(pat, i) => (
                  <box
                    width={10}
                    height={10}
                    background={pat}
                    borderColor={1}
                    borderWidth={pattern() === pat ? 1 : 0}
                    semantic={{ name: `pattern-${i() + 19}`, role: "button" }}
                    onClick={() => setPattern(pat)}
                  />
                )}
              </For>
            </box>
          </box>
        </box>
      </box>
    </box>
  );
}

export const sprites: Record<string, Sprite> = {
  "macpaint/icon": APP_ICON,
};

export default defineApp({
  id: "macpaint",
  title: "MacPaint",
  icon: "macpaint/icon",
  defaultSize: { width: 480, height: 276 },
  minSize: { width: 260, height: 140 },
  resizable: true,
  scrollable: false,
  singleInstance: true,
  sprites,
  Component: MacPaint,
  onOpen(app, props) {
    app.openWindow({
      props,
      position: { x: 8, y: 28 },
    });
  },
});
