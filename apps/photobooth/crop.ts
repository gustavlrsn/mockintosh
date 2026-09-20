import type { ImageFrame } from "@mockintosh/sdk";

/** Extra zoom on top of a cover-fit. `1` is identity. */
export const CROP_SCALE_MIN = 0.7;
export const CROP_SCALE_MAX = 1.5;
export const CROP_SCALE_DEFAULT = 1;

/** Dest-pixel shift. Positive moves the picture right / down. */
export const CROP_PAN_MIN = -48;
export const CROP_PAN_MAX = 48;
export const CROP_PAN_DEFAULT = 0;

export interface CoverSample {
  scale: number;
  panX: number;
  panY: number;
}

export const IDENTITY_CROP: CoverSample = {
  scale: CROP_SCALE_DEFAULT,
  panX: CROP_PAN_DEFAULT,
  panY: CROP_PAN_DEFAULT,
};

export function isIdentityCrop(view: CoverSample): boolean {
  return view.scale === CROP_SCALE_DEFAULT && view.panX === CROP_PAN_DEFAULT && view.panY === CROP_PAN_DEFAULT;
}

export function clampCrop(view: CoverSample): CoverSample {
  return {
    scale: Math.min(CROP_SCALE_MAX, Math.max(CROP_SCALE_MIN, view.scale)),
    panX: Math.min(CROP_PAN_MAX, Math.max(CROP_PAN_MIN, view.panX)),
    panY: Math.min(CROP_PAN_MAX, Math.max(CROP_PAN_MIN, view.panY)),
  };
}

function coverRect(srcW: number, srcH: number, dstW: number, dstH: number): {
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
} {
  if (srcW * dstH > dstW * srcH) {
    const cropH = srcH;
    const cropW = Math.max(1, Math.floor((srcH * dstW) / dstH));
    return { cropX: (srcW - cropW) >> 1, cropY: 0, cropW, cropH };
  }
  const cropW = srcW;
  const cropH = Math.max(1, Math.floor((srcW * dstH) / dstW));
  return { cropX: 0, cropY: (srcH - cropH) >> 1, cropW, cropH };
}

function fillWhite(dest: ImageFrame): void {
  const { rgba } = dest;
  for (let i = 0; i < rgba.length; i += 4) {
    rgba[i] = 255;
    rgba[i + 1] = 255;
    rgba[i + 2] = 255;
    rgba[i + 3] = 255;
  }
}

/**
 * Cover-fit `src` into `dest`, then apply zoom and pan.
 * Pixels that fall outside `src` stay white.
 */
export function sampleCover(src: ImageFrame, dest: ImageFrame, view: CoverSample): void {
  const srcW = src.width;
  const srcH = src.height;
  const dstW = dest.width;
  const dstH = dest.height;
  fillWhite(dest);
  if (srcW <= 0 || srcH <= 0 || dstW <= 0 || dstH <= 0) return;

  const { cropX, cropY, cropW, cropH } = coverRect(srcW, srcH, dstW, dstH);
  const scale = view.scale > 0 ? view.scale : 1;
  const winW = cropW / scale;
  const winH = cropH / scale;
  const winX = cropX + (cropW - winW) / 2 - view.panX * (cropW / dstW);
  const winY = cropY + (cropH - winH) / 2 - view.panY * (cropH / dstH);
  const srcRgba = src.rgba;
  const dstRgba = dest.rgba;

  for (let y = 0; y < dstH; y++) {
    const sy = winY + ((y + 0.5) * winH) / dstH;
    const iy = Math.floor(sy);
    if (iy < 0 || iy >= srcH) continue;
    const srcRow = iy * srcW;
    const dstRow = y * dstW;
    for (let x = 0; x < dstW; x++) {
      const sx = winX + ((x + 0.5) * winW) / dstW;
      const ix = Math.floor(sx);
      if (ix < 0 || ix >= srcW) continue;
      const si = (srcRow + ix) << 2;
      const di = (dstRow + x) << 2;
      dstRgba[di] = srcRgba[si];
      dstRgba[di + 1] = srcRgba[si + 1];
      dstRgba[di + 2] = srcRgba[si + 2];
      dstRgba[di + 3] = srcRgba[si + 3];
    }
  }
}

/** New `destSize`×`destSize` frame, cover-sampled from `src`. */
export function sampledFrame(src: ImageFrame, destSize: number, view: CoverSample): ImageFrame {
  const dest: ImageFrame = {
    width: destSize,
    height: destSize,
    rgba: new Uint8ClampedArray(destSize * destSize * 4),
  };
  sampleCover(src, dest, view);
  return dest;
}
