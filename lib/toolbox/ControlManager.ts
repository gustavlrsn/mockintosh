/**
 * ControlManager.ts — Macintosh Toolbox Control Manager
 *
 * Draws buttons, checkboxes, radio buttons, and scroll bars. Uses QuickDraw
 * directly for buttons; scroll bar drawing is CDEF-style (vertical vs horizontal
 * from rect). Checkboxes and radio buttons still use qdDraw for now.
 *
 * Original Mac: DrawControl / CDEF calls QuickDraw. Control Manager is the
 * layer between app and QuickDraw for controls only. Editable text is not a
 * control type; it is handled by the TextEdit path (see TextEdit.ts, future-migrations.md).
 */

import type { GrafPort, Rect } from "@mockintosh/quickdraw";
import {
  SetPort,
  GetPort,
  makeRect,
  cloneRect,
  InsetRect,
  PenNormal,
  PenSize,
  PenPat,
  FrameRoundRect,
  PaintRoundRect,
  InvertRoundRect,
  MoveTo,
  DrawString,
  FillRect,
  SectRect,
  EmptyRect,
  PtInRect,
  OffsetRect,
} from "@mockintosh/quickdraw";
import type { Point } from "@mockintosh/quickdraw";
import { measureText, getLineHeight } from "../canvas/fontAdapter";
import { QD_PATTERNS } from "../canvas/patternBridge";
import {
  qdFillRect,
  qdDrawRect,
  qdFillPattern,
  qdDrawHLine,
  qdDrawVLine,
  qdSetPixel,
  qdDrawText,
} from "../canvas/qdDraw";
import { BLACK, WHITE, type Sprite } from "../canvas/BitCanvas";
import { blitSprite, fillSpriteTile } from "../canvas/SpriteManager";

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

/** QuickDraw Rect (top, left, bottom, right). Control bounds use this convention. */
export type ControlRect = Rect;

export interface ButtonDef {
  kind?: "button";
  /** Button bounds in port/local coordinates (top, left, bottom, right). */
  boundsRect: Rect;
  label: string;
  disabled?: boolean;
  active?: boolean;
  default?: boolean;
}

export interface CheckboxDef {
  kind: "checkbox";
  /** Bounds of the full control (checkbox box + label) in port coordinates. */
  boundsRect: Rect;
  label: string;
  checked: boolean;
  disabled?: boolean;
}

export interface RadioButtonDef {
  kind: "radio";
  /** Bounds of the full control (radio circle + label) in port coordinates. */
  boundsRect: Rect;
  label: string;
  selected: boolean;
  disabled?: boolean;
}

export type ControlDef = ButtonDef | CheckboxDef | RadioButtonDef;

// -------------------------------------------------------------------------
// Control record and handle (original Mac Control Manager)
// -------------------------------------------------------------------------

/** Control kind / procID: 0 = pushButton, 1 = checkBox, 2 = radioButton, 4 = scrollBar, etc. */
export type ControlProcID = 0 | 1 | 2 | 4;

/** Part codes returned by FindControl (Inside Mac). */
export const inButton = 10;
export const inCheckBox = 11;
export const inUpButton = 20;
export const inDownButton = 21;
export const inPageUp = 22;
export const inPageDown = 23;
export const inThumb = 129;

/** Minimum interface for a window that owns controls (avoids circular WM dependency). */
export interface IWindowWithControls {
  id: string;
  controlList: ControlHandle[];
}

export interface ControlRecord {
  nextControl: ControlHandle | null;
  contrlOwner: IWindowWithControls;
  contrlRect: Rect;
  contrlVis: boolean;
  /** 0 = active, 1–253 = part code, 255 = inactive */
  contrlHilite: number;
  contrlValue: number;
  contrlMin: number;
  contrlMax: number;
  /** procID: 0 = pushButton, 1 = checkBox, 2 = radio, 4 = scrollBar */
  contrlDefProc: ControlProcID;
  contrlData: unknown;
  contrlAction: ((control: ControlHandle, partCode: number) => void) | null;
  contrlRfCon: number;
  contrlTitle: string;
}

/** Handle to a control (original Mac ControlHandle). */
export type ControlHandle = { ref: ControlRecord };

// -------------------------------------------------------------------------
// NewControl / GetNewControl (Mac Control Manager creation)
// -------------------------------------------------------------------------

/**
 * Create a control and append it to the window's control list (Mac NewControl).
 * procID: 0 = pushButton, 1 = checkBox, 2 = radioButton, 4 = scrollBar.
 * If targetList is provided, the control is pushed there instead of theWindow.controlList (e.g. scrollBarControls).
 */
