# Future Enhancements

## Special presentation mode

The Macintosh supports a **special presentation mode** for screen-sized presentations: the application can use the **entire screen**, including the area normally used by the menu bar. The menu bar is hidden so content (e.g. slides, demos) fills the full display. This is distinct from the zoom box’s standard state, which only fills the gray region (desktop minus menu bar) with a border.

**Human Interface Guidelines:**

- **User option** — The mode must be optional; the user chooses to enter it, not forced.
- **Restore menu bar** — The application must provide a visible way to bring the menu bar back: e.g. a keyboard shortcut (Command-key) or an on-screen button labeled “Menu Bar” that the user can click. The method must be clearly visible or easily accessible while the bar is hidden.
- **Application responsibility** — The app is responsible for the logic of hiding the bar, drawing full-screen content, and letting the user exit; the system (Window Manager) provides the capacity for full-screen drawing (its port covers the whole screen).

**Implementation sketch for Mockintosh:**

- **OS support:** (1) API or flag for an app to request “presentation mode” (e.g. `enterPresentationMode()` / `exitPresentationMode()`). (2) When active: hide the menu bar in the render loop and allow the requesting app to draw over the full canvas (0,0 to screen width/height). (3) Reserve a global shortcut (e.g. Escape or ⌘+something) or require the app to call `exitPresentationMode()` from its own UI (e.g. “Menu Bar” button). (4) Only one app can be in presentation mode at a time; exiting restores the menu bar and normal window layout.
- **App support:** The app enters the mode when the user chooses (e.g. “Present” or “Full screen”), draws its content full-screen, and provides a visible “Menu Bar” button or documents the shortcut so the user can exit.
- **Rendering:** In the main render loop, if presentation mode is active for app X, skip drawing the menu bar (and possibly the desktop/windows of other apps, or draw them underneath and let the presenting app cover them). The presenting app’s render receives the full canvas or a full-screen AppContext.

Not part of the current Window Manager refactor; add when we have a need (e.g. a slides or video app that wants true full-screen).

## Paid Apps via Polar.sh

