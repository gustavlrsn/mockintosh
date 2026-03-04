import { AppContext } from "../AppContext";
import { Sprite, BLACK, WHITE } from "../BitCanvas";
import { FontName, measureText, getLineHeight } from "../fontAdapter";
import { SpriteRegistry } from "../SpriteRegistry";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Align = "left" | "center" | "right";

export interface LinkRect {
  x: number;
  y: number;
  w: number;
  h: number;
  href: string;
}

type InlineSegment =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "link"; text: string; href: string };

export type LayoutNode =
  | { type: "heading"; level: 1 | 2; text: string; align: Align }
  | { type: "paragraph"; segments: InlineSegment[]; align: Align }
  | { type: "listItem"; segments: InlineSegment[] }
  | { type: "hr" }
  | { type: "image"; src: string; align: Align }
  | { type: "spacer"; height: number }
  | { type: "br" };

interface StyledWord {
  text: string;
  font: FontName;
  underline: boolean;
  href?: string;
}

export interface RenderResult {
  contentHeight: number;
  links: LinkRect[];
}

interface RenderOptions {
  startY: number;
  width: number;
  margin?: number;
  sprites?: SpriteRegistry;
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
// Parsing
// ---------------------------------------------------------------------------

export function parseSiteMarkup(markup: string): Map<string, LayoutNode[]> {
  const cards = new Map<string, LayoutNode[]>();
  const cardRegex = /<card\s+id="([^"]+)">([\s\S]*?)<\/card>/gi;
  let match;
  let hasCards = false;

  while ((match = cardRegex.exec(markup)) !== null) {
    hasCards = true;
    cards.set(match[1], parseNodes(match[2]));
  }

  if (!hasCards) {
    cards.set("home", parseNodes(markup));
  }

  return cards;
}

function parseNodes(html: string): LayoutNode[] {
  const nodes: LayoutNode[] = [];
  let pos = 0;
  const s = html.trim();

  while (pos < s.length) {
    while (pos < s.length && /\s/.test(s[pos])) pos++;
    if (pos >= s.length) break;

    if (s[pos] !== "<") {
      const end = s.indexOf("<", pos);
      const text = (end === -1 ? s.slice(pos) : s.slice(pos, end)).trim();
      if (text) {
        nodes.push({
          type: "paragraph",
          segments: [{ kind: "text", text }],
          align: "left",
        });
      }
      pos = end === -1 ? s.length : end;
      continue;
    }

    const tagMatch = s
      .slice(pos)
      .match(/^<(\w+)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*\/?>/);
    if (!tagMatch) {
      pos++;
      continue;
    }

    const tag = tagMatch[1].toLowerCase();
    const attrs = parseAttrs(tagMatch[2] || "");
    const tagEnd = pos + tagMatch[0].length;
    const align = (attrs.align as Align) || "left";

    if (tag === "hr" || tag === "br" || tag === "img" || tag === "spacer") {
      if (tag === "hr") nodes.push({ type: "hr" });
      else if (tag === "br") nodes.push({ type: "br" });
      else if (tag === "img")
        nodes.push({ type: "image", src: attrs.src || "", align });
      else if (tag === "spacer")
        nodes.push({
          type: "spacer",
          height: parseInt(attrs.height || "8", 10),
        });
      pos = tagEnd;
      continue;
    }

    const closeTag = `</${tag}>`;
    const closeIdx = s.toLowerCase().indexOf(closeTag, tagEnd);
    if (closeIdx === -1) {
      pos = tagEnd;
      continue;
    }

    const content = s.slice(tagEnd, closeIdx);
    pos = closeIdx + closeTag.length;

    if (tag === "h1" || tag === "h2") {
      nodes.push({
        type: "heading",
        level: tag === "h1" ? 1 : 2,
        text: stripTags(content).trim(),
        align,
      });
    } else if (tag === "p") {
      nodes.push({ type: "paragraph", segments: parseInline(content), align });
    } else if (tag === "ul") {
      const liRegex = /<li>([\s\S]*?)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(content)) !== null) {
        nodes.push({ type: "listItem", segments: parseInline(liMatch[1]) });
      }
    }
  }

  return nodes;
}