export function NewControl(
  theWindow: IWindowWithControls,
  boundsRect: Rect,
  title: string,
  visible: boolean,
  value: number,
  min: number,
  max: number,
  procID: ControlProcID,
  refCon: number,
  targetList?: ControlHandle[]
): ControlHandle {
  const record: ControlRecord = {
    nextControl: null,
    contrlOwner: theWindow,
    contrlRect: cloneRect(boundsRect),
    contrlVis: visible,
    contrlHilite: 0,
    contrlValue: value,
    contrlMin: min,
    contrlMax: max,
    contrlDefProc: procID,
    contrlData: null,
    contrlAction: null,
    contrlRfCon: refCon,
    contrlTitle: title,
  };
  const handle: ControlHandle = { ref: record };
  const list = targetList ?? theWindow.controlList;
  list.push(handle);
  return handle;
}

/** Create control from CNTL resource (stub; Mac GetNewControl). */
export function GetNewControl(
  _controlID: number,
  _owner: IWindowWithControls
): ControlHandle | null {
  return null;
}

// -------------------------------------------------------------------------
// Internal helpers
// -------------------------------------------------------------------------

const BTN_OVAL_DIAMETER = 10;
const DEFAULT_OUTLINE_INSET = 4;
const DEFAULT_OUTLINE_PEN = 3;
const DEFAULT_OUTLINE_OVAL = 16;
const CHECKBOX_SIZE = 12;
const RADIO_SIZE = 12;
const CONTROL_TEXT_GAP = 4;

/** Scroll bar arrow and track segment size (matches SCROLLBAR_WIDTH in WindowManager). */
export const SCROLLBAR_ARROW_SIZE = 16;

/** Data stored in contrlData for scroll bar controls (procID 4). One control per scroll bar. */
export interface ScrollBarControlData {
  vertical: boolean;
  /** Track length in pixels (for thumb size calculation). */
  trackLengthPx?: number;
  /** Total content size (e.g. contentHeight or contentWidth). */
  contentLength?: number;
  /** Visible/page size (e.g. scrollableBodyH or contentW). */
  pageSize?: number;
}

/** Optional sprite provider for scroll bar chrome (arrows, track). Injected by WindowManager. */
export type GetSpriteFn = (id: string) => Sprite | null;

// -------------------------------------------------------------------------
// DrawControl — Scroll bar (procID 4)
// -------------------------------------------------------------------------

function _drawScrollBarControl(
  port: GrafPort,
  theControl: ControlHandle,
  getSprite?: GetSpriteFn
): void {
  const c = theControl.ref;
  const r = c.contrlRect;
  const data = c.contrlData as ScrollBarControlData | null;
  const vertical = data?.vertical ?? r.bottom - r.top >= r.right - r.left;
  const value = c.contrlValue;
  const min = c.contrlMin;
  const max = Math.max(c.contrlMax, min + 1);
  const arrow = SCROLLBAR_ARROW_SIZE;

  if (vertical) {
    const left = r.left;
    const top = r.top;
    const trackTop = top + arrow;
    const trackBottom = r.bottom - arrow;
    const trackHeight = Math.max(0, trackBottom - trackTop);

    if (getSprite) {
      const upSprite = getSprite("chrome/up");
      if (upSprite) blitSprite(port, upSprite, left, top);
      const downSprite = getSprite("chrome/down");
      if (downSprite) blitSprite(port, downSprite, left, trackBottom);
    }
    const contentLength = data?.contentLength ?? max - min;
    const pageSize = data?.pageSize ?? trackHeight;
    const thumbH =
      contentLength > 0
        ? Math.max(12, Math.floor((pageSize / contentLength) * trackHeight))
        : trackHeight;
    const thumbTravel = Math.max(0, trackHeight - thumbH);
    const range = max - min;
    const thumbY =
      trackTop + (range > 0 ? Math.floor((value / range) * thumbTravel) : 0);

    if (trackHeight > 0) {
      if (getSprite) {
        const trackSprite = getSprite("scrollbar-bg");
        if (trackSprite) {
          fillSpriteTile(port, trackSprite, left, trackTop, arrow, trackHeight);
        } else {
          qdFillPattern(port, left, trackTop, arrow, trackHeight, "gray50");
        }
      } else {
        qdFillPattern(port, left, trackTop, arrow, trackHeight, "gray50");
      }
      qdDrawVLine(port, left + arrow - 1, trackTop, trackHeight, BLACK);
    }

    if (range > 0 && thumbH > 0) {
      qdFillRect(port, left + 1, thumbY, arrow - 2, thumbH, WHITE);
      qdDrawRect(port, left + 1, thumbY, arrow - 2, thumbH, BLACK);
    }

    qdDrawVLine(port, left, top, r.bottom - top, BLACK);
  } else {
    const top = r.top;
    const left = r.left;
    const trackLeft = left + arrow;
    const trackRight = r.right - arrow;
    const trackWidth = Math.max(0, trackRight - trackLeft);

    if (getSprite) {
      const leftSprite = getSprite("chrome/left");
      if (leftSprite) blitSprite(port, leftSprite, left, top);
      const rightSprite = getSprite("chrome/right");
      if (rightSprite) blitSprite(port, rightSprite, trackRight, top);
    }
    const contentLength = data?.contentLength ?? max - min;
    const pageSize = data?.pageSize ?? trackWidth;
    const thumbW =
      contentLength > 0
        ? Math.max(12, Math.floor((pageSize / contentLength) * trackWidth))
        : trackWidth;
    const thumbTravel = Math.max(0, trackWidth - thumbW);
    const range = max - min;
    const thumbX =
      trackLeft + (range > 0 ? Math.floor((value / range) * thumbTravel) : 0);

    if (trackWidth > 0) {
      if (getSprite) {
        const trackSprite = getSprite("scrollbar-bg");
        if (trackSprite) {
          fillSpriteTile(
            port,
            trackSprite,
            trackLeft,
            top + 1,
            trackWidth,
            arrow - 2
          );
        } else {
          qdFillPattern(
            port,
            trackLeft,
            top + 1,
            trackWidth,
            arrow - 2,
            "gray50"
          );
        }
      } else {
        qdFillPattern(
          port,
          trackLeft,
          top + 1,
          trackWidth,
          arrow - 2,
          "gray50"
        );
      }
    }

    if (range > 0 && thumbW > 0) {
      qdFillRect(port, thumbX, top + 1, thumbW, arrow - 2, WHITE);
      qdDrawRect(port, thumbX, top + 1, thumbW, arrow - 2, BLACK);
    }

    qdDrawHLine(port, left, top, r.right - left, BLACK);
  }
}

