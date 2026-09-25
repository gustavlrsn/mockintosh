/** Page sizes for a Canvas document. Printer sizes follow the paper at 4:3. */

export const PAGE_SQUARE = { width: 288, height: 288 } as const;
export const PAGE_WIDE = { width: 512, height: 384 } as const;
const CAMERA_ASPECT = 4 / 3;

export type PageSizeId = "square" | "wide" | "printer" | "lying";

export interface PageSize {
  width: number;
  height: number;
}

export function pageSize(id: PageSizeId, paperWidth: number): PageSize {
  if (id === "square") return { width: PAGE_SQUARE.width, height: PAGE_SQUARE.height };
  if (id === "wide") return { width: PAGE_WIDE.width, height: PAGE_WIDE.height };
  const paper = Math.max(1, Math.floor(paperWidth));
  if (id === "printer") return { width: paper, height: Math.max(1, Math.round(paper / CAMERA_ASPECT)) };
  return { width: Math.max(1, Math.round(paper * CAMERA_ASPECT)), height: paper };
}

export function pageSizeLabel(id: PageSizeId, size: PageSize): string {
  const dims = `${size.width} × ${size.height}`;
  if (id === "printer") return `${dims} (Printer Width)`;
  if (id === "lying") return `${dims} (Printer Width, Lying Down)`;
  return dims;
}

/** The preset that matches `size`, if one does. */
export function matchingPageSize(size: PageSize, paperWidth: number, ids: readonly PageSizeId[]): PageSizeId | null {
  return ids.find((id) => {
    const preset = pageSize(id, paperWidth);
    return preset.width === size.width && preset.height === size.height;
  }) ?? null;
}
