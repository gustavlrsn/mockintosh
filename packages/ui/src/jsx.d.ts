/**
 * TypeScript JSX intrinsic element declarations for the canvas UI framework.
 *
 * These augment Solid.js's JSX namespace to add `box`, `text`, `image`,
 * `raster`, and `bitmap` as known intrinsic elements with full type safety.
 */

import type { BoxProps, TextProps, ImageProps, RasterProps, BitmapProps } from "./nodes";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicElements {
      box: BoxProps & {
        /** Internal ref callback — receives the CanvasNode when mounted. */
        ref?: (el: import("./nodes").CanvasNode) => void;
      };
      text: TextProps & {
        ref?: (el: import("./nodes").CanvasNode) => void;
      };
      image: ImageProps & {
        ref?: (el: import("./nodes").CanvasNode) => void;
      };
      raster: RasterProps & {
        ref?: (el: import("./nodes").CanvasNode) => void;
      };
      bitmap: BitmapProps & {
        ref?: (el: import("./nodes").CanvasNode) => void;
      };
    }
  }
}
