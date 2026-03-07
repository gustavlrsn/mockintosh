---
name: ""
overview: ""
todos: []
isProject: false
---

# Content top inset (Mac guidelines) — Finder + Safari

## Summary

- **ChatGippity**: Unchanged (edge case: fixed _bottom_ bar; keep using `ctx.scrollArea()`).
- **Finder folder windows** and **Safari**: Use the classic Mac approach — a fixed area above the scrollbar that does not scroll; the window scrollbar starts below that strip and only the content below scrolls.

---

## Mac guidelines (from NotebookLM research)

Fixed non-scrolling regions are implemented by adjusting the scroll bar’s bounding rectangle:

- **Vertical scroll bar**: top coordinate = combined height of items above the scroll bar − 1. Only the content below that line scrolls.
- Size box: subtract 13px (or GROW_BOX_SIZE) so the scrollbar does not overlap the resize area.

So: one content area, split into (1) fixed strip at top, (2) scrollable region below; scrollbar runs alongside (2) only.

---

## Architecture

- **contentTopInset**: Height in pixels of the non-scrolling strip at the top of the content area (below title bar; if the window has an info bar in chrome, the content rect is already below it — so inset is _inside_ the content). Default 0.
- **Scrollable region**: From `contentTopInset` to the bottom of the content area. Height = `bodyH - contentTopInset`. Only this region scrolls; `maxScroll = contentHeight - (bodyH - contentTopInset)`.
- **getContentHeight**: When inset is used, it must return the **scrollable content height only** (the content drawn below the fixed strip).
- **App drawing**: Fixed strip in main context (no scroll); scrollable part via **drawScrollableContent(callback)** which receives a sub-context with origin at `(ox, oy + contentTopInset)`, size `(w, h - contentTopInset)`, and the window’s scrollY/scrollX.

---

## Implementation plan

### 1. App contract and window state

- **SystemApp** ([lib/canvas/AppRegistry.ts](lib/canvas/AppRegistry.ts)): Add optional `getContentTopInset?(app, props, size): number`.
- **MultiWindowSystemApp**: Add optional `getContentTopInset?(app, win, windowId, props, size): number`.
- **WindowState** ([lib/canvas/WindowManager.ts](lib/canvas/WindowManager.ts)): Add `contentTopInset?: number` (default 0).
- **main.tsx**: In the same loop that calls `getContentHeight` / `getInfoBar`, call `getContentTopInset` for single-window apps and for Finder (per window); set `win.contentTopInset`.

### 2. WindowManager: scrollbar and scroll logic

- Add **scrollableBodyHeight(win)** = `_bodyHeight(win) - (win.contentTopInset ?? 0)`.
- **maxScroll** everywhere: `contentHeight - _scrollableBodyHeight(win)` (not `contentHeight - bodyH`). Touch points: `handleScroll`, scroll-thumb drag in `handleMouseMove`, `_drawScrollbar` (thumb position, track hit).
- **Scrollbar geometry**: Scrollbar top `sby = win.y + headerH + (win.contentTopInset ?? 0) - 1`; track height based on `_scrollableBodyHeight(win)` (minus arrow heights).
- **findWindow** inVScroll: use new `sby` and scrollable height for the vertical scrollbar hit area.
- **getContentRect**: Unchanged (full content rect). App draws fixed strip + scrollable part via AppContext API.

### 3. AppContext: drawScrollableContent

- **Constructor**: Add optional `contentTopInset?: number` and `windowScrollY?: number` (or equivalent). When `contentTopInset > 0`, the main context is created with **scrollY = 0** so the fixed strip does not scroll; store `windowScrollY` for the scrollable sub-context.
- **drawScrollableContent(callback: (scrollCtx: AppContext) => void)**: When `contentTopInset > 0`, create a temporary AppContext with origin `(ox, oy + contentTopInset)`, size `(w, h - contentTopInset)`, scrollY = window’s scrollY, scrollX = window’s scrollX; call callback with it. Use same hitRegions so hit regions registered in the sub-context map to correct screen coordinates.
- **createAppContext** (WindowManager): Pass `contentTopInset` and, when `contentTopInset > 0`, pass scrollY = 0 for the main context and the real scrollY for use by drawScrollableContent (e.g. via a stored ref or parameter so drawScrollableContent can construct the sub-context with the real scroll).

### 4. Safari ([apps/Safari.ts](apps/Safari.ts))

