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
import type {
  TextwebSnapshot,
  TextwebSemanticElement,
} from "../api/textweb-session";

// ---------------------------------------------------------------------------
// URL helpers (shared with Safari.ts)
// ---------------------------------------------------------------------------

function normalizeUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[^\s]+\.[^\s]+$/.test(s) && !s.includes(" ")) return `https://${s}`;
  return null;
}

// ---------------------------------------------------------------------------
// Hit-testing helpers
//
// The server derives cols = max(40, floor(contentW / MONO_CHAR_PX)) where
// MONO_CHAR_PX = 6 (maxWidth 5 + spacing 1 of the Mockintosh mono bitmap font).
// The server also resizes the Playwright viewport to contentW so lines stay
// within cols. The client uses the same formula so charW = contentW / cols ≈ 6px.
// ---------------------------------------------------------------------------

const MONO_CHAR_PX = 6;
const MIN_COLS = 40;

function contentWidthToCols(contentW: number): number {
  return Math.max(MIN_COLS, Math.floor(contentW / MONO_CHAR_PX));
}

/**
 * Given a click at pixel (px, py) inside the scrollable area and the latest
 * snapshot, return the interactive element ref that was hit, or null.
 *
 * Uses grid_bounds from the semantic model (row, col_start, col_end) and the
 * derived charW for the column mapping. Falls back to parsing `[n]` tokens in
 * the view string if an element has no grid_bounds.
 */
