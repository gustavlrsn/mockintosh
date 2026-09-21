import { nodeAt } from "@mockintosh/ui";
import type { CanvasUIHost } from "@mockintosh/ui/web";
import {
  captureTree,
  closeDevTools,
  contextMenu,
  dismissMenu,
  isDevtoolsChrome,
  openInspect,
  panelOpen,
  picking,
  setContextMenu,
  setDevtoolsHost,
  setHoverId,
  setPickMode,
  setSelectedId,
} from "./state";

function logicalPoint(canvas: HTMLCanvasElement, e: MouseEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const zoomX = rect.width / Math.max(1, canvas.width);
  const zoomY = rect.height / Math.max(1, canvas.height);
  return {
    x: Math.floor((e.clientX - rect.left) / zoomX),
    y: Math.floor((e.clientY - rect.top) / zoomY),
  };
}

function pageNodeAt(host: CanvasUIHost, x: number, y: number) {
  host.paint();
  return nodeAt(host.ui.root, x, y, 0, 0, null, isDevtoolsChrome);
}

export function bindDevTools(host: CanvasUIHost): () => void {
  setDevtoolsHost(host);
  const { canvas, ui } = host;

  const hitId = (x: number, y: number): number => {
    const hit = pageNodeAt(host, x, y);
    return hit?.id ?? ui.root.id;
  };

  const openMenuAt = (e: MouseEvent) => {
    const { x, y } = logicalPoint(canvas, e);
    const hit = pageNodeAt(host, x, y);
    setContextMenu({ x, y, id: hit?.id ?? ui.root.id });
    // External write: flush so the 1-bit menu is in the tree this frame.
    host.paint();
  };

  const onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openMenuAt(e);
  };

  const swallowRightButton = (e: PointerEvent) => {
    if (e.button !== 2) return false;
    e.preventDefault();
    e.stopImmediatePropagation();
    return true;
  };

  const onPointerDownCapture = (e: PointerEvent) => {
    if (swallowRightButton(e)) return;
    if (e.button !== 0 || !picking()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const { x, y } = logicalPoint(canvas, e);
    openInspect(hitId(x, y));
  };

  const onPointerUpCapture = (e: PointerEvent) => {
    swallowRightButton(e);
  };

  const onPointerMoveCapture = (e: PointerEvent) => {
    if (!picking()) return;
    e.stopImmediatePropagation();
    const { x, y } = logicalPoint(canvas, e);
    const id = hitId(x, y);
    setHoverId(id);
    setSelectedId(id);
    captureTree();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const pickChord =
      (e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "c" || e.key === "C");
    const toggleChord =
      (e.metaKey && e.altKey && (e.key === "i" || e.key === "I")) ||
      (e.ctrlKey && e.shiftKey && (e.key === "i" || e.key === "I"));
    if (pickChord) {
      e.preventDefault();
      if (!panelOpen()) {
        openInspect(ui.root.id);
        setPickMode(true);
      } else {
        setPickMode(!picking());
      }
      return;
    }
    if (toggleChord) {
      e.preventDefault();
      if (panelOpen()) closeDevTools();
      else openInspect(ui.root.id);
      return;
    }
    if (e.key !== "Escape") return;
    if (contextMenu()) {
      dismissMenu();
      e.preventDefault();
      return;
    }
    if (picking()) {
      setPickMode(false);
      e.preventDefault();
      return;
    }
    if (panelOpen()) {
      closeDevTools();
      e.preventDefault();
    }
  };

  canvas.addEventListener("contextmenu", onContextMenu);
  canvas.addEventListener("pointerdown", onPointerDownCapture, true);
  canvas.addEventListener("pointerup", onPointerUpCapture, true);
  canvas.addEventListener("pointermove", onPointerMoveCapture, true);
  window.addEventListener("keydown", onKeyDown);

  return () => {
    canvas.removeEventListener("contextmenu", onContextMenu);
    canvas.removeEventListener("pointerdown", onPointerDownCapture, true);
    canvas.removeEventListener("pointerup", onPointerUpCapture, true);
    canvas.removeEventListener("pointermove", onPointerMoveCapture, true);
    window.removeEventListener("keydown", onKeyDown);
    canvas.style.cursor = "";
  };
}
