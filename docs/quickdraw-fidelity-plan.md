# QuickDraw Fidelity Review and Restoration Plan

`packages/quickdraw` is meant to be a line-for-line re-write of Bill Atkinson's
1984 QuickDraw (`reference/QuickDraw/*.a`, `*.p`) in TypeScript. This document
records every place the current port departs from the original and lays out
the order in which to restore it, so that the only remaining differences are
those forced by the language and by what the original delegated to the ROM/OS.

Review method: each original subsystem was read in full and compared against
the corresponding `src/*.ts` file. Numeric claims (Random, MapPt rounding,
DrawArc arithmetic, Angles tables, line rasterisation) were checked by running
the port against a transcription of the assembly. File:line references below
point at `reference/QuickDraw/` for the original and `packages/quickdraw/src/`
for the port.

---

## 1. Verdict in one paragraph

The port keeps the original's *names* and its *public signatures* but not its
*architecture*. Three load-bearing mechanisms of QuickDraw are absent —
(1) the `RgnBlt`/`SeekRgn` clipped-blit pipeline every primitive drains into,
(2) the packed XOR-delta region encoding that pipeline consumes, and (3) the
recording layer (`picSave`/`rgnSave`/`polySave`) that every `Std*` proc writes
to before it draws. In their place are a per-rectangle bounding-box clipper
with a per-pixel fallback, a per-row explicit region list, and nothing. Most of
the ~140 individual deviations catalogued below are consequences of those three
substitutions. A fourth structural substitution — text as a string-based host
callback instead of the Font Manager seam — is the one host-facing change that
cannot be made inside the package alone.

---

## 2. Root causes (architectural deviations)

These explain the bulk of the itemised findings in §3. Fixing them is the plan.

### R1. No `RgnBlt` pipeline; `portRect` added to the clip

Original: every primitive ends in `RgnBlt(srcBits, dstBits, srcRect, dstRect,
mode, pat, rgnA, rgnB, rgnC)` (`RgnBlt.a:15`). It clips to `dstBits.bounds`
and the three regions' bboxes (`RgnBlt.a:135-144`) — **never `portRect`** —
then either fast-paths to `BitBlt` if all three regions are rectangular (or
`TrimRect` says the visRgn∩rect is), or builds a per-scanline mask with
`SeekRgn`, updated only on rows where a region changes, and applies one of
eight long-wide mode loops under that mask.

Port: `drawRectToPort`/`drawHSpan` (`bitblt.ts:255-304`) with `intersectClip`
that also clips to `portRect` (`bitblt.ts:80-84`), and a per-pixel
`pointInRegion` fallback whenever either region is non-rectangular. No third
region, so `CopyBits`+`maskRgn` and `ScrollRect` each reinvent masking.
Nothing calls `ColorMap`; `patAlign`/`patStretch` are ignored.

### R2. Region encoding is per-row absolute, not packed XOR-delta

Original (`PackRgn.a:13-19`): `rgnSize`, `rgnBBox`, then rows
`V H … H 32767`, terminated by `V=32767`. Only rows where the scanline shape
*changes* are stored; each row's H list is the XOR-delta from the row above.
`rgnSize == 10` ⇔ rectangular. `PtInRgn` toggles over *all* rows with
`V ≤ pt.v`. Canonical form is guaranteed by `SortPoints`→`CullPoints`→`PackRgn`.

Port (`types.ts:224-235`): `scanlines?: {y, xs}[]`, one entry per populated
row, absolute inversion list. `rgnSize` is never maintained. `isRect()` keys on
`scanlines` presence. Consequences: `SectRgn(wideOpen, …)` expands 65 534 rows;
`InsetRgn` is geometrically wrong for complex regions; `MapRgn` produces
duplicate rows; `EqualRgn` is structural not pixel-set; pictures cannot carry
regions.

### R3. The recording layer does not exist

Original: `StdLine` → `CheckPic`/`PutPicVerb` → `DoLine` → (polySave ? append
to `thePoly` : rgnSave ? `PutLine` into `rgnBuf`) → `DrawLine` (which alone
tests `pnVis`) → `pnLoc := newPt` (`Lines.a:19-213`). `StdRect/Oval/RRect/
Arc/Poly/Rgn/Text/Bits` all begin with `CheckPic`+`PutPicVerb`+noun opcode, and
FRAME verbs call `PutRect`/`PutOval`/`PutRgn` when `rgnSave`.
`Open{Rgn,Poly,Picture}` call `HidePen`; `Close*` call `ShowPen`.

Port: no `Std*` proc references `picSave`, `rgnSave` or `polySave`. There is no
`DoLine`, `PutLine`, `PutRect`, `PutOval`, `PutRgn`, `CheckPic`, `PutPicVerb`,
`PutPicRect`, `PutPicRgn`, `PutPicData`. `OpenRgn…CloseRgn` always yields an
empty region; `OpenPoly…ClosePoly` an empty polygon; `OpenPicture…ClosePicture`
the bytes `[0x00, 0xFF]`. None of the `Open*` hide the pen.

### R4. Text is a string callback, not the Font Manager seam

Original: the *only* contact with the Font Manager is `_SwapFont`
(`Text.a:601`, `GrafTypes.a:372-375`): QuickDraw fills an `FMInput`
(family, size, face, needBits, device, numer, denom) and receives an
`FMOutput` (fontHandle → strike bitmap in FONT layout, bold/italic/ulThick/
shadow synthesis counts, extra, ascent/descent/widMax/leading, adjusted
numer/denom) plus a 256-entry Fixed width table. `DrText` then lays glyphs into
a scratch bitmap, synthesises styles, and `StretchBits` it through the clip.

Port: `globals._fontDraw(text, x, y, port)` / `_fontMeasure(text)`
(`globals.ts:83-90`) injected by `packages/ui/src/fonts/bridge.ts`, which reads
ad-hoc `port._uiFontName`/`port._uiTextColor`, treats `pnLoc.v` as the glyph
*top* rather than the baseline, splits on `"\n"`, ignores `txFont/txSize/
txFace/txMode/spExtra/numer/denom`, and clips by bbox (+`portRect`).
`GetFontInfo` is hard-coded to 9/3/8/2.

### R5. Line rasteriser is Bresenham pen-stamping, not the slab algorithm

Original (`DrawLine.a:235-519`): sort endpoints by v; fixed-point
`LEFTEDGE = h1 + ½`, `RIGHTEDGE = LEFTEDGE + pnSize.h`; `slope =
FixRatio(dh,dv)`; edges advanced by `slope/2` then biased by slope class; each
scanline of the swept parallelogram drawn **once** as `[LEFT.int, RIGHT.int)`.
H/V lines are a single rect fill. Pen size ≤ 0 draws nothing. Mode outside
8..15 draws nothing.

Port (`lines.ts:226-261`): integer Bresenham stamping `pnSize` rects at each
step; `Math.max(1, pnSize)` clamp; no mode gate. Different pixels even for
1×1 hairlines; overlapping stamps double-invert under `patXor`.

### R6. Verb dispatch and pen-state gates diverge

- `Fill*` in the original copies `pat` into `thePort^.fillPat` *before*
  dispatch, and `Std*` read `fillPat` from the port (`Rects.a:115-123`,
  `PushVerb` `:91`). Port threads an extra `fillPat?` argument through
  `StdRect/StdOval/StdArc/StdRRect/StdPoly/StdRgn` and only writes
  `port.fillPat` on the `grafProcs` branch.
