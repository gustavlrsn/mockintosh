# Future Migrations

Items not fully migrated during the current plan but that could be addressed for greater faithfulness to the original Macintosh architecture.

---

## Sprite type → QuickDraw BitMap

The `Sprite` interface (`data` + `mask` as 1-byte-per-pixel arrays) is a Mockintosh invention. The Mac equivalent is a `BitMap` (packed 1-bit-per-pixel rows) plus a mask `BitMap`. Converting sprites to native BitMaps would allow `CopyBits` to handle all blitting, eliminating `SpriteManager.ts` entirely.

**Files:** `lib/canvas/BitCanvas.ts` (Sprite interface), `lib/canvas/SpriteManager.ts`, all sprite definitions in `lib/canvas/sprites/`

---

## fontAdapter.ts → FONT resources + native DrawString

Currently fonts are loaded as bitmap textures via PixelFontCanvas and rendered by blitting glyphs into a raw pixel buffer. The Mac stored fonts as FONT/NFNT resources and rendered via `DrawString`/`DrawText` through the bottleneck. A faithful version would store font resources in ResourceManager and have QuickDraw's text routines render them natively. The `__injectFontFunctions` bridge in `main.tsx` is already halfway there.

**Files:** `lib/canvas/fontAdapter.ts`, `src/main.tsx` (font injection), `lib/toolbox/FontManager.ts`

---

## patterns.ts → QuickDraw Pattern constants

Patterns are stored as 64-byte flat arrays (1 byte per pixel). `patternBridge.ts` converts them to QuickDraw's 8-byte packed format on every use. A faithful version would define patterns only in QuickDraw's packed 8-byte format, eliminating `patternBridge.ts` entirely.

**Files:** `lib/canvas/patterns.ts`, `lib/canvas/patternBridge.ts`

---

## HitRegion → Control Manager controls

The original Mac tracked clickable UI elements (buttons, scrollbars, popup menus) as Controls in the Control Manager, not as ad-hoc rectangles. A more faithful version would register Controls with the ControlManager (which tracks their rects, hilite states, and action procs), and `FindControl`/`TrackControl` would replace the HitRegion hit-testing. This would collapse HitRegion, the scrollbar drawing in WindowContext, and the button hit-region logic into the ControlManager's native tracking.

**Files:** `lib/canvas/HitRegion.ts`, `lib/toolbox/WindowContext.ts` (scrollArea), `lib/toolbox/ControlManager.ts`

---

## TextEdit BitCanvas shim → native GrafPort text rendering

TextEdit and fontAdapter currently create a fake BitCanvas from a GrafPort's pixel buffer to draw text fields. A faithful version would use QuickDraw's `DrawString`/`TEUpdate` directly on the GrafPort, with `SetPort`/`ClipRect` for clipping. This would allow deleting the remaining `drawRect`/`fillRect`/`drawVLine` methods from BitCanvas.

**Files:** `lib/toolbox/TextEdit.ts`, `lib/canvas/ui/TextInput.ts`, `lib/canvas/fontAdapter.ts`, `lib/canvas/BitCanvas.ts` (legacy drawing methods)

---

## qdDraw.ts elimination

The convenience wrappers in `qdDraw.ts` exist because app code uses `(x, y, w, h, color)` style coordinates. If apps adopt QuickDraw's native Rect-based API directly (`FrameRect(makeRect(...))`, `PaintRect(...)`, `PenPat(...)`, etc.), `qdDraw.ts` becomes unnecessary. This is a stylistic migration, not a functional one.

**Files:** `lib/canvas/qdDraw.ts`, all consumers in `lib/toolbox/` and `apps/`

---

## SpriteManager.ts → CopyBits

All sprite blitting (including inverted, shadow-outline, outline variants) is done by hand-written pixel loops in `SpriteManager.ts`. If sprites were stored as QuickDraw BitMaps, `CopyBits` with transfer modes (`srcCopy`, `srcXor`, `notSrcCopy`, etc.) would handle all variants, which is how the original Mac did it.

**Files:** `lib/canvas/SpriteManager.ts`

---

## ZoomAnimation → Window Manager built-in zoom

The original Mac Window Manager had zoom animation built into `ShowWindow`/`ZoomWindow` via `DragGrayRgn`. Currently it's a separate module. It could be folded into `WindowManager.ts`.

**Files:** `lib/canvas/ZoomAnimation.ts`, `lib/toolbox/WindowManager.ts`

---

## dither.ts → image processing pipeline producing QuickDraw BitMap

Atkinson dithering is the original Mac algorithm but the current implementation operates on RGBA ImageData and writes to the 1-byte-per-pixel buffer. A more faithful pipeline would produce a QuickDraw BitMap directly.

**Files:** `lib/canvas/dither.ts`

---

## AppBuilder hooks → Desk Accessory / application event loop

The current React-like hooks system (`useState`, `useMemo`, `useEffect`) for app state management is a modern invention. The original Mac used a cooperative event loop where each application had a main event loop calling `GetNextEvent`/`WaitNextEvent`. This is a fundamental architectural choice and the current approach is arguably better for DX, but it's worth noting as a faithfulness gap.

**Files:** `lib/canvas/AppBuilder.ts`, `lib/canvas/AppRegistry.ts`

---

## OSServices → Gestalt / OS Utilities

Camera, audio, and storage are currently ad-hoc properties on `OSServices`. The original Mac used Gestalt for hardware capability queries and the Sound Manager for audio. These could be split into dedicated managers.

**Files:** `lib/canvas/OSServices.ts`

---

## ui/TextBlock.ts and ui/TextInput.ts

These legacy drawing modules still operate on BitCanvas directly. Once font rendering uses native QuickDraw `DrawString`, these can be rewritten to use GrafPort-only drawing and deleted from `lib/canvas/ui/`.

**Files:** `lib/canvas/ui/TextInput.ts`, `lib/canvas/ui/TextBlock.ts`
