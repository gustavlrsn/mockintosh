import { WindowContext } from "../../toolbox/WindowContext";
import { BLACK } from "../BitCanvas";
import { FontName, measureText, getLineHeight } from "../fontAdapter";
import { ResourceManager } from "../../toolbox/ResourceManager";
import type { Align, LayoutNode, LinkRect, InlineSegment } from "@mockintosh/markdown";
import { extractImageUrls } from "@mockintosh/markdown";

export type { Align, LayoutNode, LinkRect, InlineSegment };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MarkdownLoadState = "idle" | "loading" | "error";

export interface MarkdownViewOptions {
  width: number;
  margin: number;
}

// ---------------------------------------------------------------------------
// Spacing constants
// ---------------------------------------------------------------------------

const H1_MARGIN_TOP = 8;
const H1_MARGIN_BOTTOM = 4;
const H2_MARGIN_TOP = 6;
const H2_MARGIN_BOTTOM = 2;
const P_MARGIN_BOTTOM = 4;
const LI_MARGIN_BOTTOM = 2;
const LI_INDENT = 12;
const HR_MARGIN = 6;
const IMG_MARGIN_BOTTOM = 4;
const BR_HEIGHT = 6;

// ---------------------------------------------------------------------------
// Internal layout helpers
// ---------------------------------------------------------------------------

interface StyledWord {
  text: string;
  font: FontName;
  underline: boolean;
  href?: string;
}

function segmentsToWords(segments: InlineSegment[], baseFont: FontName): StyledWord[] {
  const words: StyledWord[] = [];
  for (const seg of segments) {
    let font: FontName = baseFont;
    if (seg.kind === "bold") font = "menu";
    // italic and code use body font (no dedicated italic/mono font yet)
    const underline = seg.kind === "link";
    const href = seg.kind === "link" ? seg.href : undefined;
    for (const token of seg.text.split(/(\s+)/)) {
      if (token) words.push({ text: token, font, underline, href });
    }
  }
  return words;
}

function wrapWords(words: StyledWord[], maxWidth: number): StyledWord[][] {
  const lines: StyledWord[][] = [];
  let line: StyledWord[] = [];
  let lineWidth = 0;

  for (const word of words) {
    const w = measureText(word.text, word.font);
    const isSpace = /^\s+$/.test(word.text);

    if (isSpace) {
      if (line.length > 0) { line.push(word); lineWidth += w; }
      continue;
    }

    if (lineWidth + w > maxWidth && line.length > 0) {
      while (line.length > 0 && /^\s+$/.test(line[line.length - 1].text)) {
        lineWidth -= measureText(line.pop()!.text, line[0]?.font ?? "body");
      }
      lines.push(line);
      line = [];
      lineWidth = 0;
    }

    line.push(word);
    lineWidth += w;
  }

  if (line.length > 0) {
    while (line.length > 0 && /^\s+$/.test(line[line.length - 1].text)) line.pop();
    if (line.length > 0) lines.push(line);
  }

  return lines;
}

function lineWidth(line: StyledWord[]): number {
  let w = 0;
  for (const word of line) w += measureText(word.text, word.font);
  return w;
}

function alignedX(lw: number, contentWidth: number, margin: number, align: Align): number {
  switch (align) {
    case "center": return margin + Math.floor((contentWidth - lw) / 2);
    case "right":  return margin + contentWidth - lw;
    default:       return margin;
  }
}

function headingWords(text: string, font: FontName): StyledWord[] {
  return text.split(/(\s+)/).filter(Boolean).map((t) => ({
    text: t, font, underline: false as const, href: undefined,
  }));
}

// ---------------------------------------------------------------------------
// Core render pass — draws LayoutNode[] onto a WindowContext
// ---------------------------------------------------------------------------

function renderNodes(
  ctx: WindowContext,
  nodes: LayoutNode[],
  margin: number,
  sprites: ResourceManager
): LinkRect[] {
  const contentWidth = ctx.width - margin * 2;
  const links: LinkRect[] = [];
  let y = margin;

  for (const node of nodes) {
    switch (node.type) {
      case "heading": {
        const isH1 = node.level === 1;
        const font: FontName = "menu";
        const lineH = getLineHeight(font);
        y += isH1 ? H1_MARGIN_TOP : H2_MARGIN_TOP;
        const lines = wrapWords(headingWords(node.text, font), contentWidth);
        for (const line of lines) {
          const lw = lineWidth(line);
          let cx = alignedX(lw, contentWidth, margin, node.align);
          for (const word of line) {
            ctx.drawText(word.text, cx, y, { font, color: BLACK });
            cx += measureText(word.text, font);
          }
          y += lineH;
        }
        y += isH1 ? H1_MARGIN_BOTTOM : H2_MARGIN_BOTTOM;
        break;
      }

      case "paragraph": {
        const baseFont: FontName = "body";
        const lineH = getLineHeight(baseFont);
        const lines = wrapWords(segmentsToWords(node.segments, baseFont), contentWidth);
        for (const line of lines) {
          const lw = lineWidth(line);
          let cx = alignedX(lw, contentWidth, margin, node.align);
          for (const word of line) {
            const ww = measureText(word.text, word.font);
            ctx.drawText(word.text, cx, y, { font: word.font, color: BLACK });
            if (word.underline) ctx.drawHLine(cx, y + lineH - 2, ww, BLACK);
            if (word.href) links.push({ x: cx, y, w: ww, h: lineH, href: word.href });
            cx += ww;
          }
          y += lineH;
        }
        y += P_MARGIN_BOTTOM;
        break;
      }

      case "listItem": {
        const baseFont: FontName = "body";
        const lineH = getLineHeight(baseFont);
        const extraIndent = node.indent * LI_INDENT;
        const bulletW = measureText("- ", baseFont);
        ctx.drawText("-", margin + LI_INDENT + extraIndent - bulletW, y, {
          font: baseFont, color: BLACK,
        });
        const lines = wrapWords(
          segmentsToWords(node.segments, baseFont),
          contentWidth - LI_INDENT - extraIndent
        );
        for (const line of lines) {
          let cx = margin + LI_INDENT + extraIndent;
          for (const word of line) {
            const ww = measureText(word.text, word.font);
            ctx.drawText(word.text, cx, y, { font: word.font, color: BLACK });
            if (word.underline) ctx.drawHLine(cx, y + lineH - 2, ww, BLACK);
            if (word.href) links.push({ x: cx, y, w: ww, h: lineH, href: word.href });
            cx += ww;
          }
          y += lineH;
        }
        y += LI_MARGIN_BOTTOM;
        break;
      }

      case "hr":
        y += HR_MARGIN;
        ctx.drawDottedHLine(margin, y, contentWidth, BLACK);
        y += 1 + HR_MARGIN;
        break;

      case "image": {
        const sprite = sprites.get(node.src);
        if (sprite) {
          const sx = alignedX(sprite.width, contentWidth, margin, node.align);
          ctx.blit(sprite, sx, y);
          y += sprite.height + IMG_MARGIN_BOTTOM;
        }
        break;
      }

      case "spacer":
        y += node.height;
        break;

      case "br":
        y += BR_HEIGHT;
        break;
    }
  }

  return links;
}

