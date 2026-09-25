/**
 * Full-screen menubar reveal. The bar is tucked above the screen while a
 * presentation covers it, and slides down when the pointer passes the top
 * edge — including a position above the screen, where the web host's page
 * surrounds the canvas. That pass is captured. The bar slides back up once
 * the pointer leaves it, unless a menu is open.
 */
import { createSignal } from "solid-js";
import type { PlatformPointerEvent } from "../platform/types";
import { getOpenMenuIndex, isMenubarHidden } from "./state";

export const MENUBAR_HEIGHT = 20;

/** Rows at the top of the screen, plus anything above it, that count as the edge. */
const EDGE_ROWS = 2;
/** Pixels the bar travels each frame. 20px at 4px/frame is about 80ms. */
const SLIDE_PX = 4;

const [getReveal, setReveal] = createSignal(0);

let wasHidden = false;
let target: "shown" | "hidden" = "hidden";
let swallowUp = false;

/** Tuck the bar away. Call when a window starts covering the screen, before the flush that paints it. */
export function tuckMenubar(): void {
  wasHidden = true;
  target = "hidden";
  swallowUp = false;
  setReveal(0);
}

function syncMode(): void {
  const hidden = isMenubarHidden();
  if (hidden === wasHidden) return;
  wasHidden = hidden;
  swallowUp = false;
  if (hidden) {
    target = "hidden";
    setReveal(0);
  } else {
    target = "shown";
    setReveal(MENUBAR_HEIGHT);
  }
}

/** Top of the menubar in screen pixels. `0` when it is at rest; negative while tucked. */
export function menubarTop(): number {
  if (!isMenubarHidden()) return 0;
  return getReveal() - MENUBAR_HEIGHT;
}

/**
 * OS policy for one pointer event. Returns true when the event is the edge
 * gesture and must not be delivered to the app underneath.
 */
export function claimMenubarEdge(event: PlatformPointerEvent, _now: number): boolean {
  syncMode();
  // Moves in the page margin above the canvas are only the edge gesture.
  if (!isMenubarHidden()) return event.type === "move" && event.y < 0;

  if (event.type === "up" && swallowUp) {
    swallowUp = false;
    return true;
  }

  // `y < 0` is the page above the canvas. Passing there, or across the top
  // rows, reveals the bar and is not delivered to the app.
  const revealed = getReveal();
  const onEdge = event.y < EDGE_ROWS;
  const uncovered = event.y < 0 || event.y >= revealed;
  if ((event.type === "move" || event.type === "down") && onEdge && uncovered) {
    target = "shown";
    if (event.type === "down") swallowUp = true;
    return true;
  }

  if (getOpenMenuIndex() === null && event.y >= MENUBAR_HEIGHT) target = "hidden";
  return false;
}

/**
 * Move the bar toward where it should be. Returns true when it moved, so the
 * frame loop keeps painting until the slide finishes.
 */
export function stepMenubarReveal(_now: number): boolean {
  syncMode();
  if (!isMenubarHidden()) return false;
  const goal = target === "shown" ? MENUBAR_HEIGHT : 0;
  const current = getReveal();
  if (current === goal) return false;
  const step = Math.min(SLIDE_PX, Math.abs(goal - current));
  setReveal(current + Math.sign(goal - current) * step);
  return true;
}
