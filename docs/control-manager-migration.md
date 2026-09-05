# Legacy vs Mac-style Control Manager — Summary and Migration Plan

## Summary: What We Have Two Ways of Doing

After the Control Manager and Window Manager alignment, the following can be done in two ways: a **legacy** path (immediate-mode + hit regions) and a **new** path (retained controls + FindControl/TrackControl). **Editable text fields** are handled by the TextEdit manager (see TextEdit.ts, drawTextInput / drawTextEditField) and are **not** part of the Control Manager migration. Buttons, scroll bars, and similar controls are; text inputs stay with hit regions + content events for focus and key handling.

---

### 1. Drawing buttons (and other controls)

| Aspect        | Legacy                                                                                                                       | New (Mac-style)                                                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **API**       | `ctx.drawButton({ boundsRect, label, id, onClick, onMouseDown, ... })`                                                       | `NewControl(win, boundsRect, title, visible, value, min, max, procID, refCon)` then `DrawControls(win, port)` or `Draw1Control(handle, port)` |
| **Ownership** | No control record; def is passed each frame                                                                                  | Control lives in `win.controlList`; created once                                                                                              |
| **Where**     | [WindowContext.drawButton](lib/toolbox/WindowContext.ts), all apps (Safari, PhotoBooth, Dialog fallback, SDK examples, etc.) | [Dialog](apps/Dialog.ts) when `ctx.getWindow()` is non-null                                                                                   |
| **Drawing**   | `DrawControl(port, def)` each frame; def built from props                                                                    | `DrawControls(win, port)` or `UpdateControls(win, port, updateRect)`; def built from ControlRecord inside Draw1Control                        |

**Legacy:** Immediate-mode: every render the app calls `drawButton` with a def; WindowContext draws it and registers a hit region for that frame.  
**New:** Retained: app (or dialog) creates controls once with `NewControl`, adds them to the window; drawing is done by iterating `win.controlList` (DrawControls/UpdateControls).

---

### 2. Handling clicks on buttons (content-area)

| Aspect       | Legacy                                                                                                         | New (Mac-style)                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hit-test** | Hit regions registered during render; `hitRegions.handleMouseDown(x, y)` finds region by id and runs callbacks | `FindWindow(globalPt)` → if `inContent`, `FindControl(localPt, theWindow)`; returns control + part code                                       |
| **Tracking** | Per-region callbacks: `onMouseDown` / `onMouseUp` call `invertButton` and app logic                            | `TrackControl(theControl, pt, port)` returns `onTrackEnd`; event loop calls it on mouseUp and invokes `contrlAction` if part code ≠ 0         |
| **Where**    | [main.tsx](src/main.tsx): when no control is found in window, `hitRegions.handleMouseDown`                     | main.tsx: when `controlList.length > 0`, FindControl → TrackControl; store `controlTracking`; on mouseUp call `onTrackEnd` and `contrlAction` |

**Legacy:** Clicks in content are dispatched to hit regions that were registered by `drawButton` (and other `hitRegion` calls).  
**New:** Clicks in content first try FindControl on the window; if a control is hit, TrackControl runs and the control’s `contrlAction` is called on release.

---

### 3. Dialog buttons specifically

| Aspect             | Legacy                                                                     | New (Mac-style)                                                                            |
| ------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **When**           | When `ctx.getWindow()` is `null` (e.g. context not created with a window)  | When `ctx.getWindow()` is non-null                                                         |
| **Implementation** | Same as any app: `ctx.drawButton({ ... id, onClick: () => resolve(...) })` | Create controls once (ref), `DrawControls(win, ctx.port)`; `contrlAction` calls `_resolve` |

[Dialog](apps/Dialog.ts) branches explicitly: `if (win !== null)` use NewControl + DrawControls; else use drawButton + hit regions.

---

### 4. Update region / partial redraw

| Aspect       | Legacy                                            | New (Mac-style)                                                                                                                                 |
| ------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Redraw**   | Full window: `scheduleRender()` → full repaint    | Window has `updateRect`; `InvalRect(win, badRect)` unions dirty area; `BeginUpdate(win)` clips to it (uses `win.port`); `EndUpdate(win)` clears |
| **Controls** | All controls redrawn every frame (via drawButton) | `UpdateControls(win, port, updateRect)` redraws only controls intersecting updateRect                                                           |
| **Usage**    | Used everywhere today                             | Implemented in WM/ControlManager but **not** yet used in the main render loop                                                                   |

**Legacy:** No update region; every render redraws the whole window.  
**New:** InvalRect/BeginUpdate/EndUpdate/UpdateControls exist but the render path still does full redraws; no caller uses InvalRect or BeginUpdate yet.

---

## Migration Plan: Legacy → Mac-style

Goal: over time, use a single path (Mac-style) for controls and content-area hit-testing, and optionally use update regions for partial redraw. Remove or deprecate the legacy paths once nothing uses them.

---

### Phase 1: Document and stabilize (no behavior change)

1. **Document the two paths** in the codebase (e.g. short comments in WindowContext.drawButton and in main.tsx event loop) so future changes don’t break the intended split.
2. **Keep Dialog’s dual path** as the reference: when window is available, use controls; otherwise fall back to drawButton. This preserves behavior for all current callers.

---

### Phase 2: Ensure every window has a window record (getWindow() non-null)

Today only `createWindowContext(win, hitRegions, screenPort)` passes `win` into WindowContext; scroll sub-contexts and any other context creation do not. So:

1. **Audit WindowContext construction** — Ensure the main content context for each window always receives the window (already done in [WindowManager.createWindowContext](lib/toolbox/WindowManager.ts)).
2. **Result:** For normal app/dialog windows, `ctx.getWindow()` is non-null. Only special contexts (e.g. scroll-area inner context) may have null; document that.

---

### Phase 3: Migrate Dialog to always use controls

1. **Remove the `else` branch in Dialog** — Assume `ctx.getWindow()` is always non-null for the dialog window; create controls and use DrawControls only. If getWindow() is null, log or throw so we notice any regressions.
2. **Test:** All dialog buttons still work; clicks go through FindControl → TrackControl → contrlAction.

---

### Phase 4: Migrate one app at a time from drawButton to NewControl + DrawControls

For each app that uses `ctx.drawButton`:

1. **Get the window** — Use `ctx.getWindow()` (or pass window into the app if needed).
2. **Create controls once** — e.g. in a `useRef` + first-render or when dialog opens: for each button, `NewControl(win, boundsRect, label, true, 0, 0, 1, 0, refCon)` and set `contrlAction` to the current onClick logic.
3. **Draw** — Replace `ctx.drawButton(...)` with a single `DrawControls(win, ctx.port)` (or per-control Draw1Control if you need to interleave with other drawing).
4. **Remove** — The `drawButton` call and its `id` / `onClick` / `onMouseDown` etc. for that button.

**Suggested order:** Dialog (already done for the “win” path), then a simple app (e.g. Picture, VideoPlayer), then Safari, PhotoBooth, AppStore, ChatGippity, then SDK examples and templates.

**Files to touch per app:** The app’s `render()` (and possibly state for “controls created” ref).

---

### Phase 5: Deprecate or remove legacy drawButton path

1. **When no app uses drawButton for buttons anymore** — Either remove `drawButton` from WindowContext and the SDK, or mark it `@deprecated` and document that new code should use NewControl + DrawControls.
2. **Keep `DrawControl(port, def)`** as a low-level primitive used by Draw1Control (and optionally for one-off drawing without a handle). No need to remove it.

---

### Phase 6: Optional — Use update regions in the render loop

1. **On content invalidation** — When something changes (e.g. scroll, selection), call `windowManager.InvalRect(win, badRect)` instead of or in addition to `scheduleRender()`.
2. **In render** — Before drawing window content, call `windowManager.BeginUpdate(win)` (win.port must be ensured first, e.g. via createWindowContext); after content and controls, call `windowManager.EndUpdate(win)`. Use `UpdateControls(win, win.port!, win.updateRect)` instead of (or in addition to) full DrawControls when updateRect is set.
3. **Benefit:** Fewer unnecessary redraws; matches Mac update model. Can be done after Phase 5 or in parallel for performance-sensitive windows.

---

### Phase 7: Optional — Reduce or replace HitRegion for non-control UI — **Scroll bars: done**

**Done:** Scroll bars are now fully in Control Manager. WindowManager no longer draws scroll bar pixels or holds thumb-drag state; it delegates creation and drawing to ControlManager via `CreateOrUpdateScrollBarControls` and `DrawScrollBarControls`. FindControlInWindow does a five-part hit-test (inUpButton, inDownButton, inThumb, inPageUp, inPageDown) for procID 4; TrackControl handles all parts including thumb (with onTrackMove). The event loop uses TrackControl for scroll bar hits and updates `win.scrollY`/`win.scrollX` from GetControlValue after tracking.

**Remaining (optional):** Other hit regions — anything button-like can become a control; custom hit regions (e.g. list items, canvas clicks) may stay as hit regions unless we introduce custom control kinds.

---

## Checklist (quick reference)

| Step | Action                                                                                                                                                         |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Document legacy vs new in code comments                                                                                                                        |
| 2    | Confirm getWindow() is non-null for all main window content contexts                                                                                           |
| 3    | Dialog: use only controls path; remove drawButton fallback                                                                                                     |
| 4    | Migrate Picture, VideoPlayer, then Safari, PhotoBooth, AppStore, ChatGippity, SDK examples, templates from drawButton to NewControl + DrawControls             |
| 5    | Deprecate or remove WindowContext.drawButton (and SDK drawButton for buttons)                                                                                  |
| 6    | (Optional) Use InvalRect/BeginUpdate/EndUpdate/UpdateControls in render loop                                                                                   |
| 7    | **Done:** Scroll bars are controls (CreateOrUpdateScrollBarControls, DrawScrollBarControls, TrackControl incl. thumb). Optional: other hit regions → controls. |

---

## Files Involved

- **Legacy drawing:** [lib/toolbox/WindowContext.ts](lib/toolbox/WindowContext.ts) (`drawButton`), [lib/toolbox/ControlManager.ts](lib/toolbox/ControlManager.ts) (`drawButton`, `DrawControl`)
- **Legacy hit-test:** [src/main.tsx](src/main.tsx) (event loop fallback to `hitRegions.handleMouseDown`), [lib/canvas/HitRegion.ts](lib/canvas/HitRegion.ts)
- **New path:** [lib/toolbox/ControlManager.ts](lib/toolbox/ControlManager.ts) (`NewControl`, `DrawControls`, `Draw1Control`, `UpdateControls`, `FindControl`, `TrackControl`), [lib/toolbox/WindowManager.ts](lib/toolbox/WindowManager.ts) (`controlList`, `findWindowWithPartCode`), main.tsx (FindControl → TrackControl when controlList.length > 0)
- **Dual path:** [apps/Dialog.ts](apps/Dialog.ts) (if win → controls; else drawButton)
- **Consumers of drawButton:** All other apps and SDK examples (see grep list in summary above)