- `pnVis < 0` is tested in `DrawRect`, `FrRect`, `DrawRgn`, `DrawArc`,
  `DrawLine`, `DrawPoly`, `StdBits`, `ScrollRect`, `DrText`. Port tests it only
  in `StdLine` — and there it short-circuits *recording* too.
- Pen size is used raw everywhere in the original; port clamps to ≥1 in
  `StdRect`, `StdRgn`, `drawArcLoop`, `StdLine`.
- Original `LineTo` is a pure `JMP` to `lineProc`/`StdLine`; port forces
  `pnLoc` after the bottleneck.
- `CopyBits` in the original dispatches to `bitsProc`/`StdBits`, which then
  calls `StretchBits`. Port inverts this: `StdBits` calls `CopyBits`, and
  `CopyBits` never consults `bitsProc`. Same inversion for `PicComment` →
  `commentProc`/`StdComment`, and `DrawString` → `textProc`/`StdText`.

### R7. Handle identity is not preserved

`SetClip`, `ClipRect`, `GetClip`, `CopyRgn`, `SetPortBits`, `BackPat` replace
the object stored in the port rather than copying *into* the existing handle
(`GrafAsm.a:454-477`, `Regions.a:333-372`). Anyone holding the previous handle
(the Window Manager, `picSave.picClipRgn`) sees stale data.

### R8. Missing globals and a missing `ColorMap`

`patAlign`, `fixTxWid`, `fontPtr`, `playPic`, `playIndex`, `wideMaster/
wideData` (`GrafTypes.a:264-289`) are absent. `fgColor/bkColor/colrBit` are
stored but never read: `ColorMap` (`Util.a:406-475`), which every blitter calls
and which is the 1-bpp colour-separation mechanism `TestGraf.p:910-934`
exercises, does not exist.

---

## 3. Catalogue of deviations by subsystem

Classification: **MISSING** (original behaviour absent), **SIMPLIFIED**
(different algorithm, different or degraded result), **ADDED** (behaviour the
original does not have), **BUG** (produces wrong output today), **ADAPTED**
(forced by JS or by the host boundary — see §4 for which of these are accepted).

### 3.1 GrafPort, globals, points, rects, utilities, fixed-point

| Item | Original | Port | Class |
|---|---|---|---|
| InitGraf resets all private globals (`GrafAsm.a:29-46`) | clears rgnBuf/rgnIndex/thePoly/polyMax/patAlign/… | only `_screen`, `screenBits`, `randSeed`, `thePort` | MISSING |
| screenBits via `_GetScrnBits` | 14-byte BitMap from trap | `QDScreen {width,height,bits?}` + `globals._screen` | ADAPTED (accept: take a `BitMap`) |
| `wideOpen/wideMaster/wideData` | fake handle chain in globals | single handle object | ADAPTED (accept) |
| OpenPort (`GrafAsm.a:96-103`) | `NewRgn` ×2 then InitPort | pre-shaped regions built inline | SIMPLIFIED |
| InitPort regions (`:125-132`) | `RectRgn(visRgn)`, `CopyRgn(wideOpen, clipRgn)` | assigns bbox, leaves `rgnSize` stale | BUG (latent) |
| ClosePort (`:168-177`) | dispose regions, does not touch `thePort` | clears `thePort` | ADDED |
| `newGrafPort()` | — | duplicates InitPort defaults inline | ADDED |
| SetClip / ClipRect / GetClip (`:435-477`) | `CopyRgn`/`RectRgn` **into** existing handle | replaces handle object | BUG (R7) |
| SetOrigin (`:418-424`) | `OffsetRgn(visRgn)` | offsets `rgnBBox` only, not scanlines | BUG |
| BackPat / SetPortBits | copy bytes in place | replace object | SIMPLIFIED (R7) |
| ScalePt (`Pictures.a:1697-1718`) | skip if from==to; input ≤0 → 0; `(x·to + from/2) div from`, **min 1** | `Math.round(x·tW/fW)` | BUG |
| MapPt (`:1759-1785`) | skip if from==to; round-half-**away-from-zero** on magnitude | `Math.round` (half toward +∞) | BUG (negative side) |
| MapRect (`:1798-1803`) | `MapPt` ×2 | inlined, inconsistent zero-extent handling | SIMPLIFIED |
| Random (`Util.a:174-177`) | low word `== -32768` → return 0 | returns −32768 | BUG |
| Random seed 0 / ≥2³¹ | 16-bit-word decomposition handles any 32-bit seed | Schrage variant diverges on degenerate seeds | SIMPLIFIED |
| BitAnd/Or/Xor/Not | signed LongInt | `>>> 0` unsigned | ADAPTED (make signed) |
| BitShift count ≥32 (`:61-71`) | 68k shift count mod 64 → 0 | JS mod 32 | BUG (edge) |
| HiWord / LoWord | signed INTEGER | `& 0xffff` unsigned | BUG |
| FixMul | ROM saturates on overflow | wraps (`\| 0`) | SIMPLIFIED |
| LongMul | VAR `Int64Bit` out | returns value; doc says unsigned, code signed | ADAPTED (fix doc) |
| GetPixel (`:489-507`) | Hide/ShowCursor, no bounds check | bounds-checked, no cursor | ADAPTED (accept bounds check) |
| StuffHex | `ch>'9' → +9, &F`, even-truncate | `parseInt`, even-truncate | ADAPTED (accept) |
| ForeColor/BackColor/ColorBit | store; consumed by `ColorMap` | store; nothing consumes | MISSING (R8) |
| `thePort === null` guards everywhere | would fault | silent return | ADDED (policy decision, §4) |
| `picSave/rgnSave/polySave` types | private save records (`GrafTypes.a:206-232`) | public `PicHandle/RgnHandle/PolyHandle` | SIMPLIFIED |
| Constants, patterns, arrow cursor, InitPort field defaults, SetPort/GetPort/GrafDevice/PortSize/MovePortTo, Add/Sub/Set/EqualPt, LocalToGlobal/GlobalToLocal, SetRect/EqualRect/EmptyRect/OffsetRect/InsetRect/SectRect/UnionRect/PtInRect/Pt2Rect | | | **faithful** |

### 3.2 Regions (`Regions.a`, `RgnOp.a`, `RgnBlt.a`, `PutRgn.a`, `PackRgn.a`, `SeekRgn.a`, `SortPoints.a`)

