# Mockintosh DevTools — Chrome Extension Design

This document outlines what’s possible for a dedicated **Mockintosh DevTools** Chrome extension: performance stats, render metrics, and optional debugging features, given the single-canvas rendering model.

---

## 1. What’s possible

### 1.1 Communication model

- The app runs in the **page context**; the extension runs in **content script** (same page, isolated world) and **DevTools panel** (separate UI).
- To get data from the app into the extension we need a **bridge**:
  - **Option A (recommended):** The app exposes a small API and pushes stats via `window.postMessage(..., '*')`. The extension’s content script listens for `message` events, filters by type (e.g. `MOCKINTOSH_DEVTOOLS_STATS`), and forwards to the DevTools panel via `chrome.runtime.sendMessage`. No injection of code into the page by the extension beyond the content script.
  - **Option B:** The extension injects a script that runs in the page and sets a global (e.g. `window.__MOCKINTOSH_DEVTOOLS__`) that the app is expected to call or update. That requires the app to know about the global (or the injected script to patch the app’s render loop), which is more brittle.
- **Detection:** The extension should only activate on pages that are “Mockintosh” (e.g. your dev URL and production domain). The app can set a sentinel (e.g. `document.documentElement.dataset.mockintosh = 'true'` or a `window.__MOCKINTOSH__` flag) when it boots so the content script can detect it; or the extension can match by URL (e.g. `*://localhost/*`, `*://*.vercel.app/*`).

### 1.2 Data the app can expose (without heavy instrumentation)

All of this can be implemented inside the existing render loop in `main.tsx` and one small bridge module.

| Data                       | Source                                                                 | Notes                                        |
| -------------------------- | ---------------------------------------------------------------------- | -------------------------------------------- |
| **Frame time (ms)**        | `performance.now()` around the full `render()` body                    | Per-frame CPU time for the entire frame.     |
| **FPS**                    | Rolling window of frame timestamps (e.g. last 1 s)                     | Derived in the bridge or in the extension.   |
| **Flush time (ms)**        | `performance.now()` around `bitCanvas.flush(ctx2d)`                    | Time for 1bpp → RGBA + `putImageData`.       |
| **Window count**           | `windowManager.windows.length`                                         | Snapshot each frame.                         |
| **Window list (snapshot)** | `windowManager.windows` mapped to `{ id, appId, width, height, x, y }` | Read-only; useful for a “Windows” panel.     |
| **Hit region count**       | `hitRegions` — add a getter like `.count()` or track `add()` calls     | Approximate “interactive regions” per frame. |
| **Render trigger count**   | Count calls to `scheduleRender()` per second                           | Throttled or sampled to avoid noise.         |
| **Splash / boot state**    | `showingSplashscreen`, boot time if you store it                       | Optional for a simple “OS state” line.       |

### 1.3 Optional (slightly more invasive)

| Data                            | Where                             | Notes                                                                                                                                                              |
| ------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Per-phase timings**           | `main.tsx` `render()`             | e.g. “clear”, “windows”, “menubar”, “cursor”, “flush” — each wrapped in `performance.now()`.                                                                       |
| **Draw call counts**            | QuickDraw / `qdDraw`              | Would require a thin wrapper or global counter in the bottleneck (e.g. count `PaintRect`, `FrameRect`, `CopyBits`). Only worth it if you need “draw call” metrics. |
| **Active app / focused window** | `windowManager.getActiveWindow()` | For a “Focus” line in the panel.                                                                                                                                   |

### 1.4 What the extension UI can show

- **Performance panel:** FPS (number + optional tiny graph), frame time (ms), flush time (ms), window count, hit region count.
- **Windows panel:** List of windows (id, appId, size, position) — read-only snapshot, updated every N frames or on demand.
- **Renders:** “Renders in last second” or “Schedule count” if you expose render/schedule stats.
- **Optional:** A “Capture canvas” button that asks the app (via message) to run `bitCanvas.captureRegion(0,0,w,h)` and post back a data URL for the extension to show or save.

---

## 2. Recommended architecture

### 2.1 In-repo: app-side bridge (dev-only or flag-gated)

