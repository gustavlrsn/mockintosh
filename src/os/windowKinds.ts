/**
 * Window definitions — what each `OSWindowKind` means for chrome, layering
 * and input. The Macintosh kept this in the window definition function (WDEF)
 * a window's `procID` selected; here it is one table, and it is the only
 * place a kind's behaviour is spelled out. `Window.solid.tsx`,
 * `windowGeometry.ts` and `layering.ts` all read from it.
 */

import type { WindowKind } from "@mockintosh/sdk";

/** SDK kinds plus the shell's own: Finder folder windows are documents the Finder can tell apart. */
export type OSWindowKind = WindowKind | "finder-folder";

export interface WindowDefinition {
  /** Title bar with the title text; also what makes the window draggable. */
  titleBar: boolean;
  closeBox: boolean;
  zoomBox: boolean;
  /** Outer hairline in pixels; 0 draws no frame. */
  frame: number;
  /**
   * White gap between the outer hairline and `innerFrame`. Combined with
   * `innerFrame` this is the dBoxProc “picture frame”: 1px / 2px white / 2px.
   */
  frameGap?: number;
  /** Inner band inside `frameGap`; 0 or omitted means no inner band. */
  innerFrame?: number;
  /** 1px drop shadow to the right and below. */
  shadow: boolean;
  /** Grow box in the bottom-right corner when the window is `resizable`. */
  growBox: boolean;
  /** The window is the whole screen: bounds are fixed and the menubar hides while it is frontmost. */
  coversScreen: boolean;
  /** System-modal: every other window ignores input while one is open. */
  modal: boolean;
  /** Stacking layer; higher layers paint above lower ones regardless of activation order. */
  layer: number;
}

const DOCUMENT: WindowDefinition = {
  titleBar: true,
  closeBox: true,
  zoomBox: true,
  frame: 1,
  shadow: true,
  growBox: true,
  coversScreen: false,
  modal: false,
  layer: 1,
};

const PLAIN: WindowDefinition = {
  titleBar: false,
  closeBox: false,
  zoomBox: false,
  frame: 1,
  shadow: true,
  growBox: false,
  coversScreen: false,
  modal: false,
  layer: 1,
};

const WINDOW_DEFINITIONS: Record<OSWindowKind, WindowDefinition> = {
  document: DOCUMENT,
  "finder-folder": DOCUMENT,
  dialog: { ...DOCUMENT, zoomBox: false, growBox: false },
  utility: { ...DOCUMENT, zoomBox: false, growBox: false, layer: 2 },
  plain: PLAIN,
  // dBoxProc: 1px outer, 2px white, 2px inner band; square; system-modal.
  alert: { ...PLAIN, frameGap: 2, innerFrame: 2, modal: true, layer: 4 },
  fullscreen: {
    titleBar: false,
    closeBox: false,
    zoomBox: false,
    frame: 0,
    shadow: false,
    growBox: false,
    coversScreen: true,
    modal: false,
    layer: 3,
  },
};

export function windowDefinition(kind: OSWindowKind): WindowDefinition {
  return WINDOW_DEFINITIONS[kind] ?? DOCUMENT;
}