| Item | Original | Port | Class |
|---|---|---|---|
| Data format | packed XOR-delta `Int16` stream, `rgnSize` exact | per-row absolute `scanlines`, `rgnSize` unmaintained | ADAPTED→ must revert (R2) |
| Rectangularity test | `rgnSize == 10` | `scanlines` absent/empty | ADDED state |
| OpenRgn (`Regions.a:266-286`) | flag, `rgnBuf := NewHandle(256)`, **HidePen** | creates accumulator handle, no HidePen | MISSING |
| CloseRgn (`:289-329`) | **ShowPen**, `SortPoints`, `CullPoints`, `PackRgn`; empty → `(0,0,0,0)` | per-row parity, no ShowPen, empty leaves stale bbox | MISSING / BUG |
| Contributors to open region | `PutLine` (lines, polys), `PutRect`, `PutOval` (ovals, rrects), `PutRgn`; **not** arcs | none — `rgnBuf` never written | MISSING (R3) |
| Sect/Union/Diff/Xor (`:649-839`, `RgnOp.a`) | `DoRgnOp` shortcuts (EqualRgn, empty, bbox, rect∩rect) then one merged scanline walk with A/B state machine | four per-row Map implementations; rect regions expanded to one entry per row; odd-length rows silently dropped | SIMPLIFIED + perf BUG |
| InsetRgn (`:483-595`) | `InsetScan` per axis + V/H transpose, spans shrink/merge | filters rows/points to new bbox; spans never shrink | **BUG** |
| MapRgn (`:1076-1165`) | unpack → `MapPt` each point → Sort/Cull/Pack | maps rows independently → duplicate `y` on shrink | **BUG** |
| SetRectRgn (`:390-423`) | empty rect → bbox `(0,0,0,0)` | stores verbatim | BUG |
| EqualRgn (`:613-645`) | byte compare of canonical form | structural compare; non-canonical inputs break it | SIMPLIFIED |
| RectInRgn (`:907-1002`) | `SeekRgn` rows, test span overlap | per-pixel over entire `r` | SIMPLIFIED (perf) |
| StdRgn (`:17-64`) | `CheckPic`/`PutPicVerb`/`$80+verb`/`PutPicRgn`; FRAME with rgnSave → `PutRgn` | no recording | MISSING |
| DrawRgn / FrRgn (`:146-228`) | `pnVis` check; FRAME = `CopyRgn`→`InsetRgn(pnSize)`→`DiffRgn`→`DrawRgn` (8-neighbour, pen-sized) | no `pnVis`; FRAME rect path 4 rects with clamp, complex path 4-neighbour edge detect ignoring pen size | BUG |
| TrimRect (`:1006-1072`) | rect-visRgn fast path | absent | MISSING |
| `RGNREC`/`InitRgn`/`SeekRgn` | per-region scan state | absent | MISSING (R1) |
| NewRgn, EmptyRgn, OffsetRgn, PtInRgn (under port format) | | | faithful |
| DisposeRgn, CopyRgn (as deep copy) | | | ADAPTED (accept; CopyRgn must copy *into* dst — R7) |

### 3.3 Lines and pen (`Lines.a`, `DrawLine.a`, `PutLine.a`)

| Item | Original | Port | Class |
|---|---|---|---|
| Picture recording (`Lines.a:30-88`) | `CheckPic`, `PutPicVerb(FRAME)`, `$20-$23` with from/short selection, `picPnLoc` | none | MISSING |
| Region recording (`:198-205`, `PutLine.a`) | `PutLine` centre-path inversion points; vertical lines ignored; fixed-point slabs | none | MISSING |
| Polygon recording (`:175-193`) | first LineTo pushes `oldPt` then `newPt`; poly takes precedence over rgn | none | MISSING |
| `pnVis` placement | tested only in `DrawLine`; recording proceeds | `StdLine` returns early | BUG (latent) |
| Rasteriser (`DrawLine.a:235-519`) | slab algorithm, each pixel once | Bresenham stamping | SIMPLIFIED + BUG (XOR) |
| H/V lines (`:195-230`) | one rect fill | stamping | BUG (XOR) |
| Pen size ≤ 0 (`:256-260`) | nothing drawn | `Math.max(1, …)` | ADDED |
| Mode outside 8..15 (`:78-81`) | nothing drawn | drawn as `mode & 7` | ADDED |
| `portRect` clip | not consulted | consulted | ADDED (R1) |
| ColorMap (`:88-95`) | applied | absent | MISSING |
| patAlign/patStretch (`Util.a:284-388`) | applied in `PatExpand` | absent | MISSING |
| LineTo (`Lines.a:103-110`) | pure dispatch | forces `pnLoc` after `lineProc` | ADDED |
| `StdLine(port, newPt)` | `StdLine(newPt)` on thePort | extra param | ADAPTED (revert) |
| Hide/ShowPen, GetPen, Get/SetPenState, PenSize/Mode/Pat, PenNormal, MoveTo, Move | | | faithful |

### 3.4 Rects, ovals, round-rects, arcs, angles (`Rects.a`, `Ovals.a`, `RRects.a`, `Arcs.a`, `DrawArc.a`, `PutOval.a`, `Angles.a`)

| Item | Original | Port | Class |
|---|---|---|---|
| Picture recording (all four) | `CheckPic`, `PutPicVerb`, `PutPicRect` w/ same-rect `+8`, `$0B` ovSize, arc angle words | none | MISSING |
| Region recording (FRAME) | `PutRect`; `PutOval` for oval/rrect; arcs excluded | none | MISSING |
| `pnVis` | checked in `DrawRect`/`FrRect`/`DrawArc` | never | MISSING |
| `Fill*` → `port.fillPat` | always stored before dispatch | only on grafProcs branch; `fillPat?` param | SIMPLIFIED + BUG |
| StdRect empty early-out | none (still records) | `rects.ts:222` | ADDED |
| FrRect big pen (`Rects.a:264-277`) | `h2≥h3 ∨ v2≥v3` → paint whole rect once | four overlapping rects | BUG (XOR) |
| FrRect pen clamp | raw pnSize | `Math.max(1, …)` | ADDED |
| InitOval edges (`DrawArc.a:947-959`) | `left + ovWd/2`, `right − ovWd/2 + ½` (keeps .5 for odd) | centre without ovalWidth | **BUG** |
| BumpOval borrow (`:1067-1074`) | `SUBX` borrow = `oldLo <ᵤ subLo` | compares result with subtrahend | **BUG** |
| Hollow rows outside inner range (`:664-696`) | drawn solid | inner span subtracted | **BUG** |
| flag1/flag2 sign for ≥180° (`:337-353`) | `270 − ang` | `−(270 − ang)` | **BUG** |
| Hollow >180° wrap slabs (`:735-759`) | two-way if/else-if with specific endpoints | wrong endpoints, second case absent | **BUG** |
| Mode 8..15 gate (`:117-121`) | present | absent | ADDED |
| Inner-oval pen clamp | raw | `Math.max(1, …)` | ADDED |
| StdRRect (`RRects.a:62-84`) | **one** `DrawArc` pass with `ovWd/ovHt` (skipTop/skipBot) | four quarter-arcs + rects; corner start angles select the *inner* quadrants | SIMPLIFIED + **BUG** |
| SlopeFromAngle byte table (`Angles.a:94-121`) | indexed `SLOPE−91`, byte[64]=`$02` | off by one (`$01` at 64) | **BUG** |
| SlopeFromAngle `OR.B #$7F` for 90° (`:65-67`) | present | absent | **BUG** |
| SlopeFromAngle sign 91..179 (`:54-72`) | positive | always negative (`negate` unused) | **BUG** |
| AngleFromSlope (`:11-35`) | compares positive magnitudes | compares negative → returns 89/91 always | **BUG** |
| Arc normalisation, midVert swap, skipFlag, aspect/slope maths, PtToAngle structure, SLOPE word table | | | faithful |

### 3.5 Polygons (`Polygons.a`)

| Item | Original | Port | Class |
|---|---|---|---|
| OpenPoly / ClosePoly (`:167`, `:250`) | HidePen / ShowPen | neither | MISSING |
| ClosePoly bbox (`:214-240`) | tight (`bottom = maxV`, `right = maxH`) | `+1` | BUG |
| `polySize` | live `10 + 4n`, drives every consumer | fixed 10 | SIMPLIFIED |
| Point capture | in `DoLine` | nowhere — polys always empty | MISSING (R3) |
| StdPoly recording (`:35-44`) | `$70+verb` + raw record | none | MISSING |
| FrPoly (`:342-372`) | `MoveTo(p0)` + `DoLine`, pen left at last vertex | saves/restores `pnLoc`, calls `StdLine` | ADDED |
| DrawPoly fill (`:376-414`) | `pnVis`; `OpenRgn; FrPoly; DoLine(p0); CloseRgn; DrawRgn` | float scanline rasteriser, `Math.round`, no auto-close, no `pnVis`, no pen move | SIMPLIFIED + BUG |
| RSect pre-check (`:53-64`) | present | absent | SIMPLIFIED |
| FillPoly → `port.fillPat` | always | grafProcs branch only | SIMPLIFIED |
| MapPoly (`:290-338`) | `MapRect` + `MapPt` | inlined closures, `Math.round` | SIMPLIFIED |
| OffsetPoly, KillPoly | | | faithful / ADAPTED |

