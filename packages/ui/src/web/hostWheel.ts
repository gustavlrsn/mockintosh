/**
 * Chrome, Edge, and Firefox send trackpad pinch as `wheel` + `ctrlKey`.
 * The page must not zoom (callers `preventDefault`) and must not treat
 * those deltas as overflow scroll — they are large and not a scroll intent.
 */
export function wheelIsPinchZoom(e: { ctrlKey: boolean }): boolean {
  return e.ctrlKey;
}
