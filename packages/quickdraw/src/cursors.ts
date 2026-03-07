// Cursor routines — from QuickDraw.p Cursor Routines section
//
// In the original Mac ROM, cursor management was handled by the Vertical
// Blank Manager in hardware. Here we provide state-tracking equivalents
// that apps and the OS can observe to render the cursor sprite.

import { Cursor } from "./types";
import { globals } from "./globals";

// Current cursor state (observable by the rendering engine)
export interface CursorState {
  cursor: Cursor;
  visible: boolean; // false when HideCursor count > 0
  obscured: boolean; // true after ObscureCursor (cleared on next move)
  hideCount: number; // HideCursor decrements, ShowCursor increments
}

export const cursorState: CursorState = {
  cursor: globals.arrow,
  visible: true,
  obscured: false,
  hideCount: 0,
};

// PROCEDURE InitCursor;
// Restores the cursor to the standard arrow and makes it visible.
export function InitCursor(): void {
  cursorState.cursor = globals.arrow;
  cursorState.visible = true;
  cursorState.obscured = false;
  cursorState.hideCount = 0;
}

// PROCEDURE SetCursor(crsr: Cursor);
export function SetCursor(crsr: Cursor): void {
  cursorState.cursor = crsr;
  cursorState.obscured = false;
}

// PROCEDURE HideCursor;
// Decrements hideCount; cursor is invisible when hideCount < 0.
export function HideCursor(): void {
  cursorState.hideCount--;
  cursorState.visible = cursorState.hideCount >= 0;
}

// PROCEDURE ShowCursor;
// Increments hideCount; cursor becomes visible when hideCount reaches 0.
export function ShowCursor(): void {
  cursorState.hideCount++;
  cursorState.visible = cursorState.hideCount >= 0;
}

// PROCEDURE ObscureCursor;
// Temporarily hides the cursor until the mouse is next moved.
export function ObscureCursor(): void {
  cursorState.obscured = true;
}
