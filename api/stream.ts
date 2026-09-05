/**
 * stream.ts — Playwright WebSocket session handler for Safari Stream.
 *
 * Each WebSocket connection gets its own Playwright browser context + page.
 * A shared Browser instance is reused across sessions for efficiency.
 *
 * Message protocol:
 *   Client → Server (JSON text):
 *     { type: 'navigate', url: string }
 *     { type: 'resize', contentW: number, contentH: number }
 *     { type: 'click', x: number, y: number }
 *     { type: 'dblclick', x: number, y: number }
 *     { type: 'scroll', x: number, y: number, deltaX: number, deltaY: number }
 *     { type: 'keydown', key: string, code: string, shiftKey?: boolean, metaKey?: boolean, ctrlKey?: boolean }
 *     { type: 'paste', text: string }
 *
 *   Server → Client (JSON text):
 *     { type: 'url', url: string }
 *     { type: 'title', title: string }
 *     { type: 'status', status: 'loading' | 'idle' | 'error', message?: string }
 *
 *   Server → Client (binary):
 *     Raw PNG screenshot bytes (ArrayBuffer on the client)
 */

import { chromium, Browser } from "playwright";
import type { WebSocket } from "ws";

/**
 * The server renders the page at exactly the content rect reported by the
 * client (1:1). No scaling is applied — every screenshot pixel maps directly
 * to one output pixel on the Mockintosh canvas, giving Atkinson dithering the
 * cleanest possible input. Pages will use mobile/responsive layouts at these
 * dimensions, which is an acceptable trade-off for sharp text.
 */

const DEFAULT_VIEWPORT = { width: 480, height: 300 };

type ClientMsg =
  | { type: "navigate"; url: string }
  | { type: "resize"; contentW: number; contentH: number }
  | { type: "click"; x: number; y: number }
  | { type: "dblclick"; x: number; y: number }
  | { type: "scroll"; x: number; y: number; deltaX: number; deltaY: number }
  | {
      type: "keydown";
      key: string;
      code: string;
      shiftKey?: boolean;
      metaKey?: boolean;
      ctrlKey?: boolean;
    }
  | { type: "paste"; text: string };

type ServerMsg =
  | { type: "url"; url: string }
  | { type: "title"; title: string }
  | { type: "status"; status: "loading" | "idle" | "error"; message?: string };

// ---------------------------------------------------------------------------
// Shared browser singleton
// ---------------------------------------------------------------------------

let sharedBrowser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!sharedBrowser || !sharedBrowser.isConnected()) {
    sharedBrowser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return sharedBrowser;
}

// ---------------------------------------------------------------------------
// Key mapping: DOM key names → Playwright key names
// ---------------------------------------------------------------------------

/**
 * Build a Playwright key string from a DOM KeyboardEvent-style key+modifiers.
 * Playwright accepts DOM key values directly ('Enter', 'Backspace', 'a', 'A')
 * and modifier prefixes ('Control+c', 'Meta+a', etc.).
 */
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
// Screenshot helpers
// ---------------------------------------------------------------------------

function sendJson(ws: WebSocket, msg: ServerMsg) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function sendFrame(ws: WebSocket, png: Buffer) {
  if (ws.readyState === ws.OPEN) {
    ws.send(png, { binary: true });
  }
}

// ---------------------------------------------------------------------------
// Session handler
// ---------------------------------------------------------------------------