/**
 * Draw all scroll bar controls in the window (frame port, window-local coords).
 * Call from WindowManager when drawing window chrome.
 */
export function DrawScrollBarControls(
  theWindow: IWindowWithScrollBarControls,
  port: GrafPort,
  getSprite?: GetSpriteFn
): void {
  for (const handle of theWindow.scrollBarControls) {
    const c = handle.ref;
    if (!c.contrlVis) continue;
    if (c.contrlDefProc === 4) {
      _drawScrollBarControl(port, handle, getSprite);
    }
  }
}

// -------------------------------------------------------------------------
// DrawControl — Button
// -------------------------------------------------------------------------

/** Run fn with port set; restore previous port when done. */
function withPort<T>(port: GrafPort, fn: () => T): T {
  const prev = GetPort();
  SetPort(port);
  try {
    return fn();
  } finally {
    if (prev) SetPort(prev);
  }
}

export function drawButton(port: GrafPort, btn: ButtonDef): Rect {
  const buttonRect = cloneRect(btn.boundsRect);
  const { top, left, bottom, right } = buttonRect;

  const isDefault = btn.default === true;
  const ovalWidth = BTN_OVAL_DIAMETER; // horizontal diameter of corner curvature
  const ovalHeight = BTN_OVAL_DIAMETER; // vertical diameter

  withPort(port, () => {
    PenNormal();
    if (isDefault) {
      const defaultRect = cloneRect(buttonRect);
      InsetRect(defaultRect, -DEFAULT_OUTLINE_INSET, -DEFAULT_OUTLINE_INSET);
      PenSize(DEFAULT_OUTLINE_PEN, DEFAULT_OUTLINE_PEN);
      PenPat(QD_PATTERNS.black);
      FrameRoundRect(defaultRect, DEFAULT_OUTLINE_OVAL, DEFAULT_OUTLINE_OVAL);
      PenNormal();
    }

    PenPat(QD_PATTERNS.black);
    FrameRoundRect(buttonRect, ovalWidth, ovalHeight);

    const inset = 1;
    const lineHeight = getLineHeight("menu");
    const textW = measureText(btn.label, "menu");
    const innerWidth = right - left - 2;
    const innerHeight = bottom - top - 2;
    const tx = left + inset + Math.floor((innerWidth - textW) / 2);
    const ty =
      top + inset + Math.max(0, Math.floor((innerHeight - lineHeight) / 2));

    if (btn.active) {
      PenPat(QD_PATTERNS.black);
      PaintRoundRect(buttonRect, ovalWidth, ovalHeight);
    }

    if (btn.active) {
      PenPat(QD_PATTERNS.white);
    }
    MoveTo(tx, ty);
    DrawString(btn.label);
    PenNormal();

    if (btn.disabled) {
      const innerRect = makeRect(
        top + inset,
        left + inset,
        bottom - inset,
        right - inset
      );
      FillRect(innerRect, QD_PATTERNS.gray50);
    }
  });

  if (isDefault) {
    return makeRect(
      top - DEFAULT_OUTLINE_INSET,
      left - DEFAULT_OUTLINE_INSET,
      bottom + DEFAULT_OUTLINE_INSET,
      right + DEFAULT_OUTLINE_INSET
    );
  }
  return cloneRect(buttonRect);
}

