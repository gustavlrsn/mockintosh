import { For, Show, createEffect, createSignal, onSettled } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { fontLineHeight } from "@mockintosh/ui";
import {
  defineApp,
  measureText,
  MIME,
  TextInput,
  useApp,
  type MenubarItemDef,
  type Sprite,
} from "@mockintosh/sdk";
import {
  ALL_RESIZE_HANDLES,
  allocateId,
  applyResize,
  assignLine,
  bringToFront,
  cloneDocument,
  cornerRadius,
  duplicateElement,
  emptyDocument,
  HANDLE_SIZE,
  handlePosition,
  lineEndpoints,
  minSize,
  normalizeFrame,
  parseDocument,
  sendToBack,
  type CanvasDocument,
  type CanvasElement,
  type CanvasFont,
  type FillStyle,
  type Handle,
  type ResizeHandle,
  type ShapeElement,
  type TextElement,
} from "./canvas/document";
import { boxFill, lineHitMask, ovalHitMask, paintLine, paintOval } from "./canvas/draw";
import { rasterizeCanvas } from "./canvas/raster";
import { APP_ICON, TOOL_ICONS } from "./canvas/icons";
import { matchingPageSize, pageSize, pageSizeLabel, type PageSizeId } from "./canvas/page";
import {
  FILL_LABEL,
  FONT_LABEL,
  TOOL_GRID,
  type ToolId,
} from "./canvas/tools";

const TOOLS_W = 37;
const CELL = 16;
const FOOT_H = 17;
const UNDO_LIMIT = 32;
const DEFAULT_NAME = "Untitled";
const DEFAULT_SHAPE = { width: 48, height: 32 };
const FILLS: FillStyle[] = ["none", "white", "black", "gray25", "gray50", "gray75"];

interface FrameDraft {
  x: number;
  y: number;
  width: number;
  height: number;
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
              const ink = icon.data[y * CELL + x] ? 1 : 0;
              surface.setPixel(x, y, props.selected ? (ink ? 0 : 1) : ink);
            }
          }
        }}
      />
    </box>
  );
}

