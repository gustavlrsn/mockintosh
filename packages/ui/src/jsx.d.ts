/**
 * TypeScript JSX intrinsic element declarations for the canvas UI framework.
 *
 * These augment Solid.js's JSX namespace to add `box`, `text`, `image`,
 * `raster`, and `bitmap` as known intrinsic elements with full type safety.
 */

import type { BoxProps, TextProps, ImageProps, RasterProps, BitmapProps } from "./nodes";

declare module "solid-js" {
  namespace JSX {
    type HostProps<P> = P & {
      /** Internal ref callback — receives the CanvasNode when mounted. */
      ref?: (el: import("./nodes").CanvasNode) => void;
    };
    interface IntrinsicElements {
      box: HostProps<BoxProps>;
      text: HostProps<TextProps>;
      image: HostProps<ImageProps>;
      raster: HostProps<RasterProps>;
      bitmap: HostProps<BitmapProps>;
    }
  }
}