// -------------------------------------------------------------------------
// DrawControl — Checkbox (12×12 box with X when checked)
// -------------------------------------------------------------------------

export function drawCheckbox(port: GrafPort, def: CheckboxDef): Rect {
  const { boundsRect, label, checked, disabled } = def;
  const { top, left, bottom, right } = boundsRect;
  const lineH = getLineHeight("body");
  const boxY = top + Math.max(0, Math.floor((lineH - CHECKBOX_SIZE) / 2));

  qdDrawRect(port, left, boxY, CHECKBOX_SIZE, CHECKBOX_SIZE, BLACK);
  qdFillRect(
    port,
    left + 1,
    boxY + 1,
    CHECKBOX_SIZE - 2,
    CHECKBOX_SIZE - 2,
    WHITE
  );

  if (checked) {
    for (let i = 2; i < CHECKBOX_SIZE - 2; i++) {
      qdSetPixel(port, left + i, boxY + i, BLACK);
      qdSetPixel(port, left + CHECKBOX_SIZE - 1 - i, boxY + i, BLACK);
    }
  }

  const textX = left + CHECKBOX_SIZE + CONTROL_TEXT_GAP;
  qdDrawText(port, label, textX, top, BLACK);

  if (disabled) {
    const totalW =
      CHECKBOX_SIZE + CONTROL_TEXT_GAP + measureText(label, "body");
    qdFillPattern(port, left, top, totalW, lineH, "gray50");
  }

  return cloneRect(boundsRect);
}

// -------------------------------------------------------------------------
// DrawControl — Radio Button (12×12 circle with dot when selected)
// -------------------------------------------------------------------------

export function drawRadioButton(port: GrafPort, def: RadioButtonDef): Rect {
  const { boundsRect, label, selected, disabled } = def;
  const { top, left } = boundsRect;
  const lineH = getLineHeight("body");
  const circY = top + Math.max(0, Math.floor((lineH - RADIO_SIZE) / 2));
  const cx = left + Math.floor(RADIO_SIZE / 2);
  const cy = circY + Math.floor(RADIO_SIZE / 2);
  const r = Math.floor(RADIO_SIZE / 2);

  _drawCircleOutline(port, cx, cy, r);

  if (selected) {
    _fillCircle(port, cx, cy, r - 3);
  }

  const textX = left + RADIO_SIZE + CONTROL_TEXT_GAP;
  qdDrawText(port, label, textX, top, BLACK);

  if (disabled) {
    const totalW = RADIO_SIZE + CONTROL_TEXT_GAP + measureText(label, "body");
    qdFillPattern(port, left, top, totalW, lineH, "gray50");
  }

  return cloneRect(boundsRect);
}

// -------------------------------------------------------------------------
// DrawControl — Unified dispatcher (matches original Mac DrawControl)
// -------------------------------------------------------------------------

export function DrawControl(port: GrafPort, def: ControlDef): Rect {
  const kind = (def as any).kind;
  if (kind === "checkbox") return drawCheckbox(port, def as CheckboxDef);
  if (kind === "radio") return drawRadioButton(port, def as RadioButtonDef);
  return drawButton(port, def as ButtonDef);
}

// -------------------------------------------------------------------------
// Draw1Control / DrawControls / UpdateControls (Mac Control Manager drawing)
// -------------------------------------------------------------------------

/** Build a ControlDef from a ControlRecord for the existing draw routines. */
function _recordToDef(c: ControlRecord): ControlDef {
  const kind = c.contrlDefProc;
  const boundsRect = cloneRect(c.contrlRect);
  const disabled = c.contrlHilite === 255;
  if (kind === 0) {
    const data = c.contrlData as { default?: boolean } | null;
    const btn: ButtonDef = {
      kind: "button",
      boundsRect,
      label: c.contrlTitle,
      disabled,
      active: c.contrlValue !== 0,
      default: data?.default === true,
    };
    return btn;
  }
  if (kind === 1) {
    return {
      kind: "checkbox",
      boundsRect,
      label: c.contrlTitle,
      checked: c.contrlValue !== 0,
      disabled,
    };
  }
  if (kind === 2) {
    return {
      kind: "radio",
      boundsRect,
      label: c.contrlTitle,
      selected: c.contrlValue !== 0,
      disabled,
    };
  }
  return {
    kind: "button",
    boundsRect,
    label: c.contrlTitle,
    disabled,
    active: false,
  };
}

