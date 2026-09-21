/**
 * Logical framebuffer size. There is no CSS, so this is the viewport:
 * `createUI` publishes it, `resize` updates it, widgets read it as a signal.
 */

import { createContext, useContext, type Accessor } from "solid-js";

export interface ViewportSize {
  width: number;
  height: number;
}

export interface ViewportContextValue {
  size: Accessor<ViewportSize>;
}

export const ViewportContext = createContext<ViewportContextValue | null>(null);

/** Logical framebuffer. Call the accessor in JSX so `resize` updates. */
export function useViewport(): Accessor<ViewportSize> {
  const ctx = useContext(ViewportContext);
  if (!ctx) throw new Error("useViewport() called outside of a UI tree");
  return ctx.size;
}
