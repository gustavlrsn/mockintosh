/**
 * The system printer — the OS-side implementation of the SDK's `PrintService`.
 *
 * One printer per system (like the Chooser): the shell owns the transport and
 * its connection state; every app window sees the same service through
 * `useApp().print`. Pages are composed with QuickDraw on an off-screen
 * `PrintPage` and encoded to ESC/POS by `@mockintosh/print`; only the
 * transport knows how the bytes reach the paper.
 */
import { createSignal } from "solid-js";
import { CopyBits, srcCopy, type GrafPort } from "@mockintosh/quickdraw";
import { bitMapFromPixels, makeRect } from "@mockintosh/quickdraw/bits";
import { drawString, fontLineHeight, measureText } from "@mockintosh/ui";
import {
  EscPosEncoder,
  createPrintPage,
  disposePrintPage,
  drawOnPage,
  type PrinterTransport,
} from "@mockintosh/print";
import type { PrintPictureOptions, PrintService, PrintableImage } from "@mockintosh/sdk";

/** 80 mm paper at 203 dpi. */
const DEFAULT_PAPER_WIDTH = 576;

export interface PrintServiceOptions {
  paperWidth?: number;
}

/** Polaroid layout, in dots. */
const POLAROID = {
  captionFont: "menu",
  /** Gap between the picture and the caption line. */
  captionGap: 44,
  /** White border beneath the picture (caption included), like a polaroid's chin. */
  chin: 296,
  /** Paper to advance past the print head before cutting. */
  feedBeforeCut: 124,
} as const;

export function createPrintService(
  transport: PrinterTransport,
  options: PrintServiceOptions = {}
): PrintService {
  const paperWidth = options.paperWidth ?? DEFAULT_PAPER_WIDTH;
  const [connected, setConnected] = createSignal(transport.connected);

  async function connect(): Promise<void> {
    try {
      await transport.connect();
    } finally {
      setConnected(transport.connected);
    }
  }

  async function send(bytes: Uint8Array): Promise<void> {
    if (!transport.connected) await connect();
    try {
      await transport.write(bytes);
    } finally {
      setConnected(transport.connected);
    }
  }

  async function printPage(
    height: number,
    draw: (port: GrafPort, size: { width: number; height: number }) => void
  ): Promise<void> {
    const page = createPrintPage(paperWidth, height);
    try {
      drawOnPage(page, (port) => draw(port, { width: page.width, height: page.height }));
      const bytes = new EscPosEncoder()
        .initialize()
        .raster(page.bits)
        .feed(POLAROID.feedBeforeCut)
        .cut()
        .encode();
      await send(bytes);
    } finally {
      disposePrintPage(page);
    }
  }

  function printPicture(image: PrintableImage, opts: PrintPictureOptions = {}): Promise<void> {
    const scale = Math.max(1, Math.floor(opts.scale ?? 2));
    const caption = opts.caption?.trim() ?? "";
    const src = bitMapFromPixels(image.data, image.width, image.height);
    // Enlarge by `scale`, but never wider than the paper (keep the aspect ratio).
    const w = Math.min(image.width * scale, paperWidth);
    const h = Math.round(image.height * (w / image.width));
    const x = Math.floor((paperWidth - w) / 2);

    return printPage(h + POLAROID.chin, (port) => {
      CopyBits(src, port.portBits, src.bounds, makeRect(0, x, h, x + w), srcCopy, null);
      if (caption) {
        const textW = measureText(caption, POLAROID.captionFont);
        const textY = h + POLAROID.captionGap - Math.floor(fontLineHeight(POLAROID.captionFont) / 2);
        drawString(port, caption, Math.floor((paperWidth - textW) / 2), textY, POLAROID.captionFont);
      }
    });
  }

  return { paperWidth, connected, connect, printPicture, printPage };
}