/** Draw a single control if visible (Mac Draw1Control). */
export function Draw1Control(
  theControl: ControlHandle,
  port: GrafPort,
  getSprite?: GetSpriteFn
): void {
  const c = theControl.ref;
  if (!c.contrlVis) return;
  if (c.contrlDefProc === 4) {
    _drawScrollBarControl(port, theControl, getSprite);
    return;
  }
  const def = _recordToDef(c);
  DrawControl(port, def);
}

/** Draw all visible controls in the window (Mac DrawControls). */
export function DrawControls(
  theWindow: IWindowWithControls,
  port: GrafPort
): void {
  for (const handle of theWindow.controlList) {
    Draw1Control(handle, port);
  }
}

/** Redraw controls whose rect intersects the update region (Mac UpdateControls). */
export function UpdateControls(
  theWindow: IWindowWithControls,
  port: GrafPort,
  updateRect: Rect | null
): void {
  if (updateRect === null) {
    DrawControls(theWindow, port);
    return;
  }
  const dst = makeRect(0, 0, 0, 0);
  for (const handle of theWindow.controlList) {
    const c = handle.ref;
    if (!c.contrlVis) continue;
    if (SectRect(c.contrlRect, updateRect, dst) && !EmptyRect(dst)) {
      Draw1Control(handle, port);
    }
  }
}

// -------------------------------------------------------------------------
// FindControl (Mac Control Manager hit-test)
// -------------------------------------------------------------------------

/** Part code for control kind (pushButton -> inButton, checkBox/radio -> inCheckBox). */
function _partCodeForKind(procID: ControlProcID): number {
  if (procID === 0) return inButton;
  if (procID === 1 || procID === 2) return inCheckBox;
  return inButton;
}

/**
 * Find which control (if any) contains the point; return part code (Mac FindControl).
 * thePoint in window content-local coordinates. Walk list in reverse so front-most wins.
 */
export function FindControl(
  thePoint: Point,
  theWindow: IWindowWithControls
): { theControl: ControlHandle | null; partCode: number } {
  const pt = thePoint;
  const list = theWindow.controlList;
  for (let i = list.length - 1; i >= 0; i--) {
    const handle = list[i];
    const c = handle.ref;
    if (!c.contrlVis || c.contrlHilite === 255) continue;
    if (PtInRect(pt, c.contrlRect)) {
      return {
        theControl: handle,
        partCode: _partCodeForKind(c.contrlDefProc),
      };
    }
  }
  return { theControl: null, partCode: 0 };
}

/** Window with optional scroll bar controls (window-local coords). */
export interface IWindowWithScrollBarControls extends IWindowWithControls {
  scrollBarControls: ControlHandle[];
}

/** Options for creating or updating window scroll bar controls. All geometry in window-local coordinates. */
export interface ScrollBarOptions {
  /** Vertical scroll bar bounds (full strip: up arrow + track + down arrow). */
  verticalRect: Rect | null;
  /** Horizontal scroll bar bounds (full strip: left arrow + track + right arrow). */
  horizontalRect: Rect | null;
  scrollY: number;
  scrollX: number;
  contentHeight: number;
  contentWidth: number;
  /** Height of scrollable region (visible content height). */
  scrollableBodyH: number;
  /** Width of content area (visible content width for horizontal scroll). */
  contentW: number;
  scheduleRender: () => void;
}

/** Window that has scroll state (for CreateOrUpdateScrollBarControls). */
export interface IWindowWithScrollState extends IWindowWithScrollBarControls {
  scrollY: number;
  scrollX: number;
  contentHeight: number;
  contentWidth: number;
}

/**
 * Create or update the two scroll bar controls (vertical and horizontal) for a window.
 * Call from WindowManager.drawWindowChrome when win.scrollable. Sets value/min/max and contrlAction.
 */