function CanvasApp(props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const win = app.window;
  const { print } = app;

  const [doc, setDoc] = createSignal<CanvasDocument>(emptyDocument(), { ownedWrite: true });
  const [rev, setRev] = createSignal(0);
  const [tool, setTool] = createSignal<ToolId>("select");
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [dirty, setDirty] = createSignal(false);
  const [canUndo, setCanUndo] = createSignal(false);
  const [canRedo, setCanRedo] = createSignal(false);
  const [fill, setFill] = createSignal<FillStyle>("none");
  const [stroke, setStroke] = createSignal(true);
  const [font, setFont] = createSignal<CanvasFont>("body");
  const [fileId, setFileId] = createSignal<string | undefined>(
    typeof props.fileId === "string" ? props.fileId : undefined,
  );
  const [fileName, setFileName] = createSignal<string | undefined>(
    typeof props.title === "string" ? props.title : undefined,
  );
  const [draft, setDraft] = createSignal<FrameDraft | null>(null);

  const undoStack: CanvasDocument[] = [];
  const redoStack: CanvasDocument[] = [];

  let move: { origX: number; origY: number; gx: number; gy: number } | null = null;
  let resize: { handle: Handle; orig: CanvasElement; gx: number; gy: number } | null = null;
  let creating: { tool: Exclude<ToolId, "select">; x0: number; y0: number } | null = null;

  const bump = () => setRev((n) => n + 1);
  const elements = () => doc().elements;
  const selected = () => elements().find((el) => el.id === selectedId()) ?? null;
  const artW = () => doc().width;
  const artH = () => doc().height;
  const viewW = () => Math.max(8, win.width() - TOOLS_W);
  const viewH = () => Math.max(8, win.height() - FOOT_H);

  function kept(elements: CanvasElement[]): CanvasDocument {
    const cur = doc();
    return { version: 1, width: cur.width, height: cur.height, elements };
  }

  createEffect(
    () => ({ dirty: dirty(), name: fileName() ?? DEFAULT_NAME }),
    ({ dirty: isDirty, name }) => win.setTitle(isDirty ? `${name} •` : name),
  );

  function replaceDoc(next: CanvasDocument): void {
    setDoc(next);
    bump();
  }

  function pushUndo(): void {
    undoStack.push(cloneDocument(doc()));
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
    redoStack.length = 0;
    setCanUndo(true);
    setCanRedo(false);
  }

  function undo(): void {
    const prev = undoStack.pop();
    if (!prev) return;
    redoStack.push(cloneDocument(doc()));
    replaceDoc(prev);
    setCanUndo(undoStack.length > 0);
    setCanRedo(true);
    setEditingId(null);
    setDirty(true);
  }

  function redo(): void {
    const next = redoStack.pop();
    if (!next) return;
    undoStack.push(cloneDocument(doc()));
    replaceDoc(next);
    setCanUndo(true);
    setCanRedo(redoStack.length > 0);
    setEditingId(null);
    setDirty(true);
  }

  function markDirty(): void {
    setDirty(true);
  }

  function selectElement(el: CanvasElement | null): void {
    setEditingId(null);
    setSelectedId(el?.id ?? null);
    if (el && el.type !== "text") {
      setFill(el.fill);
      setStroke(el.stroke);
    }
    if (el?.type === "text") setFont(el.font);
  }

  function patchSelected(update: (el: CanvasElement) => void): void {
    const el = selected();
    if (!el) return;
    update(el);
    replaceDoc(kept(elements().slice()));
    markDirty();
  }

  function commitElements(next: CanvasElement[], selectId: string | null): void {
    replaceDoc(kept(next));
    setSelectedId(selectId);
    markDirty();
  }

  function addElement(el: CanvasElement, editText: boolean): void {
    commitElements([...elements(), el], el.id);
    if (el.type !== "text") {
      setFill(el.fill);
      setStroke(el.stroke);
    }
    if (editText && el.type === "text") setEditingId(el.id);
  }

  function defaultTextSize(): { width: number; height: number } {
    const face = font();
    return {
      width: Math.max(48, measureText("Text", face) + 8),
      height: fontLineHeight(face) + 4,
    };
  }

  function newShape(type: Exclude<ToolId, "select">, frame: { x: number; y: number; width: number; height: number }): CanvasElement {
    const id = allocateId(elements());
    if (type === "text") {
      return {
        id,
        type: "text",
        ...frame,
        text: "Text",
        font: font(),
        align: "left",
      };
    }
    const el: ShapeElement = {
      id,
      type,
      ...frame,
      fill: type === "line" ? "none" : fill(),
      stroke: type === "line" ? true : stroke() || fill() === "none",
    };
    return el;
  }

  function finishCreate(x1: number, y1: number): void {
    if (!creating) return;
    const { tool: t, x0, y0 } = creating;
    creating = null;
    setDraft(null);
    const dragged = Math.abs(x1 - x0) > 2 || Math.abs(y1 - y0) > 2;
    if (t === "line" && !dragged) return;
    pushUndo();
    if (!dragged) {
      const size = t === "text" ? defaultTextSize() : DEFAULT_SHAPE;
      addElement(newShape(t, { x: Math.round(x0), y: Math.round(y0), ...size }), t === "text");
      return;
    }
    const frame = normalizeFrame(x0, y0, x1, y1);
    if (t !== "text" && t !== "line" && (frame.width < 4 || frame.height < 4)) return;
    const el = newShape(t, frame);
    if (t === "line") assignLine(el as ShapeElement, x0, y0, x1, y1);
    addElement(el, t === "text");
  }

  function artboardDown(lx: number, ly: number): void {
    const t = tool();
    if (t === "select") {
      selectElement(null);
      return;
    }
    creating = { tool: t, x0: lx, y0: ly };
    setDraft({ x: Math.round(lx), y: Math.round(ly), width: 1, height: 1 });
  }

  function artboardDrag(lx: number, ly: number): void {
    if (!creating) return;
    setDraft(normalizeFrame(creating.x0, creating.y0, lx, ly));
  }

  function artboardUp(lx: number, ly: number): void {
    if (!creating) return;
    finishCreate(lx, ly);
  }

  function startMove(el: CanvasElement, gx: number, gy: number): void {
    if (tool() !== "select" || editingId()) return;
    pushUndo();
    move = { origX: el.x, origY: el.y, gx, gy };
    resize = null;
  }

  function onMove(gx: number, gy: number): void {
    if (!move) return;
    const el = selected();
    if (!el) return;
    el.x = move.origX + Math.round(gx - move.gx);
    el.y = move.origY + Math.round(gy - move.gy);
    replaceDoc(kept(elements().slice()));
    markDirty();
  }

  function startResize(el: CanvasElement, handle: Handle, gx: number, gy: number): void {
    pushUndo();
    resize = { handle, orig: { ...el }, gx, gy };
    move = null;
  }

  function onResize(gx: number, gy: number): void {
    if (!resize) return;
    const el = selected();
    if (!el) return;
    const dx = Math.round(gx - resize.gx);
    const dy = Math.round(gy - resize.gy);
    if (el.type === "line" && (resize.handle === "start" || resize.handle === "end")) {
      const orig = resize.orig as ShapeElement;
      const ends = lineEndpoints(orig);
      if (resize.handle === "start") assignLine(el as ShapeElement, ends.x0 + dx, ends.y0 + dy, ends.x1, ends.y1);
      else assignLine(el as ShapeElement, ends.x0, ends.y0, ends.x1 + dx, ends.y1 + dy);
    } else if (resize.handle !== "start" && resize.handle !== "end") {
      const handle = resize.handle;
      const origin = handlePosition(resize.orig, handle);
      const mins = minSize(el);
      const next = applyResize(resize.orig, handle, origin.x + dx, origin.y + dy, mins.width, mins.height);
      el.x = next.x;
      el.y = next.y;
      el.width = next.width;
      el.height = next.height;
    }
    replaceDoc(kept(elements().slice()));
    markDirty();
  }

  function endGesture(): void {
    move = null;
    resize = null;
  }

  function deleteSelected(): void {
    const id = selectedId();
    if (!id || editingId()) return;
    pushUndo();
    commitElements(elements().filter((el) => el.id !== id), null);
  }

  function duplicateSelected(): void {
    const el = selected();
    if (!el) return;
    pushUndo();
    const copy = duplicateElement(el, allocateId(elements()));
    addElement(copy, false);
  }

  function applyFill(next: FillStyle): void {
    setFill(next);
    const el = selected();
    if (!el || el.type === "text") return;
    pushUndo();
    el.fill = next;
    if (next === "none") el.stroke = true;
    replaceDoc(kept(elements().slice()));
    markDirty();
  }

  function applyStroke(on: boolean): void {
    setStroke(on);
    const el = selected();
    if (!el || el.type === "text" || el.type === "line") return;
    pushUndo();
    el.stroke = on || el.fill === "none";
    replaceDoc(kept(elements().slice()));
    markDirty();
  }

  function applyFont(next: CanvasFont): void {
    setFont(next);
    const el = selected();
    if (!el || el.type !== "text") return;
    pushUndo();
    el.font = next;
    el.height = Math.max(el.height, fontLineHeight(next) + 4);
    replaceDoc(kept(elements().slice()));
    markDirty();
  }

  function applyAlign(next: TextElement["align"]): void {
    const el = selected();
    if (!el || el.type !== "text") return;
    pushUndo();
    el.align = next;
    replaceDoc(kept(elements().slice()));
    markDirty();
  }

  function beginEdit(el: TextElement): void {
    if (editingId() === el.id) return;
    pushUndo();
    setSelectedId(el.id);
    setEditingId(el.id);
    setFont(el.font);
  }

  function onTextChange(value: string): void {
    const el = selected();
    if (!el || el.type !== "text") return;
    el.text = value;
    const w = measureText(value || " ", el.font) + 8;
    el.width = Math.max(el.width, Math.min(w, artW()));
    replaceDoc(kept(elements().slice()));
    markDirty();
  }

  function handleKey(key: string, modifiers: { shift: boolean }): void {
    if (editingId()) return;
    if (key === "Backspace" || key === "Delete") {
      deleteSelected();
      return;
    }
    if (key === "Escape") {
      selectElement(null);
      return;
    }
    const el = selected();
    if (!el) return;
    const step = modifiers.shift ? 8 : 1;
    if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown") {
      pushUndo();
      if (key === "ArrowLeft") el.x -= step;
      if (key === "ArrowRight") el.x += step;
      if (key === "ArrowUp") el.y -= step;
      if (key === "ArrowDown") el.y += step;
      replaceDoc(kept(elements().slice()));
      markDirty();
    }
  }

  function desktopCanvases() {
    const desktop = app.fs.locate("desktop");
    if (!desktop) return [];
    return app.fs.children(desktop.id).filter((n) => n.kind === "file" && n.type === MIME.canvas);
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

  async function quitApp(): Promise<void> {
    if (await confirmDiscard()) app.quit();
  }

  async function loadFile(id: string, name: string): Promise<void> {
    try {
      const raw = await app.fs.readJSON(id);
      const next = parseDocument(raw);
      replaceDoc(next);
      setFileId(id);
      setFileName(name);
      setDirty(false);
      undoStack.length = 0;
      redoStack.length = 0;
      setCanUndo(false);
      setCanRedo(false);
      setSelectedId(null);
      setEditingId(null);
    } catch (err) {
      await app.os.showDialog({
        message: `Couldn't read "${name}": ${err instanceof Error ? err.message : String(err)}`,
        variant: "note",
      });
    }
  }

  async function writeNamed(name: string): Promise<void> {
    const existing = fileId() ? app.fs.file(fileId()!) : undefined;
    const desktop = app.fs.locate("desktop");
    const parentId = existing?.parentId ?? desktop?.id;
    if (!parentId) return;
    const file = await app.fs.writeJSON(parentId, name, doc(), {
      type: MIME.canvas,
      attributes: { icon: "canvas/icon" },
    });
    setFileId(file.id);
    setFileName(name);
    setDirty(false);
  }

  async function saveAs(): Promise<void> {
    const name = await app.os.showDialog({
      message: "Save canvas as:",
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

  async function newDocument(): Promise<void> {
    if (!(await confirmDiscard())) return;
    replaceDoc(emptyDocument());
    undoStack.length = 0;
    redoStack.length = 0;
    setCanUndo(false);
    setCanRedo(false);
    setFileId(undefined);
    setFileName(undefined);
    setDirty(false);
    setSelectedId(null);
    setEditingId(null);
  }

  async function openDocument(): Promise<void> {
    if (!(await confirmDiscard())) return;
    const files = desktopCanvases();
    if (files.length === 0) {
      await app.os.showDialog({ message: "No Canvas documents on the desktop.", variant: "note" });
      return;
    }
    if (files.length <= 6) {
      const choice = await app.os.showDialog({
        message: "Open which canvas?",
        buttons: [...files.map((f) => f.name), "Cancel"],
        variant: "note",
      });
      if (!choice || choice === "Cancel") return;
      const file = files.find((f) => f.name === choice);
      if (file) await loadFile(file.id, file.name);
      return;
    }
    const typed = await app.os.showDialog({
      message: "Name of a Canvas document on the desktop:",
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

  function setPageSize(id: PageSizeId): void {
    const size = pageSize(id, print?.paperWidth ?? 576);
    const cur = doc();
    if (cur.width === size.width && cur.height === size.height) return;
    pushUndo();
    replaceDoc({ version: 1, width: size.width, height: size.height, elements: cur.elements.slice() });
    markDirty();
  }

  async function printDocument(): Promise<void> {
    if (!print) return;
    const page = rasterizeCanvas(doc(), artW(), artH());
    try {
      await print.printPicture(page);
    } catch (err) {
      await app.os.showDialog({
        message: `Couldn't print: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  onSettled(() => {
    if (typeof props.fileId !== "string") return;
    void loadFile(props.fileId, typeof props.title === "string" ? props.title : DEFAULT_NAME);
  });

  createEffect(
    () => {
      const el = selected();
      return {
        dirty: dirty(),
        fileId: fileId(),
        canUndo: canUndo(),
        canRedo: canRedo(),
        hasSel: !!el,
        isText: el?.type === "text",
        isShape: !!el && el.type !== "text",
        editing: editingId() !== null,
        font: el?.type === "text" ? el.font : font(),
        align: el?.type === "text" ? el.align : "left",
        fill: el && el.type !== "text" ? el.fill : fill(),
        stroke: el && el.type !== "text" ? el.stroke : stroke(),
        pageW: doc().width,
        pageH: doc().height,
        paper: print?.paperWidth,
      };
    },
    (s) => {
      const fileItems: MenubarItemDef[] = [
        { label: "New", shortcut: "N", onClick: () => void newDocument() },
        { label: "Open…", shortcut: "O", onClick: () => void openDocument() },
        { type: "separator" },
        { label: "Save", shortcut: "S", onClick: () => void save(), disabled: !s.dirty && !!s.fileId },
        { label: "Save As…", onClick: () => void saveAs() },
      ];
      if (print) {
        fileItems.push({ type: "separator" }, { label: "Print…", shortcut: "P", onClick: () => void printDocument() });
      }
      fileItems.push({ type: "separator" }, { label: "Quit", shortcut: "Q", onClick: () => void quitApp() });
      app.setMenus([
        { label: "File", items: fileItems },
        {
          label: "Edit",
          items: [
            { label: "Undo", shortcut: "Z", disabled: !s.canUndo, onClick: undo },
            { label: "Redo", disabled: !s.canRedo, onClick: redo },
            { type: "separator" },
            { label: "Duplicate", shortcut: "D", disabled: !s.hasSel, onClick: duplicateSelected },
            { label: "Clear", disabled: !s.hasSel || s.editing, onClick: deleteSelected },
          ],
        },
        {
          label: "Arrange",
          items: [
            { label: "Bring to Front", disabled: !s.hasSel, onClick: () => {
              const id = selectedId();
              if (!id) return;
              pushUndo();
              commitElements(bringToFront(elements(), id), id);
            } },
            { label: "Send to Back", disabled: !s.hasSel, onClick: () => {
              const id = selectedId();
              if (!id) return;
              pushUndo();
              commitElements(sendToBack(elements(), id), id);
            } },
          ],
        },
        {
          label: "Page Size",
          items: [
            {
              type: "radiogroup",
              value: matchingPageSize({ width: doc().width, height: doc().height }, print?.paperWidth ?? 576, print ? ["square", "wide", "printer", "lying"] : ["square", "wide"]) ?? "wide",
              onValueChange: (value) => setPageSize(value as PageSizeId),
              items: (print ? ["square", "wide", "printer", "lying"] : ["square", "wide"]).map((id) => ({
                label: pageSizeLabel(id as PageSizeId, pageSize(id as PageSizeId, print?.paperWidth ?? 576)),
                value: id,
              })),
            },
          ],
        },
        {
          label: "Font",
          items: [
            {
              type: "radiogroup",
              value: s.font,
              onValueChange: (v) => applyFont(v as CanvasFont),
              items: [
                { label: FONT_LABEL.menu, value: "menu" },
                { label: FONT_LABEL.body, value: "body" },
                { label: FONT_LABEL.mono, value: "mono" },
                { label: FONT_LABEL.pixel, value: "pixel" },
              ],
            },
            { type: "separator" },
            {
              type: "radiogroup",
              value: s.align,
              onValueChange: (v) => applyAlign(v as TextElement["align"]),
              items: [
                { label: "Left", value: "left", disabled: !s.isText },
                { label: "Center", value: "center", disabled: !s.isText },
                { label: "Right", value: "right", disabled: !s.isText },
              ],
            },
          ],
        },
        {
          label: "Style",
          items: [
            {
              type: "radiogroup",
              value: s.fill,
              onValueChange: (v) => applyFill(v as FillStyle),
              items: FILLS.map((value) => ({ label: FILL_LABEL[value], value, disabled: !s.isShape && !!s.hasSel })),
            },
            { type: "separator" },
            {
              type: "radiogroup",
              value: s.stroke ? "on" : "off",
              onValueChange: (v) => applyStroke(v === "on"),
              items: [
                { label: "Frame", value: "on", disabled: !s.isShape },
                { label: "No Frame", value: "off", disabled: !s.isShape },
              ],
            },
          ],
        },
      ]);
    },
  );

  function ElementView(props: { el: CanvasElement }): JSX.Element {
    const el = () => {
      rev();
      return props.el;
    };
    const selectable = () => tool() === "select" && editingId() !== props.el.id;
    const isText = () => el().type === "text";
    const shape = () => el() as ShapeElement;
    const textEl = () => el() as TextElement;

    const pointer = () =>
      tool() === "select"
        ? {
            onMouseDown: () => selectElement(el()),
            onDoubleClick: () => {
              if (el().type === "text") beginEdit(el() as TextElement);
            },
            onDragStart: (_lx: number, _ly: number, gx: number, gy: number) => {
              if (selectable()) startMove(el(), gx, gy);
            },
            onDrag: (_lx: number, _ly: number, gx: number, gy: number) => onMove(gx, gy),
            onDragEnd: () => endGesture(),
          }
        : {};

    return (
      <Show
        when={isText()}
        fallback={
          <Show
            when={shape().type === "rect" || shape().type === "roundrect"}
            fallback={
              <box
                position="absolute"
                left={el().x}
                top={el().y}
                width={el().width}
                height={el().height}
                hitMask={shape().type === "line" ? lineHitMask(shape()) : ovalHitMask(el().width, el().height)}
                semantic={{ name: `el-${el().id}`, role: "img", value: el().type }}
                {...pointer()}
              >
                <raster
                  width={el().width}
                  height={el().height}
                  revision={rev()}
                  onPaint={(surface) => {
                    if (shape().type === "line") paintLine(surface, shape());
                    else paintOval(surface, shape());
                  }}
                />
              </box>
            }
          >
            <box
              position="absolute"
              left={el().x}
              top={el().y}
              width={el().width}
              height={el().height}
              background={boxFill(shape().fill)}
              borderWidth={shape().stroke ? 1 : 0}
              borderColor={shape().stroke ? 1 : undefined}
              borderRadius={shape().type === "roundrect" ? cornerRadius(el()) : undefined}
              semantic={{ name: `el-${el().id}`, role: "img", value: el().type }}
              {...pointer()}
            />
          </Show>
        }
      >
        <box
          position="absolute"
          left={el().x}
          top={el().y}
          width={el().width}
          height={el().height}
          overflow="hidden"
          semantic={{ name: `el-${el().id}`, role: "text", value: textEl().text }}
          {...pointer()}
        >
          <Show
            when={editingId() === el().id}
            fallback={
              <text font={textEl().font} align={textEl().align} wrap>
                {textEl().text}
              </text>
            }
          >
            <TextInput
              name={`text-${el().id}`}
              value={textEl().text}
              font={textEl().font}
              width={el().width}
              height={el().height}
              padding={1}
              borderless
              autoFocus
              selectAllOnFocus
              onChange={onTextChange}
              onSubmit={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
              onBlur={() => setEditingId(null)}
            />
          </Show>
        </box>
      </Show>
    );
  }

  function SelectionChrome(): JSX.Element {
    const el = () => {
      rev();
      return selected();
    };
    return (
      <Show when={editingId() === null ? el() : null}>
        {(sel) => {
          const node = () => sel();
          const handles = () => {
            const e = node();
            if (e.type === "line") return ["start", "end"] as Handle[];
            return ALL_RESIZE_HANDLES as Handle[];
          };
          const pos = (handle: Handle) => {
            const e = node();
            if (e.type === "line" && (handle === "start" || handle === "end")) {
              const ends = lineEndpoints(e);
              return handle === "start" ? { x: ends.x0, y: ends.y0 } : { x: ends.x1, y: ends.y1 };
            }
            return handlePosition(e, handle as ResizeHandle);
          };
          const half = Math.floor(HANDLE_SIZE / 2);
          return (
            <box
              position="absolute"
              left={0}
              top={0}
              width={artW()}
              height={artH()}
            >
              <box
                position="absolute"
                left={node().x - 1}
                top={node().y - 1}
                width={node().width + 2}
                height={node().height + 2}
                borderWidth={1}
                borderColor={1}
                borderStyle="dotted"
              />
              <For each={handles()}>
                {(handle) => (
                  <box
                    position="absolute"
                    left={pos(handle).x - half}
                    top={pos(handle).y - half}
                    width={HANDLE_SIZE}
                    height={HANDLE_SIZE}
                    background={0}
                    borderWidth={1}
                    borderColor={1}
                    semantic={{ name: `handle-${handle}`, role: "button" }}
                    onMouseDown={() => {
                      const e = node();
                      selectElement(e);
                    }}
                    onDragStart={(_lx, _ly, gx, gy) => startResize(node(), handle, gx, gy)}
                    onDrag={(_lx, _ly, gx, gy) => onResize(gx, gy)}
                    onDragEnd={() => endGesture()}
                  />
                )}
              </For>
            </box>
          );
        }}
      </Show>
    );
  }

  const status = () => {
    rev();
    const el = selected();
    if (!el) return `${elements().length} object${elements().length === 1 ? "" : "s"}`;
    if (el.type === "text") return `${FONT_LABEL[el.font]} text`;
    return `${el.width} x ${el.height}`;
  };

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
                  <ToolButton id={id} selected={tool() === id} onSelect={() => { setTool(id); setEditingId(null); }} />
                )}
              </For>
            </box>
          )}
        </For>
      </box>
      <box width={1} height={win.height()} background={1} />
      <box flexGrow={1} height={win.height()} flexDirection="column">
        <box width={viewW()} height={viewH()} overflow="scroll" background={0}>
        <box
          width={artW()}
          height={artH()}
          position="relative"
          overflow="hidden"
          background={0}
          tabIndex={0}
          autoFocus
          semantic={{ name: "artboard", role: "canvas" }}
          onMouseDown={artboardDown}
          onDrag={artboardDrag}
          onMouseUp={artboardUp}
          onKeyDown={(key, mods) => handleKey(key, mods)}
        >
          <For each={elements()}>
            {(el) => <ElementView el={el} />}
          </For>
          <Show when={draft()}>
            {(r) => (
              <box
                position="absolute"
                left={r().x}
                top={r().y}
                width={r().width}
                height={r().height}
                borderWidth={1}
                borderColor={1}
                borderStyle="dotted"
                inert
              />
            )}
          </Show>
          <SelectionChrome />
        </box>
        </box>
        <box height={1} background={1} />
        <box
          height={FOOT_H - 1}
          flexDirection="row"
          alignItems="center"
          padding={2}
          gap={3}
          background={0}
        >
          <For each={FILLS}>
            {(style) => (
              <box
                width={10}
                height={10}
                background={style === "none" ? 0 : boxFill(style)}
                borderColor={1}
                borderWidth={fill() === style ? 1 : 0}
                semantic={{ name: `fill-${style}`, role: "button", value: fill() === style ? "on" : "off" }}
                onClick={() => applyFill(style)}
              />
            )}
          </For>
          <text font="body">{status()}</text>
        </box>
      </box>
    </box>
  );
}

export const sprites: Record<string, Sprite> = {
  "canvas/icon": APP_ICON,
};

export default defineApp({
  id: "canvas",
  title: "Canvas",
  icon: "canvas/icon",
  about: {
    version: "1.0",
    description: "Draw with objects — move, resize, and edit shapes and text without flattening to a bitmap.",
  },
  defaultSize: { width: 480, height: 276 },
  minSize: { width: 280, height: 140 },
  resizable: true,
  scrollable: false,
  fileTypes: [MIME.canvas],
  sprites,
  Component: CanvasApp,
  onOpen(app, props) {
    app.openWindow({
      props,
      position: { x: 16, y: 28 },
    });
  },
});
