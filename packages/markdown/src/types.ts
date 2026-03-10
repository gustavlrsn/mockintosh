// ---------------------------------------------------------------------------
// Core types for the @mockintosh/markdown package.
//
// LayoutNode[] is the render-target model: the bridge between the markdown
// parser and the BitCanvas renderer. It describes *what to draw* without
// knowing anything about pixels or fonts.
// ---------------------------------------------------------------------------

export type Align = "left" | "center" | "right";

// Inline content within a paragraph or list item.
export type InlineSegment =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "italic"; text: string }
  | { kind: "code"; text: string }
  | { kind: "link"; text: string; href: string };

// A link hit-rect produced during a render pass.
export interface LinkRect {
  x: number;
  y: number;
  w: number;
  h: number;
  href: string;
}

// Block-level nodes passed to the canvas renderer.
export type LayoutNode =
  | { type: "heading"; level: 1 | 2; text: string; align: Align }
  | { type: "paragraph"; segments: InlineSegment[]; align: Align }
  | { type: "listItem"; segments: InlineSegment[]; indent: number }
  | { type: "hr" }
  | { type: "image"; src: string; alt: string; align: Align }
  | { type: "spacer"; height: number }
  | { type: "br" };