export function CreateOrUpdateScrollBarControls(
  theWindow: IWindowWithScrollState,
  options: ScrollBarOptions
): void {
  const {
    verticalRect,
    horizontalRect,
    scrollY,
    scrollX,
    contentHeight,
    contentWidth,
    scrollableBodyH,
    contentW,
    scheduleRender,
  } = options;

  theWindow.scrollBarControls.length = 0;

  if (verticalRect) {
    const maxScrollY = Math.max(0, contentHeight - scrollableBodyH);
    const trackHeight = Math.max(
      0,
      verticalRect.bottom - verticalRect.top - 2 * SCROLLBAR_ARROW_SIZE
    );
    const vHandle = NewControl(
      theWindow,
      verticalRect,
      "",
      true,
      scrollY,
      0,
      maxScrollY,
      4,
      0,
      theWindow.scrollBarControls
    );
    vHandle.ref.contrlData = {
      vertical: true,
      trackLengthPx: trackHeight,
      contentLength: contentHeight,
      pageSize: scrollableBodyH,
    } as ScrollBarControlData;
    vHandle.ref.contrlAction = (_, partCode) => {
      if (partCode === inUpButton) {
        theWindow.scrollY = Math.max(0, theWindow.scrollY - 12);
        scheduleRender();
      } else if (partCode === inDownButton) {
        theWindow.scrollY = Math.min(maxScrollY, theWindow.scrollY + 12);
        scheduleRender();
      } else if (partCode === inPageUp) {
        theWindow.scrollY = Math.max(0, theWindow.scrollY - scrollableBodyH);
        scheduleRender();
      } else if (partCode === inPageDown) {
        theWindow.scrollY = Math.min(
          maxScrollY,
          theWindow.scrollY + scrollableBodyH
        );
        scheduleRender();
      }
    };
  }

  if (horizontalRect) {
    const maxScrollX = Math.max(0, contentWidth - contentW);
    const trackWidth = Math.max(
      0,
      horizontalRect.right - horizontalRect.left - 2 * SCROLLBAR_ARROW_SIZE
    );
    const hHandle = NewControl(
      theWindow,
      horizontalRect,
      "",
      true,
      scrollX,
      0,
      maxScrollX,
      4,
      0,
      theWindow.scrollBarControls
    );
    hHandle.ref.contrlData = {
      vertical: false,
      trackLengthPx: trackWidth,
      contentLength: contentWidth,
      pageSize: contentW,
    } as ScrollBarControlData;
    hHandle.ref.contrlAction = (_, partCode) => {
      if (partCode === inUpButton) {
        theWindow.scrollX = Math.max(0, theWindow.scrollX - 12);
        scheduleRender();
      } else if (partCode === inDownButton) {
        theWindow.scrollX = Math.min(maxScrollX, theWindow.scrollX + 12);
        scheduleRender();
      } else if (partCode === inPageUp) {
        theWindow.scrollX = Math.max(0, theWindow.scrollX - contentW);
        scheduleRender();
      } else if (partCode === inPageDown) {
        theWindow.scrollX = Math.min(maxScrollX, theWindow.scrollX + contentW);
        scheduleRender();
      }
    };
  }
}

/**
 * Compute the scroll value (contrlValue) from a point in the scroll bar (for thumb drag).
 * Used by TrackControl when partCode is inThumb.
 */
function _scrollBarValueFromPoint(
  theControl: ControlHandle,
  point: Point
): number {
  const c = theControl.ref;
  const r = c.contrlRect;
  const data = c.contrlData as ScrollBarControlData | null;
  const vertical = data?.vertical ?? r.bottom - r.top >= r.right - r.left;
  const arrow = SCROLLBAR_ARROW_SIZE;
  const min = c.contrlMin;
  const max = Math.max(c.contrlMax, min + 1);
  const range = max - min;

  if (vertical) {
    const trackTop = r.top + arrow;
    const trackBottom = r.bottom - arrow;
    const trackHeight = Math.max(0, trackBottom - trackTop);
    const contentLength = data?.contentLength ?? range;
    const pageSize = data?.pageSize ?? trackHeight;
    const thumbH =
      contentLength > 0
        ? Math.max(12, Math.floor((pageSize / contentLength) * trackHeight))
        : trackHeight;
    const thumbTravel = Math.max(0, trackHeight - thumbH);
    const py = point.v;
    const t = thumbTravel > 0 ? (py - trackTop) / thumbTravel : 0;
    const value = min + t * range;
    return Math.max(min, Math.min(max, Math.round(value)));
  } else {
    const trackLeft = r.left + arrow;
    const trackRight = r.right - arrow;
    const trackWidth = Math.max(0, trackRight - trackLeft);
    const contentLength = data?.contentLength ?? range;
    const pageSize = data?.pageSize ?? trackWidth;
    const thumbW =
      contentLength > 0
        ? Math.max(12, Math.floor((pageSize / contentLength) * trackWidth))
        : trackWidth;
    const thumbTravel = Math.max(0, trackWidth - thumbW);
    const px = point.h;
    const t = thumbTravel > 0 ? (px - trackLeft) / thumbTravel : 0;
    const value = min + t * range;
    return Math.max(min, Math.min(max, Math.round(value)));
  }
}

/**
 * Hit-test the five parts of a scroll bar control (up arrow, down arrow, track above thumb, thumb, track below thumb).
 * Returns inUpButton, inDownButton, inThumb, inPageUp, or inPageDown.
 */
