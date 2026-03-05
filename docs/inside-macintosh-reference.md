Below is a condensed architecture brief derived mainly from Inside Macintosh Vol. I–VI and the System 6/7 runtime model, but rewritten for someone implementing a browser-based “mock” Macintosh OS using TypeScript + HTMLCanvas.
I’ve removed hardware-specific details and focused on ideas that translate well to a web implementation.

The text is written so it can be dropped into an LLM context window (~6–8k words) and used as design guidance.

⸻

Classic Macintosh OS Architecture (System 6 / Early System 7)

Practical design reference for implementing a browser-based mock Macintosh OS

1. High-Level Architecture

Classic Mac OS was built around a toolbox architecture where applications called shared system managers to implement UI and OS functionality.

Simplified stack:

Applications
↓
Toolbox Managers
Window Manager
Menu Manager
Control Manager
Dialog Manager
TextEdit
QuickDraw (graphics)

Operating System Managers
Event Manager
Memory Manager
Resource Manager
File Manager
Device Manager
Segment Loader
Process Manager (later)

System Software
Finder
Desk Accessories

For a web implementation, you can simplify this to:

Applications
↓
UI Toolkit
windows
menus
dialogs
controls
text

System Services
event system
process manager
filesystem
resource loader

Graphics Layer
Canvas drawing

The Macintosh OS was not a microkernel or modular OS in the modern sense.
Instead it was a shared runtime environment with a GUI toolkit baked into the system.

The most important architectural principle:

Applications were responsible for running the UI loop and calling the system.

⸻

2. Event-Driven Architecture

The Macintosh used a single event queue and an application-owned event loop.

Typical program structure:

initialize()
while (true):
event = WaitNextEvent()
handle(event)

Events included:
• mouseDown
• mouseUp
• keyDown
• updateEvt
• activateEvt
• diskEvt
• suspend/resume events

Why this design mattered 1. CPU usage stayed low 2. Apps controlled their own responsiveness 3. System could integrate multitasking later

Web implementation idea

Your system can implement:

System Event Queue
↓
Active Application
↓
Application Event Handler

Events can come from:

browser events
mouse
keyboard
timers
window invalidations
filesystem updates

Important Mac concept: update events

Windows were not redrawn continuously.
Instead:

window marked dirty
system posts update event
application redraws window

This works well with Canvas invalidation regions.

⸻

3. Window System

The Macintosh window manager controlled:
• window stacking
• window dragging
• clipping
• invalidation regions

Windows had a structure similar to:

Window
bounds
title
visibility
updateRegion
contentRegion
windowKind

Typical window types:
• document windows
• dialog windows
• floating windows
• desk accessories

Window hierarchy

Classic Mac did not use nested windows like modern UI frameworks.

Instead:

screen
├─ window
├─ window
└─ window

Each window had its own coordinate system.

Redraw model

When a window was exposed:

system marks region invalid
update event sent
application redraws

Implementation suggestion

For Canvas:

Maintain:

WindowManager
windows[]
zOrder
dirtyRegions

Render loop:

for window in zOrder:
draw(window)

⸻

4. QuickDraw Graphics Model

QuickDraw was the core graphics library.

It used a stateful drawing context.

Key idea:

current port
current pen
current clipping region
current font

Typical calls:

MoveTo(x,y)
LineTo(x,y)
FrameRect()
PaintRect()
DrawString()

The graphics context was called a GrafPort.

Structure:

GrafPort
origin
clipping region
pen location
pen size
pattern

Important concept: coordinate origin

Windows shifted the origin.

So drawing code could assume:

(0,0) = top-left of window

Web mapping

GrafPort ≈ CanvasRenderingContext2D

Maintain your own wrapper:

class GrafPort {
origin
clip
pen
}

⸻

5. Menu System

Menus were global and lived in a single menu bar at the top.

Structure:

MenuBar
Menu
MenuItem

Menu items had:

title
commandKey
enabled
checked
id

Menu selection produced a menu event.

Typical flow:

user clicks menu
system highlights item
event sent to application
app executes command

Important design:

Menu actions were identified by numeric IDs, not callbacks.

Example:

File menu
1 New
2 Open
3 Close

The event returned:

menuID
itemID

Web suggestion

Define commands:

commandID

Applications register handlers.

⸻

6. Controls

Controls were reusable UI widgets:

Examples:
• buttons
• scroll bars
• checkboxes
• radio buttons

Controls belonged to windows.