### 3.6 Bit transfer (`BitBlt.a`, `Bitmaps.a`, `Stretch.a`, `RgnBlt.a`)

| Item | Original | Port | Class |
|---|---|---|---|
| Pipeline | `RgnBlt` 3-region mask | `drawRectToPort` bbox + per-pixel | SIMPLIFIED (R1) |
| `portRect` clip | never | always | ADDED |
| TrimRect fast path | present | absent | SIMPLIFIED |
| `pnVis` in StdRect/StdRgn/StdBits/ScrollRect | checked | not | MISSING |
| BitBlt extents (`BitBlt.a:102-106`) | from `dstRect` only | `min(src, dst)` | ADDED |
| Mode decode | bit2 invert, bit3 pattern, `&3` op | same | faithful |
| Negative mode | quit | draws | ADDED (minor) |
| patAlign (`Util.a:313-325`) | pattern anchored to dst local origin shifted by global `patAlign` | local only | MISSING |
| patStretch (`:327-385`) | ×2 / thinned ×2 | ignored | MISSING |
| ColorMap | at head of every blit | absent | MISSING |
| CopyBits dispatch (`Bitmaps.a:189-275`) | to-port test (baseAddr **and** bounds.topLeft) → `bitsProc`/`StdBits` → `StretchBits` | never consults `bitsProc`; `StdBits` calls `CopyBits` | **BUG** |
| CopyBits not-to-port | clip to `dstBits.bounds` + mask only | same | faithful |
| StdBits recording (`:47-167`) | `$90/$91/$98/$99`, trimmed `srcBits`, `PackBits` | none; no `PackBits`/`UnpackBits` | MISSING |
| maskRgn row pre-check | — | `pointInRegion(maskRgn, 0, dy)` skips rows | **BUG** |
| StretchBits (`Stretch.a`) | vertical DDA, shrink **ORs** rows/bits, stretch replicates, `err = ratio/2`; phase anchored to unclipped dstRect | float nearest-neighbour floor sampling | SIMPLIFIED |
| Modes 8–15 to CopyBits | undefined / quit | treated as 0–7 | ADAPTED (document) |
| ScrollRect (`Bitmaps.a:759-884`) | `pnVis`; `(0,0)` → empty updateRgn; `srcRgn = dstRect∩vis∩clip`; `updateRgn = srcRgn − shifted`; `RgnBlt` clipped to both; erase updateRgn with bkPat; pnLoc untouched | unclipped `BitBlt` (can index outside buffer), strips erased, `updateRgn := dstRect` | **BUG** |
| Overlap direction (`BitBlt.a:167-193`) | compares memory rows (`top − bounds.top`) | compares local tops | BUG (edge) |
| Horizontal overlap | right-to-left walk | row snapshot | ADAPTED (accept) |
| SetStdProcs | 13 `Std*` addresses | lambdas; `bitsProc`→`CopyBits`; `commentProc`→inline no-op | SIMPLIFIED |
| rowBytes | even, `< 0x8000` | `rowBytesFor` word-rounds | faithful |
| Cursor shielding | `ShieldCursor` around every screen touch | none (host-composited) | ADAPTED (§4/§6) |

### 3.7 Text (`Text.a`, `DrawText.a`)

| Item | Original | Port | Class |
|---|---|---|---|
| Font Manager seam | `FMInput`→`_SwapFont`→`FMOutput` + strike + width table | `_fontDraw(text,x,y,port)`, `_fontMeasure(text)` | ADAPTED → wrong seam (R4) |
| Layering | DrawText → `textProc` → StdText → DrText | StdText → DrawText; DrawText never consults `textProc` | **BUG** |
| TextWidth/StringWidth/CharWidth/GetFontInfo | via `txMeasProc`/`StdTxMeas`, rounding rules `Text.a:419-429, 707-736` | `_measureString` directly | **BUG** |
| StdTxMeas (`Text.a:434-512`) | fills `info`, writes back VAR numer/denom, stashes `fontPtr`/`fixTxWid` | ignores all three | MISSING |
| GetFontInfo | from FMOutput + extra/shadow/scaling | hard-coded 9/3/8/2 | SIMPLIFIED |
| numer/denom scaling | pen advance truncated, blit via `MapRect`/`StretchBits` | ignored | MISSING |
| txMode | `txMode & 7` into StretchBits; shadow forces XOR | ignored | MISSING |
| txFace synthesis (`DrawText.a:664-907`) | bold smear, italic shear 1/16px per row, underline mask w/ halo, shadow/outline via bold+XOR | ignored | MISSING |
| spExtra | folded into `WidthPtr[32]` by FM; recorded to pictures | stored only | MISSING |
| txFont/txSize/device | FMInput | `port._uiFontName` bolted on by host | ADDED (non-faithful) |
| Baseline | `textRect.top = pnLoc.v − ascent` | `y` is glyph top | **BUG** |
| `pnVis` | pen bumped, then quit if hidden | draws regardless | BUG |
| Picture recording (`Text.a:65-204`) | `$03-$06,$0D,$10`, `$28-$2B` with `picTxLoc` delta, 255-chunking | none | MISSING |
| Pen advance | `fixTxWid` integer part, scaled/truncated | host measure (adds spacing after last glyph) | SIMPLIFIED |
| Clipping | exact regions via StretchBits; no `portRect` | bbox + `portRect` | SIMPLIFIED + ADDED |
| `"\n"` handling | none (byte 10 is a char) | line break | ADDED |
| Space char | never blitted | glyph 32 drawn | SIMPLIFIED |
| Missing glyph | `lastChar+1` slot | `'?'` | ADAPTED |
| `MeasureText` | present (`Text.a:517-592`) | absent | MISSING |
| Setters TextFont/Face/Mode/Size/SpaceExtra; Style bit values | | | faithful |

### 3.8 Pictures (`Pictures.a`)

