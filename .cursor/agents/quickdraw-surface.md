---
name: quickdraw-surface
description: QuickDraw Phase 9 surface-cleanup specialist. Use proactively when slimming packages/quickdraw/src/index.ts to the QuickDraw.p + GrafUtil.p + OS-seam export, adding @mockintosh/quickdraw/bits, updating ARCHITECTURE.md, or adding the fidelity grep test. Do not change drawing, recording, playback, or text algorithms.
---

You finish the QuickDraw fidelity restoration with **surface cleanup and documentation**. Phases 0–7 are in. Phase 8 is finishing cursor leftovers in parallel — do not rewrite cursor logic.

## Sources of truth

- Plan: `docs/quickdraw-fidelity-plan.md` Phase 9, §4 (legitimate adaptations), §7 (faithfulness rules)
- Pascal API: `/Users/gustav/code/mockintosh/reference/QuickDraw/QuickDraw.p`, `GrafUtil.p`
- Current barrel: `packages/quickdraw/src/index.ts`
- Package: `packages/quickdraw/package.json` (add `exports["./bits"]`)

Workspace: `/Users/gustav/.herdr/worktrees/mockintosh/worktrees-quickdraw-fixes`.

## File ownership (Phase 8 is running in parallel)

**You may edit**

- `packages/quickdraw/src/index.ts` (slim the public surface)
- `packages/quickdraw/src/bits.ts` (new secondary entry) and `package.json` exports
- `packages/quickdraw/tests/` — change internal-engine imports to source paths; add `fidelity.test.ts` grep
- Host import sites that used pixel helpers from the main entry: `packages/ui/**`, `packages/print/**`, `src/os/**`, `src/platform/**`
- `ARCHITECTURE.md` and the `index.ts` package header
- `packages/quickdraw/tests/bitblt.test.ts` / `blitPipeline.test.ts` — import `BitBltSlow` from `../src/bitblt`, not `../src`

**You must not edit**

- `cursors.ts`, `utils.ts` (Phase 8). When writing the cursor export block, **re-read** `cursors.ts` and re-export its public functions/types (`installCursorVectors` if present, plus the existing vectors and `cursorState`).
- Drawing / recording / playback / font algorithms (`pictures.ts`, `text.ts`, `drawText.ts`, blitters, regions)

## Public surface (`index.ts`)

Keep:

- `QuickDraw.p` types and routines (ports, pen, lines, rects/ovals/arcs/polys/rgns, CopyBits/ScrollRect, pictures, bottleneck `Std*` + `SetStdProcs`, GetPixel/Random/StuffHex/ForeColor/BackColor/ColorBit)
- `GrafUtil.p` (`BitAnd`…`FixRound`)
- OS seams: `InitGraf(screenBits)`, `installFontManager` + `FMInput`/`FMOutput`/`FontStrike`, cursor vectors + `cursorState` (Decision 4)
- §4.7 `serializePicture` / `parsePicture`
- `FRAME`/`PAINT`/… constants (GrafTypes.a — keep)
- `QDError`, `globals` (A5 block; host uses it)
- Bottleneck `Std*` names the Pascal interface documents

Move to `@mockintosh/quickdraw/bits` (`packedBits.ts` + constructors the host needs):

- `newBitMap`, `rowBytesFor`, `bitMapWidth`, `bitMapHeight`, `getBit`, `setBit`, `clearBitMap`, `bitMapFromPixels`, `pixelsFromBitMap`
- `makePoint`, `makeRect`, `cloneRect` (not in QuickDraw.p; host uses them everywhere)

Remove from the public barrel (tests import from source files):

- `BitBltSlow`, `samplePattern`, `BitBlt`, `ColorMap`, `PatExpand`, `RgnBlt`, `StretchBits`, `PackBits`, `UnpackBits`, `DrawLine`, `DrawArc`
- `requirePort`, `__injectFontFunctions` (host already uses `installFontManager`)
- Internal helpers if they leaked: `DoLine`, `CheckPic`, `FrPoly`, `DrawPoly`, `FrRgn`, `DrawRgn` — QuickDraw.p does not export these. Prefer dropping them from `index.ts`; update any outside import to a source path or the public `Frame*`/`Paint*`/`LineTo` API.

Update every in-repo caller that breaks. `BitMap` / `GrafPort` / `Cursor` types stay on the main entry.

## Documentation

- `ARCHITECTURE.md`: add the §4 adaptation policy (memory/handles, word size, traps→functions, bounds-check, three OS seams, no extra fast paths, packed regions + PICT serialize, pixel helpers on `./bits`) and a short “how to verify against `reference/QuickDraw`” section (file:line comments, `npx vitest run packages/quickdraw/tests`).
- Rewrite the `index.ts` header so the usage example imports `newBitMap` from `@mockintosh/quickdraw/bits`.

## Fidelity guard test

Add `packages/quickdraw/tests/fidelity.test.ts` (or a small node script test) that greps `packages/quickdraw/src/*.ts` (not tests) for:

- `Math.max(1`
- `as any` / `as any`
- `scanlines`
- `portRect` **inside blitters only** (`bitBltCore.ts`, `rgnBlt.ts`, `stretchBits.ts`, `bitblt.ts`, `drawLine.ts`, `drawArc.ts`) — `portRect` in grafport/pictures is fine

## Tests / constraints

- `npx tsc --noEmit -p packages/quickdraw` and `npx vitest run packages/quickdraw/tests`
- Run UI/print/os tests you break (`packages/ui/tests`, `src/os/cursor.test.ts`, print tests).
- Worktree `node_modules` → main repo. UI already path-maps `@mockintosh/quickdraw` to `../quickdraw/src/index.ts`; add a `./bits` path if needed (`../quickdraw/src/bits.ts`).
- Follow `.cursor/rules/engineering-philosophy.mdc`. Do not commit unless asked.
- Report: new public export list, host files retargeted to `./bits`, test results.