function _scrollBarPartHitTest(
  theControl: ControlHandle,
  point: Point
): number {
  const c = theControl.ref;
  const r = c.contrlRect;
  const data = c.contrlData as ScrollBarControlData | null;
  const vertical = data?.vertical ?? r.bottom - r.top >= r.right - r.left;
  const arrow = SCROLLBAR_ARROW_SIZE;
  const value = c.contrlValue;
  const min = c.contrlMin;
  const max = Math.max(c.contrlMax, min + 1);
  const range = max - min;

  if (vertical) {
    const top = r.top;
    const left = r.left;
    const trackTop = top + arrow;
    const trackBottom = r.bottom - arrow;
    const trackHeight = Math.max(0, trackBottom - trackTop);
    const contentLength = data?.contentLength ?? range;
    const pageSize = data?.pageSize ?? trackHeight;
    const thumbH =
      contentLength > 0
        ? Math.max(12, Math.floor((pageSize / contentLength) * trackHeight))
        : trackHeight;
    const thumbTravel = Math.max(0, trackHeight - thumbH);
    const thumbY =
      trackTop + (range > 0 ? Math.floor((value / range) * thumbTravel) : 0);
    const thumbBottom = thumbY + thumbH;

    const py = point.v;

    if (py < trackTop) return inUpButton;
    if (py >= trackBottom) return inDownButton;
    if (py < thumbY) return inPageUp;
    if (py < thumbBottom) return inThumb;
    return inPageDown;
  } else {
    const left = r.left;
    const top = r.top;
    const trackLeft = left + arrow;
    const trackRight = r.right - arrow;
    const trackWidth = Math.max(0, trackRight - trackLeft);
    const contentLength = data?.contentLength ?? range;
    const pageSize = data?.pageSize ?? trackWidth;
    const thumbW =
      contentLength > 0
        ? Math.max(12, Math.floor((pageSize / contentLength) * trackWidth))
        : trackWidth;
    const thumbTravel = Math.max(0, trackWidth - thumbW);
    const thumbX =
      trackLeft + (range > 0 ? Math.floor((value / range) * thumbTravel) : 0);
    const thumbRight = thumbX + thumbW;

    const px = point.h;

    if (px < trackLeft) return inUpButton;
    if (px >= trackRight) return inDownButton;
    if (px < thumbX) return inPageUp;
    if (px < thumbRight) return inThumb;
    return inPageDown;
  }
}

/**
 * Find which control (if any) contains the point; return part code (Mac FindControl for frame controls).
 * Used when FindWindow returns inVScroll or inHScroll. For scroll bar controls (procID 4), computes
 * part code from the five regions (up arrow, down arrow, thumb, page up, page down).
 */
export function FindControlInWindow(
  theWindow: IWindowWithScrollBarControls,
  windowLocalPoint: Point
): { theControl: ControlHandle | null; partCode: number } {
  const list = theWindow.scrollBarControls;
  const pt = windowLocalPoint;
  for (let i = list.length - 1; i >= 0; i--) {
    const handle = list[i];
    const c = handle.ref;
    if (!c.contrlVis) continue;
    if (PtInRect(pt, c.contrlRect)) {
      const partCode =
        c.contrlDefProc === 4
          ? _scrollBarPartHitTest(handle, pt)
          : (c.contrlData as { partCode?: number })?.partCode ?? 0;
      return {
        theControl: handle,
        partCode,
      };
    }
  }
  return { theControl: null, partCode: 0 };
}

// -------------------------------------------------------------------------
// TrackControl (Mac Control Manager tracking)
// -------------------------------------------------------------------------

/** Result of TrackControl for scroll bar thumb: includes onTrackMove for live drag updates. */
export interface TrackControlResultWithMove {
  onTrackEnd: (upPoint: Point) => number;
  onTrackMove?: (point: Point) => void;
}

/**
 * Track mouse in control: invert on call (mouse down), return a function to call on
 * mouse up with the release point. For scroll bar thumb (procID 4, partCode inThumb),
 * pass partCode so this returns an object with onTrackEnd and onTrackMove; the event
 * loop feeds mouse move events during drag; ControlManager updates contrlValue.
 */
