# Decker port (Mockintosh vs upstream)

This document compares Mockintosh's Decker integration to the standalone **Decker** host (`reference/Decker/js/decker.js` + `reference/Decker/js/lil.js`). It exists to prioritize fixes and record intentional gaps.

## Ground truth

| Piece | Location |
|--------|----------|
| Lil VM + deck format | `reference/Decker/js/lil.js` |
| Full UI host (draw, input, modals, audio, listener) | `reference/Decker/js/decker.js` |
| Example decks | `reference/Decker/examples/decks/*.deck` |

## Layering (see `ARCHITECTURE.md`)

- **`lib/decker/core.ts`** — Loads Lil, injects **host stubs** (`go_notify`, `n_alert`, `n_show`, `field_notify`, …), exposes `readDeck`, `tick`, `fireEventAsync`, `getCardIndex`, etc. This should stay **VM + deck I/O**, not BitCanvas concerns.
- **`apps/Decker.ts`** — Mockintosh app: **rasterizes** cards/widgets to `WindowContext`, routes input, menubar, transitions. This is the right place for **pixel mapping**, widget layout, and OS hooks (`_os`, `_fs`).

Keeping that split avoids leaking canvas details into the runtime and keeps a path to share `lib/decker` with other hosts later.

## What already matches (roughly)

- Deck parse/exec: `deck_read`, scripts, `go[]`, `fire_event_async`, `tick` / `sleep[]` (with host `tick` tuned to pop nested state after scripts).
- Basic widget hit-testing and **Interact** vs **Widgets** mode behavior.
- Minimal **alert[] / read[] / write[]** wiring via `setHostPrimitives`.

## Prioritized gaps

### 1. Indexed pixels → display (highest impact on "blank" or wrong cards)

Upstream draws deck images with index semantics wired through **`draw_pattern`**, **`draw_scaled`**, **`draw_fat`**, palette picking (`pick_palette`), etc. See e.g. `pal_pat` / `draw_pattern` in `lil.js`.

Mockintosh converts `image.pix` bytes to RGBA in `apps/Decker.ts` (`colorForPixel`, `imageToImageData`). Values that are not handled explicitly tend to fall through to a **single background color**, so **large regions can look empty** even when Lil state and hit-testing are correct.

**Next step:** Align mapping with upstream rules per index range (0–1, patterns 2–31 with `pal_pat`, direct palette indices, and any paths used by `draw_scaled` / dithering). Treat this as a **small dedicated module** (e.g. `lib/decker/pixelFormat.ts` or a section of `Decker.ts`) with tests or golden samples from `tour.deck`.

### 2. Widget rendering vs `draw_con` / `widget_*`

Upstream **`draw_con`** pastes the card image, then dispatches **`widget_button`**, **`widget_field`**, **`widget_canvas`**, **`widget_grid`**, **`widget_slider`**, **`widget_contraption`** (`decker.js`).

The port uses simplified **drawButton / drawField / drawSlider / drawGrid / drawCanvas** and a minimal contraption path. Missing or partial vs upstream:

- **Fields:** rich / plain / code, `layout_richtext`-style content (port mostly draws string `value`).
- **Buttons:** full style matrix (check, menu, invisible, …).
- **Canvas:** upstream has a full drawing stack; port mostly **blits** the canvas `image` when present.
- **Contraptions:** upstream `widget_contraption`; port nests widgets + optional image blit — **approximation only**.

### 3. `go_notify` / transitions / message queue

Reference **`go_notify`** handles URLs, **`modal_enter('trans')`**, **`draw_con`** snapshots for from/to cards, **`msg.pending_loop`**, **`msg.next_view`**, and clears UI state (`decker.js`).

The port uses **React state** for a **simplified directional wipe** and **`useEffect`** to fire **`view`** when the card index changes.

**Decision (Option A — permanent subset):** Full snapshot-based transitions require capturing the framebuffer before navigation and feeding it to a custom Lil transition function — out of scope for this port. Instead, named transition types (`WipeRight`, `WipeLeft`, `SlideRight`, `SlideDown`, etc.) are approximated by revealing the destination card from the appropriate direction. Custom deck-defined transition scripts (via `deck.transit`) are not supported.

### 4. Host stubs (`lib/decker/core.ts`)

| Primitive | Upstream role | Port |
|-----------|----------------|------|
| `n_show` / `n_print` | Listener / printed output UI | Forwarded to `hostCallbacks.show`/`print`; logs to console by default |
| `field_notify` | Sync in-field editor | Empty stub |
| `n_play` | Audio | Forwarded to `hostCallbacks.play`; no-op by default |

### 5. Fonts embedded in decks

Built-in registry covers **body / menu / mono**; decks often embed **custom fonts** (e.g. `deckbuilder`). Until those are registered from `deck.fonts`, titles and metrics may fall back and layout can look wrong.

### 6. Event ordering parity

Standalone Decker couples input to **`interpret()`** and **`msg.*`**. The port uses **mousedown → `fireEventAsync` → `tick()`** and a **RAF** loop; behavior is close for many decks but not identical for pathological scripts — note when debugging timing-sensitive decks.

## Suggested implementation order

1. **Pixel / pattern / palette mapping** ✅ Done — `lib/decker/pixelFormat.ts` with 25 regression tests.
2. **Field** rendering (plain vs rich vs code; value types). ✅ Done — background fill, invert mode.
3. **Canvas** (minimum needed for target example decks — often blit + limited drawing). ✅ Approximation in place.
4. **Transitions** ✅ Done — Option A: named directional wipes (WipeRight, WipeLeft, SlideRight, SlideDown, etc.).
5. **Listener / print / sound** ✅ Done — `n_show`/`n_print` forward to hostCallbacks; default implementations log to console.
6. **Load and register deck fonts** from the deck. ✅ Done — `registerEmbeddedFonts` called after `readDeck`.

## Example-deck checklist (tour.deck)

| Feature | Status |
|---------|--------|
| Card navigation via buttons | ✅ Working |
| Background image rendering | ✅ Fixed (pixelFormat module) |
| Rect-style buttons with shadow | ✅ Fixed |
| Invisible buttons (hotspots) | ✅ Fixed (no longer return early) |
| Field background fill | ✅ Fixed |
| Custom deck font (deckbuilder) | ✅ Registered from deck.fonts |
| SlideRight / SlideDown transitions | ✅ Directional wipe approximation |
| Check/radio buttons | ✅ Improved rendering |
| Grid column widths | ✅ Respects widths[] array |
| Rich-text fields | ⚠️ Plain text only; rich-text runs not laid out |
| Custom Lil transition scripts | ❌ Not supported (Option A) |
| Audio (n_play) | ❌ Stub; forwarded to hostCallbacks.play |
| Draw mode tools | ❌ Not ported |

## Remaining known gaps

- **Rich-text fields**: `widget_field` upstream runs `layout_richtext` which handles bold, links, and inline images. The port renders the raw string value only.
- **Slider styles**: The port shows a generic track+knob. Upstream `bar`, `compact`, `horiz`, `vert` styles differ significantly.
- **ImageData caching**: Added — images cached by `(object identity, frameSlot, screenOffset, palette)`. Full blitImageData conversion still runs per frame.

## References in repo

- Runtime factory + stubs: `lib/decker/core.ts`
- UI + rasterization: `apps/Decker.ts`
- Pixel format logic + tests: `lib/decker/pixelFormat.ts`, `lib/decker/pixelFormat.test.ts`
- Fonts: `lib/fonts/DeckerFontRegistry.ts`, `lib/fonts/DeckerBuiltins.ts`
