/**
 * Text measurement bridge — connects the layout engine's MeasureFunc
 * to the font system, without the layout engine importing any font code.
 */

import { createContext, useContext } from "solid-js";
import type { MeasureFunc } from "./layout";
import { requireFont, initBuiltinFonts } from "./fonts/registry";
import { layoutText } from "./fonts/textLayout";
import { alignmentHeight } from "./fonts/metrics";
import type { CanvasNode, TextVerticalAlign } from "./nodes";

/**
 * Create the MeasureFunc used by computeLayout.
 * Injected into the layout engine during createUI().
 *
 * For `text` nodes `availableWidth` is the content-box width (padding already
 * removed by the layout engine); wrapped text breaks lines against it.
 */
export function createMeasureFunc(): MeasureFunc {
  initBuiltinFonts();
  return (node: CanvasNode, availableWidth: number): { width: number; height: number } => {
    if (node.type === "_text_content") {
      // Bare string child of a box — single line in the parent's font.
      const text = node.textContent;
      if (!text) return { width: 0, height: 0 };
      const fontName = node.parent?.props["font"] as string | undefined ?? "body";
      const font = requireFont(fontName);
      const block = layoutText(font, text);
      const valign = (node.parent?.props["verticalAlign"] as TextVerticalAlign | undefined) ?? "top";
      return { width: block.width, height: alignmentHeight(font, block.lines.length, block.height, valign) };
    }
    if (node.type === "text") {
      const fontName = node.props["font"] as string | undefined ?? "body";
      const font = requireFont(fontName);
      const text = collectTextContent(node);
      const valign = (node.props["verticalAlign"] as TextVerticalAlign | undefined) ?? "top";
      if (!text) {
        return { width: 0, height: alignmentHeight(font, 1, font.glyphHeight, valign) };
      }
      const wrap = node.props["wrap"] as boolean | undefined ?? false;
      const block = layoutText(font, text, wrap ? availableWidth : undefined);
      return {
        width: block.width,
        height: alignmentHeight(font, block.lines.length, block.height, valign),
      };
    }
    if (node.type === "image") {
      const src = node.props["src"] as { width: number; height: number } | undefined;
      if (src) return { width: src.width, height: src.height };
    }
    if (node.type === "raster" || node.type === "bitmap") {
      return { width: 0, height: 0 };
    }
    return { width: 0, height: 0 };
  };
}

function collectTextContent(node: CanvasNode): string {
  if (node.type === "_text_content") return node.textContent;
  return node.children.map(collectTextContent).join("");
}

// -------------------------------------------------------------------------
// useMeasure hook — exposes measurement to components
// -------------------------------------------------------------------------

export interface MeasureAPI {
  measureText(text: string, fontName?: string): number;
}

export const MeasureContext = createContext<MeasureAPI | null>(null);

export function useMeasure(): MeasureAPI {
  const ctx = useContext(MeasureContext);
  if (!ctx) throw new Error("useMeasure() called outside of a UI tree");
  return ctx;
}
