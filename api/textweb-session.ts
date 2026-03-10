/**
 * textweb-session.ts — TextWeb WebSocket session handler.
 *
 * Each WebSocket connection gets its own AgentBrowser (Playwright) instance.
 * The server renders the page as a text grid via textweb and sends the result
 * back to the client as a JSON "snapshot" message.
 *
 * Message protocol:
 *   Client → Server (JSON text):
 *     { type: 'navigate', url: string }
 *     { type: 'resize', contentW: number, contentH: number }
 *     { type: 'click', ref: number }
 *     { type: 'keydown', key: string, code: string, shiftKey?: boolean, metaKey?: boolean, ctrlKey?: boolean }
 *     { type: 'paste', text: string }
 *     { type: 'scroll', direction: 'up' | 'down' }
 *
 *   Server → Client (JSON text):
 *     { type: 'snapshot', view: string, url: string, title: string, elements: Record<number, TextwebElement>, meta: TextwebMeta }
 *     { type: 'status', status: 'loading' | 'idle' | 'error', message?: string }
 *
 * Column-width formula (shared contract between client and server):
 *   After the client sends a `resize` message with `contentW` pixels, the server
 *   resets AgentBrowser.cols to `max(40, floor(contentW / APPROX_MONO_CHAR_PX))`.
 *   The client uses the same constant to compute character width for hit-testing:
 *     charW = contentW / cols
 *   APPROX_MONO_CHAR_PX is an estimate for the default page font; real charW is
 *   available in `meta.charW` from each snapshot so the client can self-correct.
 */

import { createRequire } from "module";
import type { WebSocket } from "ws";

// textweb is CommonJS — load it through createRequire from the ESM context.
const require = createRequire(import.meta.url);
const { AgentBrowser } = require("textweb") as {
  AgentBrowser: new (opts?: { cols?: number }) => AgentBrowserInstance;
};

// ---------------------------------------------------------------------------
// Types describing textweb's runtime return shapes
// ---------------------------------------------------------------------------

export interface TextwebElement {
  selector: string;
  tag: string;
  semantic: string;
  href: string | null;
  text: string | null;
  label: string;
  x: number;
  y: number;
}

export interface TextwebMeta {
  cols: number;
  rows: number;
  scrollY: number;
  totalRefs: number;
  charW: number;
  charH: number;
  url?: string;
  title?: string;
  stats?: {
    totalElements: number;
    interactiveElements: number;
    renderMs: number;
  };
}

export interface TextwebGridBounds {
  row: number;
  col_start: number;
  col_end: number;
}

export interface TextwebSemanticElement {
  id: string;
  type: string;
  name: string | null;
  text: string | null;
  href: string | null;
  grid_ref: number | null;
  grid_bounds: TextwebGridBounds | null;
  selector: string;
}

export interface TextwebSemanticModel {
  mode: string;
  url: string | null;
  title: string | null;
  elements: TextwebSemanticElement[];
}

export interface TextwebSnapshot {
  view: string;
  elements: Record<number, TextwebElement>;
  meta: TextwebMeta;
  semantic: TextwebSemanticModel;
}

