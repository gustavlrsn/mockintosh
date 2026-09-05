/**
 * Cursor routines — from `QuickDraw.p` Cursor Routines section.
 *
 * In the original Mac ROM, cursor management was performed by the Vertical
 * Blank Manager in hardware — the cursor sprite was composited over the
 * framebuffer each VBL interrupt.  Here we provide state-tracking equivalents
 * that the rendering engine can observe to position and show/hide the cursor
 * sprite.
 */

import { Cursor } from "./types";
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
 * Restore the cursor to the standard arrow sprite and make it fully visible.
 * `PROCEDURE InitCursor`.
 */
export function InitCursor(): void {
  cursorState.cursor = globals.arrow;
  cursorState.visible = true;
  cursorState.obscured = false;
  cursorState.hideCount = 0;
}

/**
 * Change the cursor shape to `crsr` and clear the obscured flag.
 * `PROCEDURE SetCursor(crsr: Cursor)`.
 */
export function SetCursor(crsr: Cursor): void {
  cursorState.cursor = crsr;
  cursorState.obscured = false;
}

/**
 * Decrement the hide counter; the cursor becomes invisible when
 * `hideCount < 0`.  Calls may be nested: match each `HideCursor` with
 * a corresponding {@link ShowCursor}.
 * `PROCEDURE HideCursor`.
 */
export function HideCursor(): void {
  cursorState.hideCount--;
  cursorState.visible = cursorState.hideCount >= 0;
}

/**
 * Increment the hide counter; the cursor becomes visible again when
 * `hideCount >= 0`.
 * `PROCEDURE ShowCursor`.
 */
export function ShowCursor(): void {
  cursorState.hideCount++;
  cursorState.visible = cursorState.hideCount >= 0;
}

/**
 * Temporarily hide the cursor until the next mouse movement.
 * Sets `cursorState.obscured = true`; the rendering engine should clear this
 * flag when a `mousemove` event is received.
 * `PROCEDURE ObscureCursor`.
 */
export function ObscureCursor(): void {
  cursorState.obscured = true;
}
