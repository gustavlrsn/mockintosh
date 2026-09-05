---
name: Sites as Mini-Apps
overview: Refactor Safari's site system so websites are content-first markup documents with card-based multi-page support, rendered by a lightweight layout engine, with Google as a search engine across all registered sites.
todos:
  - id: markup-parser
    content: "Create lib/canvas/ui/SiteMarkup.ts — parse HTML-subset markup into layout nodes, render them onto AppContext with vertical flow, alignment, links, images, and cards"
    status: pending
  - id: site-registry
    content: "Define new SiteEntry interface with markup body. Create built-in sites as markup strings (mockintosh.com, placeholder sites). Google stays native."
    status: pending
  - id: google-search
    content: "Implement Google as a native renderer with TextInput that searches site names, URLs, keywords, and body text. Render clickable results."
    status: pending
  - id: safari-refactor
    content: "Refactor Safari.ts — header bar stays native, content area delegates to markup renderer or Google renderer. Handle link clicks for navigation between sites and cards."
    status: pending
isProject: false
---

# Content-First Sites for Safari

## Problem

Safari sites are currently plain render functions with no content model. Any interactivity requires manual wiring in Safari's `render`/`onEvent`. Sites should be **documents**, not programs — the App Builder already handles interactive apps.

## Key Distinction

- **Apps** = interactive, stateful, event-driven (sandboxed workers, full drawing API)
- **Sites** = content-first, declarative, document-like (markup-driven, rendered by Safari)

## Markup Format

HTML-subset with card-based pages and flow layout hints. No CSS, no JS — just structure and content.

### Supported Tags

- `<card id="name">...</card>` — a page within the site (first card is default)
- `<h1>`, `<h2>` — headings (ChiKareGo font, extra spacing above/below)
- `<p>` — paragraph (Geneva9, word-wrapped)
- `<b>text</b>` — bold inline (rendered in ChiKareGo)
- `<a href="url">` — link (underlined, clickable). `href="#cardId"` for internal card links, `href="site.com"` for cross-site navigation
- `<ul>`, `<li>` — unordered list with bullet character prefix
- `<hr>` — horizontal rule (dotted line across width)
- `<img src="/sprite.png">` — image from SpriteRegistry
- `<br>` — line break
- `<spacer height="N">` — vertical gap of N pixels

### Layout Attributes

- `align="center|right|left"` — on any block element (h1, h2, p, img)
- `margin="N"` — extra vertical spacing around a block element

### Example Site

```html
<card id="home">
<h1 align="center">Mockintosh</h1>
<img src="/microdesktop-disk.png" align="center">
<spacer height="8">
<p align="center">A mock operating system in the style of an early Macintosh.</p>
<hr>
<p>Features:</p>
<ul>
<li>1-bit black and white graphics</li>
<li>Window management with dragging</li>
<li>Built-in apps and an App Store</li>
</ul>
<p><a href="#about">About this project</a></p>
</card>

<card id="about">
<h1>About</h1>
<p>Built by @gustavlrsn. All credit for the design language belongs to Susan Kare.</p>
<spacer height="8">
<p><a href="#home">Back to home</a></p>
</card>
```

## Layout Engine: `SiteMarkup.ts`

New file: [`lib/canvas/ui/SiteMarkup.ts`](lib/canvas/ui/SiteMarkup.ts)

### Parsing

Simple regex-based state machine — no DOM, no tree. Parses the markup into a flat list of layout nodes:

```typescript
type LayoutNode =
  | { type: "heading"; level: 1 | 2; text: string; align: Align }
  | { type: "paragraph"; segments: InlineSegment[]; align: Align }
  | { type: "listItem"; segments: InlineSegment[] }
  | { type: "hr" }
  | { type: "image"; src: string; align: Align }
  | { type: "spacer"; height: number }
  | { type: "br" };

type InlineSegment =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "link"; text: string; href: string };
```

Cards are parsed separately — `parseCards(markup)` returns a `Map<string, LayoutNode[]>`.

### Rendering

`renderSiteMarkup(ctx, nodes, options)` does a single top-to-bottom pass:

- Tracks a `y` cursor starting at `contentY`
- Each node type advances `y` by its height
- Headings: draw in ChiKareGo with spacing above/below
- Paragraphs: word-wrap using existing `getWrappedLines`, render segments with inline style changes (bold = ChiKareGo, link = underlined)
- List items: indent + bullet character + wrapped text
- hr: `ctx.drawDottedHLine` across the width
- Images: look up sprite, blit at current y, respect alignment
- Spacer: just advance y

Returns `{ contentHeight: number; links: LinkRect[] }` where `LinkRect` is `{ x, y, w, h, href }` for click hit-testing.

### Measuring

`measureSiteMarkup(nodes, width)` — same vertical pass without drawing, returns total height. Used by `getContentHeight` for scrollbar.

## Site Registry

```typescript
interface SiteEntry {
  name: string;
  url: string;
  body: string;        // markup content
  keywords?: string[]; // extra search terms
}
```

Built-in sites:
- **google.com** — special native renderer (not markup), see below
- **mockintosh.com** — markup site with logo, description, feature list
- **facebook.com, twitter.com, github.com, wikipedia.org** — placeholder markup pages ("Under Construction" style with era-appropriate text)

## Google Search Page

Google stays as a **native renderer** inside Safari because it needs a functional TextInput and dynamic results. It:

1. Draws "Google" title centered + a real `TextInput` (using existing `drawTextInput` / `TextInputState`)
2. On Enter, searches all `siteRegistry` entries — matching against `name`, `url`, `keywords`, and `body` (stripped of tags)
3. Renders results as a list: **site name** (bold), URL (small text), snippet (first ~60 chars of body text stripped of tags)
4. Each result is a clickable link rect — clicking navigates to that site
5. Shows "No results found" when nothing matches

This requires two `useState` hooks beyond the URL bar: `searchInput: TextInputState` and `searchResults: ResultEntry[]`.

## Safari Refactoring

[`apps/Safari.ts`](apps/Safari.ts) changes:

### State hooks (in order, always called unconditionally)
1. `urlInput` — URL bar TextInput
2. `currentUrl` — current site URL string
3. `history` — navigation history array
4. `historyIdx` — current position in history
5. `searchInput` — Google search TextInput
6. `searchResults` — Google search results array
7. `currentCard` — current card ID within a site (default: first card)
8. `lastLinks` — link rects from last render (for click hit-testing)

### render
- Draw header bar (native: back/fwd buttons, URL input)
- If `currentUrl === "google.com"`: call Google native renderer
- Otherwise: look up site in registry, parse cards, get current card nodes, call `renderSiteMarkup`, store returned links in state

### onEvent
- Header bar: focus URL input, handle back/fwd button clicks
- If Google: handle search input focus/keyboard, result click navigation
- If markup site: hit-test click against `lastLinks`, navigate on match (internal `#card` links update `currentCard`, external links update `currentUrl`)

### getContentHeight
- Google: fixed 300
- Markup sites: `measureSiteMarkup` on current card

## Files to Change

- **New: [`lib/canvas/ui/SiteMarkup.ts`](lib/canvas/ui/SiteMarkup.ts)** — Markup parser + vertical flow layout engine. Uses existing `drawBitmapText`, `getWrappedLines`, `measureText` from fontAdapter and TextBlock. ~200-300 lines.
- **Edit: [`apps/Safari.ts`](apps/Safari.ts)** — New site registry, markup rendering, Google search page, link navigation. Major rewrite of render/onEvent.