// Minimal subset of AgentBrowser we actually call.
interface AgentBrowserInstance {
  cols: number;
  page: import("playwright").Page | null;
  launch(): Promise<AgentBrowserInstance>;
  navigate(url: string): Promise<TextwebSnapshot>;
  snapshot(): Promise<TextwebSnapshot>;
  click(ref: number): Promise<TextwebSnapshot>;
  scroll(dir: "up" | "down", amount?: number): Promise<TextwebSnapshot>;
  close(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Pixel advance of one character in the Mockintosh `mono` bitmap font:
 *   maxWidth (5) + spacing (1) = 6 px.
 *
 * This constant is the shared contract between server and client:
 *   • Server sets cols = max(MIN_COLS, floor(contentW / MONO_CHAR_PX))
 *   • Server also resizes the Playwright viewport to contentW so elements
 *     beyond the window edge are not extracted by textweb's renderer.
 *   • Client computes charW = contentW / cols (≈ MONO_CHAR_PX) for hit-testing.
 */
const MONO_CHAR_PX = 6;
const MIN_COLS = 40;

function normalizeUrl(raw: string): string {
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function urlToCols(contentW: number): number {
  return 4; //Math.max(MIN_COLS, Math.floor(contentW / MONO_CHAR_PX));
}

// ---------------------------------------------------------------------------
// Key mapping helpers (same logic as stream.ts)
// ---------------------------------------------------------------------------

function toPlaywrightKey(
  key: string,
  modifiers: { shift?: boolean; meta?: boolean; ctrl?: boolean }
): string {
  const parts: string[] = [];
  if (modifiers.meta) parts.push("Meta");
  if (modifiers.ctrl) parts.push("Control");
  if (modifiers.shift && key.length > 1) parts.push("Shift");
  parts.push(key);
  return parts.join("+");
}

// ---------------------------------------------------------------------------
// Message helpers
// ---------------------------------------------------------------------------

type ServerMsg =
  | ({ type: "snapshot" } & TextwebSnapshot & { url: string; title: string })
  | { type: "status"; status: "loading" | "idle" | "error"; message?: string };

function sendJson(ws: WebSocket, msg: ServerMsg) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function sendSnapshot(ws: WebSocket, result: TextwebSnapshot) {
  sendJson(ws, {
    type: "snapshot",
    view: result.view,
    elements: result.elements,
    meta: result.meta,
    semantic: result.semantic,
    url: result.meta.url ?? "",
    title: result.meta.title ?? "",
  });
}

// ---------------------------------------------------------------------------
// Client message types
// ---------------------------------------------------------------------------

type ClientMsg =
  | { type: "navigate"; url: string }
  | { type: "resize"; contentW: number; contentH: number }
  | { type: "click"; ref: number }
  | {
      type: "keydown";
      key: string;
      code: string;
      shiftKey?: boolean;
      metaKey?: boolean;
      ctrlKey?: boolean;
    }
  | { type: "paste"; text: string }
  | { type: "scroll"; direction: "up" | "down" };

// ---------------------------------------------------------------------------
// Session handler
// ---------------------------------------------------------------------------

export async function handleTextwebSession(ws: WebSocket): Promise<void> {
  const browser: AgentBrowserInstance = new AgentBrowser({ cols: MIN_COLS });

  try {
    await browser.launch();
  } catch (err) {
    sendJson(ws, {
      type: "status",
      status: "error",
      message:
        "Failed to launch browser: " +
        (err instanceof Error ? err.message : String(err)),
    });
    return;
  }

  ws.on("message", async (raw) => {
    if (typeof raw !== "string" && !Buffer.isBuffer(raw)) return;

    let msg: ClientMsg;
    try {
      msg = JSON.parse(raw.toString()) as ClientMsg;
    } catch {
      return;
    }

    switch (msg.type) {
      case "navigate": {
        sendJson(ws, { type: "status", status: "loading" });
        try {
          const result = await browser.navigate(normalizeUrl(msg.url));
          sendSnapshot(ws, result);
          sendJson(ws, { type: "status", status: "idle" });
        } catch (err) {
          sendJson(ws, {
            type: "status",
            status: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
        break;
      }

      case "resize": {
        // Update cols so the grid renders at the right width.
        // Also resize the Playwright viewport to contentW so textweb's renderer
        // doesn't extract elements beyond the window edge (which would produce
        // lines longer than cols and overflow the Mockintosh window).
        browser.cols = urlToCols(msg.contentW);
        const vw = Math.max(200, msg.contentW);
        const vh = Math.max(100, msg.contentH);
        if (browser.page) {
          try {
            await browser.page.setViewportSize({ width: vw, height: vh });
          } catch {
            // Page not yet loaded — non-fatal.
          }
        }
        // Re-snapshot the current page at the new column width if one is loaded.
        if (browser.page && browser.page.url() !== "about:blank") {
          try {
            const result = await browser.snapshot();
            sendSnapshot(ws, result);
          } catch {
            // Non-fatal — page may not be navigated yet.
          }
        }
        break;
      }

      case "click": {
        sendJson(ws, { type: "status", status: "loading" });
        try {
          const result = await browser.click(msg.ref);
          sendSnapshot(ws, result);
          sendJson(ws, { type: "status", status: "idle" });
        } catch (err) {
          sendJson(ws, {
            type: "status",
            status: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
        break;
      }

      case "keydown": {
        if (!browser.page) break;
        const k = toPlaywrightKey(msg.key, {
          shift: msg.shiftKey,
          meta: msg.metaKey,
          ctrl: msg.ctrlKey,
        });
        try {
          if (k.length === 1) {
            await browser.page.keyboard.type(k);
          } else {
            await browser.page.keyboard.press(k);
          }
          const result = await browser.snapshot();
          sendSnapshot(ws, result);
        } catch {
          // Unrecognised key names are non-fatal.
        }
        break;
      }

      case "paste": {
        if (!browser.page) break;
        try {
          await browser.page.evaluate(
            (text) => navigator.clipboard?.writeText(text).catch(() => {}),
            msg.text
          );
          await browser.page.keyboard.press("Control+v");
          const result = await browser.snapshot();
          sendSnapshot(ws, result);
        } catch {
          // Non-fatal.
        }
        break;
      }

      case "scroll": {
        try {
          const result = await browser.scroll(msg.direction);
          sendSnapshot(ws, result);
        } catch {
          // Non-fatal.
        }
        break;
      }
    }
  });

  ws.on("close", async () => {
    try {
      await browser.close();
    } catch {
      // Ignore cleanup errors.
    }
  });
}
