/** Capture sizes for Photo Booth. Printer sizes follow the paper and the camera's shape. */

export const SQUARE_SIZE = { width: 288, height: 288 } as const;
export const WIDE_SIZE = { width: 512, height: 384 } as const;
/** Used until the camera has delivered a frame. */
export const DEFAULT_CAMERA_ASPECT = 4 / 3;

export type PhotoSizeId = "square" | "wide" | "printer" | "lying";

export interface PhotoSize {
  width: number;
  height: number;
}

/** `aspect` is the camera's width / height. */
export function photoSize(id: PhotoSizeId, paperWidth: number, aspect: number = DEFAULT_CAMERA_ASPECT): PhotoSize {
  if (id === "square") return { width: SQUARE_SIZE.width, height: SQUARE_SIZE.height };
  if (id === "wide") return { width: WIDE_SIZE.width, height: WIDE_SIZE.height };
  const paper = Math.max(1, Math.floor(paperWidth));
  const ratio = aspect > 0 ? aspect : DEFAULT_CAMERA_ASPECT;
  if (id === "printer") return { width: paper, height: Math.max(1, Math.round(paper / ratio)) };
  return { width: Math.max(1, Math.round(paper * ratio)), height: paper };
}

export function photoSizeLabel(id: PhotoSizeId, size: PhotoSize): string {
  const dims = `${size.width} × ${size.height}`;
  if (id === "printer") return `${dims} (Printer Width)`;
  if (id === "lying") return `${dims} (Printer Width, Lying Down)`;
  return dims;
}
