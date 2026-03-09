import type { GrafPort } from "@mockintosh/quickdraw";
import {
  SetPort,
  MoveTo,
  TextFont,
  TextFace,
  DrawString,
} from "@mockintosh/quickdraw";
import { BLACK } from "../canvas/BitCanvas";
import { resolveTextColor } from "../canvas/ColorSystem";
import { resolveLineBox, type FontName } from "../canvas/fontAdapter";
import { GetFNum, FMTextWidth } from "./FontManager";

export interface PortTextOptions {
  font: FontName;
  spacing?: number;
  lineHeight?: number;
  lineSpacing?: number;
  color?: number;
}

export function drawTextToPort(
  port: GrafPort,
  text: string,
  x: number,
  y: number,
  opts: PortTextOptions
): void {
  if (!text) return;

  const spacing = opts.spacing ?? 0;
  const color = resolveTextColor(opts.color ?? BLACK);
  const lineBox = resolveLineBox(opts.font, {
    lineHeight: opts.lineHeight,
    lineSpacing: opts.lineSpacing,
  });
  const textPort = port as GrafPort & { txColor?: number };
  const previousColor = textPort.txColor ?? BLACK;

  SetPort(port);
  TextFont(GetFNum(opts.font));
  TextFace(0);
  textPort.txColor = color;

  if (spacing === 0 && !text.includes("\n")) {
    MoveTo(x, y + lineBox.glyphOffsetY);
    DrawString(text);
    textPort.txColor = previousColor;
    return;
  }

  let penX = x;
  let penY = y;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n") {
      penX = x;
      penY += lineBox.lineHeight;
      continue;
    }

    MoveTo(penX, penY + lineBox.glyphOffsetY);
    DrawString(ch);
    penX += FMTextWidth(ch, opts.font, spacing);
  }

  textPort.txColor = previousColor;
}
