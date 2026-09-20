import { createDitherer, type AsciiDitherOptions, type ImageFrame } from "@mockintosh/sdk";

export type PhotoDither = "atkinson" | "bayer" | "ascii";

/** One constructor for the Photo Booth / Dither viewfinder modes. */
export function createPhotoDitherer(
  mode: PhotoDither,
  width: number,
  height: number,
  ascii?: AsciiDitherOptions,
): (frame: ImageFrame, out: Uint8Array) => void {
  return createDitherer(width, height, mode, ascii);
}
