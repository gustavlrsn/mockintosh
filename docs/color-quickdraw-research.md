# Adding Color QuickDraw without changing the QuickDraw port

Research date: 2026-09-13; updated 2026-09-15 after reading the System 7.1 Color QuickDraw assembly (see [What the System 7.1 source shows](#what-the-system-71-color-quickdraw-source-shows)). Historical findings below distinguish Apple's documented behavior from proposed implementation choices. Apple manuals and Apple-authored technical articles are primary sources; several links point to archival mirrors because the original hosting has disappeared. Where the shipping implementation is cited, the path is given relative to the local `reference/supermario` clone described below.

## Recommendation for Mockintosh

Add a separate `@mockintosh/color-quickdraw` package that depends on the existing `@mockintosh/quickdraw`. Keep the latter's source, `BitMap`, packed storage, and monochrome behavior unchanged. Give the new package its own color port and `PixMap`, explicit target capabilities, and conversion/compositing routines. Delegate monochrome operations to QuickDraw; initially reuse QuickDraw to rasterize coverage masks for colored shapes. Integrate the new package through the UI and platform boundaries.

Choose packed one-bit rendering when the target is monochrome, so those devices do not need a full color framebuffer. Preserve existing black/white ink and pattern choices exactly. New UI colors should carry deliberate monochrome alternatives; images can use an explicit luminance/dithering conversion. This is an architectural recommendation, not an implemented or benchmarked package.

Where the new package must make a fallback decision (RGB to black/white, arithmetic mode on a one-bit target, foreground/background collision, pattern expansion, per-device color resolution), follow the algorithm Apple shipped rather than inventing Mockintosh policy. Those algorithms are now known and are listed in [Fallback rules Apple actually shipped](#fallback-rules-apple-actually-shipped).

## What the historical systems did

### Original Macintosh QuickDraw already separated drawing intent from a monochrome image

Basic QuickDraw used `GrafPort` drawing state and a one-bit `BitMap`. Its `fgColor`, `bkColor`, and `colrBit` fields carried limited color intent even though a bitmap could not retain it. Color commands could survive in a recorded picture and support output to color printers. The `colrBit` field identified the printing color plane. This was not an RGB framebuffer hidden behind a monochrome screen. [Apple, GrafPort](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-27.html).

The basic color model had eight predefined colors. Their constants encoded both additive display colors and subtractive printing separations. `ForeColor` and `BackColor` selected that intent; patterns provided spatial mixtures of black and white. These are distinct mechanisms: color intent, one-bit storage, and halftone patterns. [Apple, About QuickDraw Drawing](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-59.html).

The original assembly preserved in this repository corroborates the printing path: `reference/QuickDraw/Util.a` contains `ColorMap`, which adjusts patterns and transfer modes for `colrBit`; drawing routines including `DrawText.a` and `DrawArc.a` call it. The current TypeScript port should remain the source of truth for its existing monochrome behavior.

### Original Color QuickDraw was a compatible expansion

Apple's own historical table dates Color QuickDraw to the Macintosh II in March 1987. It initially used indexed devices; 32-Bit QuickDraw added direct color in 1989. Do not attribute modern RGB framebuffers, all System 7 facilities, or all later dithering behavior to the first release. [Apple's develop, “QuickDraw's CopyBits Procedure: Better Than Ever in System 7.0,” Spring 1991](https://vintageapple.org/develop/pdf/develop-06_9104_Spring_1991.pdf). Apple's technical note dates the first 32-Bit QuickDraw release to May 1989 and identifies direct-color devices and pictures among its motivations. [Apple Technical Note QD01](https://leopard-adc.pepas.com/technotes/qd/qd_01.html).

Color QuickDraw's central separation was:

| Structure | Responsibility |
| --- | --- |
| `CGrafPort` | Drawing state, including desired RGB colors, pen, patterns, clipping, and coordinates |
| `PixMap` | Image storage: bounds, row stride, depth, and color table |
| `GDevice` | Output-device state and color environment |
| `RGBColor` | Device-independent requested color: three 16-bit components |

RGB requests were mapped to available palette entries when drawing. Indexed images supported 1, 2, 4, or 8 bits per pixel; one-bit output was part of the supported depth model. `GDevice` separated the device from individual windows, including screens with differing depths. Existing shape commands worked with either port type; Color QuickDraw commands could also operate on basic ports with reduced capabilities. This is strong evidence for a compatible drawing model, not evidence that an unchanged monochrome rasterizer produced every color pixel. [Apple, About Color QuickDraw](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-198.html).

### What “reused QuickDraw” can safely mean

Apple explicitly documents common routines for geometry, regions, shape drawing, and image copying in both basic and Color QuickDraw. Keeping existing geometry and drawing semantics while adding a richer destination is faithful to that public architecture. [Apple, QuickDraw Drawing](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-58.html).

The extension mechanism was `grafProcs`: shape calls reached low-level procedures such as `StdOval`; applications could replace a procedure or modify its parameters and then call the standard implementation. Color ports required `SetStdCProcs` rather than `SetStdProcs`. These hooks support the architectural idea of separate drawing backends, but the manuals alone do not show the internal code reuse. The System 7.1 source does: shape geometry is shared verbatim and depth handling is confined to the blitters, as documented in [What the System 7.1 source shows](#what-the-system-71-color-quickdraw-source-shows). [Apple, Customizing QuickDraw's Low-Level Routines](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-60.html).

`CopyBits` was also a conversion boundary: it handled bitmap/pixel-map transfers and colorization using foreground/background colors. Its later documentation includes specific one-bit fallbacks for arithmetic modes—for example, `blend` becomes `srcCopy`. This is a precedent for defining reduced-device semantics explicitly. It is not permission to apply arbitrary RGB bitwise operations and assume they preserve the old transfer modes. [Apple, CopyBits](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-166.html).

### Monochrome compatibility did not automatically guarantee a legible result

Basic `ForeColor`/`BackColor` drawing displayed every nonwhite color as black on a black-and-white screen. A red foreground on a blue background could therefore disappear. This behavior should not be generalized to every RGB, palette, or image-conversion path. [Apple, Drawing With QuickDraw](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-60.html).

Apple supplied more deliberate alternatives. `PixPat` included `pat1Data`, an explicit monochrome pattern for basic ports, initially 50% gray. [Apple, PixPat reference, p. 131](https://leopard-adc.pepas.com/documentation/Carbon/Reference/QuickDraw_Ref/QuickDraw_Ref.pdf). System 7 picture playback converted `MakeRGBPat` patterns to approximately equivalent luminance patterns and other pixel patterns to their `pat1Data` fallbacks. That is specifically documented System 7 behavior, not a claim about the 1984 ROM. [Apple, Color Pictures in Basic Graphics Ports](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-333.html).

The Palette Manager's `pmBlack` and `pmWhite` usages explicitly preserved distinctions on one-bit devices: Apple gives the example of red and dark blue otherwise both mapping to black. This is a useful precedent for semantic monochrome choices in UI colors. [Apple, Using Palettes With Offscreen Graphics Worlds](https://dev.os9.ca/techpubs/mac/ACI/ACI-27.html).

System 7 also added RGB foreground/background APIs, `DeviceLoop`, and offscreen graphics-world support to basic QuickDraw. Software availability and device depth were separate questions: a machine could support Color QuickDraw while currently drawing to one-bit output. [Apple, Using Basic QuickDraw](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-20.html).

The transferable lesson is to preserve requested color separately from its current pixel representation, make device capabilities explicit, and provide deliberate monochrome representations for meaningful distinctions. A color-shaped region rendered through an existing one-bit coverage mask is a project implementation proposal, not an established account of how Apple's ROM was implemented.

Apple documents adding `ditherCopy` (64) to source modes on System 7. Thus automatic nearest-color mapping, pattern approximation, and explicitly requested image dithering are different operations. We should expose that choice rather than promise that every color drawing call automatically produces a good monochrome halftone. [Apple, About QuickDraw Drawing](https://dev.os9.ca/techpubs/mac/QuickDraw/QuickDraw-59.html).

This was not the first appearance of image dithering: 32-Bit QuickDraw 1.2, documented in April 1990 for System 6.0.5, already supported `ditherCopy` to indexed destinations of one through eight bits, including error diffusion from an eight-bit image to one-bit output. That is a particularly close historical precedent for color-image-to-monochrome conversion, but still postdates the original 1987 release. [Apple Technical Note QD01, Indexed to Indexed Dithering](https://leopard-adc.pepas.com/technotes/qd/qd_01.html).

## What the System 7.1 Color QuickDraw source shows

### Provenance and local copy

The SuperMario source tree is Apple's unified ROM + System source for System 7.1 (codename SuperMario, later Cube-E), snapshotted 1994-02-09. It circulates as [elliotnunn/supermario](https://github.com/elliotnunn/supermario), which adds patchsets to make it buildable. It is MPW 68k assembly. The `QuickDraw/` directory is the shipping Color QuickDraw with 32-Bit QuickDraw merged in (`QD.a` is the driver that `INCLUDE`s every file and sets `has32BitQD EQU 1`).

Unlike the 1984 QuickDraw in `reference/QuickDraw/`, which the Computer History Museum released under a license, this dump has no license. It is a reading source for verifying behavior; do not transcribe it line-by-line with `file:line` citations the way `packages/quickdraw` cites the CHM release.

A sparse clone lives at `reference/supermario` (the `/reference` directory is gitignored). Recreate it with:

```sh
git clone --depth 1 --filter=blob:none --sparse https://github.com/elliotnunn/supermario.git reference/supermario
cd reference/supermario
git sparse-checkout set \
  base/SuperMarioProj.1994-02-09/QuickDraw \
  base/SuperMarioProj.1994-02-09/Interfaces/AIncludes \
  base/SuperMarioProj.1994-02-09/Internal/Asm
```

Files use CR line endings; pipe through `tr -d '\r'` before grepping. Paths below are relative to `reference/supermario/base/SuperMarioProj.1994-02-09/`. Line numbers were observed at commit `9dd3c4b`.

Orientation within `QuickDraw/`:

| Location | What it is |
| --- | --- |
| `QuickDraw/*.a` | Color QuickDraw proper: `Stretch.a`, `RgnBlt.a`, `BitBlt.a`, `Patterns.a`, `ColorMgr.a`, `GDevice.a`, `GWorld.a`, `DeviceLoop.a`, plus the shared geometry files. |
| `QuickDraw/JacksonPollock/` | Not the 32-Bit QuickDraw engine. "Jackson Pollock" was the codename for the 1989–90 *32-Bit QuickDraw 1.x* INIT for System 6.0.4+. The directory holds only the installer (`JPInit.a`, `JPPatch.a` load `ptch` 31; `32-Bit CQD.r` has the "requires System 6.0.4" alert). The code it installs is the parent directory. |
| `QuickDraw/Classic/*.m.a` | Monochrome QuickDraw for Plus/SE/Classic, a 1988 descendant of the 1984 files already ported. Useful only as a diff baseline against the color files. |
| `QuickDraw/Patches/AllB&WQDPatch.a` | System 7 linked patch for B&W machines: adds `RGBForeColor`, `GetForeColor`, `OpenCPicture`, `QDError` without color capability. |
| `QuickDraw/PictUtilities/` | C sources for picture color analysis (median cut, popular colors). |
| `Internal/Asm/ColorEqu.a`, `Interfaces/AIncludes/Quickdraw.a` | Structure offsets and flag bits for `PixMap`, `CGrafPort`, `GDevice`, `PixPat`. |

### One engine, tagged ports

Apple did not build a color layer that delegates to monochrome QuickDraw. It made `PixMap` the universal in-engine type and adapted `BitMap` into it at the door.

The port kind is a tag in the high bits of `rowBytes`. `Internal/Asm/ColorEqu.a:263-272` defines `PMFlag = $8000` (this is a `PixMap`), `cPortFlag = $C000` (a `PixMap` that belongs to a `CGrafPort`), and bit numbers `isPixMap = 15`, `isCPort = 14`. Roughly forty sites across the sources do `TST PORTBITS+ROWBYTES(A3) / BPL oldPort`. `PortToMap`/`BitsToMap` (`QuickDraw/ColorAsm.a:113`) resolve "pointer to a port, a `BitMap`, or a `PixMap` of unknown origin" to the underlying map. TypeScript should express this as a discriminated union, not a bit in `rowBytes`.

`BitsToPix` (`QuickDraw/ColorAsm.a:620`) is the adapter every blitter calls (`RgnBlt`, `Stretch`, `DrawLine`, `DrawArc`, `DrawText`). It copies the source into a local stack `PixMap`. Two rules matter:

- If the input is a plain `BitMap` whose `baseAddr` is the screen, the copy takes the current `GDevice`'s `PixMap` (depth, row bytes, color table) with bounds offset to device coordinates. This is how a pre-color application drawing to `screenBits` draws at whatever depth the monitor currently has.
- Otherwise a plain `BitMap` becomes a one-bit `PixMap` with a fixed two-entry white/black color table (`OneBitCTable`, `ColorAsm.a:81`), because "we are copying to or from the user's buffer and can't change its size".

After `BitsToPix`, no drawing code sees a `BitMap` again.

### Geometry unchanged, depth confined to the blitters

Comment-stripped line diffs between `Classic/*.m.a` and the color versions:

| File | Classic | Color | Nature of change |
| --- | --- | --- | --- |
| Ovals, RRects, Arcs, Angles, RgnOp, PackRgn, SortPoints, PutLine, PutOval, PutRgn | 109–473 | within a few dozen lines | essentially untouched |
| Rects | 691 | 1036 | `StdDevLoop` added; rasterization unchanged |
| Regions | 1820 | 2186 | 32-bit-clean addressing, not color |
| BitBlt | 813 | 4942 | per-depth transfer loops |
| RgnBlt | 841 | 4251 | per-depth loops plus arithmetic and hilite modes |
| DrawText | 986 | 5689 | colorized glyph paths, TrueType |
| Stretch | 1205 | 11959 | all depth conversion, dithering, search procs |

This confirms the architectural split proposed above: keep geometry, region, and picture-verb code untouched; put every depth decision in the transfer routines.

### `StretchBits` is the only depth-conversion boundary

`RgnBlt.a:76` states the contract: "StretchBits does all transfers between source and destination of different depths, so we can assume that source depth = dest depth." `StretchBits` (`Stretch.a:388`) is `CopyBits`' engine and the one place where source and destination `pixelSize` may differ. Its dispatch tables (`Stretch.a:1915-1947`):

| Table | Cases |
| --- | --- |
| `stColorTab` | 32→indexed, 32→16, 32→indexed dithered, 16→32, 16→indexed, 16→indexed dithered |
| `stGrayTab` | 32→`BitMap`, 32→gray, 32→`BitMap` dithered (`Dither32toBitmap`), 32→gray dithered, and the 16-bit equivalents |
| `stSearchTab` | the same pairs routed through custom Color Manager search procs |

Indexed-to-indexed uses `ScaleIndexedToIndexed` with a scale table built by `MakeScaleTbl` (`Patterns.a:1340`); fast paths `CB8to8Clip`, `CB8to1Clip`, `CB1to8Clip` handle the common unscaled cases. The proposed package should likewise route every mono↔color and color↔color copy through one conversion entry point and forbid depth mixing anywhere else.

### Region clipping is a one-bit coverage mask expanded to depth

`RgnBlt.a:215`: "region masks are created as long aligned 1-bit deep masks which are then expanded to the proper depth." `SeekMask` produces one-bit scan masks from up to three regions, and a `RUNRTN` routine (`DrawingVars.a`, `RUNRTN`, "rtn to form n-bit run mask from 1-bit scan mask") expands them to the destination depth before the transfer loop applies them. The coverage-mask approach proposed for colored shapes below is therefore Apple's own approach, executed inside the blitter rather than as a separate layer.

### Patterns expand per depth and cache by depth and color-table seed

`PatExpand` (`Patterns.a:623`) expands the 8×8 one-bit pattern into a depth-specific buffer: 16 rows × 1 long for depths 1–4, 8 rows × 2 longs for 8-bit, × 4 for 16-bit, × 8 for 32-bit. In copy mode the foreground/background colors are baked into the expanded pattern and blitted directly; in OR, BIC, and XOR modes the pattern stays a mask and color is applied in the transfer loop (XOR ignores color entirely). A `PixPat`'s expanded data is cached in `patXData`/`patXMap` and invalidated when the device depth (`patXValid`) or color-table seed (`LastCTable`) changes. `MakeRGBPat` (`Patterns.a:2031`) sets `pat1Data` to 50% gray, and `PatDither` builds the dithered indexed pattern.

### `StdDevLoop` re-resolves colors per screen device

`StdDevLoop` (`Rects.a:137`) wraps every screen-bound shape. With a single device it skips all the work. Otherwise it converts the shape's rectangle to global coordinates, walks `DeviceList`, and for each active device whose `gdRect` intersects: sets `theGDevice` and `SrcDevice`, and if the device's color-table seed differs from the last one, re-derives the port's `fgColor`/`bkColor` indices from its RGB fields via `GetForeColor`/`RGBForeColor` (or the Palette Manager if a palette is attached), then calls the draw routine. Picture and polygon recording is cleared after the first pass so verbs are recorded once. `DeviceLoop.a` is the application-facing trap with the same idea, grouping "similar" devices by depth and the monochrome/color flag.

For Mockintosh this is the model for drawing one retained scene to a color screen and a monochrome printer or capture: resolve paint per target at draw time, not per scene.

### Device model: monochrome is not the same as one-bit

`Interfaces/AIncludes/Quickdraw.a:475-512`: `gdType` is `clutType`, `fixedType`, or `directType`; `gdFlags` bit 0 `gdDevType` is "0 = monochrome; 1 = color", independent of `pixelSize`. Eight-bit grayscale devices exist, and `MakeGrayITab` (`ColorMgr.a:850`) builds their inverse table from luminance alone. `Color2Index` (`ColorMgr.a:1236`) walks the device's search-proc chain, then falls back to `ITabMatch` for indexed devices (a Voronoi inverse table built by `MakeITable`, `ColorMgr.a:266`) or direct component packing for `directType`. The target descriptor proposed below should therefore carry pixel format *and* color capability as separate fields, matching this.

### Fallback rules Apple actually shipped

These are the exact rules to reproduce when a color request lands on a reduced target. Each is Apple behavior verified in source, not Mockintosh policy.

| Situation | Rule | Source |
| --- | --- | --- |
| RGB → black/white on a one-bit device | luminance = (5·R + 9·G + 2·B) / 16 on 16-bit components; luminance ≥ `$8000` → white, else black | `OneBitProc`, `Stretch.a:2143` ("[5 9 2] luminance mapping") |
| RGB → gray index | luminance lookup table | `MakeGrayITab`, `ColorMgr.a:850` |
| RGB → classic eight colors (old `GrafPort`, and every B&W machine) | take the high bit of each component → 3-bit RGB → `blackColor`…`whiteColor` | `RGB2OLD`, `ColorMgr.a:1555` (called from `RGBForeColor`, `ColorMgr.a:1503`); `Patches/AllB&WQDPatch.a:645` |
| Classic color → one-bit screen (`colrBit = 0`) | bit 0 of the planar color value is the "white" bit; every non-white color draws black | `remapOld1bit`, `QDUtil.a:726`; `ColorMap`, `QDUtil.a:473` |
| Arithmetic modes on a one-bit destination | avg→`srcCopy`, addPin→`srcBic`, addOver→`srcXor`, subPin→`srcOr`, transparent→`srcOr`, max→`srcBic`, subOver→`srcXor`, min→`srcOr` | `arithMode`, `QDUtil.a:466` |
| Foreground and background differ in RGB but map to the same index on a ≤2-bit destination | invert the foreground (`InvertColor`, then `Color2Index`) so text stays visible; skipped when `colrBit` is set | `ColorMap`, `QDUtil.a` "goOnAndFlip"; `MakeScaleTbl`, `Patterns.a` change <14> |
| XOR and notXOR modes | ignore foreground/background color entirely; black/white masks | `ColorMap`, `QDUtil.a` "COLOROK" |
| `GetForeColor` on a B&W machine | returns canonical RGB from an inline eight-entry table (e.g. yellow `$FC00,$F37D,$052F`, red `$DD6B,$08C2,$06A2`) | `Patches/AllB&WQDPatch.a:683` |
| Color pattern on a one-bit port | use `pat1Data`; `MakeRGBPat` initializes it to 50% gray | `Patterns.a:2031-2062` |

Alpha/"stream" modes in `grafVars` apply only to ≥16-bit direct devices (`ColorMap`, "alpha mode is illegal" on old ports) and are out of scope.

### How this changes the plan

Most of the proposals in this document are confirmed by the source: unchanged geometry, a single conversion boundary at `CopyBits`, one-bit coverage masks for shapes, explicit one-bit alternatives for paints (`pat1Data`), and an explicit device capability that is separate from depth.

The one place the source disagrees with the *packaging* below is that Apple used a single engine with `PixMap` as the universal type and one-bit as just another depth with fast-path loops. Three options follow:

1. **Separate package, as proposed below.** The mono package stays byte-for-byte identical; the color package owns bitmap and text dispatch because the current `CopyBits` and `DrawText` bypass the bottlenecks.
2. **Apple's structure.** Introduce `PixMap` inside `@mockintosh/quickdraw`, add a `BitsToPix`-style adapter, parameterize `BitBlt`/`RgnBlt` by depth, and port `Stretch.a`'s conversion table. One engine and most faithful, but it modifies the ported mono raster code and relies on golden-frame tests to prove nothing changed.
3. **Hybrid (recommended).** Keep option 1's boundary, but implement the color package's decisions by transcribing Apple's algorithms: `ColorMap`'s mode and color resolution, `PatExpand`'s per-depth expansion and cache keys, `StdDevLoop`'s per-target color re-resolution, `OneBitProc`'s luminance rule, and the `arithMode` table.

`ARCHITECTURE.md` already commits to color arriving "the way Color QuickDraw did — a `PixMap` with a `pixelSize` beside the 1-bit `BitMap`". Option 3 honors that while keeping the mono package frozen, and it gives every fallback decision a documented precedent.

## What the current project actually supports

The working tree was inspected as it stood on the research date, including existing uncommitted work. These observations describe the TypeScript implementation, not assumptions based on its Pascal API names.

| Current boundary | Finding and implication |
| --- | --- |
| [Architecture](../ARCHITECTURE.md) | Already anticipates a `PixMap` alongside `BitMap` if color returns. The proposed package follows this boundary. |
| [QuickDraw types](../packages/quickdraw/src/types.ts), [packed storage](../packages/quickdraw/src/packedBits.ts) | `BitMap` is packed one-bit, MSB first, with `1 = black`. Never pass color bytes to its accessors or disguise a color buffer as this type. |
| [Color setters](../packages/quickdraw/src/utils.ts), [raster engine](../packages/quickdraw/src/bitblt.ts) | `ForeColor`, `BackColor`, and `ColorBit` store fields; the one-bit raster engine does not implement RGB mapping. Their presence is not a latent color backend. |
| [Shape dispatch](../packages/quickdraw/src/rects.ts), [bottleneck setup](../packages/quickdraw/src/bottleneck.ts) | Shape hooks can redirect selected drawing operations. They are useful extension points, but are not a complete interception layer. |
| [Bitmap drawing](../packages/quickdraw/src/bitmaps.ts) | `CopyBits` directly calls `BitBlt` or packed-pixel accessors; it does not dispatch through `grafProcs.bitsProc`. Color blits need a new entry point outside this package. |
| [Text drawing](../packages/quickdraw/src/text.ts), [UI font bridge](../packages/ui/src/fonts/bridge.ts) | `DrawText` calls `_fontDraw` directly, bypassing `textProc`; the bridge writes with `setBit`. Font measurement and glyph assets remain reusable, but color text needs an adapter or glyph-mask path. |
| [UI drawing](../packages/ui/src/draw.ts), [node types](../packages/ui/src/nodes.ts) | `Ink` is `0 \| 1`; sprite drawing uses direct `CopyBits`; raster callbacks write bits and expose a real `GrafPort`. These paths require explicit integration. |
| [UI initialization](../packages/ui/src/ui.ts), [boot](../src/os/boot.ts), [display contract](../src/platform/types.ts) | All assume one `BitMap`; boot obtains it from `InitGraf`/`screenBits`. Selecting a color target requires changes here, outside the preserved QuickDraw package. |
| [Canvas presenter](../src/platform/web/CanvasPresenter.ts), [headless platform](../src/platform/headless/index.ts) | Presentation and test capture currently decode only one-bit storage. Color presentation needs its own format path. |
| [Printing](../packages/print/src/page.ts), [cursor](../src/os/cursor.ts), [zoom animation](../src/os/zoomAnimation.ts) | Print pages, cursor compositing, and XOR animation depend on monochrome drawing. Keep print output one-bit and explicitly adapt the other consumers for color. |
| [Screenshot service](../src/os/kernel/uiService.ts), [frame schema](../src/os/kernel/schema.ts) | Capture contains bytes and row stride without a pixel format; PBM export assumes one-bit data. Color frames need a versioned/tagged representation or a separate capture operation. |

Consequently, “install `CQDProcs` and everything becomes color” is not viable for this port. A separate package is feasible, but adding visible color is also a UI/platform integration task.

## Proposed package boundary

The following is a design sketch, not a promise of complete classic Color QuickDraw API or binary compatibility.

| New concept | Proposed responsibility |
| --- | --- |
| `RGBColor` | Requested color, independent of the destination. Three unsigned 16-bit components would preserve the classic API vocabulary; convenience constructors can accept 8-bit RGB. |
| `PixMap` | Own color pixel storage, bounds, byte stride, and an explicit format. Begin with one opaque RGB format stored in four bytes per pixel, with documented byte order and reserved-byte handling. |
| `ColorPort` / `CGrafPort` | Desired foreground/background colors, clip/visible regions, pen state, target, and patterns. Compose with existing QuickDraw types instead of making a fake `GrafPort` containing color bytes. |
| Target descriptor | Distinguish `mono1` from the supported color format and declare actual color capability. Keep pixel format, device capability, and requested render mode separate; a multi-bit format need not imply a color display. |
| Color pattern / paint | RGB or a color tile plus an optional explicit one-bit ink/pattern alternative, inspired by `PixPat.pat1Data`. |
| Copy/conversion routines | Own mono-to-color, color-to-color, and color-to-mono transfers, clipping, source interpretation, and conversion policy. Delegate mono-to-mono to existing QuickDraw. This is the analogue of `StretchBits`: the single place where source and destination formats may differ. |

Use a tagged target union whose monochrome member wraps the existing `BitMap`. Do not reproduce Apple's pointer casts, record overlays, or high-bit tagging in `rowBytes`; TypeScript can express the distinction directly. Geometry and region types can be imported from QuickDraw. The package should have no DOM dependency and no dependency on the UI package; the UI remains responsible for supplying font/glyph data.

Starting with opaque RGB storage is a modern implementation choice, not a reproduction of 1987 indexed Color QuickDraw. Indexed `PixMap` formats and palette management can be added when a target or application needs them. They should live entirely in the new package. A four-byte 512×342 color buffer uses 700,416 bytes; the existing packed screen uses 21,888 bytes, a 32× difference before scratch buffers. These are storage calculations, not performance measurements.

### Reusing QuickDraw for actual work

1. **Monochrome target:** resolve a paint to its one-bit ink/pattern and call existing QuickDraw against the real destination port. Legacy commands keep their existing transfer modes and packed fast paths.
2. **Color target, shape:** create or reuse a bounded one-bit scratch bitmap. Rasterize the shape into it using unchanged QuickDraw with solid black copy drawing and the appropriate geometry/clip. Treat the bits as coverage, then apply the color paint to covered destination pixels in the new package. This mirrors `RgnBlt`'s own one-bit region mask expanded to depth (`RgnBlt.a:215`), applied one level higher.
3. **Text:** reuse font metrics and bitmap glyphs through a UI adapter. Render glyph coverage into a mask or provide glyph masks directly to the new compositor. Preserve measurement and pen advance exactly once.
4. **Images:** retain existing monochrome sprites and masks. The new copy routine expands source bits to foreground/background RGB, while a separate opacity mask decides which pixels are affected. Color image storage never enters the old `CopyBits`.

Coverage and paint must remain separate. A white pixel in an opaque sprite is still opaque; a zero bit in a two-color pattern may mean background color; neither necessarily means transparency. An erase operation needs full shape coverage painted with the background, not an empty mask. Invert needs coverage plus a defined destination operation. Using the finished black/white image itself as a transparency mask would get these cases wrong.

Scratch drawing must save and restore `globals.thePort` in `try/finally`, including a previously null port, and isolate mutable pen, clip, and recording state. Do not call `InitGraf` per operation or change global font callbacks per color port. Preserve coordinate origins and pattern phase when using bounded masks. Region and picture recording have side effects; explicitly scope them out of the first facade until their forwarding behavior is specified.

Use `QDProcs` only where verified hooks help compatibility. Have the facade explicitly own bitmap and text dispatch so it does not depend on nonexistent interception. A mask backend minimizes duplicate shape algorithms but adds allocation/clearing and compositing costs: pool bounded masks and measure before optimizing. It is not yet demonstrated to be the fastest option.

For transfer modes, retain the existing mono semantics verbatim. Initially define color copy, opaque/transparent mask expansion, and a reversible invert operation needed by the shell. Audit current `srcBic`/`srcOr` cursor and sprite pairs as explicit mask composition. Do not apply those numeric modes naively to RGB bytes or treat arbitrary RGB XOR as a complete implementation of classic color transfer rules. If arithmetic modes are ever accepted, map them on a one-bit target with the `arithMode` table above rather than a new rule. Document unsupported modes rather than silently changing their meaning.

### Graceful one-bit output

Prefer rendering the same retained scene directly for each target. Resolve UI paint at draw time: a red error label may request solid black on mono; a blue selection background may request a specific pattern and a paired, readable text ink. Central theme paints can supply those choices so applications do not branch on hardware for every drawing call. Preserve patterns that are meaningful textures instead of automatically replacing them with flat gray colors on a color screen.

For RGB without an authored fallback, use Apple's one-bit rule: luminance = (5·R + 9·G + 2·B) / 16 on 16-bit components, white when ≥ `$8000`, otherwise black (`OneBitProc`, `Stretch.a:2143`). Black and white are exact endpoints under this rule. Let area fills opt into a stable ordered black/white pattern, and let photographs opt into image dithering. Anchor ordered patterns to a documented coordinate space so clipping or partial repaint does not change their phase. Any deviation from the Apple arithmetic should be labelled as Mockintosh behavior.

A single threshold cannot preserve differences between equally bright colors. Apple's own mitigation is the foreground/background collision rule in `ColorMap`: when a pair differs in RGB but maps to the same one-bit index, the foreground is inverted so text remains legible. Adopt that rule for paired styles. Beyond it, critical status, focus, and selection must also use text, outline, shape, or an authored pattern. The fallback belongs to a foreground/background pair or semantic style where contrast matters, not just independent RGB conversion.

Keep color images in their original format until the destination is known. For a mono target, convert them into bounded one-bit images or bands, then use QuickDraw to composite them; do not require a screen-sized RGB intermediary. Keep the ESC/POS encoder receiving packed one-bit pages. A color screen does not make the attached printer color-capable.

An explicit platform capability and selected mode should control rendering. Model it on `GDevice`: pixel format (depth, indexed/direct) and color capability (`gdDevType`) are separate fields, so an eight-bit grayscale target is representable. Existing displays default to monochrome for compatibility; color-capable hosts may still select mono. Do not use canvas availability as the capability test. Changing mode requires a target reallocation and complete redraw, with format-aware capture and presentation. Multiple screens or simultaneous color/mono viewers can be deferred; the retained tree offers a future route to drawing separately for each, subject to the current single-instance/global-state constraints.

### Legacy raw drawing

Existing `<raster onPaint>` callbacks can call QuickDraw directly through `surface.port`. Keep that a real mono port. For a color destination, a compatibility adapter can render such a callback into an explicitly opaque monochrome raster tile and expand it into color. This preserves the established binary raster contract for opaque content, but does not recover independent alpha or destination-dependent XOR behavior. Such effects need a new color-aware drawing surface or an explicitly restricted compatibility contract. Do not promise that arbitrary direct writes to `portBits` will acquire color automatically.

## A practical first implementation and its checks

First build the separate package against offscreen targets: identical rectangles, lines, rounded shapes, clipping, bitmap masks, and a color image rendered to both mono and RGB. Include a red-on-blue example with an authored readable mono fallback. Prove scratch-port restoration and coverage semantics before integrating the OS.

Next add an explicit drawing backend at `createUI`/`draw.ts`, adapt the font bridge, and expose additive color paint and image types while keeping `Ink = 0 | 1` valid. Then add target selection at boot, the color presenter, color-aware cursor/zoom behavior, and format-aware capture. Keep the monochrome platform and printing contracts working through their existing bytes. Integrating these pieces is required before claiming the desktop supports color; an offscreen package alone is not completion.

Acceptance checks for that work should cover:

- Byte-for-byte agreement with existing mono output for legacy scenes, including clipping, pattern alignment, sprites, text, cursor, and XOR restoration.
- Colored shape coverage matching the old rasterizer; nonzero bounds, nested clips, white opaque pixels, and transparent masks.
- Color/mono copies with scaling, source/destination overlap, and explicit conversion policy; validate old fast and slow paths before treating them as compatibility oracles.
- Mono readability of the paired style examples, deterministic dither output across clipped repaints, and exact black/white endpoints.
- The Apple fallback rules as table-driven tests: the [5 9 2] luminance threshold on representative RGBs (including the eight classic colors and mid-grays either side of `$8000`), the `arithMode` mapping, and foreground inversion when a differing fg/bk pair collides on a one-bit target.
- Drawing a mono print page between color screen operations without leaking port, font, clip, or color state.
- Actual packed output and no mandatory full RGB allocation on a mono-only host; color frame metadata and continued valid PBM export through explicit mono conversion.

Full PICT v2 recording/playback, palette animation, direct-color classic transfer-mode parity, multiple simultaneous devices, and all classic Color QuickDraw entry points should remain named follow-ups. No implementation or tests were run as part of this research; only this research note was added.
