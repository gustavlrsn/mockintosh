/**
 * Layout for a picture on thermal paper: whole-number scale, portrait or
 * landscape. Pure, so printing and previews share one result.
 */
import { CopyBits, srcCopy, type BitMap } from "@mockintosh/quickdraw";
import { bitMapFromPixels, bitMapHeight, bitMapWidth, makeRect, pixelsFromBitMap } from "@mockintosh/quickdraw/bits";
import { createPrintPage, disposePrintPage, drawOnPage } from "@mockintosh/print";
import type { PrintOrientation, PrintPictureLayout, PrintPictureOptions, PrintableImage } from "@mockintosh/sdk";

/** Paper to advance past the print head before cutting or tearing off, in dots. */
export const FEED_BEFORE_CUT = 124;

export type PictureOrientation = PrintOrientation;

export type PictureScale = NonNullable<PrintPictureOptions["scale"]>;

export type PictureLayoutOptions = PrintPictureOptions;

export interface PictureLayout {
  page: BitMap;
  /** Scale actually used. Smaller than requested when the request was wider than the paper. */
  scale: number;
  orientation: PictureOrientation;
  paperWidth: number;
}

/** Side of the picture that runs across the paper. */
function acrossDots(image: PrintableImage, orientation: PictureOrientation): number {
  return orientation === "portrait" ? image.width : image.height;
}

/** Scale for one orientation. A requested enlargement that doesn't fit shrinks to the paper. */
function scaleFor(across: number, paperWidth: number, requested: PictureScale): number {
  if (across < 1) return 1;
  if (requested === "fit") return paperWidth / across;
  if (typeof requested === "number") {
    const whole = Math.max(1, Math.floor(requested));
    return across * whole <= paperWidth ? whole : paperWidth / across;
  }
  if (across <= paperWidth) return Math.max(1, Math.floor(paperWidth / across));
  return paperWidth / across;
}

/**
 * Best fit: prefer a whole-number scale that doesn't shrink, then the one
 * that fills the paper. When both must shrink, shrink the least. Portrait
 * wins a tie.
 */
function chooseFit(
  image: PrintableImage,
  paperWidth: number,
  requested: PictureScale,
  orientation: "auto" | PictureOrientation,
): { orientation: PictureOrientation; scale: number } {
  const candidates: PictureOrientation[] = orientation === "auto" ? ["portrait", "landscape"] : [orientation];
  const fits = candidates.map((candidate) => {
    const across = acrossDots(image, candidate);
    const scale = scaleFor(across, paperWidth, requested);
    const printed = Math.min(paperWidth, Math.round(across * scale));
    return { orientation: candidate, scale, printed };
  });
  const unshrunk = fits.filter((fit) => fit.scale >= 1);
  const pool = unshrunk.length > 0 ? unshrunk : fits;
  pool.sort((a, b) => b.printed - a.printed || b.scale - a.scale || (a.orientation === "portrait" ? -1 : 1));
  return pool[0]!;
}

/** Clockwise quarter turn: top-left lands on the top-right. */
function rotateClockwise(image: PrintableImage): PrintableImage {
  const { width, height, data } = image;
  const rotated = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = height - 1 - y;
      const ny = x;
      rotated[ny * height + nx] = data[y * width + x]!;
    }
  }
  return { width: height, height: width, data: rotated };
}

/**
 * Lay `image` out on paper `paperWidth` dots wide. Landscape turns the
 * picture a quarter turn clockwise.
 */
export function layoutPicture(
  image: PrintableImage,
  options: PictureLayoutOptions,
  paperWidth: number,
): PictureLayout {
  const width = Math.max(1, Math.floor(paperWidth));
  const requested = options.scale ?? "auto";
  const fit = chooseFit(image, width, requested, options.orientation ?? "auto");
  const placed = fit.orientation === "landscape" ? rotateClockwise(image) : image;
  const w = Math.min(width, Math.max(1, Math.round(placed.width * fit.scale)));
  const h = Math.max(1, Math.round(placed.height * (w / placed.width)));
  const x = Math.floor((width - w) / 2);
  const src = bitMapFromPixels(placed.data, placed.width, placed.height);

  const page = createPrintPage(width, h);
  try {
    drawOnPage(page, (port) => {
      CopyBits(src, port.portBits, src.bounds, makeRect(0, x, h, x + w), srcCopy, null);
    });
  } finally {
    disposePrintPage(page);
  }

  return { page: page.bits, scale: fit.scale, orientation: fit.orientation, paperWidth: width };
}

/** The same layout as 1 byte per pixel, for previews. */
export function layoutPrintable(
  image: PrintableImage,
  options: PictureLayoutOptions,
  paperWidth: number,
): PrintPictureLayout {
  const layout = layoutPicture(image, options, paperWidth);
  return {
    page: {
      width: bitMapWidth(layout.page),
      height: bitMapHeight(layout.page),
      data: pixelsFromBitMap(layout.page),
    },
    scale: layout.scale,
    orientation: layout.orientation,
    paperWidth: layout.paperWidth,
  };
}
