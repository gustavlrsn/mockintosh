import { Show, createEffect, createMemo, createSignal } from "solid-js";
import type { JSX, RasterSurface } from "@mockintosh/ui";
import { Button, Select, useApp, type PrintOrientation, type PrintPictureOptions, type PrintableImage } from "@mockintosh/sdk";

/** 203 dpi thermal heads: dots × 25.4 / 203 = millimetres. */
const DOTS_PER_INCH = 203;

export type PrintScaleChoice = "auto" | "1" | "2" | "3" | "fit";
export type PrintOrientationChoice = "auto" | PrintOrientation;

export function printPictureOptions(
  scale: PrintScaleChoice,
  orientation: PrintOrientationChoice,
): PrintPictureOptions {
  return {
    scale: scale === "auto" || scale === "fit" ? scale : Number(scale),
    orientation,
  };
}

export interface PrintSettingsProps {
  image: () => PrintableImage | null;
  scale: () => PrintScaleChoice;
  orientation: () => PrintOrientationChoice;
  onScale: (scale: PrintScaleChoice) => void;
  onOrientation: (orientation: PrintOrientationChoice) => void;
  printing: () => boolean;
  onPrint: () => void;
  [key: string]: unknown;
}

const PREVIEW_W = 268;
const PREVIEW_H = 168;

function mm(dots: number): number {
  return Math.round((dots / DOTS_PER_INCH) * 25.4);
}

function scaleWords(scale: number): string {
  const whole = Math.round(scale);
  return Math.abs(scale - whole) < 0.05 ? `${whole}×` : `${scale.toFixed(2)}×`;
}

/** Nearest-neighbour reduction so the page fits the preview. */
function reducePage(page: PrintableImage, maxW: number, maxH: number): PrintableImage {
  const fit = Math.min(1, maxW / page.width, maxH / page.height);
  const width = Math.max(1, Math.floor(page.width * fit));
  const height = Math.max(1, Math.floor(page.height * fit));
  const data = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const sy = Math.min(page.height - 1, Math.floor(y / fit));
    for (let x = 0; x < width; x++) {
      const sx = Math.min(page.width - 1, Math.floor(x / fit));
      data[y * width + x] = page.data[sy * page.width + sx]!;
    }
  }
  return { width, height, data };
}

function outline(surface: RasterSurface, x: number, y: number, width: number, height: number): void {
  for (let i = 0; i < width; i++) {
    surface.setPixel(x + i, y, 1);
    surface.setPixel(x + i, y + height - 1, 1);
  }
  for (let i = 0; i < height; i++) {
    surface.setPixel(x, y + i, 1);
    surface.setPixel(x + width - 1, y + i, 1);
  }
}

export function PrintSettings(props: PrintSettingsProps): JSX.Element {
  const app = useApp();
  const print = app.print!;

  const layout = createMemo(() => {
    const image = props.image();
    if (!image) return null;
    return print.layoutPicture(image, printPictureOptions(props.scale(), props.orientation()));
  });

  const [paintRev, setPaintRev] = createSignal(0);
  createEffect(
    () => ({
      scale: props.scale(),
      orientation: props.orientation(),
      image: props.image(),
      paper: print.paperWidth,
      laid: layout(),
    }),
    () => {
      setPaintRev((n) => n + 1);
    },
  );

  const summary = () => {
    const laid = layout();
    if (!laid) return "No photo to print.";
    return `Printed at ${scaleWords(laid.scale)}, ${laid.orientation}, ${mm(laid.page.height)} mm long`;
  };

  return (
    <box width={app.window.width()} height={app.window.height()} flexDirection="column" padding={8} gap={6} background={0}>
      <box flexDirection="row" alignItems="center" gap={6}>
        <text font="body">Orientation</text>
        <Select
          name="orientation"
          width={120}
          value={props.orientation()}
          onChange={(value) => props.onOrientation(value as PrintOrientationChoice)}
          options={[
            { value: "auto", label: "Auto" },
            { value: "portrait", label: "Portrait" },
            { value: "landscape", label: "Landscape" },
          ]}
        />
      </box>
      <box flexDirection="row" alignItems="center" gap={6}>
        <text font="body">Scale</text>
        <Select
          name="scale"
          width={120}
          value={props.scale()}
          onChange={(value) => props.onScale(value as PrintScaleChoice)}
          options={[
            { value: "auto", label: "Auto" },
            { value: "1", label: "1×" },
            { value: "2", label: "2×" },
            { value: "3", label: "3×" },
            { value: "fit", label: "Fit Width" },
          ]}
        />
      </box>
      <text font="body">{`${print.paperWidth} dots, ${mm(print.paperWidth)} mm`}</text>
      <raster
        width={PREVIEW_W}
        height={PREVIEW_H}
        revision={paintRev()}
        onPaint={(surface) => {
          surface.fill(0);
          const laid = layout();
          if (!laid) return;
          const preview = reducePage(laid.page, PREVIEW_W - 2, PREVIEW_H - 2);
          const x = Math.floor((PREVIEW_W - preview.width) / 2);
          const y = Math.floor((PREVIEW_H - preview.height) / 2);
          surface.blitPixels(preview.data, preview.width, preview.height, x, y);
          outline(surface, x, y, preview.width, preview.height);
        }}
      />
      <text font="body">{summary()}</text>
      <Show when={props.image()}>
        <Button label="Print" disabled={props.printing()} onClick={() => props.onPrint()} />
      </Show>
    </box>
  );
}
