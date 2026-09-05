To create a basic Macintosh application that includes a window, a button, and dynamic text, you must use the **Window Manager**, **Control Manager**, **Event Manager**, and **QuickDraw**.

The following Pascal code demonstrates the essential Toolbox architecture required to initialize the environment, create the UI elements, handle user interaction, and redraw the screen.

### **Pascal Example Code**

```pascal
PROGRAM CounterApp;

USES
    QuickDraw, Windows, Controls, Events, Dialogs, Fonts;

VAR
    myWindow: WindowPtr;
    addBtn:   ControlHandle;
    count:    Integer;
    gDone:    Boolean;
    event:    EventRecord;

{ Drawing procedure called during update events }
PROCEDURE DrawMyWindow(window: WindowPtr);
VAR
    countStr: Str255;
BEGIN
    SetPort(window);                             { Ensure we are drawing in our window }
    EraseRect(window^.portRect);                 { Clear the content area }

    UpdateControls(window, window^.visRgn);      { Redraw the button }

    { Draw the counter text using QuickDraw text routines }
    MoveTo(20, 40);                              { Set pen position }
    DrawString('Current count: ');               { Draw static label }
    NumToString(count, countStr);                { Convert integer to Pascal string }
    DrawString(countStr);                        { Draw current count }
END;

{ Initialize the Toolbox managers in the required order }
PROCEDURE InitApp;
BEGIN
    InitGraf(@thePort);                          { Initialize QuickDraw }
    InitFonts;                                   { Initialize Font Manager }
    InitWindows;                                 { Initialize Window Manager }
    InitMenus;                                   { Initialize Menu Manager }
    TEInit;                                      { Initialize TextEdit }
    InitCursor;                                  { Set cursor to standard arrow }

    count := 0;
    gDone := FALSE;
END;

{ Handle mouse-down events }
PROCEDURE HandleMouseDown(theEvent: EventRecord);
VAR
    part:    Integer;
    clicked: WindowPtr;
    mousePt: Point;
    control: ControlHandle;
BEGIN
    part := FindWindow(theEvent.where, clicked); { Locate click }

    CASE part OF
        inContent:
            IF clicked = FrontWindow THEN
            BEGIN
                mousePt := theEvent.where;
                GlobalToLocal(mousePt);          { Translate to window coordinates }

                { Determine if click was in a control }
                IF FindControl(mousePt, clicked, control) = inButton THEN
                BEGIN
                    { Track mouse until released }
                    IF TrackControl(control, mousePt, NIL) <> 0 THEN
                    BEGIN
                        count := count + 1;      { Increment counter }
                        InvalRect(clicked^.portRect); { Mark window for redrawing }
                    END;
                END;
            END;
        inDrag:
            DragWindow(clicked, theEvent.where, screenBits.bounds); { Move window }
        inGoAway:
            IF TrackGoAway(clicked, theEvent.where) THEN gDone := TRUE; { Close app }
    END;
END;

{ Main Application Logic }
BEGIN
    InitApp;

    { Create a document window }
    myWindow := NewWindow(NIL, {bounds} 50, 50, 300, 200, 'Counter', TRUE, documentProc, WindowPtr(-1), TRUE, 0);

    { Create the "Add count" button }
    { Rectangle is local to the window's content region }
    addBtn := NewControl(myWindow, {bounds} 20, 60, 120, 80, 'Add count', TRUE, 0, 0, 1, pushButProc, 0);

    { Main Event Loop }
    REPEAT
        IF WaitNextEvent(everyEvent, event, 60, NIL) THEN
        CASE event.what OF
            mouseDown: HandleMouseDown(event);
            updateEvt:
                BEGIN
                    BeginUpdate(WindowPtr(event.message)); { Prepare for drawing }
                    DrawMyWindow(WindowPtr(event.message));
                    EndUpdate(WindowPtr(event.message));   { Finish drawing }
                END;
        END;
    UNTIL gDone;
END.
```

### **JavaScript pseudo-code (same flow)**

The following is a direct translation of the Pascal into JavaScript-style pseudo-code so you can see the same architecture in familiar syntax. Toolbox calls are kept as function names; types are implied.