| Item | Original | Port | Class |
|---|---|---|---|
| Recording by drawing procs | `CheckPic`/`PutPicVerb`/`PutPicRect`/`PutPicRgn`/`PutPicData` delta-encoded against a `PicSave` snapshot | none — pictures are `[0x00, 0xFF]` | MISSING (R3) |
| OpenPicture (`:181-287`) | reject nested; `HidePen`; `ClipRect(picFrame)` if clip is wideOpen; `PicSave` snapshot; `$11 01` | writes `0x00` NOP; none of the rest | BUG + MISSING |
| ClosePicture (`:291-318`) | `$FF`, trim, dispose picClipRgn, `ShowPen` | no ShowPen | MISSING |
| PicComment (`:164-178`) | → `commentProc`/`StdComment` → `PutPicData` | writes directly; `StdComment` is a no-op | BUG |
| StdPutPic (`:93-160`) | grows handle, updates `picSize` on every write, dead-picture flag | push bytes | SIMPLIFIED |
| Playback reads | `GetPicData` → `getPicProc`/`StdGetPic`, `playPic`/`playIndex` | direct `_data` index | MISSING (bottleneck) |
| DrawPicture mapping (`:382-414`, `GETRECT`, `MapPt/MapRgn/MapPoly/ScalePt`) | picFrame→dstRect for every opcode | `dstRect` ignored | MISSING |
| Port save/reinit/restore (`:421-485`, `:509-519`) | full port copy, defaults, `patAlign` | none — playback mutates caller's port permanently | MISSING |
| `$0C` origin (`:777-794`) | **delta** into `fromRect` and `patAlign`; clip re-derived | `SetOrigin(dh,dv)` absolute, mutates portRect/visRgn | **BUG** |
| `$01` clipRgn (`:678-693`) | full region, `MapRgn`, `SectRgn` with user clip | bbox only, `ClipRect` replaces | BUG |
| `$0A thePat`, `$10 txRatio`, `$11 version`, `$70-$74`, `$80-$84`, `$90/$91/$98/$99` | handled | absent → hit `default` | MISSING |
| Unknown opcode | NOP, continue | terminates playback | ADDED |
| Text `$29-$2B` (`:854-896`) | offsets from `textLoc` (last text *start*), `textProc(count, buf, numer, denom)` | offsets from advanced `pnLoc`; calls `DrawText` | **BUG** |
| Arc angles | signed word | `readWord()` unsigned | BUG |
| `spExtra` | signed long | `readLong() >>> 0` | BUG |
| `Picture {picSize, picFrame, _data}` | one byte handle | structured | ADAPTED (accept; add (de)serialiser) |
| KillPicture | dispose | no-op | ADAPTED |
| Memory ABORT path | present | n/a | ADAPTED |

### 3.9 Cursor (`LCursor.a`)

`LCursor.a` is glue: every routine jumps through low-memory vectors (`$800-$81C`)
into the ROM cursor engine, which is **not** in the reference source. So the
port's choice to expose `cursorState` for a host compositor (`src/os/cursor.ts`
does two `CopyBits`, `srcBic` then `srcOr`, as the ROM did) is the correct
*kind* of adaptation. Deviations within that adaptation:

| Item | ROM / glue | Port | Class |
|---|---|---|---|
| ShowCursor | saturates at level 0 (IM I-168) | increments past 0 | BUG |
| SetCursor | does not un-obscure | clears `obscured` | ADDED |
| ShieldCursor (`LCursor.a:81-105`) | rect-intersection hide, called by every blitter | absent | MISSING (as a vector) |
| Hide/Show around GetPixel and blits | present | none (moot while host-composited) | ADAPTED |

### 3.10 Surface the port ADDED that the original has no counterpart for

`newGrafPort`, `QDScreen`, `globals._screen/_fontMeasure/_fontDraw`,
`__injectFontFunctions`, `cursorState`/`CursorState`, `makePoint/makeRect/
cloneRect`, `bitMapFromPixels/pixelsFromBitMap/bitMapWidth/bitMapHeight/
clearBitMap/getBit/setBit/newBitMap/rowBytesFor`, exported `BitBlt/BitBltSlow/
samplePattern/drawRectToPort/drawHSpan`, `Region.scanlines`, `Picture._data`,
`OvalRec/initOval/bumpOval` exports, `FRAME/PAINT/ERASE/INVERT/FILL` constants
(GrafTypes.a has them; QuickDraw.p uses the enum — keep). Host code
(`packages/ui`, `packages/print`, `src/os`) currently imports: `newBitMap`,
`getBit`, `setBit`, `bitMapWidth/Height`, `bitMapFromPixels`,
`pixelsFromBitMap`, `makeRect`, `cloneRect`, `globals`, `cursorState`,
`newGrafPort` (test only), `__injectFontFunctions`, `InitGraf`.

---

## 4. Adaptations that are legitimate and should stay

A faithful port in another language is not a byte-for-byte emulation. The
following are accepted deviations; everything not on this list should match the
original exactly.

1. **Memory model.** Handles become object references; `NewHandle/SetSize/
   DisposHandle` become allocation/GC; growth-in-chunks (`polyMax`, `rgnMax`,
   `picMax`) is dropped. `Kill*/Dispose*` may be no-ops. The 16-bit size cap of
   `QuickGlue.a` is not reproduced.
2. **Word size.** 16-bit wraparound of coordinates is not emulated, *except*
   where the original relies on fixed-point 16.16 arithmetic (`FixRatio`,
   `FixMul`, `|0` wraps in `DrawArc`/`DrawLine`/`PutLine`) — those must use
   `fixmath.ts` and `|0` to reproduce rounding exactly.
3. **Traps → functions.** `_LongMul/_FixMul/_FixRatio` are implemented locally
   with ROM semantics (saturation, signed HiWord/LoWord). VAR parameters become
   in-place mutation of the passed object; `GetPort` may return a value.
4. **Memory safety.** Where the original would read/write arbitrary memory
   (`GetPixel` out of bounds, `StdGetPic` past the end, `CopyBits` source
   outside `srcBits.bounds`), the port bounds-checks and returns white / zero.
   Where the original would *trap* (divide by zero in `MapPt` with a zero
   extent, nil `thePort`), the port may throw or return — but this must be a
   single documented policy, not per-function ad-hoc guards.
5. **OS-provided seams.** Three things were outside QuickDraw in 1984 and stay
   outside: the screen (`_GetScrnBits`), the Font Manager (`_SwapFont`), and
   the cursor engine (`$800` vectors). The port exposes each as an explicit
   injection point with the **original record shapes** (`BitMap`, `FMInput`/
   `FMOutput`+strike, cursor vectors), not with convenience callbacks.
6. **Performance-only paths.** Word-wide `BitBlt` fast paths, `FASTFLAG`/
   `MODEMAP` in `DrawArc`, `StretchBits` table cases, and the `_StackAvail`-
   driven recursion in `DrText` may be omitted or replaced **provided the
   pixel output is identical**. `TrimRect` is *not* on this list: it changes
   which path runs but not pixels, so it is optional — but cheap and worth
   having.
7. **Region and picture byte layout.** The region must use the packed
   inversion-point encoding (it is semantically load-bearing and appears in
   pictures). It may live in an `Int16Array` rather than raw bytes. `Picture`
   may be a record `{picSize, picFrame, data}` with a `serialize/parse` pair
   producing exact PICT v1 bytes.
8. **Pixel helpers.** `packedBits.ts` (`getBit/setBit/newBitMap/rowBytesFor/
   bitMapFromPixels/pixelsFromBitMap`) is a host utility, not QuickDraw. Keep it,
   but move it to a clearly non-QD export path (e.g. `@mockintosh/quickdraw/
   bits`) so the main export surface is exactly `QuickDraw.p`.

Everything in §3 marked ADDED, SIMPLIFIED, BUG or MISSING that is not covered
by these eight points is in scope for removal or restoration.

---

## 5. Restoration plan

Phases are ordered by dependency. Each phase names the files it rewrites, the
original files it transcribes, and the acceptance test. Phases 1–3 are
foundations and unblock everything else; phases 4–8 can partly overlap once 3
lands. Estimated size is relative.

### Phase 0 — Conformance harness (small)

- Port `TestGraf.p` (`reference/QuickDraw/TestGraf.p`, 971 lines) to a
  Vitest suite that renders into an offscreen `BitMap` and snapshots the
  result. It exercises every primitive, `SetScale` ratios 1/8…64 for
  DrawPicture (a MapPt/ScalePt oracle), `ColorBit` passes, `StuffHex`,
  `InsetRect`, `SetClip`. Snapshots are initially *generated* by the port
  and hand-verified against transcriptions where feasible; later phases update
  them as each subsystem is corrected.
