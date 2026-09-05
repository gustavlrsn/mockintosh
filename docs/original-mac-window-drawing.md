# Original Macintosh vs Mockintosh: Window Drawing Context

This doc compares how the **original Macintosh** handled the window drawing context (and related hit-testing) with how **Mockintosh** does it via `WindowContext`.

## Original Macintosh

### Drawing context: GrafPort + WindowRecord

- **GrafPort** is the central drawing context in QuickDraw. It holds:

  - **portBits** — the bitmap drawn into (screen or offscreen)
  - **portRect** — the rectangle defining the drawable area (for a window, the content area)
  - **visRgn** — visible region (not obscured by other windows); maintained by the Window Manager
  - **clipRgn** — clipping region (e.g. to avoid drawing over scroll bars)
  - **pnLoc**, **pnSize**, **pnPat**, **txFont**, **txFace**, etc. — pen and text state

- **WindowRecord** has the **GrafPort as its first field**, so `WindowPtr = GrafPtr`. The app draws into a window by treating the window as a port.

- **Current port**: QuickDraw has a global “current” port (`thePort`). The app calls **SetPort(theWindow)** so that all subsequent QuickDraw calls (MoveTo, LineTo, FrameRect, DrawString, etc.) go to that window’s bitmap and use that port’s coordinate system and clipping.

- **Coordinate system**:

  - Each port has a **local** coordinate system; (0,0) is the top-left of the port’s drawable area.
  - **SetOrigin(h, v)** sets the local origin (used for scrolling: shift the coordinate plane so content appears to scroll).
  - **MovePortTo(leftGlobal, topGlobal)** moves the port’s position in global (screen) coordinates; typically used by the Window Manager, not the app.
  - **LocalToGlobal** / **GlobalToLocal** convert between local and global coordinates.

- **Update cycle**: When a window needs redrawing, the app receives an **updateEvt**. It calls **BeginUpdate(theWindow)** (which sets the port’s clip to the window’s **updateRgn**), draws, then **EndUpdate**. **InvalRect** / **InvalRgn** mark areas that need redraw; **ValidRect** / **ValidRgn** clear them.

So on the original Mac, the “drawing context” for a window is literally **the window’s GrafPort**: you SetPort to the window, and all drawing is in that port’s local coordinates with that port’s clipping.

### Hit testing

- **FindWindow(thePoint, theWindow)** — takes a point in **global** coordinates and returns which part of which window was hit: **inContent**, **inDrag**, **inGrow**, **inGoAway**, **inZoomIn**, **inZoomOut**, or **inMenuBar**, **inSysWindow**, **inDesk**.
- If the result is **inContent**, the app converts the point to **local** (GlobalToLocal) and calls **FindControl(thePoint, theWindow, theControl)** to see if a control (button, scroll bar, etc.) was hit. Control Manager owns control hit-testing.
- If FindControl returns 0 (no control), the app does **its own** hit testing for document/custom content (e.g. which shape or text range was clicked). There is no OS-level “hit region” abstraction for custom content; the app is responsible.

### Scroll bars and controls

- Scroll bars and the grow box are **controls** (Control Manager). The app creates them with **NewControl** / **GetNewControl**, and the Window Manager draws the window frame (including size box and scroll bar outlines) via **DrawGrowIcon**. **FindControl** and **TrackControl** handle hit-testing and dragging for those controls.
- Scrolling content is done by the app: typically **SetOrigin** to reflect scroll position, and **ScrollRect** for bit-blitting when possible. The app draws content in local coordinates; the origin offset makes that content appear scrolled.

---

## Mockintosh: WindowContext

Mockintosh gives apps a **WindowContext** instead of raw access to the window’s GrafPort.

| Original Mac                                                                                                 | Mockintosh                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One GrafPort per window; app calls **SetPort(window)** and draws with QuickDraw in local coordinates.        | **WindowContext** wraps a GrafPort and adds origin/scroll and a **HitRegionMap**. Apps draw via `ctx.drawRect`, `ctx.drawText`, etc., which apply coordinate translation and delegate to QuickDraw.                                                                                                             |
| Origin/scrolling: app calls **SetOrigin** on the port (or uses ScrollRect).                                  | **WindowContext** is constructed with `(ox, oy, w, h, scrollY, scrollX, ...)`; all drawing methods use internal `tx()`/`ty()` so app coordinates are always local to the context (including scroll).                                                                                                            |
| Clipping: port’s **clipRgn**; **BeginUpdate** sets clip to **updateRgn**.                                    | Clipping is handled by the port and by **pushClip**/ **popClip** on the context (and in **drawScrollableContent**).                                                                                                                                                                                             |
| Hit testing: **FindWindow** → part code; **FindControl** for controls; app does custom hit-test for content. | **HitRegionMap** is passed into the context; apps call **ctx.hitRegion(id, rect, callbacks)** to register rectangles in **screen** space. The OS uses this map to route clicks. No separate FindControl for app-defined regions; controls can use the same hit-region mechanism or a dedicated control manager. |
| Scroll bars: Control Manager controls; app sets **SetOrigin** and draws content.                             | **ctx.scrollArea(...)** draws scroll bar chrome and registers hit regions for arrows, track, and optional grow box; **drawContent** receives a child **WindowContext** with the right scroll offset.                                                                                                            |
| Window = GrafPort (first field of WindowRecord).                                                             | **WindowContext** can hold a **WindowRecord** (`getWindow()`); when non-null, the context is tied to a real window for Mac-style chrome.                                                                                                                                                                        |

So: on the original Mac, the “context” is the **current GrafPort** (the window’s port), and the app is responsible for setting the port, origin, and doing its own content hit-testing. In Mockintosh, **WindowContext** is an abstraction that encapsulates port, origin/scroll, and a **retained** hit-region map, so the OS can both draw and dispatch events without the app re-hit-testing every frame.
