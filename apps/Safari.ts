import { NativeApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { measureText, getLineHeight } from "../lib/canvas/fontAdapter";
import {
  createTextInputState,
  handleTextInputKey,
  handleTextInputClick,
  handleTextInputDoubleClick,
  handleTextInputDrag,
  TextInputState,
} from "../lib/canvas/ui/TextInput";
import { OSEvent } from "../lib/canvas/EventManager";
import { SpriteRegistry } from "../lib/canvas/SpriteRegistry";
import {
  parseSiteMarkup,
  renderSiteNodes,
  measureSiteNodes,
  stripTags,
  LinkRect,
  LayoutNode,
} from "../lib/canvas/ui/SiteMarkup";

// ---------------------------------------------------------------------------
// Site registry
// ---------------------------------------------------------------------------

interface SiteEntry {
  name: string;
  url: string;
  body: string;
  keywords?: string[];
}

const siteRegistry: SiteEntry[] = [
  {
    name: "Mockintosh",
    url: "mockintosh.com",
    keywords: ["mac", "macintosh", "retro", "1-bit", "operating system"],
    body: `
<card id="home">
<h1 align="center">Mockintosh</h1>
<img src="microdesktop-disk" align="center">
<spacer height="8">
<p align="center">A mock operating system in the style of an early Macintosh.</p>
<hr>
<h2>Features</h2>
<ul>
<li>1-bit black and white graphics at 512x342</li>
<li>Window management with dragging and layering</li>
<li>Built-in apps: Finder, Safari, Photo Booth, and more</li>
<li>Create your own apps with the App Builder</li>
</ul>
<p><a href="#about">About this project</a></p>
</card>

<card id="about">
<h1>About</h1>
<p>Mockintosh is an open source project. The design language and icons are inspired by the original Macintosh, designed by Susan Kare.</p>
<spacer height="8">
<p><a href="#home">Back to home</a></p>
</card>
`,
  },
  {
    name: "Facebook",
    url: "www.facebook.com",
    keywords: ["social", "network", "friends"],
    body: `
<h1 align="center">Facebook</h1>
<hr>
<p align="center">Under Construction</p>
<spacer height="12">
<p align="center">This site is not yet available on the Mockintosh web.</p>
<p align="center">Check back later!</p>
<spacer height="8">
<p align="center"><a href="google.com">Back to Google</a></p>
`,
  },
  {
    name: "Twitter",
    url: "www.twitter.com",
    keywords: ["social", "tweets", "microblog"],
    body: `
<h1 align="center">Twitter</h1>
<hr>
<p align="center">Under Construction</p>
<spacer height="12">
<p align="center">140 characters will have to wait.</p>
<spacer height="8">
<p align="center"><a href="google.com">Back to Google</a></p>
`,
  },
  {
    name: "GitHub",
    url: "www.github.com",
    keywords: ["code", "git", "repository", "open source", "developer"],
    body: `
<h1 align="center">GitHub</h1>
<hr>
<p align="center">Under Construction</p>
<spacer height="12">
<p align="center">Where the world builds software. Coming soon to Mockintosh.</p>
<spacer height="8">
<p align="center"><a href="google.com">Back to Google</a></p>
`,
  },
  {
    name: "Wikipedia",
    url: "www.wikipedia.org",
    keywords: ["encyclopedia", "wiki", "knowledge", "articles"],
    body: `
<card id="home">
<h1 align="center">Wikipedia</h1>
<p align="center">The Free Encyclopedia</p>
<hr>
<h2>Featured Article</h2>
<p>The Macintosh, later renamed the Macintosh 128K, was the first commercially successful personal computer to feature a mouse and a graphical user interface rather than a command line.</p>
<p>It was introduced on January 24, 1984. It came bundled with MacWrite and MacPaint.</p>
<spacer height="4">
<p><a href="#mac">Read more about the Macintosh</a></p>
<spacer height="8">
<p><a href="google.com">Back to Google</a></p>
</card>

<card id="mac">
<h1>Macintosh</h1>
<p>The original Macintosh had a 9-inch monochrome display with a resolution of 512x342 pixels. It shipped with 128KB of RAM and used 3.5-inch floppy disks.</p>
<spacer height="4">
<p>The graphical user interface was designed by a team that included Susan Kare, who created the iconic icons, fonts, and interface elements.</p>
<spacer height="4">
<h2>Specifications</h2>
<ul>
<li>CPU: Motorola 68000 at 7.83 MHz</li>
<li>RAM: 128KB (later 512KB)</li>
<li>Display: 512x342 monochrome</li>
<li>Storage: 400KB 3.5-inch floppy</li>
</ul>
<spacer height="8">
<p><a href="#home">Back to Wikipedia home</a></p>
</card>
`,
  },
];

// ---------------------------------------------------------------------------
// Google search
// ---------------------------------------------------------------------------

interface SearchResult {
  name: string;
  url: string;
  snippet: string;
}

function searchSites(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return siteRegistry
    .filter((s) => {
      const haystack = `${s.name} ${s.url} ${(s.keywords || []).join(
        " "
      )} ${stripTags(s.body)}`.toLowerCase();
      return haystack.includes(q);
    })
    .map((s) => ({
      name: s.name,
      url: s.url,
      snippet: stripTags(s.body).slice(0, 80),
    }));
}

const GOOGLE_SEARCH_BAR_W = 200;
const GOOGLE_SEARCH_BAR_H = 16;
const GOOGLE_RESULT_H = 42;

function googleSearchBarLayout(
  w: number,
  contentH: number,
  hasResults: boolean
) {
  const barW = Math.min(GOOGLE_SEARCH_BAR_W, w - 40);
  if (hasResults) {
    return { barX: 8, barY: 4, barW: w - 16 };
  }
  return {
    barX: Math.floor((w - barW) / 2),
    barY: Math.floor(contentH / 3) + 24,
    barW,
  };
}

function renderGooglePage(
  ctx: AppContext,
  contentY: number,
  w: number,
  contentH: number,
  searchInput: TextInputState,
  results: SearchResult[],
  linksRef: { current: LinkRect[] }
) {
  const links: LinkRect[] = [];
  const hasResults = results.length > 0 || searchInput.value.trim() !== "";
  const layout = googleSearchBarLayout(w, contentH, hasResults);

  if (!hasResults) {
    const title = "Google";
    const tw = measureText(title, "ChiKareGo");
    ctx.drawText(
      title,
      Math.floor((w - tw) / 2),
      contentY + Math.floor(contentH / 3),
      { font: "ChiKareGo", color: BLACK }
    );
  }

  ctx.drawTextInput(
    searchInput,
    layout.barX,
    contentY + layout.barY,
    layout.barW,
    GOOGLE_SEARCH_BAR_H
  );

  if (hasResults) {
    let y = contentY + layout.barY + GOOGLE_SEARCH_BAR_H + 8;

    if (results.length === 0) {
      ctx.drawText("No results found.", 8, y, {
        font: "Geneva9",
        color: BLACK,
      });
    } else {
      for (const result of results) {
        const nameW = measureText(result.name, "ChiKareGo");
        ctx.drawText(result.name, 8, y, { font: "ChiKareGo", color: BLACK });
        ctx.drawHLine(8, y + getLineHeight("ChiKareGo") - 2, nameW, BLACK);
        links.push({ x: 0, y, w, h: GOOGLE_RESULT_H, href: result.url });
        y += getLineHeight("ChiKareGo");

        ctx.drawText(result.url, 8, y, { font: "Geneva9", color: BLACK });
        y += getLineHeight("Geneva9");

        if (result.snippet) {
          ctx.drawText(result.snippet, 8, y, {
            font: "Geneva9",
            color: BLACK,
          });
          y += getLineHeight("Geneva9");
        }

        y += 6;
      }
    }
  }

  linksRef.current = links;
}

// ---------------------------------------------------------------------------
// Navigation helper
// ---------------------------------------------------------------------------

function navigateTo(
  url: string,
  history: string[],
  historyIdx: number,
  setCurrentUrl: (v: string) => void,
  setHistory: (v: string[]) => void,
  setHistoryIdx: (v: number) => void,
  setCurrentCard: (v: string) => void,
  setSearchInput: (v: TextInputState) => void,
  setSearchResults: (v: SearchResult[]) => void,
  setUrlInput: (v: TextInputState) => void
) {
  const isGoogle = url === "google.com";
  const site = siteRegistry.find((s) => s.url === url);
  if (!site && !isGoogle) return;

  const newHistory = history.slice(0, historyIdx + 1);
  newHistory.push(url);
  setHistory(newHistory);
  setHistoryIdx(newHistory.length - 1);
  setCurrentUrl(url);
  setCurrentCard("home");
  setSearchInput(createTextInputState(""));
  setSearchResults([]);

  const newUrlInput = createTextInputState(url);
  newUrlInput.focused = false;
  setUrlInput(newUrlInput);
}

// ---------------------------------------------------------------------------
// Safari app
// ---------------------------------------------------------------------------

const HEADER_HEIGHT = 28;
const CONTENT_MARGIN = 8;

export const SafariApp: NativeApp = {
  id: "safari",
  title: "Safari",
  icon: "icon/safari",
  defaultSize: { width: 384, height: 220 },
  scrollable: true,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const sprites: SpriteRegistry = props._sprites;

    // --- Hooks (must match order in onEvent and getContentHeight) ---
    const [urlInput, setUrlInput] = app.useState<TextInputState>(
      createTextInputState("google.com")
    );
    const [currentUrl, setCurrentUrl] = app.useState("google.com");
    const [history, setHistory] = app.useState<string[]>(["google.com"]);
    const [historyIdx, setHistoryIdx] = app.useState(0);
    const [searchInput, setSearchInput] = app.useState<TextInputState>(
      createTextInputState("")
    );
    app.useState<"url" | "search" | null>(null); // dragging — not used in render
    const [searchResults, setSearchResults] = app.useState<SearchResult[]>([]);
    const [currentCard, setCurrentCard] = app.useState("home");
    const linksRef = app.useRef<LinkRect[]>([]);

    // --- Header bar ---
    ctx.clear(WHITE);
    ctx.fillRect(0, 0, ctx.width, HEADER_HEIGHT, WHITE);
    ctx.drawHLine(0, HEADER_HEIGHT - 1, ctx.width, BLACK);

    ctx.drawButton({
      x: 4,
      y: 4,
      width: 20,
      height: 20,
      label: "<",
      disabled: historyIdx <= 0,
      id: "safari-back",
      onClick: () => {
        if (historyIdx > 0) {
          const newIdx = historyIdx - 1;
          setHistoryIdx(newIdx);
          setCurrentUrl(history[newIdx]);
          setCurrentCard("home");
          setSearchInput(createTextInputState(""));
          setSearchResults([]);
          const newUrlState = createTextInputState(history[newIdx]);
          setUrlInput(newUrlState);
        }
      },
    });
    ctx.drawButton({
      x: 24,
      y: 4,
      width: 20,
      height: 20,
      label: ">",
      disabled: historyIdx >= history.length - 1,
      id: "safari-forward",
      onClick: () => {
        if (historyIdx < history.length - 1) {
          const newIdx = historyIdx + 1;
          setHistoryIdx(newIdx);
          setCurrentUrl(history[newIdx]);
          setCurrentCard("home");
          setSearchInput(createTextInputState(""));
          setSearchResults([]);
          const newUrlState = createTextInputState(history[newIdx]);
          setUrlInput(newUrlState);
        }
      },
    });

    ctx.drawTextInput(urlInput, 50, 6, ctx.width - 58, 16);

    // --- Content area ---
    const contentY = HEADER_HEIGHT;
    const contentH = ctx.height - HEADER_HEIGHT;
    ctx.pushClip(0, contentY, ctx.width, contentH);

    if (currentUrl === "google.com") {
      renderGooglePage(
        ctx,
        contentY,
        ctx.width,
        contentH,
        searchInput,
        searchResults,
        linksRef
      );
    } else {
      const site = siteRegistry.find((s) => s.url === currentUrl);
      if (site) {
        const cards = parseSiteMarkup(site.body);
        const cardNodes =
          cards.get(currentCard) || cards.values().next().value || [];
        const result = renderSiteNodes(ctx, cardNodes as LayoutNode[], {
          startY: contentY + CONTENT_MARGIN,
          width: ctx.width,
          margin: CONTENT_MARGIN,
          sprites,
        });
        linksRef.current = result.links;
      } else {
        ctx.drawText("Page not found", 16, contentY + 16, {
          font: "ChiKareGo",
          color: BLACK,
        });
        ctx.drawText(currentUrl, 16, contentY + 34, {
          font: "Geneva9",
          color: BLACK,
        });
        linksRef.current = [];
      }
    }

    ctx.popClip();
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any, size: WindowSize) {
    // --- Hooks (same order as render) ---
    const [urlInput, setUrlInput] = app.useState<TextInputState>(
      createTextInputState("google.com")
    );
    const [currentUrl, setCurrentUrl] = app.useState("google.com");
    const [history, setHistory] = app.useState<string[]>(["google.com"]);
    const [historyIdx, setHistoryIdx] = app.useState(0);
    const [searchInput, setSearchInput] = app.useState<TextInputState>(
      createTextInputState("")
    );
    const [dragging, setDragging] = app.useState<"url" | "search" | null>(null);
    const [searchResults, setSearchResults] = app.useState<SearchResult[]>([]);
    const [, setCurrentCard] = app.useState("home");
    const linksRef = app.useRef<LinkRect[]>([]);

    // --- Keyboard ---
    if (event.type === "keyDown") {
      if (event.key === "Enter") {
        if (urlInput.focused) {
          navigateTo(
            urlInput.value,
            history,
            historyIdx,
            setCurrentUrl,
            setHistory,
            setHistoryIdx,
            setCurrentCard,
            setSearchInput,
            setSearchResults,
            setUrlInput
          );
        } else if (currentUrl === "google.com") {
          setSearchResults(searchSites(searchInput.value));
        }
      } else if (urlInput.focused) {
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
      } else if (currentUrl === "google.com") {
        searchInput.focused = true;
        if (
          handleTextInputKey(
            searchInput,
            event.key!,
            event.code!,
            event.shiftKey,
            event.metaKey,
            event.ctrlKey
          )
        ) {
          setSearchInput({ ...searchInput });
        }
      }
    }

    // --- Mouse down / double-click ---
    if (event.type === "mouseDown" || event.type === "doubleClick") {
      let focusedUrl = false;
      let focusedSearch = false;
      let newDragging: "url" | "search" | null = null;

      const urlInputX = 50;
      const urlInputW = size.width - 58;

      if (
        event.y! >= 6 &&
        event.y! < 22 &&
        event.x! >= urlInputX &&
        event.x! < urlInputX + urlInputW
      ) {
        // URL bar click
        focusedUrl = true;
        const localX = event.x! - urlInputX;
        if (event.type === "doubleClick") {
          handleTextInputDoubleClick(urlInput, localX);
        } else {
          handleTextInputClick(urlInput, localX, event.shiftKey);
          newDragging = "url";
        }
        setUrlInput({ ...urlInput, focused: true });
      } else if (event.y! < HEADER_HEIGHT) {
        // Nav buttons handled by hit regions
      } else {
        // Content area click — check links first
        const links = linksRef.current;
        for (const link of links) {
          if (
            event.x! >= link.x &&
            event.x! < link.x + link.w &&
            event.y! >= link.y &&
            event.y! < link.y + link.h
          ) {
            if (link.href.startsWith("#")) {
              setCurrentCard(link.href.slice(1));
            } else {
              navigateTo(
                link.href,
                history,
                historyIdx,
                setCurrentUrl,
                setHistory,
                setHistoryIdx,
                setCurrentCard,
                setSearchInput,
                setSearchResults,
                setUrlInput
              );
            }
            return;
          }
        }

        // Google search input click
        if (currentUrl === "google.com") {
          const contentH = size.height - HEADER_HEIGHT;
          const hasResults =
            searchResults.length > 0 || searchInput.value.trim() !== "";
          const layout = googleSearchBarLayout(
            size.width,
            contentH,
            hasResults
          );
          const sx = layout.barX;
          const sy = HEADER_HEIGHT + layout.barY;

          if (
            event.x! >= sx &&
            event.x! < sx + layout.barW &&
            event.y! >= sy &&
            event.y! < sy + GOOGLE_SEARCH_BAR_H
          ) {
            focusedSearch = true;
            const localX = event.x! - sx;
            if (event.type === "doubleClick") {
              handleTextInputDoubleClick(searchInput, localX);
            } else {
              handleTextInputClick(searchInput, localX, event.shiftKey);
              newDragging = "search";
            }
            setSearchInput({ ...searchInput, focused: true });
          }
        }
      }

      if (!focusedUrl) setUrlInput({ ...urlInput, focused: false });
      if (!focusedSearch) setSearchInput({ ...searchInput, focused: false });
      setDragging(newDragging);
    }

    // --- Mouse drag ---
    if (event.type === "mouseMove" && dragging) {
      if (dragging === "url") {
        const localX = event.x! - 50;
        if (handleTextInputDrag(urlInput, localX)) {
          setUrlInput({ ...urlInput });
        }
      } else if (dragging === "search") {
        const contentH = size.height - HEADER_HEIGHT;
        const hasResults =
          searchResults.length > 0 || searchInput.value.trim() !== "";
        const layout = googleSearchBarLayout(size.width, contentH, hasResults);
        const localX = event.x! - layout.barX;
        if (handleTextInputDrag(searchInput, localX)) {
          setSearchInput({ ...searchInput });
        }
      }
    }

    // --- Mouse up ---
    if (event.type === "mouseUp") {
      if (dragging) setDragging(null);
    }
  },

  getContentHeight(app: AppBuilder, props: any, size: WindowSize): number {
    const sprites: SpriteRegistry = props._sprites;

    // --- Hooks (same order as render) ---
    app.useState<TextInputState>(createTextInputState("google.com"));
    const [currentUrl] = app.useState("google.com");
    app.useState<string[]>(["google.com"]);
    app.useState(0);
    app.useState<TextInputState>(createTextInputState(""));
    app.useState<"url" | "search" | null>(null);
    const [searchResults] = app.useState<SearchResult[]>([]);
    const [currentCard] = app.useState("home");
    app.useRef<LinkRect[]>([]); // linksRef — keep hook alignment

    if (currentUrl === "google.com") {
      const baseH =
        searchResults.length > 0
          ? 28 + searchResults.length * (GOOGLE_RESULT_H + 6) + 16
          : 200;
      return Math.max(baseH, 200);
    }

    const site = siteRegistry.find((s) => s.url === currentUrl);
    if (!site) return 200;

    const cards = parseSiteMarkup(site.body);
    const cardNodes =
      cards.get(currentCard) || cards.values().next().value || [];
    return (
      measureSiteNodes(
        cardNodes as LayoutNode[],
        size.width,
        CONTENT_MARGIN,
        sprites
      ) +
      CONTENT_MARGIN * 2
    );
  },
};