- Add per-file golden tests for the numerically checked items already
  confirmed wrong (Angles tables, DrawArc rows for 5×7/6×7/20×12 ovals,
  `MapPt(−5, 2→1)`, `Random` step 1430, `BitShift(1,32)`, `HiWord(−65536)`).
- Add a `reference/` transcription helper under `packages/quickdraw/tests/
  oracle/` for the few algorithms where a BigInt reference is cheap
  (`InitOval/BumpOval`, `PutLine`, `MAP1/SCALE1`, `Random`).

### Phase 1 — Foundations: fixed-point, points/rects, port plumbing (small)

Files: `fixmath.ts`, `points.ts`, `rects.ts` (calc half), `grafport.ts`,
`globals.ts`, `utils.ts`, `regions.ts` (SetRectRgn/CopyRgn only), `types.ts`.

- `fixmath.ts`: `HiWord/LoWord` signed; `BitAnd/Or/Xor/Not` signed;
  `BitShift` count `&63`, ≥32 → 0; `FixMul` saturate; fix `LongMul` doc.
- `points.ts`/`rects.ts`: transcribe `SCALE1`/`MAP1` (`Pictures.a:1697-1785`)
  exactly; `MapRect = MapPt×2`; `MapRgn`/`MapPoly` call these.
- `utils.ts`: `Random` — transcribe the 16-bit-word algorithm including the
  `-32768 → 0` case.
- `regions.ts`: `SetRectRgn` normalises empty → `(0,0,0,0)`; `CopyRgn` copies
  **into** `dstRgn.rgn` (same-handle no-op).
- `grafport.ts`: `OpenPort = NewRgn×2 + InitPort`; `InitPort` uses
  `RectRgn`/`CopyRgn`; `SetClip/ClipRect/GetClip` via `CopyRgn`/`RectRgn` in
  place; `SetOrigin` via `OffsetRgn`; `BackPat`/`SetPortBits` copy in place;
  `InitGraf` resets every global and takes a `BitMap` (drop `QDScreen`,
  `globals._screen`); `ClosePort` stops touching `thePort` (or document it).
  Delete `newGrafPort` (host test uses `OpenPort`).
- `globals.ts`: add `patAlign: Point`, `fixTxWid: Fixed`, `fontPtr`,
  `playPic`, `playIndex`; type `thePoly` as `PolyHandle`.
- `types.ts`: `GrafVerb` used everywhere (drop `verb as any`); `picSave/
  rgnSave/polySave` typed as the private state records they are (`PicSaveState`,
  `boolean`, `boolean`) — `thePic`/`thePoly` live in globals as in the original.
- Decide and apply the null-`thePort` policy (§4.4) uniformly.

### Phase 2 — Region core (large)

Files: new `rgnCore.ts` (or split as the original: `packRgn.ts`, `seekRgn.ts`,
`rgnOp.ts`, `sortPoints.ts`, `putRgn.ts`), rewrite `regions.ts`; `types.ts`
`Region`.

- `Region = { rgnSize: number; rgnBBox: Rect; data?: Int16Array }` — packed
  `V H…H 32767 … 32767` stream (`PackRgn.a:13-19`). Remove `scanlines`.
- Transcribe: `SortPoints` (non-recursive quicksort VH), `CullPoints`,
  `PackRgn` (incl. `<4 points → empty`, `==4 → rect`), `PutRgn` (unpack to
  points), `InitRgn`/`SeekRgn` (`RGNREC` state, forward play / reset-and-replay
  backward, XOR into scan buffer trimmed to `[minH,maxH)`), `RgnOp`
  (`EXPAND` rect → 18-byte fake data; A/B `NEXTV` merge; `SectScan/DiffScan/
  UnionScan` as one loop with initial states; `XorScan`; `InsetScan` with
  `OUTSET` merge; emit only changes vs previous output row), `TrimRect`
  (RgnOp with `okGrow=false`, 24 bytes).
- Rewrite on top of them: `SectRgn/UnionRgn/DiffRgn/XorRgn` with all
  `DoRgnOp` shortcuts (`Regions.a:728-806`); `InsetRgn` (two `HINSET` passes
  with V/H swap); `MapRgn` (PutRgn → MapPt → Sort/Cull/Pack); `EqualRgn`
  (size + data compare); `RectInRgn` (`SeekRgn` rows, test buffer non-zero);
  `PtInRgn` (toggle over all rows `V ≤ v`); `OffsetRgn` (walk stream);
  `OpenRgn` (flag, `rgnBuf: Point[]`, **HidePen**); `CloseRgn` (**ShowPen**,
  Sort/Cull/Pack, empty → `SetEmptyRgn`).
- `pointInRegion` in `bitblt.ts` goes away (replaced by `RgnBlt` in Phase 3);
  `PtInRgn` is the public test.
- Tests: region algebra identities on random polygons vs a brute-force pixel
  oracle; canonical-form invariants (sorted, even rows, exact `rgnSize`);
  `SectRgn(wideOpen, x)` is O(|x|).

### Phase 3 — Blit pipeline (large)

Files: `bitblt.ts` → `rgnBlt.ts` + `bitBlt.ts` + `patExpand.ts` + `colorMap.ts`;
`bitmaps.ts` → `stretchBits.ts`, `copyBits.ts` (or keep one file per original);
`bottleneck.ts`; `utils.ts` (ColorMap consumer).

- `BitBlt(srcBits, dstBits, srcRect, dstRect, mode, pat)`: extents from
  `dstRect`; overlap direction by *memory* row/left (`BitBlt.a:167-193`,
  `284-292`); modes as today; negative mode → quit.
- `PatExpand(pat, dstBits, patAlign, patStretch, invert)` → 8/16-row aligned
  pattern (`Util.a:284-388`), honouring `patAlign` and `patStretch` ±2.
- `ColorMap(mode, pat, port)` → `{mode, pat}` (`Util.a:406-475`).
- `RgnBlt(srcBits, dstBits, srcRect, dstRect, mode, pat, rgnA, rgnB, rgnC)`:
  `ColorMap`; `minRect = RSect(dstRect, dstBits.bounds, bboxA, bboxB, bboxC)`
  (**no portRect**); `ShieldCursor` vector; all-rect or `TrimRect` → `BitBlt`;
  else `InitRgn` per non-rect region, `SEEKMASK` AND of scan buffers updated
  only on change, eight mode loops under mask (a `Uint8Array` row mask is fine
  — §4.6).
- `StretchBits(srcBits, dstBits, srcRect, dstRect, mode, rgnA, rgnB, rgnC)`
  (`Stretch.a`): `ColorMap` (pattern-bit → `RgnBlt` fill); same-size →
  `RgnBlt`; else vertical DDA with `VERROR = −denom.v/2`, OR-merge on shrink,
  replicate on stretch, horizontal bit-DDA `STRETCH` (`err = ratio/2`) /
  `SHRINK` (OR), phase anchored to unclipped `dstRect`, `SRCLIMIT`. Table fast
  paths optional.
- `CopyBits` (`Bitmaps.a:189-275`): shield if `srcBits` is screen; to-port
  test = `baseAddr && bounds.topLeft`; to-port → `grafProcs.bitsProc ??
  StdBits`; else `StretchBits(…, wideOpen, wideOpen, maskRgn ?? wideOpen)`.
