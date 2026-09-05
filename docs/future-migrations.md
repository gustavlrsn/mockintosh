# Future Migrations

Items not fully migrated during the current plan but that could be addressed for greater faithfulness to the original Macintosh architecture.

---

## Done: Control Manager uses QuickDraw directly for buttons

Button drawing now calls QuickDraw directly from Control Manager (SetPort, FrameRoundRect, PaintRoundRect, InvertRoundRect, MoveTo, DrawString, PenSize, PenPat). Press feedback uses InvertRoundRect on mouse down and again on mouse up. See `.cursor/plans/original_mac_button_drawing.plan.md`. **Do not change packages/quickdraw** unless a discrepancy with reference/QuickDraw is found; treat visual/placement issues as GrafPort or coordinate fixes first.

---

## Deferred: visRgn occlusion (CalcVis)

The original Mac Window Manager maintained **visRgn** per window so that drawing was clipped to the visible content minus windows in front. We currently use the painter's algorithm and repaint every frame, so occlusion is implicit. A more faithful version would compute visRgn (e.g. CalcVis) and set it on each window's port so that QuickDraw only draws into truly visible pixels.

---

## Deferred: SetOrigin for scrolling

The original Mac used **SetOrigin(dh, dv)** to shift the local coordinate plane for scrolling; the app then draws relative to the scrolled document's top-left as (0,0). We currently emulate scrolling via **tx()** / **ty()** offset math in WindowContext. Migrating to SetOrigin would let apps use native QuickDraw coordinates and remove the need for scroll offset in the context transform.

---

## Deferred: Dirty-region / updateRgn rendering

The original Mac only redrew **dirty** areas (updateRgn per window). We currently redraw the full screen each frame. Implementing updateRgn and **BeginUpdate** / **EndUpdate** would allow partial redraws and **putImageData** with a dirty rect for better performance when most of the screen is static.

---

## WindowRecord

**Done:** We now use `WindowRecord` (replacing `WindowState`) as the window type; each record holds window state plus optional `port` and `framePort` GrafPorts, ensured on demand via `ensureWindowPort(record, screenPort)`. `BeginUpdate(theWindow)` uses `theWindow.port` (must be ensured before calling). This aligns with the original Mac where the window record started with a GrafPort (WindowPtr = GrafPtr).

## Sprite type → QuickDraw BitMap

The `Sprite` interface (`data` + `mask` as 1-byte-per-pixel arrays) is a Mockintosh invention. The Mac equivalent is a `BitMap` (packed 1-bit-per-pixel rows) plus a mask `BitMap`. Converting sprites to native BitMaps would allow `CopyBits` to handle all blitting, eliminating `SpriteManager.ts` entirely.

**Files:** `lib/canvas/BitCanvas.ts` (Sprite interface), `lib/canvas/SpriteManager.ts`, all sprite definitions in `lib/canvas/sprites/`

---

## fontAdapter.ts → Decker FONT resources + native DrawString (text path done)

**Done:** All in-repo text drawing goes through QuickDraw. WindowContext.drawText and drawTextBlock, WindowManager (window titles, info bar), Finder (measurement via FMTextWidth), TextEdit, and MenuManager use SetPort + MoveTo + DrawString; the bridge delegates to `drawBitmapTextToPixels` for glyph blitting. FontManager owns the injection and uses port.txFont (and optional txColor). Font data now comes from Decker-style `FNT0` / `FNT1` records seeded from the Decker reference built-ins (`body`, `menu`, `mono`). There are no remaining `drawBitmapText` callers in the repo; it is deprecated and kept only for external/legacy BitCanvas paths.

**Remaining:** BitCanvas pushClip/popClip and getBitCanvas() remain for scroll area and SDK until a separate clip migration.

**Files:** `lib/canvas/fontAdapter.ts`, `src/main.tsx` (font injection), `lib/toolbox/FontManager.ts`

---

## patterns.ts → QuickDraw Pattern constants

Patterns are stored as 64-byte flat arrays (1 byte per pixel). `patternBridge.ts` converts them to QuickDraw's 8-byte packed format on every use. A faithful version would define patterns only in QuickDraw's packed 8-byte format, eliminating `patternBridge.ts` entirely.

**Files:** `lib/canvas/patterns.ts`, `lib/canvas/patternBridge.ts`

---

## Original Mac split: TextEdit vs Control Manager

On the original Mac, **editable text** was handled by the **TextEdit** manager (TEHandle, TEKey, TEClick, TEUpdate), not by the Control Manager. The Control Manager was for buttons, scroll bars, checkboxes, and similar controls; in dialogs, the DITL had separate item types for Controls vs Editable Text. Our design follows this: text inputs use the TextEdit path (`drawTextInput` → `drawTextEditField`, state/handlers in ui/TextInput) and are **not** intended to become Control Manager controls. The TextEdit path owns hit-region registration for the field when the app passes `options.id` to `drawTextInput`, so **apps do not need to call hitRegion separately** for text inputs; this matches the original Mac where the Dialog Manager did hit testing for dialog items.

---

## HitRegion → Control Manager controls

The original Mac tracked clickable UI elements (buttons, scrollbars, popup menus) as Controls in the Control Manager, not as ad-hoc rectangles. The migration below applies to **buttons, scroll bars, and other Control Manager-style controls**; **editable text fields** remain on the TextEdit path and are out of scope for this migration. A more faithful version would register Controls with the ControlManager (which tracks their rects, hilite states, and action procs), and `FindControl`/`TrackControl` would replace the HitRegion hit-testing. This would collapse HitRegion, the scrollbar drawing in WindowContext, and the button hit-region logic into the ControlManager's native tracking.

**Done — scroll bars:** Scroll bars are now fully in Control Manager. WindowManager calls `CreateOrUpdateScrollBarControls` and `DrawScrollBarControls`; FindControlInWindow does five-part hit-test for procID 4; TrackControl (including thumb with onTrackMove) and GetControlValue drive scroll state. See [control-manager-migration.md](control-manager-migration.md) Phase 7.

**Concrete migration plan (legacy drawButton → NewControl + DrawControls):** See [control-manager-migration.md](control-manager-migration.md).

**Files:** `lib/canvas/HitRegion.ts`, `lib/toolbox/WindowContext.ts` (scrollArea), `lib/toolbox/ControlManager.ts`

---

## TextEdit BitCanvas shim → native GrafPort text rendering (done)

**Done:** TextEdit uses SetPort, ClipRect (with GetClip/SetClip save/restore), MoveTo, and DrawString for both `drawTextEditField` and `drawTextBlockToPort`. The BitCanvas-based `drawTextInput(canvas, ...)` has been removed from lib/canvas/ui/TextInput.ts; that file now only exports state and event handlers (createTextInputState, handleTextInputKey, etc.). All text field drawing goes through WindowContext.drawTextInput → drawTextEditField(port, ...). BitCanvas pushClip/popClip and getBitCanvas() remain for scroll area and SDK until a separate clip migration.

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

**Done:** TextInput’s BitCanvas drawing path has been removed. ui/TextInput.ts now only provides state and event handlers; text field rendering is GrafPort-based via TextEdit.drawTextEditField. ui/TextBlock.ts remains layout/measurement-only (getWrappedLines, measureTextBlock) with no drawing; it is used by WindowContext.drawTextBlock and TextEdit.drawTextBlockToPort.

**Files:** `lib/canvas/ui/TextInput.ts`, `lib/canvas/ui/TextBlock.ts`