function hitTestRef(
  px: number,
  py: number,
  margin: number,
  charW: number,
  lineH: number,
  snapshot: TextwebSnapshot
): number | null {
  const col = Math.floor((px - margin) / charW);
  const row = Math.floor(py / lineH);

  for (const el of snapshot.semantic.elements) {
    if (el.grid_ref === null || el.grid_ref === undefined) continue;
    const bounds = el.grid_bounds;
    if (!bounds) continue;
    if (
      bounds.row === row &&
      col >= bounds.col_start &&
      col <= bounds.col_end
    ) {
      return el.grid_ref;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HEADER_HEIGHT = 28;
const CONTENT_MARGIN = 0;
const START_PAGE = "";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";
type PageStatus = "loading" | "idle" | "error";

// ---------------------------------------------------------------------------
// Safari Textweb app
// ---------------------------------------------------------------------------

export const SafariTextwebApp: SystemApp = {
  id: "safari-textweb",
  title: "Safari Textweb",
  icon: "icon/safari",
  defaultSize: { width: 480, height: 320 },
  minSize: { width: 280, height: 200 },
  scrollable: true,
  resizable: true,

  render(app: AppBuilder, ctx: WindowContext, _props: any) {
    // --- Hooks (order must match onEvent and getContentHeight) ---
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
    const [pageStatus, setPageStatus] = app.useState<PageStatus>("idle");
    const [errorMsg, setErrorMsg] = app.useState<string>("");
    const [snapshot, setSnapshot] = app.useState<TextwebSnapshot | null>(null);
    const lastSentSizeRef = app.useRef<{ w: number } | null>(null);

    const contentW = ctx.width;
    const contentH = ctx.height - HEADER_HEIGHT;

    // --- Establish WebSocket on mount ---
    app.useEffect(() => {
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${location.host}/api/textweb`);
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

      ws.onmessage = (evt: MessageEvent) => {
        try {
          const msg = JSON.parse(evt.data as string);
          if (msg.type === "snapshot") {
            const snap = msg as TextwebSnapshot & {
              url: string;
              title: string;
            };
            setSnapshot(snap);
            if (snap.url) {
              setCurrentUrl(snap.url);
              setUrlInput(createTextInputState(snap.url));
            }
          } else if (msg.type === "status") {
            setPageStatus(msg.status as PageStatus);
            setErrorMsg(msg.message ?? "");
          }
        } catch {}
        app.scheduleRender();
      };

      return () => {
        ws.close();
      };
    }, []);

    // Notify server when content width changes so it can recompute cols.
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const last = lastSentSizeRef.current;
      if (!last || last.w !== contentW) {
        lastSentSizeRef.current = { w: contentW };
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

      const goTo = (url: string) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        setCurrentUrl(url);
        setUrlInput(createTextInputState(url));
        setPageStatus("loading");
        setSnapshot(null);
        app.scheduleRender();
        wsRef.current.send(JSON.stringify({ type: "navigate", url }));
      };

      const backControl = win.controlList[0];
      const fwdControl = win.controlList[1];

      if (backControl) {
        backControl.ref.contrlAction = (_c, partCode) => {
          if (partCode === inButton && historyIdx > 0) {
            const newIdx = historyIdx - 1;
            setHistoryIdx(newIdx);
            goTo(history[newIdx]);
          }
        };
        backControl.ref.contrlHilite = historyIdx <= 0 ? 255 : 0;
      }
      if (fwdControl) {
        fwdControl.ref.contrlAction = (_c, partCode) => {
          if (partCode === inButton && historyIdx < history.length - 1) {
            const newIdx = historyIdx + 1;
            setHistoryIdx(newIdx);
            goTo(history[newIdx]);
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

    // --- Scrollable content ---
    ctx.drawScrollableContent((scrollCtx) => {
      const lineH = getLineHeight("mono");
      const lines = snapshot?.view.split("\n") ?? [];

      // Overlay / empty-state message
      const overlayMsg = (() => {
        if (connectionState === "connecting") return "Connecting…";
        if (connectionState === "error")
          return "Connection error — is the API server running?";
        if (connectionState === "disconnected") return "Not connected";
        if (pageStatus === "loading") return "Loading…";
        if (pageStatus === "error") return errorMsg || "Page error";
        if (!currentUrl && lines.length === 0)
          return "Enter a URL above to browse the web.";
        return null;
      })();

      if (overlayMsg) {
        const tw = measureText(overlayMsg, "body");
        const mx = Math.max(
          CONTENT_MARGIN,
          Math.floor((scrollCtx.width - tw) / 2)
        );
        const my = Math.floor(contentH / 2) - getLineHeight("body");
        scrollCtx.fillRect(
          mx - 2,
          my - 2,
          tw + 4,
          getLineHeight("body") + 4,
          WHITE
        );
        scrollCtx.drawText(overlayMsg, mx, my, { font: "body", color: BLACK });
        return;
      }

      // Render the text grid line by line with the mono font.
      let y = CONTENT_MARGIN;
      for (const line of lines) {
        if (line.length > 0) {
          scrollCtx.drawText(line, CONTENT_MARGIN, y, {
            font: "mono",
            color: BLACK,
          });
        }
        y += lineH;
      }
    });

    // Suppress unused variable warnings
    void currentUrl;
    void contentH;
  },

  getContentTopInset(): number {
    return HEADER_HEIGHT;
  },

  getContentHeight(app: AppBuilder, _props: any, _size: WindowSize): number {
    // --- Hooks (same order as render) ---
    app.useState<TextInputState>(createTextInputState(START_PAGE));
    app.useState(START_PAGE);
    app.useState<string[]>([START_PAGE]);
    app.useState(0);
    app.useRef(false);
    app.useRef<WebSocket | null>(null);
    app.useState<ConnectionState>("disconnected");
    const [pageStatus] = app.useState<PageStatus>("idle");
    app.useState<string>("");
    const [snapshot] = app.useState<TextwebSnapshot | null>(null);
    app.useRef<{ w: number } | null>(null);

    if (pageStatus !== "idle" || !snapshot) return 200;
    const lineCount = snapshot.view.split("\n").length;
    return lineCount * getLineHeight("mono") + CONTENT_MARGIN * 2;
  },

  onEvent(app: AppBuilder, event: OSEvent, _props: any, size: WindowSize) {
    // --- Hooks (same order as render) ---
    const [urlInput, setUrlInput] = app.useState<TextInputState>(
      createTextInputState(START_PAGE)
    );
    const [, setCurrentUrl] = app.useState(START_PAGE);
    const [history, setHistory] = app.useState<string[]>([START_PAGE]);
    const [historyIdx, setHistoryIdx] = app.useState(0);
    app.useRef(false); // controlsCreatedRef
    const wsRef = app.useRef<WebSocket | null>(null);
    app.useState<ConnectionState>("disconnected"); // connectionState
    const [, setPageStatus] = app.useState<PageStatus>("idle");
    app.useState<string>(""); // errorMsg
    const [snapshot] = app.useState<TextwebSnapshot | null>(null);
    app.useRef<{ w: number } | null>(null); // lastSentSizeRef

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
      setCurrentUrl(typed);
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
      // Forward keystrokes to the real page
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

    // --- Mouse click: hit-test against semantic grid elements ---
    if (event.type === "mouseDown" || event.type === "doubleClick") {
      if (event.contentRegion === "scrollable") {
        setUrlInput({ ...urlInput, focused: false });

        if (snapshot && wsRef.current?.readyState === WebSocket.OPEN) {
          const contentW = size.width;
          const cols = contentWidthToCols(contentW);
          const charW = contentW / cols;
          const lineH = getLineHeight("mono");

          const ref = hitTestRef(
            event.x ?? 0,
            event.y ?? 0,
            CONTENT_MARGIN,
            charW,
            lineH,
            snapshot
          );
          if (ref !== null) {
            wsRef.current.send(JSON.stringify({ type: "click", ref }));
          }
        }
      }
    }

    // --- Scroll: translate wheel events into textweb scroll direction ---
    if (
      event.type === "scroll" &&
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      const direction = (event.deltaY ?? 0) > 0 ? "down" : "up";
      wsRef.current.send(JSON.stringify({ type: "scroll", direction }));
    }
  },
};