- `StdBits`: `CheckPic` + `$90/$91/$98/$99` recording with `PackBits` (Phase 5
  provides `CheckPic`; land `PackBits/UnpackBits` here); `pnVis ≥ 0` →
  `StretchBits(…, clipRgn, visRgn, maskRgn ?? wideOpen)`.
- `ScrollRect`: literal transcription (`Bitmaps.a:759-884`) using
  `RectRgn/SectRgn/OffsetRgn/DiffRgn` and two `RgnBlt`s.
- `DrawRgn(rgn, mode, pat)` / `FrRgn(rgn, mode, pat)` (`Regions.a:146-228`)
  as the shape→bits entry points; `drawRectToPort`/`drawHSpan` are deleted
  (`DrawRect` = `RgnBlt(portBits, portBits, r, r, mode, pat, clipRgn, visRgn,
  wideOpen)`).
- `SetStdProcs` assigns the 13 `Std*` functions directly.
- Tests: `BitBltSlow` stays as the per-pixel oracle; RgnBlt vs oracle with
  random complex clip/vis/mask; Stretch vs BigInt transcription; ScrollRect
  updateRgn vs pixel diff; `patAlign` phase test.

### Phase 4 — Shape rasterisers (medium)

Files: `rects.ts`, `arcs.ts` → `drawArc.ts` + `ovals.ts` + `rrects.ts` +
`arcs.ts`, `angles.ts`, `lines.ts` → `lines.ts` + `drawLine.ts`.

- `angles.ts`: drop leading `0x01` from the byte table; `OR.B #$7F` for 90°;
  positive for 91..179; shared positive-magnitude helper for `AngleFromSlope`.
  Move `PtToAngle` here.
- `drawArc.ts`: `InitOval` edges from `ovalWidth`; `BumpOval` borrow computed
  *before* subtraction; `useInner = vert ∈ [inner.top, inner.bot)`; `flag =
  270 − ang` for ≥180; hollow wrap two-way if/else-if; mode 8..15 gate;
  `pnVis`; raw pen size; `minRect` from `RSect(dst, bounds, clip.bbox,
  vis.bbox)`; spans through the Phase 3 mask (`ONESLAB`).
- `StdRRect` = one `DrawArc(r, hollow, ovWd, ovHt, mode, pat, 0, 360)`;
  delete the corner decomposition.
- `rects.ts`: `FrRect` pinwheel with the `h2≥h3 ∨ v2≥v3 → paint once` path,
  raw pen size, no empty early-out; `pnVis` in `DrawRect`/`FrRect`.
- `lines.ts`: `LineTo` pure dispatch; `StdLine(newPt)` (picture recording) →
  `DoLine(newPt)` (poly / rgn / `DrawLine` / `pnLoc`) → `DrawLine(p1, p2)`
  (`pnVis`, mode gate, `ColorMap`, H/V rect, slab loop with `FixRatio/FixMul`).
- All `Std*` return to `QuickDraw.p` signatures; `Fill*` write `port.fillPat`
  first; `PushVerb` reads the port.
- Tests: pixel goldens per verb × pen size (incl. 0 and > half) × mode
  (patCopy/patXor) for rect/oval/rrect/arc/line, generated from transcriptions
  where available (`/tmp/qd-audit` scripts from this review can seed them).

### Phase 5 — Recording layer (medium)

Files: new `picSave.ts` (or in `pictures.ts`), `putLine.ts`, `putOval.ts`,
`rects.ts` (`PutRect`), `regions.ts` (`PutRgn` already from Phase 2),
`polygons.ts`, `lines.ts`, every `Std*`.

- `PicSaveState` (`GrafTypes.a:206-232`) with the 20 snapshot fields;
  `CheckPic` (`pnVis ≥ −1`, `$0E/$0F/$0C/$01`), `PutPicVerb`, `PutPicRect`
  (same-rect `+8`), `PutPicRgn`, `PutPicByte/Word/Long`, `PutPicData` →
  `grafProcs.putPicProc ?? StdPutPic`; `StdPutPic` keeps `picSize` live;
  `StdComment` records `$A0/$A1`; `PicComment` → `commentProc ?? StdComment`.
- `OpenPicture`: nested → `null`; `HidePen`; wideOpen → `ClipRect(picFrame)`;
  snapshot defaults; `$11 01`. `ClosePicture`: `$FF`, `ShowPen`.
- `PutLine` (`PutLine.a`, exact fixed-point), `PutRect` (`Rects.a:610-671`),
  `PutOval` (`PutOval.a`, with duplicate-cancel), into `globals.rgnBuf`.
- `DoLine`: poly append (`oldPt` on first), else `PutLine` when `rgnSave`.
- `OpenPoly` HidePen / `ClosePoly` ShowPen, tight bbox, live `polySize`;
  `FrPoly = MoveTo(p0) + DoLine…` leaving the pen; `DrawPoly = pnVis; OpenRgn;
  FrPoly; DoLine(p0); CloseRgn; DrawRgn`; `RSect` pre-check; delete
  `polyToScanlines`.
- Every `Std*` gets its `CheckPic`/`PutPicVerb`/noun-opcode prologue and, for
  FRAME with `rgnSave`, its `Put*` call.
- Tests: record `TestGraf` scenes and compare byte streams to hand-assembled
  expectations from `PicFormat.txt`; `OpenRgn/Frame*/CloseRgn` vs
  `PaintRgn` pixel oracle; polygon fill vs region-fill identity.

### Phase 6 — Picture playback (medium)

Files: `pictures.ts`.

- `PicPlayState {theRect, penLoc, textLoc, ovalSize, fromRect, toRect,
  numer, denom, theClip, userClip}`; `GetPicData` → `getPicProc ?? StdGetPic`
  using `globals.playPic/playIndex`.
- `DrawPicture`: reject degenerate rects; save whole port; reinit defaults
  (`Pictures.a:464-485`); `patAlign := 0`; loop `PicItem`; restore; `patAlign`.
- All opcodes per `Pictures.a:526-1300`: `$01` full region → `theClip`,
  `MapRgn`, `SectRgn` with `userClip`; `$07/$0B/$10` via `ScalePt`; `$0C`
  delta into `fromRect` + `patAlign`, clip re-derived; `$0A`, `$11`;
  `$20-$23` with unmapped `penLoc`; `$28-$2B` with `textLoc` and
  `textProc(count, bytes, numer, denom)`; `$3x-$6x` via `GETRECT`+`MapRect`
  to the bottleneck procs; `$7x` `MapPoly`; `$8x` `MapRgn`; `$9x` with
  `UnpackBits` and `MapRect(dstRect)`; `$A0/$A1` → `commentProc`; unknown →
  NOP; angles/`spExtra` signed.
- `serializePicture/parsePicture` for PICT v1 bytes (header + data).
- Tests: `TestGraf` `SetScale` ratios; round-trip record→play at 1:1 is
  pixel-identical to direct drawing; play into a custom `grafProcs` sees the
  same calls as direct drawing.

### Phase 7 — Text and the Font Manager seam (large; touches the host)

Files: `text.ts` → `text.ts` + `drawText.ts`, new `fontManager.ts` (types +
injection), `globals.ts`; host: `packages/ui/src/fonts/*`, `packages/ui/src/
draw.ts`, `packages/ui/src/textLayout.ts`, `packages/print`.

- Types: `FMInput`, `FMOutput`, `FontStrike {fontType, firstChar, lastChar,
  widMax, kernMax, nDescent, fRectWidth, fRectHeight, ascent, descent,
  leading, rowWords, bitImage, locTable, owTable, heightTable?}`,
  `WidthTable = Int32Array(256)` (Fixed). Injection point:
  `installFontManager(swapFont: (inRec: FMInput) => FMOutput)` replacing
  `__injectFontFunctions`.
