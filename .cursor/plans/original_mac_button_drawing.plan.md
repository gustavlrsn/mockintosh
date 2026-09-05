---
name: ""
overview: ""
todos: []
isProject: false
---

---

name: Original Mac Button Drawing
overview: Do not change the QuickDraw package unless a discrepancy with reference/QuickDraw is found. Prefer fixing our GrafPort usage and coordinate conventions. Mirror original Mac layering: Control Manager for controls only; app content = SetPort + QuickDraw direct.
todos:

- id: compare-reference-qd
  content: "Compare reference/QuickDraw with packages/quickdraw for discrepancies (RoundRect, arcs, port usage); change package only if reference shows different behavior"
  status: completed
- id: fix-port-coordinates
  content: "Fix GrafPort usage and coordinate conventions (WindowPort, portRect, bounds, clipRgn, origin, render path) so drawing matches QuickDraw expectations; treat visual/placement issues here first"
  status: pending
- id: control-manager-qd-direct
  content: "Control Manager uses QuickDraw directly (SetPort, FrameRoundRect, PaintRoundRect, InvertRoundRect, MoveTo, DrawString, PenSize, PenPat); remove reliance on qdDraw for button drawing"
  status: completed
- id: invert-press
  content: "Use InvertRoundRect on mouse down and again on release for pressed state; optional thin withPort+InvertRoundRect for redraw"
  status: completed
- id: mac-strategy-layering
  content: "Implement original Mac layering: Control Manager = QuickDraw only for controls; app content = SetPort(windowPort) + QuickDraw direct; Window Manager = chrome via QuickDraw; Menu Manager = menus via QuickDraw; no global wrapper over all QuickDraw"
  status: pending
  isProject: false

---

# Original Mac Button Drawing — Fix QuickDraw / Coordinates, Use QuickDraw Directly

## Original Mac strategy: who uses QuickDraw (NotebookLM research)

On the original Mac, **QuickDraw did all drawing**, but **who called it** depended on the UI element:

| UI element                                         | Responsible layer   | How QuickDraw is used                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Controls** (buttons, scroll bars, checkboxes)    | **Control Manager** | Indirect: app uses UpdateControls / Draw1Control; Control Manager (CDEF) calls QuickDraw (FrameRoundRect, MoveTo, DrawString, InvertRoundRect, etc.).                                                                                                                                                 |
| **Window chrome** (title bar, outline, close/zoom) | **Window Manager**  | Indirect: Window Definition Functions draw chrome using QuickDraw.                                                                                                                                                                                                                                    |
| **Menus** (bar and items)                          | **Menu Manager**    | Indirect: DrawMenuBar, MDEFs draw via QuickDraw.                                                                                                                                                                                                                                                      |
| **Dialogs / alerts**                               | **Dialog Manager**  | Indirect: uses Window Manager + Control Manager.                                                                                                                                                                                                                                                      |
| **Window content** (document, custom graphics)     | **The application** | **Direct:** app calls **SetPort(window)** to set the current GrafPort to the window’s content port (provided by the Window Manager; WindowRecord’s first field is a GrafPort, so WindowPtr = GrafPtr), then calls QuickDraw directly (FrameRect, PaintRect, DrawString, etc.). No manager in between. |

So the **Control Manager is the layer between app and QuickDraw only for controls**, not for all drawing. For **content**, the app gets the window’s GrafPort from the Window Manager and calls **SetPort(port)** then **QuickDraw directly**. We should implement this same strategy.

---

## Principle: do not change QuickDraw unless the reference disagrees

- **Do not change the QuickDraw package** ([packages/quickdraw](packages/quickdraw)) unless we discover a **discrepancy** between the original source in [reference/QuickDraw](reference/QuickDraw) and our port. If something looks wrong (e.g. round rects, placement, clipping), assume the cause is **our GrafPort usage or coordinate conventions** and fix it there first.
- **Only after** comparing reference vs port: if the reference implements something differently (e.g. different procedure order, different semantics), then and only then change the package to match the reference.
- No "correct round rect" helper in the toolbox or qdDraw. **Button drawing** uses QuickDraw procedures directly from the Control Manager: `FrameRoundRect`, `PaintRoundRect`, `InvertRoundRect`, `MoveTo`, `DrawString`, `PenSize`, `PenPat`, etc.

---

## Implement the original Mac layering

Mirror the strategy above in our codebase:

1. **Control Manager** — The layer between the app and QuickDraw **only for controls** (buttons, scrollbars, checkboxes, radio buttons). It receives a GrafPort (the window’s content port), calls `SetPort(port)`, then uses QuickDraw directly to draw the control. Apps do not draw controls themselves; they call our Control Manager (e.g. `drawButton` / `DrawControl`), which performs the QuickDraw calls. No qdDraw wrappers for control drawing.
2. **Window content (app drawing)** — Apps draw their own content (document, custom UI) by **calling QuickDraw directly** after setting the port. Our WindowContext (or equivalent) provides the window’s GrafPort; the app (or its render callback) does `SetPort(port)` and then calls `FrameRect`, `PaintRect`, `DrawString`, etc. from `@mockintosh/quickdraw`. No global “drawing layer” that wraps all QuickDraw for content; the app is the caller.
3. **Window Manager** — Draws window chrome (title bar, border, close/zoom) using QuickDraw. Our existing chrome-drawing code (e.g. in main.tsx or WindowManager) should use the appropriate port and QuickDraw procedures directly (or a minimal withPort + QuickDraw), not a separate qdDraw API for chrome.
4. **Menu Manager** — Draws the menu bar and menu items using QuickDraw (via MDEF-style logic). Our MenuManager should call QuickDraw directly for menu drawing.
5. **No global QuickDraw wrapper** — We do not introduce a single “layer” that sits between every caller and QuickDraw. We have **manager-specific** behavior: Control Manager for controls, Window Manager for chrome, Menu Manager for menus; **app content** uses SetPort + QuickDraw direct. qdDraw is not that layer; it can be deprecated or reduced to minimal helpers (e.g. port save/restore only) where we still need it during migration.