// ---------------------------------------------------------------------------
// Core measure pass — same layout logic without drawing
// ---------------------------------------------------------------------------

function measureNodes(
  nodes: LayoutNode[],
  width: number,
  margin: number,
  sprites?: ResourceManager
): number {
  const contentWidth = width - margin * 2;
  let y = 0;

  for (const node of nodes) {
    switch (node.type) {
      case "heading": {
        const isH1 = node.level === 1;
        y += isH1 ? H1_MARGIN_TOP : H2_MARGIN_TOP;
        const lines = wrapWords(headingWords(node.text, "menu"), contentWidth);
        y += lines.length * getLineHeight("menu");
        y += isH1 ? H1_MARGIN_BOTTOM : H2_MARGIN_BOTTOM;
        break;
      }
      case "paragraph": {
        const baseFont: FontName = "body";
        const lines = wrapWords(segmentsToWords(node.segments, baseFont), contentWidth);
        y += lines.length * getLineHeight(baseFont) + P_MARGIN_BOTTOM;
        break;
      }
      case "listItem": {
        const baseFont: FontName = "body";
        const extraIndent = node.indent * LI_INDENT;
        const lines = wrapWords(
          segmentsToWords(node.segments, baseFont),
          contentWidth - LI_INDENT - extraIndent
        );
        y += lines.length * getLineHeight(baseFont) + LI_MARGIN_BOTTOM;
        break;
      }
      case "hr":
        y += HR_MARGIN * 2 + 1;
        break;
      case "image": {
        const sprite = sprites?.get(node.src);
        if (sprite) y += sprite.height + IMG_MARGIN_BOTTOM;
        break;
      }
      case "spacer":
        y += node.height;
        break;
      case "br":
        y += BR_HEIGHT;
        break;
    }
  }

  return y;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Renders loading / error / idle states into a scrollable WindowContext.
 * Returns the link rects produced during the render pass (empty when not idle).
 */
export function renderMarkdownContent(
  ctx: WindowContext,
  nodes: LayoutNode[],
  state: MarkdownLoadState,
  errorMsg: string | null,
  sprites: ResourceManager,
  opts: MarkdownViewOptions
): LinkRect[] {
  const { margin } = opts;

  if (state === "loading") {
    const msg = "Loading\u2026";
    const tw = measureText(msg, "body");
    ctx.drawText(msg, Math.floor((ctx.width - tw) / 2), Math.floor(ctx.height / 2), {
      font: "body", color: BLACK,
    });
    return [];
  }

  if (state === "error") {
    ctx.drawText("Could not load page.", margin, margin, { font: "menu", color: BLACK });
    if (errorMsg) {
      ctx.drawText(errorMsg, margin, margin + getLineHeight("menu") + 4, {
        font: "body", color: BLACK,
      });
    }
    return [];
  }

  if (nodes.length === 0) return [];

  return renderNodes(ctx, nodes, margin, sprites);
}

/**
 * Returns the total pixel height of the rendered node list.
 * Use this in getContentHeight to size the scrollable area correctly.
 */
export function measureMarkdownContent(
  nodes: LayoutNode[],
  width: number,
  margin: number,
  sprites?: ResourceManager
): number {
  return measureNodes(nodes, width, margin, sprites);
}

/** Returns the first LinkRect whose bounds contain (x, y), or null. */
export function hitTestLink(links: LinkRect[], x: number, y: number): LinkRect | null {
  for (const link of links) {
    if (x >= link.x && x < link.x + link.w && y >= link.y && y < link.y + link.h) {
      return link;
    }
  }
  return null;
}

/**
 * Kicks off sprites.load() for every image URL in the node list.
 * Errors are silently swallowed — missing images simply won't render.
 */
export function preloadImages(
  nodes: LayoutNode[],
  sprites: ResourceManager,
  maxWidth: number
): void {
  for (const url of extractImageUrls(nodes)) {
    sprites.load(url, maxWidth, maxWidth).catch(() => {
      // silently ignore failed image loads
    });
  }
}