- `StdTxMeas` (`Text.a:434-512`): fill FMInput from port, swap, fill `info`,
  write back numer/denom, sum widths → `fixTxWid`, stash `fontPtr`.
- `TextWidth/StringWidth/CharWidth/GetFontInfo` through `txMeasProc` with
  the rounding rules (`Text.a:419-429`, `684-736`); `MeasureText`.
- `CallText` → `textProc ?? StdText` with (1,1)/(1,1); `StdText` = picture
  recording + 255-chunking + `DrText`.
- `DrText` (`DrawText.a`): `textRect` from `pnLoc.v − ascent`; pen bump then
  `pnVis`; `minRect`; scratch `BitMap` with `bufLeft`/slop; glyph loop with
  Fixed `charLoc` (+½), `kernMax`, space not blitted, missing symbol; bold
  smear; italic shear; underline mask; shadow/outline (bold + XOR); final
  `StretchBits(buf → portBits, textRect → textR2, txMode & 7, clipRgn,
  visRgn, portBounds)`. Fast path optional (§4.6).
- Host: convert Decker fonts to `FontStrike` at load (declare a baseline per
  font); map `txFont/txSize` → font, `txFace` → synthesis counts; `<text>`
  nodes call `TextFont/TextSize/TextFace/ForeColor` and `MoveTo(x, top +
  ascent)`; delete `_uiFontName/_uiTextColor` and the `"\n"` split from the
  draw path (line breaking stays in `textLayout.ts`, which should measure via
  `TextWidth`).
- Tests: `StdTxMeas` vs hand-computed widths; style synthesis goldens; picture
  text opcodes; host screenshot tests updated for baseline semantics.

### Phase 8 — Cursor (small)

Files: `cursors.ts`, `src/os/cursor.ts`.

- Keep host compositing (the engine was ROM, §4.5) but make the package
  expose the **vectors** the original did: `HideCursor/ShowCursor/
  ShieldCursor/InitCursor/SetCursor/ObscureCursor` as installable hooks with
  the `LCursor.a` argument shapes; `RgnBlt/StretchBits/CopyBits/ScrollRect/
  GetPixel` call `ShieldCursor(rect, offset)`/`HideCursor`/`ShowCursor` as the
  original does (host may make them no-ops while it composites per frame).
- `ShowCursor` saturates at 0; `SetCursor` does not un-obscure.
- Optionally implement the ROM-style save-under engine in `src/os` so the
  cursor lives in `screenBits` and shielding becomes real.

### Phase 9 — Surface cleanup and documentation (small)

- `index.ts` exports exactly the `QuickDraw.p` interface + `GrafUtil.p` +
  the three OS seams (screen `BitMap` in `InitGraf`, `installFontManager`,
  cursor vectors). Pixel helpers move to a secondary entry (`./bits`).
- Remove `BitBltSlow/samplePattern/drawRectToPort/drawHSpan/OvalRec/initOval/
  bumpOval` from the public surface (tests import from source paths).
- Update `ARCHITECTURE.md` and the package header with the §4 adaptation
  policy and a "how to verify against the reference" section.
- Add a lint rule or test that greps `src/*.ts` for `Math.max(1`,
  `portRect` inside blitters, `as any`, and `scanlines` to keep the
  simplifications from creeping back.

### Dependency graph

```
0 harness ─┐
1 foundations ─┬─► 2 regions ─► 3 blit ─┬─► 4 shapes ─► 5 recording ─► 6 playback
               │                        ├─► 7 text (needs 3, 5)
               │                        └─► 8 cursor (needs 3)
               └─────────────────────────────────────────────────────► 9 cleanup
```

---

## 6. Decisions (resolved 2026-09-13)

All six were resolved in favour of the recommendation. They are binding for
the phases above.

1. **Null `thePort` policy** (§4.4): **throw.** Every routine that the
   original would fault on with `thePort = NIL` throws a single `QDError`
   (`'QuickDraw: thePort is NIL'`). Remove the ~40 ad-hoc `if (!thePort)
   return` guards; the host is responsible for calling `InitGraf`/`SetPort`
   first. Query routines that the original does *not* dereference `thePort`
   in (`SetRect`, `PtInRect`, `EqualRect`, `RectRgn`, `EmptyRgn`, …) keep
   working without a port, exactly as in the assembly.
2. **Region storage**: **`Int16Array` packed stream.** `Region` is
   `{ rgnSize, rgnBBox, data: Int16Array }` where `data` is the exact
   `V H…H 32767 … 32767` inversion-point stream from `Regions.a`. `rgnSize`
   is maintained on every mutation (`10` ⇔ rectangular). `PutPicRgn` and
   opcodes `$01`/`$8x` copy the stream verbatim. The row-decoded form exists
   only transiently inside `RgnOp`/`SeekRgn`.
3. **Text seam ownership**: the package exports the `FMInput`/`FMOutput`/
   `FontStrike` types and `installFontManager(swapFont)` only. The
   Decker→strike conversion, the baseline (ascent) declaration, font-family
   numbering, size fallback, and synthesis (`boldPixels`, `italicPixels`,
   `ulOffset`/`ulShadow`/`ulThick`, `shadowPixels`, `extra`) live in
   `packages/ui/src/fonts`. `StdText`/`StdTxMeas` consume `FMOutput` as
   `DrawText.a` does; `y` is the baseline (`pnLoc.v`), never the glyph top.
4. **Cursor**: **host-composited with real vectors.** `packages/quickdraw`
   implements `InitCursor`/`SetCursor`/`HideCursor`/`ShowCursor`/
   `ObscureCursor`/`ShieldCursor` as vector-driven state exactly as
   `Cursor.a` does, exposing the same `crsrVis`/`crsrObscure`/`crsrRect`
   semantics. Compositing the sprite into the framebuffer remains a
   `src/os` responsibility; a faithful in-framebuffer engine is not in
   scope.
5. **Colour separation**: **implement `ColorMap` fully.** `ForeColor`/
   `BackColor`/`ColorBit` set `fgColor`/`bkColor`/`colrBit` and `ColorMap`
   maps the transfer mode per `RgnBlt.a` (`colrBit` selects the plane; a
   foreground/background colour whose bit is clear turns the mode into the
   equivalent all-zeros/all-ones operation). This is required for `TestGraf`
   conformance.
6. **Performance fast paths** (§4.6): omit initially. `TrimRect` and the
   all-rectangular `BitBlt` path are added in Phase 3 as the only fast
   paths; anything else must be pixel-identical to the general path and
   listed in §4 before it is added.

---

## 7. Faithfulness rules for contributors (proposed for `ARCHITECTURE.md`)

- Every exported function has the `QuickDraw.p` signature. Internal helpers
  keep the original's names (`DoLine`, `FrRect`, `PushVerb`, `RgnBlt`,
  `SeekRgn`, `CheckPic`) and file grouping so a reader can diff against the
  `.a` source.
- No `Math.max(1, …)`, no `portRect` in a blitter, no early-outs the original
  lacks, no clearing of state the original leaves alone.
- Fixed-point arithmetic goes through `fixmath.ts`; integer wrap is `| 0`.
- Anything that departs from the assembly is listed in §4 of this document
  with a reason; if it is not listed, it is a bug.
- New behaviour the host needs (pixel helpers, screenshot tooling, font
  conversion) lives outside the `QuickDraw.p` surface.
