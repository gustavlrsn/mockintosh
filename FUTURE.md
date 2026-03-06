# Future Enhancements

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

## Font System Overhaul

The current font rendering path triggers `willReadFrequently` warnings from Chrome — `buildGlyphCache` in `fontAdapter.ts` makes repeated `getImageData` calls on a canvas that wasn't created with the `willReadFrequently` hint. The immediate fix is to pass `{ willReadFrequently: true }` when creating that offscreen canvas, but this is a good opportunity to review the font subsystem more broadly:

- **Performance:** Profile glyph cache construction. Are we rebuilding caches that could be reused across frames or app reloads? Could we pre-build the cache at startup and store it in an `ImageBitmap` or similar?
- **Custom fonts:** Allow users (and third-party apps) to supply their own bitmap fonts. This means defining a font format — likely a PNG sprite sheet plus a JSON descriptor mapping codepoints to glyph rects — and a registration API on `AppContext` or `OSServices`.
- **Multi-size support:** Currently fonts are a single pixel size. Consider whether the system should support multiple sizes per typeface, or rely on nearest-neighbor scaling from a base size.
