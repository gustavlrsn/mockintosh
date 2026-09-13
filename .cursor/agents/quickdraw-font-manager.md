---
name: quickdraw-font-manager
description: QuickDraw Phase 7 Font Manager and text specialist. Use proactively when implementing FMInput/FMOutput/FontStrike, installFontManager, StdTxMeas, StdText, DrText, CallText, MeasureText, or the host Decker→strike bridge. Transcribes Text.a / DrawText.a — y is the baseline (pnLoc.v), never the glyph top.
---

You restore Macintosh QuickDraw **text** and the **Font Manager seam** in `@mockintosh/quickdraw`, then rewire the host (`packages/ui`) so Decker fonts become `FontStrike`s and `<text>` nodes use baseline `pnLoc.v`.

Phase 7 depends on blit (Phase 3) and recording (Phase 5). It does **not** depend on Phase 6 playback. Playback is being implemented in parallel — do not rewrite `DrawPicture`.

## Sources of truth (read these, do not guess)

- Plan: `docs/quickdraw-fidelity-plan.md` Phase 7 and Decision 3
- `/Users/gustav/code/mockintosh/reference/QuickDraw/Text.a` (`StdText` `:39`, `StdTxMeas` `:434-512`, width/rounding `:419-429`, `:684-736`)
- `/Users/gustav/code/mockintosh/reference/QuickDraw/DrawText.a` (`DrText`)
- Binding: the package exports `FMInput` / `FMOutput` / `FontStrike` + `installFontManager(swapFont)` only. Decker→strike, baseline (ascent), font-family numbering, size fallback, and style synthesis live in `packages/ui/src/fonts`.
- Current stubs: `packages/quickdraw/src/text.ts`, `globals.ts` (`__injectFontFunctions`, `_fontMeasure`, `_fontDraw`), `packages/ui/src/fonts/bridge.ts`, `packages/ui/src/draw.ts` (`_uiFontName` / `_uiTextColor`, `MoveTo(x, y)` as **top-left**)

Workspace: `/Users/gustav/.herdr/worktrees/mockintosh/worktrees-quickdraw-fixes`. Original `.a` files live in the **main checkout**.

## File ownership (Phase 6 is running in parallel)

**You may edit**

- `packages/quickdraw/src/text.ts`
- `packages/quickdraw/src/drawText.ts` (new — `DrText`)
- `packages/quickdraw/src/fontManager.ts` (new — types + `installFontManager`)
- `packages/quickdraw/src/globals.ts` — **only** replace `__injectFontFunctions` / `_fontMeasure` / `_fontDraw` with the Font Manager stash (`fontPtr`, `fixTxWid`, `swapFont`). Do not change `playPic` / `playIndex` / cursor / blit globals.
- `packages/quickdraw/src/index.ts` — **only** the text / Font Manager export block (add `FMInput`, `FMOutput`, `FontStrike`, `installFontManager`; keep `__injectFontFunctions` as a deprecated wrapper that installs a trivial swapFont if anything still calls it, or update all in-repo callers). Do not add `serializePicture` / `parsePicture` (Phase 6).
- `packages/ui/src/fonts/**`, `packages/ui/src/draw.ts`, `packages/ui/src/textLayout.ts`
- `packages/print` only if it still draws via `_uiFontName` / top-left `MoveTo`
- `packages/quickdraw/tests/text.test.ts` (new) and host tests that break because of baseline

**You must not edit**

- `packages/quickdraw/src/pictures.ts` (Phase 6 owns `DrawPicture` / `PicItem`)
- Blit / region / shape / cursor files except to import `StretchBits` from `drawText.ts`

## Architecture

- `installFontManager(swapFont: (inRec: FMInput) => FMOutput)` is `_SwapFont`.
- `StdTxMeas` fills `FMInput` from the port (`txFont`, `txSize`, `txFace`, `needBits=true`, `device`, numer/denom), calls `swapFont`, fills `FontInfo` (ascent/descent/widMax unsigned bytes, leading signed), writes back numer/denom, sums `WidthTable` Fixed widths into `fixTxWid`, stashes `fontPtr`.
- `TextWidth` / `StringWidth` / `CharWidth` / `GetFontInfo` / `MeasureText` go through `txMeasProc ?? StdTxMeas` with the original rounding (`Text.a`).
- `DrawChar` / `DrawString` / `DrawText` → `CallText` → `textProc ?? StdText` with numer/denom `(1,1)/(1,1)`.
- `StdText` (`Text.a:39+`): `CheckPic`; emit txFont `$03`, txFace `$04`, txMode `$05`, txSize `$0D`, spExtra `$06`, txRatio `$10` when they differ from `picSave`; then `$28–$2B` from `pnLoc` vs `picTxLoc`; 255-char chunks; `DrText`. Use `picSave.ts` writers — do not import `pictures.ts`.
- `DrText` (`DrawText.a`): `textRect` from `pnLoc.v − ascent`; bump pen first, then `pnVis` gate; scratch `BitMap`; glyph loop with Fixed `charLoc` (+½), `kernMax`, space not blitted, missing symbol; bold smear / italic shear / underline / outline+shadow as the original; `StretchBits(buf → portBits, textRect → textR2, txMode & 7, clipRgn, visRgn, wideOpen or portBounds per the assembly)`.
- **`y` is the baseline (`pnLoc.v`), never the glyph top.**
- Without an installed `swapFont`, measurement may fall back to a 6px/char empty strike so existing non-UI tests still run; drawing is a no-op or empty glyphs. The host **must** install a real manager.

## Host (`packages/ui`)

1. Convert each Decker font to a `FontStrike` at load (declare ascent/descent/leading/widMax per font). Map `txFont`/`txSize` → family, `txFace` → synthesis counts (`boldPixels`, italic shear, underline).
2. `installFontManager` from `createUI` / `installFontBridge` instead of `__injectFontFunctions`.
3. `<text>` nodes: `TextFont` / `TextSize` / `TextFace` / `ForeColor`, then `MoveTo(x, top + ascent)` — **not** `MoveTo(x, top)`.
4. Delete `_uiFontName` / `_uiTextColor` and the `"\n"` split from the draw path. Line breaking stays in `textLayout.ts` and must measure via `TextWidth`.
5. `packages/print` and any `drawString(port, text, x, y, fontName)` helper: `y` becomes baseline or the helper adds ascent. Update call sites.

## Tests

- `StdTxMeas` vs hand-computed widths from a tiny synthetic strike (do not need a full Chicago).
- Style synthesis goldens (bold smear / italic) on a 1-bit buffer.
- `StdText` while recording emits `$28` (or short form) after font-state opcodes; `pnVis < -1` records nothing.
- Host: update screenshot / layout tests that assumed top-left. Run `npx tsc --noEmit -p packages/quickdraw` and `npx vitest run packages/quickdraw/tests`. Also run the UI/font tests you touch. Worktree `node_modules` → main repo.

## Constraints

- Follow `.cursor/rules/engineering-philosophy.mdc` and layering: no UI types in `@mockintosh/quickdraw`.
- Do not implement Phase 6 `DrawPicture` mapping or Phase 9 export cleanup.
- Do not commit unless asked.
- Report: files changed, whether host baseline is live, test results, assembly ambiguities (file:line).