export function TrackControl(
  theControl: ControlHandle,
  thePoint: Point,
  port: GrafPort,
  partCodeFromHit?: number
): ((upPoint: Point) => number) | TrackControlResultWithMove {
  const c = theControl.ref;
  const rect = c.contrlRect;
  const partCode =
    partCodeFromHit ??
    (c.contrlDefProc === 4
      ? (c.contrlData as { partCode?: number })?.partCode ?? 0
      : _partCodeForKind(c.contrlDefProc));

  if (c.contrlDefProc === 4 && partCodeFromHit === inThumb) {
    SetControlValue(theControl, _scrollBarValueFromPoint(theControl, thePoint));
    return {
      onTrackEnd(upPoint: Point): number {
        const val = _scrollBarValueFromPoint(theControl, upPoint);
        SetControlValue(theControl, val);
        return PtInRect(upPoint, rect) ? inThumb : 0;
      },
      onTrackMove(point: Point): void {
        const val = _scrollBarValueFromPoint(theControl, point);
        SetControlValue(theControl, val);
      },
    };
  }

  if (c.contrlDefProc === 0) {
    withPort(port, () => {
      PenNormal();
      InvertRoundRect(rect, BTN_OVAL_DIAMETER, BTN_OVAL_DIAMETER);
    });
  }
  return (upPoint: Point): number => {
    if (c.contrlDefProc === 0) {
      withPort(port, () => {
        PenNormal();
        InvertRoundRect(rect, BTN_OVAL_DIAMETER, BTN_OVAL_DIAMETER);
      });
    }
    return PtInRect(upPoint, rect) ? partCode : 0;
  };
}

// -------------------------------------------------------------------------
// GetControlValue / SetControlValue / GetControlMaximum / SetControlMaximum
// -------------------------------------------------------------------------

export function GetControlValue(theControl: ControlHandle): number {
  return theControl.ref.contrlValue;
}

export function SetControlValue(
  theControl: ControlHandle,
  theValue: number
): void {
  theControl.ref.contrlValue = theValue;
}

export function GetControlMaximum(theControl: ControlHandle): number {
  return theControl.ref.contrlMax;
}

export function SetControlMaximum(
  theControl: ControlHandle,
  maxValue: number
): void {
  theControl.ref.contrlMax = maxValue;
}

// -------------------------------------------------------------------------
// ShowControl / HideControl / MoveControl / SizeControl
// -------------------------------------------------------------------------

export function ShowControl(theControl: ControlHandle): void {
  theControl.ref.contrlVis = true;
}

export function HideControl(theControl: ControlHandle): void {
  theControl.ref.contrlVis = false;
}

export function MoveControl(
  theControl: ControlHandle,
  h: number,
  v: number
): void {
  OffsetRect(theControl.ref.contrlRect, h, v);
}

export function SizeControl(
  theControl: ControlHandle,
  w: number,
  h: number
): void {
  const r = theControl.ref.contrlRect;
  r.right = r.left + w;
  r.bottom = r.top + h;
}

// -------------------------------------------------------------------------
// Circle drawing helpers (midpoint circle algorithm)
// -------------------------------------------------------------------------

function _drawCircleOutline(
  port: GrafPort,
  cx: number,
  cy: number,
  r: number
): void {
  let x = r;
  let y = 0;
  let d = 1 - r;
  _plotCirclePoints(port, cx, cy, x, y);
  while (x > y) {
    y++;
    if (d <= 0) {
      d += 2 * y + 1;
    } else {
      x--;
      d += 2 * (y - x) + 1;
    }
    _plotCirclePoints(port, cx, cy, x, y);
  }
}

function _plotCirclePoints(
  port: GrafPort,
  cx: number,
  cy: number,
  x: number,
  y: number
): void {
  qdSetPixel(port, cx + x, cy + y, BLACK);
  qdSetPixel(port, cx - x, cy + y, BLACK);
  qdSetPixel(port, cx + x, cy - y, BLACK);
  qdSetPixel(port, cx - x, cy - y, BLACK);
  qdSetPixel(port, cx + y, cy + x, BLACK);
  qdSetPixel(port, cx - y, cy + x, BLACK);
  qdSetPixel(port, cx + y, cy - x, BLACK);
  qdSetPixel(port, cx - y, cy - x, BLACK);
}

function _fillCircle(port: GrafPort, cx: number, cy: number, r: number): void {
  for (let dy = -r; dy <= r; dy++) {
    const halfW = Math.floor(Math.sqrt(r * r - dy * dy));
    for (let dx = -halfW; dx <= halfW; dx++) {
      qdSetPixel(port, cx + dx, cy + dy, BLACK);
    }
  }
}

/**
 * Invert the button's round rect (for press feedback). Call on mouse down,
 * then call again on mouse up/leave to restore. Uses QuickDraw InvertRoundRect.
 * @param boundsRect Button bounds in port coordinates (top, left, bottom, right).
 */
export function invertButton(port: GrafPort, boundsRect: Rect): void {
  withPort(port, () => {
    PenNormal();
    InvertRoundRect(boundsRect, BTN_OVAL_DIAMETER, BTN_OVAL_DIAMETER);
  });
}