- Add **getContentTopInset**: return `HEADER_HEIGHT` (28).
- **getContentHeight**: Return only the **scrollable** content height (page content below the 28px nav). For Google: height of search bar + results. For site pages: existing page content height.
- **render**: Draw nav bar (back, forward, URL input) in the main context in `[0, HEADER_HEIGHT)`. Call **ctx.drawScrollableContent((scrollCtx) => { ... })** and move all page drawing into the callback using `scrollCtx` (coordinates relative to top of scrollable area).
- **onEvent**: Keep URL bar / content split by `y < HEADER_HEIGHT`. Content coordinates and link hit-testing already in content-local space; ensure link rects are in scrollable-region coordinates to match drawScrollableContent.

### 5. Finder folder windows ([apps/Finder.ts](apps/Finder.ts))

- **getContentTopInset**: For folder windows (windowId !== DESKTOP_WINDOW_ID), return **INFO_BAR_HEIGHT** (20). For desktop, return 0 or omit.
- **getInfoBar**: For folder windows, return **null** so the OS does not draw the info bar in the chrome (the fixed strip will be drawn in the content area instead). Desktop can keep returning null as today.
- **getContentHeight**: For folder windows, return only the **scrollable** content height (icon grid: same formula as today — maxY + FOLDER_PADDING — which is already the grid height; no change to the value, but semantically it is now “scrollable part only”).
- **renderFolderWindow**: Draw the info bar in the fixed strip: in the main context, draw the three segments (“X items”, “2,427K in disk”, “7,648K available”) in `[0, INFO_BAR_HEIGHT)` (reuse the same layout as WindowManager’s drawInfoBar or a shared helper if desired). Then call **ctx.drawScrollableContent((scrollCtx) => { ... })** and move the icon grid drawing into the callback; icon positions are in scrollable-region coordinates (same as today’s content coordinates but starting at 0 in the callback).
- **handleFolderEvent**: Event coordinates are content-local; when `y >= INFO_BAR_HEIGHT`, treat as scrollable region (convert to scrollable-local for icon hit-test: use `y - INFO_BAR_HEIGHT` and scroll offset for the scrollable context). Preserve hook order; add scroll state if needed for any logic that depends on scroll (e.g. drag/drop already uses contentX, contentY, scrollX, scrollY from getOpenFolderWindows — those will now be the full content rect and window scroll; main.tsx’s getOpenFolderWindows returns contentRect and scroll from WindowManager, so the scrollable region origin is contentY + contentTopInset; callers that need scrollable-area local coords can subtract contentTopInset from y and use scrollY).
- **getOpenFolderWindows** (main.tsx): Currently returns contentX, contentY, contentW, contentH, scrollY, scrollX. With contentTopInset, the scrollable region starts at contentY + contentTopInset and has height contentH - contentTopInset. Either (a) keep returning the full content rect and scroll, and let Finder (or other consumers) compute scrollable region from contentTopInset, or (b) add contentTopInset to the returned info so callers know the fixed strip height. Prefer (b): add `contentTopInset?: number` to FinderWindowInfo so drag/drop and other code can convert to scrollable-local when needed.

### 6. SDK and docs

- **packages/sdk**: Add optional `getContentTopInset?` to the App interface; document that when used, `getContentHeight` returns only the scrollable content height and the app uses `drawScrollableContent` for the part below the inset.
- **ARCHITECTURE.md**: Document content top inset (fixed area above the scrollbar per Mac guidelines); document drawScrollableContent and that getInfoBar (chrome) is for simple text, while contentTopInset + app-drawn fixed strip is for toolbars / URL bars / Finder-style info in content.

### 7. ChatGippity

- No code changes. It remains the edge case (fixed _bottom_ bar) and keeps using `ctx.scrollArea()`.

---

## Files to touch

| Area               | Files                                                                                |
| ------------------ | ------------------------------------------------------------------------------------ |
| Contract + state   | AppRegistry.ts, WindowManager.ts, main.tsx                                           |
| Scroll + scrollbar | WindowManager.ts (findWindow, drawScrollbar, handleScroll, scroll drag)              |
| AppContext         | AppContext.ts (contentTopInset, drawScrollableContent, constructor)                  |
| Safari             | apps/Safari.ts                                                                       |
| Finder             | apps/Finder.ts; FinderWindowInfo (contentTopInset); getOpenFolderWindows in main.tsx |
| SDK + docs         | packages/sdk/src/index.ts, APP_DEV_GUIDE.md, ARCHITECTURE.md                         |

---

## Edge cases

- contentTopInset >= body height: clamp or treat as 0 so scrollable height stays positive.
- Apps without getContentTopInset: contentTopInset remains 0; behaviour unchanged.
- Hit regions in drawScrollableContent: sub-context uses same HitRegionMap; coordinates are in sub-context space; sub-context applies origin and scroll when registering, so screen positions remain correct.
