import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { measureText, getLineHeight } from "../lib/canvas/fontAdapter";
import {
  createTextInputState,
  handleTextInputKey,
  handleTextInputPaste,
  handleTextInputClick,
  handleTextInputDoubleClick,
  handleTextInputDrag,
  TextInputState,
} from "../lib/toolbox/TextEdit";
import { OSEvent } from "../lib/toolbox/EventManager";
import { ResourceManager } from "../lib/toolbox/ResourceManager";
import { makeRect } from "@mockintosh/quickdraw";
import {
  NewControl,
  DrawControls,
  inButton,
} from "../lib/toolbox/ControlManager";
import {
  measureMarkdownContent,
  renderMarkdownContent,
  hitTestLink,
  preloadImages,
  MarkdownLoadState,
} from "../lib/canvas/ui/MarkdownView";
import type { LinkRect, LayoutNode } from "@mockintosh/markdown";
import { parseMarkdown } from "@mockintosh/markdown";

// ---------------------------------------------------------------------------
// Page fetching
//
// TWO BACKENDS — swap by changing USE_JINA:
//
//   true  → Jina Reader API (client-side, no server needed, handles
//            Cloudflare / bot-protected sites, CORS-enabled)
//   false → /api/browse proxy (server-side defuddle; faster for open sites
//            but blocked by Cloudflare/IP filtering on some domains)
// ---------------------------------------------------------------------------

const USE_JINA = false;
const JINA_BASE = "https://r.jina.ai/";