Developers should be able to sell their apps in the App Store — either free or paid (one-time purchase or subscription). Payment processing would be handled by [Polar.sh](https://polar.sh), which acts as merchant of record and handles checkout, licensing, payouts, tax, and refunds.

### Payment Flow

```
User clicks "Buy $2.00" in App Store
  → App Store calls POST /api/checkout { polar_product_id, origin }
  → Edge Function creates Polar checkout session
  → Returns { checkout_url, session_id }
  → App Store opens PolarEmbedCheckout iframe overlay on canvas
  → User completes payment in iframe
  → Embed fires "success" event
  → App Store calls POST /api/verify-purchase { session_id }
  → Edge Function validates with Polar API
  → Returns { license_key, entry_url }
  → App Store loads the app bundle via AppLoader
  → License stored in MockFS under /Mockintosh HD/System/Licenses/
```

The checkout iframe is a real DOM element overlaid on the canvas — necessary because credit card input must live in Polar/Stripe's iframe for PCI compliance, and Apple Pay / Google Pay require real DOM elements.

### Registry Changes

The `registry.json` already supports `pricing` fields:

```json
{
  "pricing": {
    "type": "one-time",
    "amount_cents": 200,
    "currency": "usd",
    "polar_product_id": "prod_xxx"
  }
}
```

Types: `"free"` (public entry URL), `"one-time"` (pay once), `"subscription"` (monthly/yearly with `"interval"`). For paid apps, `"entry"` is `null` in the public registry — the real bundle URL is returned by `/api/verify-purchase` after license validation.

### New Backend Endpoints Needed

- **`/api/checkout`** — Creates a Polar checkout session. Requires `POLAR_ACCESS_TOKEN` env var.
- **`/api/verify-purchase`** — Validates a completed purchase, returns `{ license_key, entry_url }`.

### License Storage

Licenses stored in MockFS as JSON files under `/Mockintosh HD/System/Licenses/`:

```json
{
  "app_id": "cool-app",
  "license_key": "lic_xxxxx",
  "purchased_at": 1709740800000,
  "pricing_type": "one-time"
}
```

On reload, the boot sequence re-validates licenses:

- **One-time purchases:** Call `/api/verify-purchase` to get a fresh `entry_url`.
- **Subscriptions:** Same, but API checks if subscription is still active.

### Dependencies Needed

- `@polar-sh/checkout` — Embedded checkout iframe (OS `package.json`, not SDK)
- `@polar-sh/sdk` — Server-side SDK for Edge Functions
- `POLAR_ACCESS_TOKEN` — Environment variable in Vercel

### No User Accounts Required

The license key is the proof of purchase, stored locally in MockFS. If cleared, users re-enter their key (Polar sends it via email).

### Developer Workflow

1. Create a [Polar.sh](https://polar.sh) account
2. Create a product with desired pricing
3. Add `"pricing"` field to their registry PR
4. Upload app bundle to a non-public location
5. Revenue handled by Polar (~5% platform fee)

## Dev Server Integration

How does an external app developer test against a running Mockintosh instance? Options:

- A Vite plugin that watches `dist/` and hot-reloads
- An OS dev mode that polls a local URL for app bundles

## Version Pinning

Should the OS lock to specific app versions, or always load the latest approved? The registry manifest supports both patterns.

## Permissions UI

Should users see a permissions prompt when installing apps (like mobile), or is the review process sufficient?

## Window open/close animation (explore later)

The original Mac Window Manager does **not** animate windows opening or closing at the system level—it shows or hides them immediately and redraws. The Human Interface Guidelines, however, encourage an _illusion_ of direct manipulation: e.g. a window “retreating into” its document icon when closed, or the Finder-style “zoom” from an icon into a window when opening. Those effects are **application-level** (the Finder draws them), not provided by the Window Manager.

For Mockintosh we could explore, later:

- **App-level effects:** Let applications (e.g. Finder) implement their own open/close transitions—e.g. when opening a document from the desktop, animate a rectangle growing from the icon to the window bounds; when closing, animate the window shrinking back to the icon. The OS would only need to expose hooks (e.g. “window about to open” / “about to close”) and perhaps a way to draw a transition frame (or the app draws to the canvas during the transition).
- **Optional OS-level helper:** A small animation helper (e.g. “draw grow-from-rect over N frames”) that apps or the Finder could call for a consistent “zoom open/close” feel without each app reimplementing it.

No change to the current refactor plan: we keep immediate show/hide to match classic Mac WM behavior. This is a future enhancement for a more polished, HIG-aligned feel.

## refCon on Windows (explore later)

The original Mac Window Record had a **refCon** (reference constant) field: an application-defined value the Window Manager stored but never interpreted. We deferred adding it in the Window Manager refactor because its use wasn’t critical yet; it’s worth exploring later.

**Why it could be useful:**

- **Document–window binding:** When an app opens one window per document (e.g. FileViewer per file), it could set `refCon` to the document id or a handle when creating the window. On activate, update, or close events, the app gets the window back and reads `refCon` to know which document to update or save—without maintaining a separate `windowId → document` map.
- **Dialog context:** A modal or modeless dialog could store a reference to the parent window or the operation it’s for, so when the user clicks OK/Cancel the app knows where to route the result.
- **Palette state:** A utility window could store a handle to its tool state or configuration.

Today we have `windowId`, `appId`, and `props` per window; `refCon` would be a single optional slot (e.g. `refCon?: unknown`) set at open time. The OS would never read or interpret it—only pass it back when the window is referenced. If we later want a cleaner “window ↔ document” story or fewer ad-hoc maps in app code, adding refCon is a small, Mac-aligned option. See the Window Manager refactor plan for the deferred refCon item.

## Font System Overhaul

The current font rendering path triggers `willReadFrequently` warnings from Chrome — `buildGlyphCache` in `fontAdapter.ts` makes repeated `getImageData` calls on a canvas that wasn't created with the `willReadFrequently` hint. The immediate fix is to pass `{ willReadFrequently: true }` when creating that offscreen canvas, but this is a good opportunity to review the font subsystem more broadly:

- **Performance:** Profile glyph cache construction. Are we rebuilding caches that could be reused across frames or app reloads? Could we pre-build the cache at startup and store it in an `ImageBitmap` or similar?
- **Custom fonts:** Allow users (and third-party apps) to supply their own bitmap fonts. This means defining a font format — likely a PNG sprite sheet plus a JSON descriptor mapping codepoints to glyph rects — and a registration API on `AppContext` or `OSServices`.
- **Multi-size support:** Currently fonts are a single pixel size. Consider whether the system should support multiple sizes per typeface, or rely on nearest-neighbor scaling from a base size.
