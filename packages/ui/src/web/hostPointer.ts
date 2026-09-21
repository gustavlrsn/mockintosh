import type { PointerKind } from "../pointer";

const CURSOR_QUERY = "(hover: hover) and (pointer: fine)";

function match(query: string): { matches: boolean } | null {
  return typeof matchMedia === "function" ? matchMedia(query) : null;
}

/**
 * True when the host has a hovering fine pointer — a cursor is worth painting.
 * Missing `matchMedia` (tests, headless) assumes a mouse.
 */
export function hostPresentsCursor(
  query: (q: string) => { matches: boolean } | null = match,
): boolean {
  return query(CURSOR_QUERY)?.matches ?? true;
}

/** Map a DOM `pointerType` to the kit kind. Coarse fingers reported as mouse still pan. */
export function pointerKind(
  e: { pointerType: string },
  presentsCursor: boolean = hostPresentsCursor(),
): PointerKind {
  if (e.pointerType === "touch") return "touch";
  if (e.pointerType === "pen") return "pen";
  return presentsCursor ? "mouse" : "touch";
}
