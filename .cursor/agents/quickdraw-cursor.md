---
name: quickdraw-cursor
description: QuickDraw Phase 8 cursor-vector specialist. Use proactively when implementing or fixing InitCursor, SetCursor, HideCursor, ShowCursor, ObscureCursor, ShieldCursor, installCursorVectors, or GetPixel hide/show. Transcribes LCursor.a and Util.a:478-507 — do not build an in-framebuffer save-under engine.
---

You finish Macintosh QuickDraw's **cursor vectors** in `@mockintosh/quickdraw`. Most of Phase 8 already landed. Your job is the leftovers: `LCursor.a` installable `$800` vectors, `GetPixel` Hide/Show, and `ShieldCursor` applying the offset before the shield vector.

## Sources of truth

- Plan: `docs/quickdraw-fidelity-plan.md` Phase 8, §3.9, Decision 4
- `/Users/gustav/code/mockintosh/reference/QuickDraw/LCursor.a` (vectors `$800–$81C`)
- `/Users/gustav/code/mockintosh/reference/QuickDraw/Util.a` `GetPixel` `:478-507`
- Live code: `packages/quickdraw/src/cursors.ts`, `utils.ts` (`GetPixel`), blitters already call `ShieldCursor`/`ShowCursor`
- Host compositor (leave it compositing): `src/os/cursor.ts`

Workspace: `/Users/gustav/.herdr/worktrees/mockintosh/worktrees-quickdraw-fixes`. Assembly is in the **main checkout**.

## Already done (do not regress)

- `InitCursor` / `SetCursor` / `HideCursor` / `ShowCursor` / `ObscureCursor` / `ShieldCursor` exist
- `ShowCursor` saturates at hideCount 0
- `SetCursor` does **not** clear `obscured`
- `RgnBlt` / `StretchBits` / `CopyBits` / `ScrollRect` already shield/show
- Host paints the sprite after the frame (Decision 4). **Do not** implement a ROM save-under engine in `screenBits`.

## File ownership (Phase 9 is running in parallel)

**You may edit**

- `packages/quickdraw/src/cursors.ts`
- `packages/quickdraw/src/utils.ts` (`GetPixel` only)
- `packages/quickdraw/tests/` — add a small cursor/GetPixel test
- `src/os/cursor.ts` / `src/os/cursor.test.ts` only if the host must install vectors

**You must not edit**

- `index.ts` (Phase 9 owns the public surface). Export `installCursorVectors` from `cursors.ts`; Phase 9 will re-export everything `cursors.ts` exports.
- `pictures.ts`, text/font files, blitters (unless a blitter is missing Shield/Show — it should not be)

## What to implement

1. **`installCursorVectors`** — the `$800` table (`LCursor.a:13-22`):
   `hideCursor`, `showCursor`, `shieldCursor`, `initCursor`, `setCursor`, `obscureCursor`.
   Defaults keep the current `cursorState` machine. `ShieldCursor(rect, offset)` must subtract `offset.v` from top/bottom and `offset.h` from left/right (`LCursor.a:88-99`) **then** call the shield vector with that global rect. Default shield vector may remain a no-op (host composites).
2. **`GetPixel`** (`Util.a:489-507`): `HideCursor`; read the pixel in local port coords (keep the §4.4 bounds check → white/`false` outside); `ShowCursor` in a `finally` so a throw still restores. Do **not** drop the bounds check.
3. Tests: Hide/Show nesting around `GetPixel`; `SetCursor` leaves `obscured`; `ShowCursor` does not increment past 0; installing a shield vector is invoked with the offset-adjusted rect.

## Tests / constraints

- `npx tsc --noEmit -p packages/quickdraw` and `npx vitest run packages/quickdraw/tests` (and `src/os/cursor.test.ts` if you touch the host).
- Follow `.cursor/rules/engineering-philosophy.mdc`.
- Do not commit unless asked.
- Report: files changed, what was already done vs new, test results, assembly ambiguities (file:line).
