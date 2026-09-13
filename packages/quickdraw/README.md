# `@mockintosh/quickdraw`

TypeScript rewrite of Bill Atkinson’s 1984 Macintosh QuickDraw
(`reference/QuickDraw/*.a`, `QuickDraw.p`, `GrafUtil.p`).

It is the graphics engine Mockintosh paints with: 1-bit `BitMap`s, grafPorts,
regions, pictures, and the original verbs (`FrameRect`, `PaintOval`,
`DrawString`, `CopyBits`, …). The host (`@mockintosh/ui`, `src/os`) sits
above it. It does not talk to a canvas or a GPU.

```ts
import { InitGraf, OpenPort, MoveTo, LineTo, FrameRect, type GrafPort } from "@mockintosh/quickdraw";
import { newBitMap, makeRect } from "@mockintosh/quickdraw/bits";

InitGraf(newBitMap(512, 342));
const port = {} as GrafPort;
OpenPort(port);
MoveTo(10, 10);
LineTo(100, 80);
FrameRect(makeRect(20, 20, 80, 120));
```

## What we match

**Same functions.** The public export is `QuickDraw.p` + `GrafUtil.p` plus
three OS seams the original left outside the unit:

| Seam | 1984 | Here |
|---|---|---|
| Screen | `_GetScrnBits` | `InitGraf(screenBits: BitMap)` |
| Fonts | `_SwapFont` | `installFontManager` + `FMInput` / `FMOutput` / `FontStrike` |
| Cursor | `$800` vectors | `installCursorVectors` + `cursorState` |

Pixel helpers (`newBitMap`, `getBit`, `makeRect`, …) are **not** QuickDraw.
Import them from `@mockintosh/quickdraw/bits`.

**Same pixels.** Packed XOR-delta regions, the `RgnBlt` / `StretchBits`
pipeline, slab lines, `DrawArc` oval arithmetic, `ColorMap`, PICT v1
record/play, and `DrText` style synthesis are the 1984 algorithms. A
Bresenham line or a per-row `scanlines` region would be a different
library.

**Same pictures.** `OpenPicture` / drawing / `ClosePicture` emit PICT v1
opcodes; `DrawPicture` plays them through the bottleneck procs.
`serializePicture` / `parsePicture` are the byte form.

## What we do not match

A port is not a 68000 emulator. These are accepted deviations
(`docs/quickdraw-fidelity-plan.md` §4):

1. **Handles are objects.** `NewHandle` / `SetSize` / `DisposHandle` are
   allocation and GC. Growth-in-chunks and the 16-bit size cap are gone.
2. **Coordinates are JS numbers.** We do not wrap every add at 16 bits.
   16.16 fixed-point (`FixMul`, `FixRatio`, oval/line edges) still goes
   through `fixmath.ts` and `| 0` so rounding matches.
3. **Traps are functions.** VAR parameters mutate the object you pass.
4. **Bounds-check.** Out-of-range `GetPixel` / `CopyBits` reads return
   white. Nil `thePort` throws `QDError`.
5. **The cursor is not in `screenBits`.** The ROM engine is not in the
   QuickDraw dump. We keep the `$800` call graph; the host composites
   the sprite after the frame (`src/os/cursor.ts`, mask `srcBic` then
   data `srcOr`). `ShieldCursor` is a no-op unless you install a vector.
6. **No 68k speed costume.** Word-wide `MOVE.L` loops, `StretchBits`
   ratio tables, and `_StackAvail` text splits are omitted. Pixel output
   of the general path is the spec.

Internals keep the original names (`DoLine`, `RgnBlt`, `CheckPic`,
`SeekRgn`) so a reader can diff against the `.a` files. They are not
re-exported from the barrel.

## Performance (JS, not 68k)

We take shortcuts that **do not change the function or the bits**:

- **`DrText` direct-to-screen** when `srcOr`, no style, 1:1, rectangular
  clip/vis — glyphs go into `portBits` with `blitRowBits`. Styled or
  clipped text still uses the scratch + `StretchBits` path.
- **`DrawArc` solid slabs** when clip/vis are rectangular and the
  pattern is solid black or white (`MODEMAP` → black / xor / white /
  nop). Gray patterns and complex clips still call `RgnBlt` per
  scanline.
- **Span apply under a region mask** — walk `SeekRgn` as runs, then
  `fillRowBits` / `blitRowBits`, not `applyPixel` per dot.
- **Pooled scratch** — `RGNREC` slots, mask words, and stretch row
  buffers grow and stay. The 68k used stack; we do not allocate a new
  mask on every `FrameRect`.
- **Skip Shield/Show** when the shield vector is the default no-op.
  `GetPixel` still Hide/Shows. Install a real `$808` and the pair runs
  again.
- **`asInt16` stays on INTEGER/Fixed math** (picture words, `FixMul`,
  oval state, stretch DDA error). Clipped blit steps (`v + 1`,
  `left + width`) do not wrap.

We do **not** replace slab lines, packed regions, or `ColorMap` with
something “more JS.” Those change pixels.

## Layers

```
Apps / @mockintosh/sdk
        ↓
src/os  (cursor composite, boot, InitGraf)
        ↓
@mockintosh/ui  (layout, Decker → FontStrike, CanvasNode → verbs)
        ↓
@mockintosh/quickdraw
        ↓
1-bit BitMap  (host display / printer)
```

`@mockintosh/ui` must not leak into this package. Fonts arrive as
strikes through `installFontManager`. The shell owns the framebuffer
`BitMap` passed to `InitGraf`.

## Verify

```bash
npx tsc --noEmit -p packages/quickdraw
npx vitest run packages/quickdraw/tests
```

`tests/fidelity.test.ts` greps `src/` for `Math.max(1`, `as any`,
`scanlines`, and `portRect` inside blitters.

Source comments use `file:line` against `reference/QuickDraw`. The
binding review is `docs/quickdraw-fidelity-plan.md`.
