export interface OSEvent {
  type:
    | "mouseDown"
    | "mouseUp"
    | "mouseMove"
    | "doubleClick"
    | "scroll"
    | "keyDown"
    | "keyUp"
    /** Sent to the app whose window just became the active (frontmost) window. */
    | "activate"
    /** Sent to the app whose window just lost active status. */
    | "deactivate";
  x?: number;
  y?: number;
  /** When window has content top inset: "fixed" = click in non-scrolling strip (y 0..inset), "scrollable" = in scrollable region (y in scrollable-content space). */
  contentRegion?: "fixed" | "scrollable";
  button?: number;
  deltaY?: number;
  deltaX?: number;
  key?: string;
  code?: string;
  shiftKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

export type EventHandler = (event: OSEvent) => void;

/**
 * Translates DOM events on the canvas element into Mockintosh OS events.
 */
export class EventManager {
  private canvasEl: HTMLCanvasElement;
  private zoom: number = 1;
  private handlers: EventHandler[] = [];
  private lastClickTime = 0;
  private lastClickX = 0;
  private lastClickY = 0;
  private _moveRafPending = false;
  private static DOUBLE_CLICK_MS = 500;
  private static DOUBLE_CLICK_DIST = 4;

  constructor(canvasEl: HTMLCanvasElement) {
    this.canvasEl = canvasEl;
    this._bind();
  }

  setZoom(zoom: number) {
    this.zoom = zoom;
  }

  onEvent(handler: EventHandler) {
    this.handlers.push(handler);
  }

  removeHandler(handler: EventHandler) {
    this.handlers = this.handlers.filter((h) => h !== handler);
  }

  private emit(event: OSEvent) {
    for (const h of this.handlers) h(event);
  }

  private toLocal(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvasEl.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - rect.left) / this.zoom),
      y: Math.floor((e.clientY - rect.top) / this.zoom),
    };
  }

  private _bind() {
    this.canvasEl.addEventListener("mousedown", (e) => {
      const { x, y } = this.toLocal(e);
      const now = Date.now();
      const dx = Math.abs(x - this.lastClickX);
      const dy = Math.abs(y - this.lastClickY);
      if (
        now - this.lastClickTime < EventManager.DOUBLE_CLICK_MS &&
        dx < EventManager.DOUBLE_CLICK_DIST &&
        dy < EventManager.DOUBLE_CLICK_DIST
      ) {
        this.emit({ type: "doubleClick", x, y, button: e.button });
        this.lastClickTime = 0;
      } else {
        this.emit({ type: "mouseDown", x, y, button: e.button });
        this.lastClickTime = now;
        this.lastClickX = x;
        this.lastClickY = y;
      }
    });

    this.canvasEl.addEventListener("mouseup", (e) => {
      const { x, y } = this.toLocal(e);
      this.emit({ type: "mouseUp", x, y, button: e.button });
    });

    this.canvasEl.addEventListener("mousemove", (e) => {
      if (this._moveRafPending) return;
      this._moveRafPending = true;
      requestAnimationFrame(() => {
        this._moveRafPending = false;
        const { x, y } = this.toLocal(e);
        this.emit({ type: "mouseMove", x, y });
      });
    });

    this.canvasEl.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const { x, y } = this.toLocal(e);
        this.emit({ type: "scroll", x, y, deltaY: e.deltaY, deltaX: e.deltaX });
      },
      { passive: false }
    );

    window.addEventListener("keydown", (e) => {
      this.emit({
        type: "keyDown",
        key: e.key,
        code: e.code,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
      });
    });

    window.addEventListener("keyup", (e) => {
      this.emit({
        type: "keyUp",
        key: e.key,
        code: e.code,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
      });
    });
  }

  destroy() {
    // In a full implementation we'd remove all listeners.
    // For simplicity, the EventManager lives for the lifetime of the app.
  }
}
