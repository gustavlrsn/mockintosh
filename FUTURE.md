# Future Enhancements

## Running apps without windows

Full screen (the Macintosh "special presentation mode") and `onOpen` are in: an app decides what opening it does, and may open no window. What is *not* modelled yet is an app that keeps running with no window — on the Macintosh an application whose last window closed stays frontmost with its menubar until File → Quit. Here the active app is still derived from the active window, so a windowless launch has no menubar of its own and nothing to quit. The [kernel plan](docs/kernel-plan.md) introduces app-instance ownership in M2 and process accounting in M3 / shell stage S3; `onOpen` is the existing entry-point seam. Keeping a windowless GUI app frontmost until Quit still needs an explicit active-app and lifetime policy.

## Revealing the menubar in full screen (hover at the top edge)

**Status: potential todo — undecided whether this belongs in the OS.** Today a full-screen app is responsible for the way back, as the Macintosh HIG required: ⌘ shortcuts keep working with the menubar hidden, and Photo Booth adds an on-screen "Menu Bar" button. The idea is to make the way back an OS gesture instead: move the pointer to the top edge, pause, and the menubar slides down over the full-screen content (Mac OS X Lion introduced this for full-screen apps; Yosemite made it a general auto-hide preference).

**How classic Mac apps handled it**, for reference: there was no system gesture. HyperCard hid the bar with `hide menubar` and brought it back with ⌘-Space; slide-show tools (More, Persuasion) left the show on Escape / ⌘-period; kiosk stacks put a "Menu Bar" button on screen, which is what the HIG literally suggests; games (Dark Castle, Shufflepuck Café) zeroed `MBarHeight`, drew everywhere, and you left by quitting.

**Why it might belong in the OS:** "the user must always be able to get back" is a system concern, and every full-screen app reinventing a "Menu Bar" button is per-app duplication. **Why it might not:** it is a modern gesture the original never had; the classic Mac had no hidden-bar reveal and no animation beyond the Finder's zoom rects; on hosts without hover (e-paper, touch) it needs a second trigger anyway; and an app-level affordance is at least *visible*, which a hover gesture is not.

**Sketch, if we do it:**

- `state.ts`: the menubar's hidden state becomes three-valued — `shown | hidden | revealing(px)` — replacing the boolean `isMenubarHidden()`; a `reveal` signal (0…20) drives the bar's `top = -MENUBAR_HEIGHT + reveal`.
- `boot.ts` `onPointer`: OS policy next to double-click detection — pointer on row 0 for ~250 ms (dwell, so grazing the edge does not flicker) sets the target to shown; pointer below the bar's rows with no menu open sets it back to hidden. A `down` on the top two rows reveals too, for hosts without hover, and is consumed rather than delivered to the app.
- Frame loop: step `reveal` 1 px per frame toward its target (20 frames ≈ 330 ms at 60 Hz) and `scheduleRepaint` only while it is moving; same speed back up.
- Stay revealed while a dropdown is open. Hit-testing is the node tree, so a half-revealed bar is already clickable and dropdowns hang from its current position (`MenuDropdown` is a child of the Menubar box) — worth a test.
- ⌘ shortcuts fire without revealing, as now, and remain the guaranteed path documented in the SDK.
- Headless test: open a full-screen window, move the pointer to row 0, tick 20 frames, assert the menubar rows are painted; move away, tick, assert they are gone.
- Photo Booth then drops its "Menu Bar" button (or keeps it as a discoverable hint — decide then).

## Window definition details

`windowKinds.ts` is the WDEF table. `dBoxProc` alerts use a square 1px / 2px-white / 2px picture frame. Not yet distinguished: `documentProc` vs `zoomDocProc` (every document has a zoom box), `altDBoxProc` (plain box with a heavier shadow), and the "small title" of a `utility` window, which today draws the standard title bar.

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