```javascript
// === Global state (VAR in Pascal) ===
let myWindow; // WindowPtr
let addBtn; // ControlHandle
let count; // Integer
let gDone; // Boolean
let event; // EventRecord

// Drawing procedure — only called when we receive an updateEvt
function DrawMyWindow(window) {
  SetPort(window); // "Current port" = this window
  EraseRect(window.portRect); // Clear content area to white

  UpdateControls(window, window.visRgn); // Redraw controls (e.g. button)

  MoveTo(20, 40); // Pen position for text
  DrawString("Current count: ");
  DrawString(String(count)); // NumToString(count) in Pascal
}

// Initialize toolbox — order matters
function InitApp() {
  InitGraf(thePort);
  InitFonts();
  InitWindows();
  InitMenus();
  TEInit();
  InitCursor();

  count = 0;
  gDone = false;
}

// Handle one mouse-down: find where we clicked, maybe run TrackControl
function HandleMouseDown(theEvent) {
  // Pascal: FindWindow(where, clicked) returns part code, fills clicked by reference
  const { part, window: clicked } = FindWindow(theEvent.where);

  if (part === inContent) {
    if (clicked === FrontWindow()) {
      const mousePt = GlobalToLocal(theEvent.where, clicked); // Screen → window coords

      // FindControl returns part code (e.g. inButton), and gives us the control handle
      const { partCode, control } = FindControl(mousePt, clicked);
      if (partCode === inButton && control) {
        if (TrackControl(control, mousePt, null) !== 0) {
          count += 1;
          InvalRect(clicked.portRect); // "This window needs redraw"
        }
      }
    }
  } else if (part === inDrag) {
    DragWindow(clicked, theEvent.where, screenBits.bounds);
  } else if (part === inGoAway) {
    if (TrackGoAway(clicked, theEvent.where)) gDone = true;
  }
}

// === Main (equivalent to BEGIN ... END.) ===
InitApp();

myWindow = NewWindow(
  null,
  50,
  50,
  300,
  200,
  "Counter",
  true,
  documentProc,
  -1,
  true,
  0
);
addBtn = NewControl(
  myWindow,
  20,
  60,
  120,
  80,
  "Add count",
  true,
  0,
  0,
  1,
  pushButProc,
  0
);

// Main event loop (REPEAT ... UNTIL gDone)
while (!gDone) {
  if (WaitNextEvent(everyEvent, event, 60, null)) {
    switch (event.what) {
      case mouseDown:
        HandleMouseDown(event);
        break;
      case updateEvt:
        const windowToUpdate = event.message; // WindowPtr(event.message)
        BeginUpdate(windowToUpdate);
        DrawMyWindow(windowToUpdate);
        EndUpdate(windowToUpdate);
        break;
    }
  }
}
```

**Pascal → JS notes:**

- **By-reference args:** Pascal’s `FindWindow(theEvent.where, clicked)` writes into `clicked`; the pseudo-code uses a small “ref” object or closure to mimic that. In real classic Mac code, these are pointers.
- **`event.message`:** For `updateEvt`, the system puts the window to redraw in `event.message`; you pass it to `BeginUpdate` / `DrawMyWindow` / `EndUpdate`.
- **Loop:** `REPEAT ... UNTIL gDone` is expressed as `while (!gDone) { ... }`; the app stays running until the user closes the window and `TrackGoAway` sets `gDone = true`.

### **Architecture Overview**

- **Initialization:** You must initialize **QuickDraw** first, followed by **Fonts**, then **Windows**. The `InitCursor` call changes the startup "wristwatch" cursor back to the standard arrow.
- **Coordinate Systems:** **QuickDraw** maintains a global coordinate system for the screen and local coordinate systems for each window. When handling a `mouseDown` event, you use `GlobalToLocal` to translate the screen click into the window's local coordinates so the **Control Manager** can perform hit testing.
- **The Content Region:** The **Window Manager** draws the frame (title bar, close box), but your application is responsible for the **content region**. This includes drawing controls via `UpdateControls` and text via `DrawString`.
- **Event-Driven Redrawing:** Instead of drawing immediately, the standard approach is to use `InvalRect` to mark an area as "bad". The **Event Manager** then sends an `updateEvt`, triggering the code to redraw only the necessary portions of the window.

---

### **Comparison: Classic Mac vs Mockintosh**