Structure:

Control
bounds
value
min
max
action

Controls were drawn by the system but triggered callbacks.

⸻

7. Dialog System

Dialogs were specialized windows.

They used dialog resources defining layout.

Typical dialog elements:

static text
edit text
buttons
icons

Dialog loop:

while dialog open:
WaitNextEvent()
DialogSelect()

Dialog manager handled:
• tab order
• button clicks
• default buttons

⸻

8. Finder

Finder was just another application, but with special privileges.

Responsibilities:

desktop
file browsing
file launching
disk management
icons
drag and drop

Finder used the file system metadata to display icons.

File type determined:

icon
application binding

Classic Mac files had metadata:

type code
creator code

Example:

TEXT
APPL
PICT

Web idea

Store metadata with files:

{
type: "document",
creator: "finder",
icon: "text-icon"
}

⸻

9. File System Model

Classic Mac used hierarchical filesystem.

Files had:

data fork
resource fork

Data fork = raw data
Resource fork = structured assets

Example resources:

icons
menus
dialogs
strings
code segments

Resource structure:

resource type
resource id
resource name
data

Example:

MENU 128
ICON 256
STR# 1000

Web implementation

You can simulate this with JSON:

{
"resources": {
"MENU": {...},
"ICON": {...}
}
}

Or embed resources inside application bundles.

⸻

10. Memory Model (Simplified)

Classic Mac OS used relocatable memory blocks called Handles.

Handle -> pointer -> memory block

Memory could move during compaction.

Why this mattered:

system could defragment memory

For web systems you do not need this.

Instead:

JS objects / arrays

However one concept is useful:

Application memory partitions

Each app had its own memory allocation.

You can simulate this with:

AppSandbox

⸻

11. Process Model

Early Mac:

single foreground application

MultiFinder introduced:

cooperative multitasking

Process states:

active
background
suspended

Switching happened when apps called:

WaitNextEvent()

Web model suggestion

Implement:

ProcessManager

Each application:

tick()
handleEvent()

Scheduler:

for app in apps:
if app.active:
app.tick()

But realistically only one app will be interactive.

⸻

12. Application Launching

Launching an application:

1 load application file
2 read resources
3 allocate memory
4 run initialization code
5 open windows
6 enter event loop

Finder handled launching.

⸻

13. Drag and Drop

Finder supported drag and drop between:

icons
folders
applications
disks

Drag events included:

source
destination
item
operation

Operations:

move
copy
alias

⸻

14. Desktop Metaphor

Core UI concepts:

desktop
disks
folders
documents
applications
trash

Icons represented files.

Interaction model:

click select
double click open
drag move

⸻

15. System Extensions

Classic Mac supported:

INIT resources
system extensions
control panels

These modified system behavior.

For a web system you can implement:

plugins

⸻

16. Desk Accessories

Desk accessories were mini apps:

calculator
alarm
notepad

They ran alongside the main app.

Implementation idea:

small windows
limited privileges

⸻

17. Error Handling

Classic Mac used error codes.

Example:

fnfErr = file not found
memFullErr = memory full

In modern implementation:

exceptions

⸻

18. Key Architectural Lessons

The most important ideas from the classic Mac architecture:

1. GUI as the OS core

Unlike Unix, the UI toolkit was part of the system.

2. Event-driven design

Applications reacted to events instead of running continuously.

3. Shared UI managers

All applications used the same window/menu/dialog managers.

4. Simple process model

No complex scheduling.

5. Resource-based UI

UI layouts stored as data.

6. Finder as a normal application

Encouraged extensibility.

⸻

19. Recommended Web Architecture

For a browser Macintosh system:

Browser
↓
Canvas Renderer
↓
QuickDraw-like API
↓
Window Manager
↓
UI Managers
menus
dialogs
controls
text
↓
System Services
event manager
filesystem
process manager
resource loader
↓
Applications
Finder
TextEdit
Calculator

⸻

20. Minimal Subsystems to Implement

You only need these to recreate the Mac feel:

Event system
Window manager
QuickDraw graphics
Menu bar
Controls
Filesystem
Finder
Application launcher

Everything else can come later.

⸻

21. Recommended Implementation Order
    1.  QuickDraw layer (Canvas wrapper)
    2.  Window manager
    3.  Menu bar
    4.  Event system
    5.  Finder
    6.  Filesystem
    7.  Application launching
    8.  Dialogs
    9.  Controls

At that point the system already feels like a Macintosh.