function parseInline(html: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const regex =
    /<(b|a)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*>([\s\S]*?)<\/\1>|([^<]+)/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    if (match[4] !== undefined) {
      if (match[4]) segments.push({ kind: "text", text: match[4] });
    } else if (match[1] === "b") {
      segments.push({ kind: "bold", text: match[3] });
    } else if (match[1] === "a") {
      const href = (match[2] || "").match(/href="([^"]*)"/)?.[1] || "";
      segments.push({ kind: "link", text: match[3], href });
    }
  }

  return segments;
}

function parseAttrs(attrStr: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const regex = /([\w-]+)="([^"]*)"/g;
  let m;
  while ((m = regex.exec(attrStr)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

export function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Inline layout — word wrapping with mixed fonts
// ---------------------------------------------------------------------------

function segmentsToWords(
  segments: InlineSegment[],
  baseFont: FontName
): StyledWord[] {
  const words: StyledWord[] = [];
  for (const seg of segments) {
    const font: FontName = seg.kind === "bold" ? "ChiKareGo" : baseFont;
    const underline = seg.kind === "link";
    const href = seg.kind === "link" ? seg.href : undefined;
    const text = seg.text;

    const tokens = text.split(/(\s+)/);
    for (const token of tokens) {
      if (!token) continue;
      words.push({ text: token, font, underline, href });
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
      if (line.length > 0) {
        line.push(word);
        lineWidth += w;
      }
      continue;
    }

    if (lineWidth + w > maxWidth && line.length > 0) {
      while (line.length > 0 && /^\s+$/.test(line[line.length - 1].text)) {
        lineWidth -= measureText(line.pop()!.text, line[0]?.font ?? "Geneva9");
      }
      lines.push(line);
      line = [];
      lineWidth = 0;
    }

    line.push(word);
    lineWidth += w;
  }

  if (line.length > 0) {
    while (line.length > 0 && /^\s+$/.test(line[line.length - 1].text)) {
      line.pop();
    }
    if (line.length > 0) lines.push(line);
  }

  return lines;
}

function measureLineWidth(line: StyledWord[]): number {
  let w = 0;
  for (const word of line) w += measureText(word.text, word.font);
  return w;
}

function alignedX(
  lineWidth: number,
  contentWidth: number,
  margin: number,
  align: Align
): number {
  switch (align) {
    case "center":
      return margin + Math.floor((contentWidth - lineWidth) / 2);
    case "right":
      return margin + contentWidth - lineWidth;
    default:
      return margin;
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export function renderSiteNodes(
  ctx: AppContext,
  nodes: LayoutNode[],
  opts: RenderOptions
): RenderResult {
  const margin = opts.margin ?? 8;
  const contentWidth = opts.width - margin * 2;
  const links: LinkRect[] = [];
  let y = opts.startY;

  for (const node of nodes) {
    switch (node.type) {
      case "heading": {
        const isH1 = node.level === 1;
        const font: FontName = "ChiKareGo";
        const lineH = getLineHeight(font);
        y += isH1 ? H1_MARGIN_TOP : H2_MARGIN_TOP;
        const tw = measureText(node.text, font);
        const x = alignedX(tw, contentWidth, margin, node.align);
        ctx.drawText(node.text, x, y, { font, color: BLACK });
        y += lineH + (isH1 ? H1_MARGIN_BOTTOM : H2_MARGIN_BOTTOM);
        break;
      }

      case "paragraph": {
        const baseFont: FontName = "Geneva9";
        const lineH = getLineHeight(baseFont);
        const words = segmentsToWords(node.segments, baseFont);
        const lines = wrapWords(words, contentWidth);

        for (const line of lines) {
          const lw = measureLineWidth(line);
          let cx = alignedX(lw, contentWidth, margin, node.align);
          for (const word of line) {
            const ww = measureText(word.text, word.font);
            ctx.drawText(word.text, cx, y, { font: word.font, color: BLACK });
            if (word.underline) {
              ctx.drawHLine(cx, y + lineH - 2, ww, BLACK);
            }
            if (word.href) {
              links.push({ x: cx, y, w: ww, h: lineH, href: word.href });
            }
            cx += ww;
          }
          y += lineH;
        }

        y += P_MARGIN_BOTTOM;
        break;
      }

      case "listItem": {
        const baseFont: FontName = "Geneva9";
        const lineH = getLineHeight(baseFont);
        const bulletW = measureText("- ", baseFont);
        ctx.drawText("-", margin + LI_INDENT - bulletW, y, {
          font: baseFont,
          color: BLACK,
        });

        const words = segmentsToWords(node.segments, baseFont);
        const lines = wrapWords(words, contentWidth - LI_INDENT);

        for (let i = 0; i < lines.length; i++) {
          let cx = margin + LI_INDENT;
          for (const word of lines[i]) {
            const ww = measureText(word.text, word.font);
            ctx.drawText(word.text, cx, y, { font: word.font, color: BLACK });
            if (word.underline) {
              ctx.drawHLine(cx, y + lineH - 2, ww, BLACK);
            }
            if (word.href) {
              links.push({ x: cx, y, w: ww, h: lineH, href: word.href });
            }
            cx += ww;
          }
          y += lineH;
        }

        y += LI_MARGIN_BOTTOM;
        break;
      }

      case "hr": {
        y += HR_MARGIN;
        ctx.drawDottedHLine(margin, y, contentWidth, BLACK);
        y += 1 + HR_MARGIN;
        break;
      }

      case "image": {
        if (opts.sprites) {
          const sprite = opts.sprites.get(node.src);
          if (sprite) {
            const sx = alignedX(sprite.width, contentWidth, margin, node.align);
            ctx.blit(sprite, sx, y);
            y += sprite.height + IMG_MARGIN_BOTTOM;
          }
        }
        break;
      }

      case "spacer": {
        y += node.height;
        break;
      }

      case "br": {
        y += BR_HEIGHT;
        break;
      }
    }
  }

  return { contentHeight: y - opts.startY, links };
}

// ---------------------------------------------------------------------------
// Measuring (same layout pass without drawing)
// ---------------------------------------------------------------------------

export function measureSiteNodes(
  nodes: LayoutNode[],
  width: number,
  margin: number = 8,
  sprites?: SpriteRegistry
): number {
  const contentWidth = width - margin * 2;
  let y = 0;

  for (const node of nodes) {
    switch (node.type) {
      case "heading": {
        const isH1 = node.level === 1;
        y += isH1 ? H1_MARGIN_TOP : H2_MARGIN_TOP;
        y += getLineHeight("ChiKareGo");
        y += isH1 ? H1_MARGIN_BOTTOM : H2_MARGIN_BOTTOM;
        break;
      }
      case "paragraph": {
        const baseFont: FontName = "Geneva9";
        const lineH = getLineHeight(baseFont);
        const words = segmentsToWords(node.segments, baseFont);
        const lines = wrapWords(words, contentWidth);
        y += lines.length * lineH + P_MARGIN_BOTTOM;
        break;
      }
      case "listItem": {
        const baseFont: FontName = "Geneva9";
        const lineH = getLineHeight(baseFont);
        const words = segmentsToWords(node.segments, baseFont);
        const lines = wrapWords(words, contentWidth - LI_INDENT);
        y += lines.length * lineH + LI_MARGIN_BOTTOM;
        break;
      }
      case "hr":
        y += HR_MARGIN * 2 + 1;
        break;
      case "image": {
        if (sprites) {
          const sprite = sprites.get(node.src);
          if (sprite) y += sprite.height + IMG_MARGIN_BOTTOM;
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

  return y;
}
