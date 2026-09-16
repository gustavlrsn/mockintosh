/**
 * Renderer-owned JSX types for `@mockintosh/ui`.
 *
 * Solid 2 no longer exports a JSX namespace from `solid-js`. TypeScript
 * resolves `jsxImportSource: "@mockintosh/ui"` to this module.
 */

import type { Element as SolidElement } from "solid-js";
import type { BoxProps, TextProps, ImageProps, RasterProps, BitmapProps, CanvasNode } from "./nodes";

export type HostProps<P> = P & {
  /** Internal ref callback — receives the CanvasNode when mounted. */
  ref?: ((el: CanvasNode) => void) | ((el: CanvasNode) => void)[];
  children?: JSX.Element;
};

export namespace JSX {
  /**
   * Same union Solid 2 uses for `For` / `Show` / context components, plus our
   * CanvasNode (a `RenderedElement`) so host leaves type-check as children.
   */
  export type Element = SolidElement | CanvasNode;

  export interface ElementChildrenAttribute {
    children: {};
  }

  export interface IntrinsicAttributes {
    ref?: ((el: CanvasNode) => void) | ((el: CanvasNode) => void)[];
  }

  export interface IntrinsicElements {
    box: HostProps<BoxProps>;
    text: HostProps<TextProps>;
    image: HostProps<ImageProps>;
    raster: HostProps<RasterProps>;
    bitmap: HostProps<BitmapProps>;
  }
}

export type { JSX as default };