---

## 1. Compare reference/QuickDraw with packages/quickdraw; change package only on discrepancy

- **Before changing anything in [packages/quickdraw](packages/quickdraw):** Compare the relevant routines with [reference/QuickDraw](reference/QuickDraw) (e.g. RRects.a, DrawArc.a, arcs, port/rect usage). If the reference and our port behave the same, **do not change the package.**
- **Only if** the reference clearly specifies different behavior (e.g. different RoundRect algorithm, different angle convention, different clipping) should we update the port to match. Document the discrepancy and the change.
- Do not "fix" the package for perceived visual issues without first checking the reference and our GrafPort/coordinate usage.

---

## 2. Fix GrafPort usage and coordinate conventions first

- When round rects (or other shapes) look wrong, are misplaced, or are clipped incorrectly, **treat the cause as our port and coordinate setup**, not the QuickDraw package:
  - Audit **GrafPort**: `portRect`, `portBits.bounds`, `origin` (if used), `clipRgn` / `visRgn`, and how the window port is created and updated in [lib/toolbox/WindowPort.ts](lib/toolbox/WindowPort.ts) and the render path in [src/main.tsx](src/main.tsx).
  - Ensure **local coordinates** passed to QuickDraw (e.g. rect for `FrameRoundRect`) match the port's coordinate system (e.g. content-local (0,0) at top-left of content, y increasing downward).
  - Ensure **clipping** (clipRgn, visRgn, portRect) and **buffer bounds** (portBits.bounds) are consistent so that drawing inside the port rect is neither clipped incorrectly nor offset wrongly.
- No new helper layers to "fix" coordinates; fix the actual port and coordinate usage so they match what QuickDraw expects.

---

## 3. Button drawing using QuickDraw directly

**File:** [lib/toolbox/ControlManager.ts](lib/toolbox/ControlManager.ts)

- **Do not** add a toolbox "correct round rect" helper. Do not implement round rect in qdDraw as a composition of arcs/rects.
- **Use QuickDraw directly** for buttons:
  - Import from `@mockintosh/quickdraw`: `SetPort`, `GetPort`, `makeRect`, `PenNormal`, `PenSize`, `PenPat`, `FrameRoundRect`, `PaintRoundRect`, `InvertRoundRect`, `MoveTo`, `DrawString` (and any pattern/color setup you use).
  - **Draw sequence** (match original Mac CDEF):
    1. `SetPort(port)` (save/restore previous port with GetPort if needed).
    2. **Default button:** `PenSize(3, 3)`; `FrameRoundRect(insetRect(r, -4, -4), 16, 16)`; then `PenNormal()`.
    3. **Button frame:** `FrameRoundRect(r, 10, 10)` (pen 1, black).
    4. **Label:** `MoveTo(tx, ty)`; `DrawString(btn.label)` (centered in button rect).
    5. **Disabled:** overlay with gray (e.g. `PenPat` + `PaintRect` or existing pattern API).
    6. **Pressed state:** `InvertRoundRect(r, 10, 10)` on mouse down and again on mouse up/leave (no fill + white text for transient press).
- So the Control Manager is the "port" between app and QuickDraw: it owns the call sequence and calls only standard QuickDraw procedures. Optionally it can use a thin `withPort(port, fn)` for save/restore of the port; that does not redefine round rects.
- **Text:** Use `MoveTo` + `DrawString`; rely on your existing font injection/bottleneck so that `DrawString` draws with the correct font. No need for a separate "qdDrawText" for the button label if the port's `DrawString` is already set up.

---

## 4. qdDraw and inversion

- **Do not** add `qdInvertRoundRect` or any round-rect helper in qdDraw.
- If the app or WindowContext needs to trigger "invert button" on press/release, it should call QuickDraw's `InvertRoundRect` (after `SetPort(port)`) with the button's rect and oval size, then request a redraw. That can be a small wrapper that only does "SetPort + InvertRoundRect + optional GetPort/SetPort restore," not a reimplementation of the round rect shape.

---

## Summary

| Item                        | Action                                                                                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **QuickDraw package**       | **Do not change** [packages/quickdraw](packages/quickdraw) unless a **discrepancy** with [reference/QuickDraw](reference/QuickDraw) is found. Compare reference vs port first; only then consider package changes.                    |
| **Visual/placement issues** | Fix **GrafPort usage and coordinate conventions** first (WindowPort, portRect, bounds, clipRgn, origin, render path). Assume the issue is our setup, not the ported QuickDraw.                                                        |
| **Original Mac layering**   | **Control Manager** = QuickDraw only for controls. **App content** = SetPort(windowPort) + QuickDraw direct. **Window Manager** = chrome via QuickDraw. **Menu Manager** = menus via QuickDraw. No global wrapper over all QuickDraw. |
| **Button drawing**          | **Control Manager** calls QuickDraw directly: `SetPort`, `FrameRoundRect`, `PaintRoundRect`, `InvertRoundRect`, `MoveTo`, `DrawString`, `PenSize`, `PenPat`. No round-rect helper.                                                    |
| **Pressed state**           | Use `InvertRoundRect` on mouse down and again on release; optional thin "withPort + InvertRoundRect" for redraw, no new round-rect implementation.                                                                                    |
