/**
 * Cursor routines — from `QuickDraw.p` and `LCursor.a`.
 *
 * `LCursor.a` is glue: every public call jumps through the `$800` table into
 * the ROM cursor engine (not in the reference source). The port keeps that
 * seam and a `cursorState` machine the host compositor can observe; it does
 * not implement a save-under engine in `screenBits` (Decision 4).
 */

import { Cursor, Point, Rect } from "./types";
import { globals } from "./globals";

/**
 * Observable snapshot of the current cursor state.
 * The rendering engine should read this each frame to decide whether and
 * how to draw the cursor sprite.
 */
export interface CursorState {
  /** The active cursor sprite (data + mask + hotSpot). */
  cursor: Cursor;
  /** `true` when the cursor should be drawn (`hideCount >= 0` and not obscured). */
  visible: boolean;
  /**
   * `true` after {@link ObscureCursor} — the cursor is temporarily hidden
   * until the mouse moves.  The rendering engine is responsible for clearing
   * this flag on mouse movement.
   */
  obscured: boolean;
  /**
   * Reference counter for hide/show nesting.
   * {@link HideCursor} decrements; {@link ShowCursor} increments.
   * The cursor is visible when `hideCount >= 0`.
   */
  hideCount: number;
}

/** Singleton cursor state, observable by the rendering engine. */
export const cursorState: CursorState = {
  cursor: globals.arrow,
  visible: true,
  obscured: false,
  hideCount: 0,
};

/**
 * Installable `$800` cursor vectors (`LCursor.a:13-22`).
 * `JSCRNADDR` (`$80C`) and `JSCRNSIZE` (`$810`) are unused (see `_GetScrnBits`).
 */
export interface CursorVectors {
  /** `$800` `JHideCursor`. */
  hideCursor: () => void;
  /** `$804` `JShowCursor`. */
  showCursor: () => void;
  /**
   * `$808` `JShieldCursor`.
   * Receives the shield rect already converted to global coords
   * (`LCursor.a:88-99`).
   */
  shieldCursor: (globalRect: Rect) => void;
  /** `$814` `JInitCrsr`. */
  initCursor: () => void;
  /** `$818` `JSetCrsr`. */
  setCursor: (crsr: Cursor) => void;
  /** `$81C` `JCrsrObscure`. */
  obscureCursor: () => void;
}

function defaultHideCursor(): void {
  cursorState.hideCount--;
  cursorState.visible = cursorState.hideCount >= 0;
}

function defaultShowCursor(): void {
  // Saturates at hideCount 0 (IM I-168); extra ShowCursor calls are no-ops.
  if (cursorState.hideCount >= 0) {
    cursorState.visible = true;
    return;
  }
  cursorState.hideCount++;
  cursorState.visible = cursorState.hideCount >= 0;
}

function defaultShieldCursor(_globalRect: Rect): void {
  // Vector only — host composites the sprite after the frame (Decision 4).
}

function defaultInitCursor(): void {
  cursorState.visible = true;
  cursorState.obscured = false;
  cursorState.hideCount = 0;
}

function defaultSetCursor(crsr: Cursor): void {
  cursorState.cursor = crsr;
  // SetCursor does not un-obscure (`LCursor.a:40-53` / IM I-168).
}

function defaultObscureCursor(): void {
  cursorState.obscured = true;
}

const defaultCursorVectors: CursorVectors = {
  hideCursor: defaultHideCursor,
  showCursor: defaultShowCursor,
  shieldCursor: defaultShieldCursor,
  initCursor: defaultInitCursor,
  setCursor: defaultSetCursor,
  obscureCursor: defaultObscureCursor,
};

let vectors: CursorVectors = { ...defaultCursorVectors };
/** True when `$808` is not the default no-op (host save-under / real engine). */
let shieldLive = false;

/**
 * Replace the `$800` table. Omitted slots revert to the default
 * `cursorState` machine (`LCursor.a:13-22`).
 */
export function installCursorVectors(next: Partial<CursorVectors> = {}): void {
  vectors = {
    hideCursor: next.hideCursor ?? defaultCursorVectors.hideCursor,
    showCursor: next.showCursor ?? defaultCursorVectors.showCursor,
    shieldCursor: next.shieldCursor ?? defaultCursorVectors.shieldCursor,
    initCursor: next.initCursor ?? defaultCursorVectors.initCursor,
    setCursor: next.setCursor ?? defaultCursorVectors.setCursor,
    obscureCursor: next.obscureCursor ?? defaultCursorVectors.obscureCursor,
  };
  shieldLive = vectors.shieldCursor !== defaultShieldCursor;
}

/**
 * Run `body` under Shield/Show only when a real shield vector is installed.
 * The default shield is a no-op (host composites after the frame), so the
 * pair is skipped to avoid a rect alloc and two calls per primitive.
 */
export function withCursorShield(rect: Rect, offsetPt: Point, body: () => void): void {
  if (!shieldLive) {
    body();
    return;
  }
  ShieldCursor(rect, offsetPt);
  try {
    body();
  } finally {
    ShowCursor();
  }
}

/**
 * Restore the cursor to the standard arrow sprite and make it fully visible.
 * `PROCEDURE InitCursor` (`LCursor.a:26-37`): `SetCursor(arrow)` then `JInitCrsr`.
 */
export function InitCursor(): void {
  SetCursor(globals.arrow);
  vectors.initCursor();
}

/**
 * Change the cursor shape to `crsr`. Does not clear `obscured`.
 * `PROCEDURE SetCursor(crsr: Cursor)` (`LCursor.a:40-53`).
 */
export function SetCursor(crsr: Cursor): void {
  vectors.setCursor(crsr);
}

/**
 * Decrement the hide counter; the cursor becomes invisible when
 * `hideCount < 0`.  Calls may be nested: match each `HideCursor` with
 * a corresponding {@link ShowCursor}.
 * `PROCEDURE HideCursor` (`LCursor.a:57-65`).
 */
export function HideCursor(): void {
  vectors.hideCursor();
}

/**
 * Increment the hide counter; the cursor becomes visible again when
 * `hideCount >= 0`. Saturates at 0.
 * `PROCEDURE ShowCursor` (`LCursor.a:69-77`).
 */
export function ShowCursor(): void {
  vectors.showCursor();
}

/**
 * Temporarily hide the cursor until the next mouse movement.
 * Sets `cursorState.obscured = true`; the rendering engine should clear this
 * flag when a `mousemove` event is received.
 * `PROCEDURE ObscureCursor` (`LCursor.a:109-117`).
 */
export function ObscureCursor(): void {
  vectors.obscureCursor();
}

/**
 * Convert `shieldRect` to global coords by subtracting `offsetPt`
 * (`LCursor.a:88-99`), then call `JShieldCursor` with that rect.
 * `PROCEDURE ShieldCursor(shieldRect: Rect; offset: Point)`.
 */
export function ShieldCursor(shieldRect: Rect, offsetPt: Point): void {
  vectors.shieldCursor({
    top: shieldRect.top - offsetPt.v,
    left: shieldRect.left - offsetPt.h,
    bottom: shieldRect.bottom - offsetPt.v,
    right: shieldRect.right - offsetPt.h,
  });
}