export async function handleStreamSession(ws: WebSocket): Promise<void> {
  const browser = await getBrowser();

  const context = await browser.newContext({
    viewport: DEFAULT_VIEWPORT,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ignoreHTTPSErrors: false,
  });

  const page = await context.newPage();

  // ---------------------------------------------------------------------------
  // Screenshot coalescing: if a screenshot is already in flight, queue one more.
  // ---------------------------------------------------------------------------
  let screenshotInFlight = false;
  let screenshotQueued = false;

  async function takeScreenshot() {
    if (screenshotInFlight) {
      screenshotQueued = true;
      return;
    }

    // Skip frames where the page is mid-scroll-animation at a sub-pixel offset.
    // The frame loop will catch the next whole-pixel position automatically,
    // giving smooth-but-sharp scrolling without blurry in-between renders.
    try {
      const subPixel = await page.evaluate(
        () =>
          Math.abs(window.scrollY - Math.round(window.scrollY)) > 0.01 ||
          Math.abs(window.scrollX - Math.round(window.scrollX)) > 0.01
      );
      if (subPixel) return;
    } catch {
      // Page not ready — fall through and attempt the screenshot anyway
    }

    screenshotInFlight = true;
    try {
      const png = await page.screenshot({ type: "png" });
      sendFrame(ws, png);
    } catch {
      // Page may have closed or navigated away — ignore
    } finally {
      screenshotInFlight = false;
      if (screenshotQueued) {
        screenshotQueued = false;
        takeScreenshot();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Continuous frame loop — keeps animations and video live after page load.
  // Runs at ~8fps (125ms) which is a comfortable rate for a retro display and
  // stays well within the dither+blit budget. Stops during navigation so frames
  // from the old page don't overwrite the loading state.
  // ---------------------------------------------------------------------------
  const FRAME_INTERVAL_MS = 125;
  let frameLoop: ReturnType<typeof setInterval> | null = null;

  function startFrameLoop() {
    if (frameLoop !== null) clearInterval(frameLoop);
    frameLoop = setInterval(() => takeScreenshot(), FRAME_INTERVAL_MS);
  }

  function stopFrameLoop() {
    if (frameLoop !== null) {
      clearInterval(frameLoop);
      frameLoop = null;
    }
  }

  // ---------------------------------------------------------------------------
  // High-contrast CSS injection
  //
  // Injected after every page load. Converts all text to solid black and all
  // backgrounds to white, eliminating the grey antialiasing halos around glyphs
  // that Atkinson dithering would otherwise spread into noise. Images and videos
  // are left untouched so they still dither naturally.
  // ---------------------------------------------------------------------------
  async function injectHighContrastCSS() {
    try {
      await page.addStyleTag({
        content: `
          *:not(img):not(video):not(canvas):not(svg):not([class*="icon"]) {
            color: black !important;
            background-color: white !important;
            background-image: none !important;
            box-shadow: none !important;
            text-shadow: none !important;
            border-color: #999 !important;
          }
          a { color: black !important; }
          a:visited { color: #333 !important; }
          ::placeholder { color: #666 !important; }
        `,
      });
    } catch {
      // Page may have navigated away before the style tag could be added
    }
  }

  // Notify client when the URL changes (navigation, redirect, history.pushState)
  page.on("framenavigated", async (frame) => {
    if (frame === page.mainFrame()) {
      sendJson(ws, { type: "url", url: page.url() });
    }
  });

  page.on("load", async () => {
    try {
      sendJson(ws, { type: "title", title: await page.title() });
    } catch {}
    await injectHighContrastCSS();
    sendJson(ws, { type: "status", status: "idle" });
    await takeScreenshot();
    startFrameLoop();
  });

  // Also grab a screenshot after DOM is ready (before full load) for faster
  // first-paint feedback.
  page.on("domcontentloaded", () => takeScreenshot());

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
        stopFrameLoop();
        sendJson(ws, { type: "status", status: "loading" });
        try {
          await page.goto(msg.url, {
            waitUntil: "domcontentloaded",
            timeout: 30_000,
          });
        } catch (err) {
          sendJson(ws, {
            type: "status",
            status: "error",
            message: err instanceof Error ? err.message : String(err),
          });
          await takeScreenshot();
        }
        break;
      }

      case "resize": {
        const vw = Math.max(200, msg.contentW);
        const vh = Math.max(100, msg.contentH);
        await page.setViewportSize({ width: vw, height: vh });
        await takeScreenshot();
        break;
      }

      case "click": {
        await page.mouse.click(msg.x, msg.y);
        await takeScreenshot();
        break;
      }

      case "dblclick": {
        await page.mouse.dblclick(msg.x, msg.y);
        await takeScreenshot();
        break;
      }

      case "scroll": {
        await page.mouse.move(msg.x, msg.y);
        // Normalize to 1px per scroll tick so the small viewport scrolls
        // predictably rather than jumping by the OS wheel delta (~100px).
        const dx = msg.deltaX !== 0 ? Math.sign(msg.deltaX) : 0;
        const dy = msg.deltaY !== 0 ? Math.sign(msg.deltaY) : 0;
        await page.mouse.wheel(dx, dy);
        await takeScreenshot();
        break;
      }

      case "keydown": {
        const k = toPlaywrightKey(msg.key, {
          shift: msg.shiftKey,
          meta: msg.metaKey,
          ctrl: msg.ctrlKey,
        });
        try {
          if (k.length === 1) {
            // Single printable character — use type() to generate proper
            // keydown/keypress/keyup + input events.
            await page.keyboard.type(k);
          } else {
            await page.keyboard.press(k);
          }
        } catch {
          // Some key names may not be recognised by Playwright; ignore.
        }
        await takeScreenshot();
        break;
      }

      case "paste": {
        // Simulate Ctrl+V after writing to clipboard via JS
        await page.evaluate(
          (text) => navigator.clipboard?.writeText(text).catch(() => {}),
          msg.text
        );
        await page.keyboard.press("Control+v");
        await takeScreenshot();
        break;
      }
    }
  });

  ws.on("close", async () => {
    stopFrameLoop();
    try {
      await context.close();
    } catch {}
  });
}
