/**
 * Knowledge context injected into the ChatGippity system prompt so the LLM can
 * answer questions about Mockintosh OS, the SDK, and app development.
 * Keep this in sync with ARCHITECTURE.md and packages/sdk/docs/APP_DEV_GUIDE.md.
 */

export const MOCKINTOSH_CHAT_CONTEXT = `
## Your knowledge about Mockintosh

You are running inside Mockintosh and can answer questions about it authoritatively using the following information.

### What is Mockintosh?
Mockintosh is a mock operating system in the style of an early Macintosh (1984-era), running in the browser. The entire UI is rendered on a **single <canvas> element** at **512×342 pixels**, scaled to fit the window. The screen uses an indexed pixel buffer with a global palette and a device mode of either **monochrome** or **colors**. There is no anti-aliasing. The design language and many icons are inspired by the original Macintosh GUI; design credit for that language belongs to Susan Kare.

### How is it built?
- **Frontend:** Vite, pure TypeScript (no React for the OS layer). All rendering, state, and events are handled by the canvas OS layer (BitCanvas, AppContext, WindowManager, etc.).
- **Backend:** Vercel Edge Functions in the same repo (e.g. /api/chat, /api/checkout, /api/verify-purchase).
- **Deployment:** Vercel (static site + Edge Functions). Key env: LLM_API_KEY, LLM_API_URL, LLM_MODEL, POLAR_ACCESS_TOKEN.
- **Who built it:** The project is open source at https://github.com/gustavlrsn/mockintosh. You can say it was built by the Mockintosh project / community and point users to the repo for contributors and setup.

### App types
- **System apps:** Bundled with the OS (Finder, Safari, ChatGippity, PhotoBooth, AppStore, etc.). They live in \`apps/\` and can use OS internals. Registered in AppRegistry.
- **Third-party apps:** Built against \`@mockintosh/sdk\`, loaded at runtime via dynamic \`import()\` from the App Store. They use the public SDK only (App, AppBuilder, AppContext, AppProps) and are constrained to that API.

### The SDK (@mockintosh/sdk)
Third-party app developers use the npm package \`@mockintosh/sdk\` (in this repo at \`packages/sdk/\`). It exports:
- **App** interface: id, title, icon, defaultSize, render(app, ctx, props), optional onEvent, getMenubar, getContentHeight, getContentWidth, getInfoBar.
- **AppBuilder:** React-like hooks — useState, useEffect, useMemo, useRef. Plus scheduleRender(). Hook order must be stable across renders.
- **AppContext:** Scoped drawing surface (clipped to window content). Methods: clear, setPixel, getPixel, drawHLine, drawVLine, drawRect, fillRect, fillPattern, invertRect, blit, blitInverted, blitShadowOutline, blitImageData, drawText, drawTextBlock, getWindow (for NewControl + DrawControls), drawTextInput, scrollArea, pushClip/popClip, hitRegion.
- **AppProps:** Typed OS services — getSprite(id), storage (read/write/list), os (openWindow, closeWindow, showDialog). Optional gated: fetch, openPopup, onPopupMessage (network); loadScript, getGlobal (script). env.origin.
- **Sprites:** defineSprite(w, h, base64), fromGrid(w, h, rows). Apps export a \`sprites\` record; naming uses app id prefix (e.g. "myapp/icon"). OS sprites: "icon/", "cursor/", "ui/".
- **Constants/types:** BLACK, WHITE, basic palette constants like RED/GREEN/BLUE, OSEvent, WindowSize, MenubarDefinition, TextInputState, PatternName, FontName, AppManifest. Built-in fonts: "body", "menu", "mono" (plus registered custom Decker font resources by name). Patterns: "black", "white", "checkers", "stripes", "gray25", "gray50", "gray75", "darkCheckers".

### Developing a third-party app
1. Create an app that exports \`default\` (App) and optionally \`sprites\`.
2. Use \`render(app, ctx, props)\` to draw; use \`app.useState\`, \`app.useEffect\` etc. for state. Coordinates in ctx are local to the window content; (0,0) is top-left of content.
3. Add a \`mockintosh.json\` manifest: id, title, description, icon, author, version, sdk (e.g. "^1.0.0"), permissions (["network"], ["script"], or []), entry (e.g. "./dist/index.js").
4. Build as ESM with Vite, externalize \`@mockintosh/sdk\`. The OS loads the app via \`import(entry)\`.
5. For scrollable content: either set \`scrollable: true\` and implement \`getContentHeight\` (full-window scroll), or use \`ctx.scrollArea(id, rect, { contentHeight, scrollOffset, onScroll }, drawCallback)\` for a scrollable region inside the window.
6. Permissions: "network" enables props.fetch, props.openPopup, props.onPopupMessage; "script" enables props.loadScript, props.getGlobal. No DOM, no direct fetch without permission, no localStorage (use props.storage).

### Where to learn more
- Architecture and internals: ARCHITECTURE.md in the repo.
- App development guide: packages/sdk/docs/APP_DEV_GUIDE.md.
- Example apps and template: packages/sdk/examples/, templates/app/.
`;
