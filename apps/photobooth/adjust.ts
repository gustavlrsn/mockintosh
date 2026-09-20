import type { ImageFrame } from "@mockintosh/sdk";

export const CONTRAST_MIN = 0.5;
export const CONTRAST_MAX = 3;
export const CONTRAST_DEFAULT = 1;

export const BRIGHTNESS_MIN = -64;
export const BRIGHTNESS_MAX = 64;
export const BRIGHTNESS_DEFAULT = 0;

export interface ImageAdjust {
  /** `1` is identity; `2` doubles distance from mid-grey. */
  contrast: number;
  /** Added after contrast; `0` is identity. */
  brightness: number;
}

export const IDENTITY_ADJUST: ImageAdjust = {
  contrast: CONTRAST_DEFAULT,
  brightness: BRIGHTNESS_DEFAULT,
};

export function isIdentityAdjust(adjust: ImageAdjust): boolean {
  return adjust.contrast === CONTRAST_DEFAULT && adjust.brightness === BRIGHTNESS_DEFAULT;
}

/** Contrast then brightness, in place. No-op when both are identity. */
export function applyAdjustInPlace(frame: ImageFrame, adjust: ImageAdjust): void {
  if (isIdentityAdjust(adjust)) return;
  const { rgba } = frame;
  const c = adjust.contrast;
  const b = adjust.brightness;
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = (rgba[i] - 128) * c + 128 + b;
    rgba[i + 1] = (rgba[i + 1] - 128) * c + 128 + b;
    rgba[i + 2] = (rgba[i + 2] - 128) * c + 128 + b;
  }
}

export function applyAdjust(src: ImageFrame, adjust: ImageAdjust): ImageFrame {
  const dest: ImageFrame = {
    width: src.width,
    height: src.height,
    rgba: new Uint8ClampedArray(src.rgba),
  };
  applyAdjustInPlace(dest, adjust);
  return dest;
}

/** Pivot around mid-grey. `1` is a copy; `2` doubles distance from 128. */
export function applyContrast(src: ImageFrame, amount: number): ImageFrame {
  return applyAdjust(src, { contrast: amount, brightness: 0 });
}