- **New file:** e.g. `src/platform/web/DevToolsBridge.ts`.
- **Responsibility:**
  - Expose a single function: `attachDevToolsBridge(callback: (stats: DevToolsFrameStats) => void)`.
  - Define a small `DevToolsFrameStats` type (frameTimeMs, flushTimeMs, windowCount, windows, hitRegionCount, fps?, etc.).
- **Integration in `main.tsx`:**
  - At the start of `render()`, `t0 = performance.now()`.
  - Before `bitCanvas.flush(ctx2d)`, `tFlushStart = performance.now()`; after, `flushTimeMs = performance.now() - tFlushStart`.
  - At the end of `render()`, `frameTimeMs = performance.now() - t0`; build a snapshot of window list and hit region count; call the bridge callback with the stats object (if attached).
  - The bridge, when called, throttles (e.g. max 10 updates per second) and does `window.postMessage({ type: 'MOCKINTOSH_DEVTOOLS_STATS', payload: stats }, '*')`.
  - **Activation:** Only run the bridge when e.g. `import.meta.env.DEV` or a query param like `?mockintosh-devtools` or when `document.documentElement.hasAttribute('data-mockintosh-devtools')` (so the extension can set that attribute if we add a “Enable DevTools” handshake). Prefer a query param or env so the extension doesn’t have to inject state before the app boots.

### 2.2 Extension repo or folder

- **Structure (e.g. `extensions/mockintosh-devtools/`):**
  - `manifest.json` (Manifest V3): permissions for `activeTab` or host patterns; optional `devtools_page` that opens a panel.
  - **DevTools page:** HTML/JS that creates a “Mockintosh” panel. When the panel loads, it can send a message to the background to ask for the latest stats; the background gets them from the content script.
  - **Content script:** Injected on URLs that match Mockintosh (e.g. your app’s origin). Listens for `window.addEventListener('message', ...)`, and when `event.data?.type === 'MOCKINTOSH_DEVTOOLS_STATS'`, sends `chrome.runtime.sendMessage({ source: 'mockintosh-devtools', stats: event.data.payload })`.
  - **Background service worker:** Forwards messages between content script and DevTools page (DevTools page can’t talk to content script directly; it goes via background).
- **Panel UI:** Simple layout: Performance (FPS, frame time, flush time, window count, hit regions), Windows (table from `windows` snapshot). No framework required; vanilla JS + small CSS is enough.

### 2.3 Detection and activation

- **Option 1 (simplest):** Extension matches by URL (e.g. `https://your-mockintosh-app.vercel.app/*` and `http://localhost:*/*`). Content script always runs; if no `MOCKINTOSH_DEVTOOLS_STATS` messages arrive, the panel shows “No Mockintosh page detected” or “Open a Mockintosh app in this tab”.
- **Option 2:** App sets a sentinel on load (e.g. `document.documentElement.dataset.mockintosh = 'true'`). Content script checks for it and only then starts listening for stats (or requests a snapshot). Ensures we don’t show “Mockintosh” for random pages that never send stats.

---

## 3. Summary

| Question                                             | Answer                                                                                                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Is it possible?**                                  | Yes. A Chrome extension can show performance stats, render metrics, and window list by having the app push a small stats object via `postMessage` and the extension displaying it in a DevTools panel. |
| **What’s needed in the app?**                        | A small, optional bridge that measures frame time and flush time, and snapshots windows + hit region count, then posts one message per frame (throttled) when enabled.                                 |
| **What’s needed in the extension?**                  | Content script (message listener), background (relay), DevTools page + panel UI.                                                                                                                       |
| **Heavier instrumentation (per-phase, draw calls)?** | Possible with a bit more code in the app (timers per phase; optional counters in QuickDraw); not required for a first version.                                                                         |

If you want to proceed, the next concrete steps are: (1) add `DevToolsBridge.ts` and integrate the timing + snapshot in `main.tsx` behind a dev/query flag, and (2) add a minimal Chrome extension in `extensions/mockintosh-devtools/` with manifest, content script, background, and a simple DevTools panel that displays FPS, frame time, flush time, and window count.