| Concern                 | Classic Mac (Pascal)                                             | Mockintosh (Testing.ts)                                                      |
| ----------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Event loop**          | App owns `REPEAT … WaitNextEvent … UNTIL`                        | Framework owns loop; app is a `render()`                                     |
| **State**               | Global vars                                                      | `useState` / `useRef` (component-scoped)                                     |
| **Init**                | App calls InitGraf, InitFonts, InitWindows, … in order           | Framework provides ready context                                             |
| **Hit-test / tracking** | App does FindWindow → GlobalToLocal → FindControl → TrackControl | Framework does it; app gets `contrlAction(partCode)`                         |
| **Redraw**              | App calls InvalRect; later updateEvt runs DrawMyWindow           | App calls setState; framework schedules render                               |
| **Drawing**             | SetPort, EraseRect, UpdateControls, MoveTo, DrawString           | ctx.clear(), ctx.drawText(), DrawControls(win, ctx.port)                     |
| **Control creation**    | Once at startup; store handle                                    | Once on first render (ref guard); create via NewControl, attach contrlAction |

Mockintosh already removes the heaviest classic-Mac burdens: no event loop, no manual coordinate translation, no InvalRect, no toolbox init order. What remains that an app still has to do by hand:

- **Control lifecycle:** “Create controls once” via a ref guard, clear `win.controlList` on reopen, and call `DrawControls` every frame.
- **Control API surface:** `NewControl(win, boundsRect, label, visible, …)` with many positional args, then set `contrlData` / `contrlAction` on the handle.
- **Layout:** Measure text, compute button bounds, center manually.

---

### **Ultimate SDK: minimal app code**

If the goal is to **simplify app code and app development** as much as possible, the ideal SDK would keep Mockintosh’s reactive/render model and context-based drawing, but push more into the framework so the app looks like this:

```javascript
// Counter app — idealized
export const CounterApp = {
  id: "counter",
  title: "Counter",
  defaultSize: { width: 260, height: 120 },

  render(app, ctx) {
    const [count, setCount] = app.useState(0);

    ctx.clear(WHITE);
    ctx.drawText(`Current count: ${count}`, 16, 16, {
      font: "body",
      color: BLACK,
    });

    // Declarative: "a button, label and callback only; framework handles rect, control list, drawing"
    ctx.button("Increment", () => setCount((c) => c + 1));
  },
};
```

**What the “ultimate” SDK would do:**

1. **Own the event loop and init** — Already in Mockintosh; keep it.
2. **Reactive redraw** — setState → schedule render. Keep it.
3. **Declarative controls** — Instead of the app calling `NewControl`, measuring text, computing rects, guarding with a ref, and calling `DrawControls`, the framework could expose:
   - **`ctx.button(label, onClick)`** (or `ctx.control({ type: 'button', label, onClick })`): the framework creates/updates the control, picks default size (e.g. from label + padding), places it (e.g. bottom-center or via a simple layout), and draws it. No ref, no `controlList` management in app code, no `inButton` / partCode in the app.
4. **Stable control identity** — Framework keys controls by position in the render tree or by a stable id (e.g. first button, second button), so “create once” and “clear on reopen” are handled inside the framework; the app never touches `controlList` or refs for controls.
5. **Sensible defaults** — Button size from label + theme padding; optional layout hints (e.g. “bottom”, “center”) so the app doesn’t need `measureText` or manual rect math for the common case.
6. **Context-only drawing** — Keep `ctx.clear`, `ctx.drawText`, and optional `ctx.port` for advanced use; `DrawControls` becomes an internal detail called by the framework after the app’s `render`.

**What to keep from the classic model:**

- **Content region responsibility** — The app still describes _what_ to draw (text, buttons); the framework still doesn’t impose a heavy widget tree, so the “one render function that draws and declares controls” stays.
- **Toolbox alignment** — Under the hood, the SDK can still use the same Control Manager and QuickDraw concepts (controls, port, UpdateControls) so behavior and look stay consistent; the app just doesn’t touch them directly for the common case.

**Summary:** The ultimate SDK would be “Mockintosh plus a thin declarative control layer”: same app shape (one descriptor with `render(app, ctx)`), same state model (hooks), but with **`ctx.button(label, onClick)`** (and perhaps a few layout helpers) so that the counter app has no refs, no `NewControl`, no `measureText`, no `DrawControls`, and no manual control lifecycle. The app would only clear the window, draw the count text, and declare the button; the framework would own the rest.
