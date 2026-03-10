import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { measureText, getLineHeight } from "../lib/canvas/fontAdapter";
import {
  createTextInputState,
  handleTextInputKey,
  handleTextInputPaste,
  TextInputState,
} from "../lib/toolbox/TextEdit";
import { OSEvent } from "../lib/toolbox/EventManager";
import { makeRect } from "@mockintosh/quickdraw";
import {
  NewControl,
  DrawControls,
  inButton,
} from "../lib/toolbox/ControlManager";
import { atkinsonTo1bit } from "../lib/canvas/dither";

// ---------------------------------------------------------------------------
// URL helpers (same rules as Safari.ts)
// ---------------------------------------------------------------------------

function normalizeUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[^\s]+\.[^\s]+$/.test(s) && !s.includes(" ")) return `https://${s}`;
  return null;
}

// ---------------------------------------------------------------------------
// Dithering
// ---------------------------------------------------------------------------

interface DitherState {
  canvas: OffscreenCanvas;
  ctx: OffscreenCanvasRenderingContext2D;
  pixels: Uint8Array;
  luminance: Float32Array;
}

function getOrCreateDitherState(
  ref: { current: DitherState | null },
  w: number,
  h: number
): DitherState {
  const existing = ref.current;
  if (existing && existing.canvas.width === w && existing.canvas.height === h) {
    return existing;
  }
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;
  ref.current = {
    canvas,
    ctx,
    pixels: new Uint8Array(w * h),
    luminance: new Float32Array(w * h),
  };
  return ref.current;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HEADER_HEIGHT = 28;
const START_PAGE = "";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

// ---------------------------------------------------------------------------
// Safari Stream app
// ---------------------------------------------------------------------------

export const SafariStreamApp: SystemApp = {
  id: "safari-stream",
  title: "Safari Stream",
  icon: "icon/safari",
  defaultSize: { width: 480, height: 320 },
  minSize: { width: 280, height: 200 },
  scrollable: false,
  resizable: true,

  render(app: AppBuilder, ctx: WindowContext, _props: any) {
    // --- Hooks (order must match onEvent) ---
    const [urlInput, setUrlInput] = app.useState<TextInputState>(
      createTextInputState(START_PAGE)
    );
    const [currentUrl, setCurrentUrl] = app.useState(START_PAGE);
    const [history, setHistory] = app.useState<string[]>([START_PAGE]);
    const [historyIdx, setHistoryIdx] = app.useState(0);
    const controlsCreatedRef = app.useRef(false);
    const wsRef = app.useRef<WebSocket | null>(null);
    const [connectionState, setConnectionState] =
      app.useState<ConnectionState>("disconnected");
    const [pageStatus, setPageStatus] = app.useState<
      "loading" | "idle" | "error"
    >("idle");
    const [errorMsg, setErrorMsg] = app.useState<string>("");
    const framePixelsRef = app.useRef<Uint8Array | null>(null);
    const frameWidthRef = app.useRef(0);
    const frameHeightRef = app.useRef(0);
    const ditherRef = app.useRef<DitherState | null>(null);
    const lastSentSizeRef = app.useRef<{ w: number; h: number } | null>(null);

    const contentW = ctx.width;
    const contentH = ctx.height - HEADER_HEIGHT;

    // Keep dither buffers sized to content rect
    getOrCreateDitherState(ditherRef, contentW, contentH);

    // --- Establish WebSocket on mount, tear down on close ---
    app.useEffect(() => {
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${location.host}/api/stream`);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;
      setConnectionState("connecting");
      app.scheduleRender();

      ws.onopen = () => {
        setConnectionState("connected");
        app.scheduleRender();
      };

      ws.onclose = () => {
        setConnectionState("disconnected");
        wsRef.current = null;
        app.scheduleRender();
      };

      ws.onerror = () => {
        setConnectionState("error");
        app.scheduleRender();
      };

      ws.onmessage = async (evt: MessageEvent) => {
        if (evt.data instanceof ArrayBuffer) {
          // Binary: PNG screenshot — decode, scale, Atkinson-dither
          const blob = new Blob([evt.data], { type: "image/png" });
          try {
            const bitmap = await createImageBitmap(blob);
            const state = ditherRef.current;
            if (state) {
              state.ctx.clearRect(
                0,
                0,
                state.canvas.width,
                state.canvas.height
              );
              state.ctx.drawImage(
                bitmap,
                0,
                0,
                state.canvas.width,
                state.canvas.height
              );
              bitmap.close();
              const imgData = state.ctx.getImageData(
                0,
                0,
                state.canvas.width,
                state.canvas.height
              );
              state.luminance.fill(0);
              atkinsonTo1bit(
                imgData.data,
                state.canvas.width,
                state.canvas.height,
                state.pixels,
                state.luminance
              );
              framePixelsRef.current = state.pixels;
              frameWidthRef.current = state.canvas.width;
              frameHeightRef.current = state.canvas.height;
            }
          } catch {
            // Blob may be invalid; ignore
          }
          app.scheduleRender();
        } else {
          // JSON control message
          try {
            const msg = JSON.parse(evt.data as string);
            if (msg.type === "url") {
              setCurrentUrl(msg.url as string);
              setUrlInput(createTextInputState(msg.url as string));
            } else if (msg.type === "title") {
              // Title available; could surface in window title bar in future
            } else if (msg.type === "status") {
              setPageStatus(msg.status);
              setErrorMsg(msg.message ?? "");
            }
          } catch {}
          app.scheduleRender();
        }
      };

      return () => {
        ws.close();
      };
    }, []);

    // Notify server when content rect changes so it can resize the viewport
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const last = lastSentSizeRef.current;
      if (!last || last.w !== contentW || last.h !== contentH) {
        lastSentSizeRef.current = { w: contentW, h: contentH };
        wsRef.current.send(
          JSON.stringify({ type: "resize", contentW, contentH })
        );
      }
    }

    // --- Header bar ---
    ctx.clear(WHITE);
    ctx.fillRect(0, 0, ctx.width, HEADER_HEIGHT, WHITE);
    ctx.drawHLine(0, HEADER_HEIGHT - 1, ctx.width, BLACK);

    const win = ctx.getWindow();
    if (win !== null) {
      if (!controlsCreatedRef.current) {
        NewControl(win, makeRect(4, 4, 24, 24), "<", true, 0, 0, 1, 0, 0);
        NewControl(win, makeRect(4, 24, 24, 44), ">", true, 0, 0, 1, 0, 0);
        controlsCreatedRef.current = true;
      }

      // Re-wire action callbacks every render to close over latest state
      const backControl = win.controlList[0];
      const fwdControl = win.controlList[1];

      if (backControl) {
        backControl.ref.contrlAction = (_c, partCode) => {
          if (
            partCode === inButton &&
            historyIdx > 0 &&
            wsRef.current?.readyState === WebSocket.OPEN
          ) {
            const newIdx = historyIdx - 1;
            setHistoryIdx(newIdx);
            const url = history[newIdx];
            setCurrentUrl(url);
            setUrlInput(createTextInputState(url));
            setPageStatus("loading");
            wsRef.current.send(
              JSON.stringify({ type: "navigate", url: normalizeUrl(url) ?? url })
            );
          }
        };
        backControl.ref.contrlHilite = historyIdx <= 0 ? 255 : 0;
      }

      if (fwdControl) {
        fwdControl.ref.contrlAction = (_c, partCode) => {
          if (
            partCode === inButton &&
            historyIdx < history.length - 1 &&
            wsRef.current?.readyState === WebSocket.OPEN
          ) {
            const newIdx = historyIdx + 1;
            setHistoryIdx(newIdx);
            const url = history[newIdx];
            setCurrentUrl(url);
            setUrlInput(createTextInputState(url));
            setPageStatus("loading");
            wsRef.current.send(
              JSON.stringify({ type: "navigate", url: normalizeUrl(url) ?? url })
            );
          }
        };
        fwdControl.ref.contrlHilite =
          historyIdx >= history.length - 1 ? 255 : 0;
      }

      DrawControls(win, ctx.port);
    }

    ctx.drawTextInput(urlInput, 50, 6, ctx.width - 58, 16, {
      id: "url-input",
      onChange: () => {
        setUrlInput((prev) => ({ ...prev, focused: true }));
        app.scheduleRender();
      },
    });

    // --- Content area ---
    ctx.fillRect(0, HEADER_HEIGHT, contentW, contentH, WHITE);

    if (framePixelsRef.current && frameWidthRef.current > 0) {
      ctx.blit1bitPixels(
        framePixelsRef.current,
        frameWidthRef.current,
        frameHeightRef.current,
        0,
        HEADER_HEIGHT
      );
    }

    // Overlay status / empty-state messages
    const overlayMsg = (() => {
      if (connectionState === "connecting") return "Connecting…";
      if (connectionState === "error") return "Connection error — is the API server running?";
      if (connectionState === "disconnected") return "Not connected";
      if (pageStatus === "loading") return "Loading…";
      if (pageStatus === "error") return errorMsg || "Page error";
      if (!currentUrl && !framePixelsRef.current) {
        return "Enter a URL above to browse the web.";
      }
      return null;
    })();

    if (overlayMsg) {
      const y = HEADER_HEIGHT + Math.floor(contentH / 2) - getLineHeight("body");
      const tw = measureText(overlayMsg, "body");
      const x = Math.max(4, Math.floor((contentW - tw) / 2));
      // White backing so the message is readable over a dithered frame
      ctx.fillRect(x - 2, y - 2, tw + 4, getLineHeight("body") + 4, WHITE);
      ctx.drawText(overlayMsg, x, y, { font: "body", color: BLACK });
    }
  },

  getContentTopInset(): number {
    return HEADER_HEIGHT;
  },

  onEvent(app: AppBuilder, event: OSEvent, _props: any, _size: WindowSize) {
    // --- Hooks (same order as render) ---
    const [urlInput, setUrlInput] = app.useState<TextInputState>(
      createTextInputState(START_PAGE)
    );
    const [currentUrl] = app.useState(START_PAGE);
    const [history, setHistory] = app.useState<string[]>([START_PAGE]);
    const [historyIdx, setHistoryIdx] = app.useState(0);
    app.useRef(false); // controlsCreatedRef
    const wsRef = app.useRef<WebSocket | null>(null);
    app.useState<ConnectionState>("disconnected"); // connectionState
    const [, setPageStatus] = app.useState<"loading" | "idle" | "error">("idle");
    app.useState<string>(""); // errorMsg
    app.useRef<Uint8Array | null>(null); // framePixelsRef
    app.useRef(0); // frameWidthRef
    app.useRef(0); // frameHeightRef
    app.useRef<DitherState | null>(null); // ditherRef
    app.useRef<{ w: number; h: number } | null>(null); // lastSentSizeRef

    const navigateToUrl = (typed: string) => {
      const fullUrl = normalizeUrl(typed);
      if (!fullUrl) return;
      if (wsRef.current?.readyState !== WebSocket.OPEN) return;

      const newHistory = [...history.slice(0, historyIdx + 1), typed];
      setHistory(newHistory);
      setHistoryIdx(newHistory.length - 1);

      const newInput = createTextInputState(typed);
      newInput.focused = false;
      setUrlInput(newInput);
      setPageStatus("loading");
      app.scheduleRender();

      wsRef.current.send(JSON.stringify({ type: "navigate", url: fullUrl }));
    };

    // --- Paste ---
    if (event.type === "paste" && event.pasteText) {
      if (urlInput.focused) {
        if (handleTextInputPaste(urlInput, event.pasteText)) {
          setUrlInput({ ...urlInput });
        }
      } else if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "paste", text: event.pasteText })
        );
      }
      return;
    }

    // --- Keyboard ---
    if (event.type === "keyDown") {
      if (event.key === "Enter" && urlInput.focused) {
        navigateToUrl(urlInput.value.trim());
        return;
      }
      if (urlInput.focused) {
        if (
          handleTextInputKey(
            urlInput,
            event.key!,
            event.code!,
            event.shiftKey,
            event.metaKey,
            event.ctrlKey
          )
        ) {
          setUrlInput({ ...urlInput });
        }
        return;
      }
      // Forward keystrokes to the page
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "keydown",
            key: event.key,
            code: event.code,
            shiftKey: event.shiftKey ?? false,
            metaKey: event.metaKey ?? false,
            ctrlKey: event.ctrlKey ?? false,
          })
        );
      }
    }

    // --- Mouse down / double-click ---
    // event.y is already content-relative (0 = top of scrollable area) because
    // WindowManager's contentEventY subtracts contentTopInset before dispatch.
    // contentRegion === "scrollable" means the click landed below the header strip.
    if (event.type === "mouseDown" || event.type === "doubleClick") {
      if (event.contentRegion === "scrollable") {
        setUrlInput({ ...urlInput, focused: false });
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: event.type === "doubleClick" ? "dblclick" : "click",
              x: event.x ?? 0,
              y: event.y ?? 0,
            })
          );
        }
      }
    }

    // --- Scroll ---
    // Scroll events reach here only when the cursor is inside this window
    // (non-scrollable app path in main.tsx), so no y-guard is needed.
    if (event.type === "scroll" && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "scroll",
          x: event.x ?? 0,
          y: event.y ?? 0,
          deltaX: event.deltaX ?? 0,
          deltaY: event.deltaY ?? 0,
        })
      );
    }

    // Suppress unused variable warning
    void currentUrl;
  },
};