async function fetchPage(
  url: string,
  sprites: ResourceManager,
  contentWidth: number,
  onResult: (nodes: LayoutNode[], title: string) => void,
  onError: (msg: string) => void
) {
  try {
    let markdown: string;
    let title = "";

    if (USE_JINA) {
      // --- Jina Reader API ---
      // GET https://r.jina.ai/<target-url>
      // Returns clean markdown, CORS-enabled, runs a headless browser server-side.
      const resp = await fetch(JINA_BASE + url, {
        headers: {
          Accept: "text/plain",
          "X-Return-Format": "markdown",
        },
      });
      if (!resp.ok) {
        onError(`${resp.status} ${resp.statusText}`);
        return;
      }
      const raw = await resp.text();
      // Jina prepends a metadata block:
      //   Title: …
      //   URL Source: …
      //   Markdown Content:
      //   <actual markdown>
      const mdSep = raw.indexOf("Markdown Content:");
      if (mdSep !== -1) {
        const header = raw.slice(0, mdSep);
        const titleMatch = header.match(/^Title:\s*(.+)$/m);
        if (titleMatch) title = titleMatch[1].trim();
        markdown = raw.slice(mdSep + "Markdown Content:".length).trim();
      } else {
        markdown = raw;
      }
    } else {
      // --- /api/browse proxy (defuddle, server-side) ---
      const resp = await fetch("/api/browse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }));
        onError(err.error || `HTTP ${resp.status}`);
        return;
      }
      const data = await resp.json();
      markdown = data.markdown;
      title = data.title;
    }

    const nodes = parseMarkdown(markdown);

    // Kick off image pre-loads; re-render fires after each resolves
    preloadImages(nodes, sprites, contentWidth);

    onResult(nodes, title);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    onError(`Network error: ${msg}`);
  }
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/**
 * Normalise a user-typed string into a full URL.
 * Returns null if the string looks like a search query rather than a URL.
 */
function normalizeUrl(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  // Looks like a domain: contains a dot and no spaces
  if (/^[^\s]+\.[^\s]+$/.test(s) && !s.includes(" ")) {
    return `https://${s}`;
  }
  return null;
}

/**
 * Resolve a link href against the current page URL.
 * Handles relative paths (../foo), root-relative (/foo), protocol-relative (//foo),
 * and absolute URLs. Falls back to normalizeUrl for bare domains typed by the user.
 */
function resolveLink(href: string, currentUrl: string): string | null {
  // Try resolving as a URL relative to the current page
  if (currentUrl) {
    try {
      return new URL(href, currentUrl).toString();
    } catch {
      // fall through
    }
  }
  return normalizeUrl(href);
}

// ---------------------------------------------------------------------------
// Safari app
// ---------------------------------------------------------------------------

const HEADER_HEIGHT = 28;
const CONTENT_MARGIN = 8;

type LoadingState = MarkdownLoadState;

const START_PAGE = "";

export const SafariApp: SystemApp = {
  id: "safari",
  title: "Safari",
  icon: "icon/safari",
  defaultSize: { width: 384, height: 220 },
  minSize: { width: 200, height: 220 },
  scrollable: true,
  resizable: true,

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const sprites: ResourceManager = props._sprites;

    // --- Hooks (must match order in onEvent and getContentHeight) ---
    const [urlInput, setUrlInput] = app.useState<TextInputState>(
      createTextInputState(START_PAGE)
    );
    const [currentUrl, setCurrentUrl] = app.useState(START_PAGE);
    const [history, setHistory] = app.useState<string[]>([START_PAGE]);
    const [historyIdx, setHistoryIdx] = app.useState(0);
    const linksRef = app.useRef<LinkRect[]>([]);
    const controlsCreatedRef = app.useRef(false);
    const [pageNodes, setPageNodes] = app.useState<LayoutNode[]>([]);
    const [loadingState, setLoadingState] = app.useState<LoadingState>("idle");
    const [errorMessage, setErrorMessage] = app.useState<string | null>(null);

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

      const contentWidth = ctx.width - CONTENT_MARGIN * 2;

      const goTo = (url: string) => {
        setCurrentUrl(url);
        setUrlInput(createTextInputState(url));
        setLoadingState("loading");
        setPageNodes([]);
        setErrorMessage(null);
        app.scheduleRender();
        fetchPage(
          url,
          sprites,
          contentWidth,
          (nodes) => {
            setPageNodes(nodes);
            setLoadingState("idle");
            app.scheduleRender();
          },
          (msg) => {
            setLoadingState("error");
            setErrorMessage(msg);
            app.scheduleRender();
          }
        );
      };

      const backControl = win.controlList[0];
      const fwdControl = win.controlList[1];

      // Refresh action callbacks every render so they close over current state.
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
      if (!currentUrl) {
        // Start page
        const line1 = "Enter a URL above to browse the web.";
        const tw = measureText(line1, "body");
        scrollCtx.drawText(
          line1,
          Math.max(CONTENT_MARGIN, Math.floor((scrollCtx.width - tw) / 2)),
          Math.floor(scrollCtx.height / 2) - getLineHeight("body"),
          { font: "body", color: BLACK }
        );
        linksRef.current = [];
        return;
      }

      linksRef.current = renderMarkdownContent(
        scrollCtx,
        pageNodes,
        loadingState,
        errorMessage,
        sprites,
        { width: scrollCtx.width, margin: CONTENT_MARGIN }
      );
    });
  },

  getContentTopInset(_app: AppBuilder, _props: any, _size: WindowSize): number {
    return HEADER_HEIGHT;
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any, size: WindowSize) {
    const sprites: ResourceManager = props._sprites;

    // --- Hooks (same order as render) ---
    const [urlInput, setUrlInput] = app.useState<TextInputState>(
      createTextInputState(START_PAGE)
    );
    const [currentUrl, setCurrentUrl] = app.useState(START_PAGE);
    const [history, setHistory] = app.useState<string[]>([START_PAGE]);
    const [historyIdx, setHistoryIdx] = app.useState(0);
    const linksRef = app.useRef<LinkRect[]>([]); // linksRef
    app.useRef(false); // controlsCreatedRef
    const [, setPageNodes] = app.useState<LayoutNode[]>([]);
    const [, setLoadingState] = app.useState<LoadingState>("idle");
    const [, setErrorMessage] = app.useState<string | null>(null);

    const navigateToUrl = (typed: string) => {
      const fullUrl = normalizeUrl(typed);
      if (!fullUrl) return;

      const newHistory = history.slice(0, historyIdx + 1);
      newHistory.push(typed);
      setHistory(newHistory);
      setHistoryIdx(newHistory.length - 1);
      setCurrentUrl(typed);
      const newUrlInput = createTextInputState(typed);
      newUrlInput.focused = false;
      setUrlInput(newUrlInput);

      setLoadingState("loading");
      setPageNodes([]);
      setErrorMessage(null);
      app.scheduleRender();

      const contentWidth = size.width - CONTENT_MARGIN * 2;
      fetchPage(
        fullUrl,
        sprites,
        contentWidth,
        (nodes, _title) => {
          setPageNodes(nodes);
          setLoadingState("idle");
          app.scheduleRender();
        },
        (msg) => {
          setLoadingState("error");
          setErrorMessage(msg);
          app.scheduleRender();
        }
      );
    };

    // --- Paste ---
    if (event.type === "paste" && event.pasteText) {
      if (urlInput.focused) {
        if (handleTextInputPaste(urlInput, event.pasteText)) {
          setUrlInput({ ...urlInput });
        }
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
      }
    }

    // --- Mouse down / double-click ---
    if (event.type === "mouseDown" || event.type === "doubleClick") {
      const inScrollable =
        event.contentRegion === "scrollable" ||
        (event.contentRegion === undefined && event.y! >= HEADER_HEIGHT);

      if (inScrollable) {
        const hit = hitTestLink(linksRef.current, event.x!, event.y!);
        if (hit) {
          const resolved = resolveLink(hit.href, currentUrl);
          if (resolved) navigateToUrl(resolved);
          return;
        }
      }

      setUrlInput({ ...urlInput, focused: false });
    }

    // --- Mouse up ---
    if (event.type === "mouseUp") {
      // nothing extra needed
    }
  },

  getContentHeight(app: AppBuilder, props: any, size: WindowSize): number {
    const sprites: ResourceManager = props._sprites;

    // --- Hooks (same order as render) ---
    app.useState<TextInputState>(createTextInputState(START_PAGE));
    app.useState(START_PAGE);
    app.useState<string[]>([START_PAGE]);
    app.useState(0);
    app.useRef<LinkRect[]>([]);
    app.useRef(false);
    const [pageNodes] = app.useState<LayoutNode[]>([]);
    const [loadingState] = app.useState<LoadingState>("idle");
    app.useState<string | null>(null);

    if (loadingState !== "idle" || pageNodes.length === 0) return 200;
    return (
      measureMarkdownContent(pageNodes, size.width, CONTENT_MARGIN, sprites) +
      CONTENT_MARGIN * 2
    );
  },
};
