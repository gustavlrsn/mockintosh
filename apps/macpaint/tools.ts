export const TOOL_IDS = [
  "select",
  "spray",
  "brush",
  "fill",
  "pencil",
  "eraser",
  "line",
  "rect",
  "rrect",
  "oval",
] as const;

export type ToolId = (typeof TOOL_IDS)[number];

export const TOOL_LABEL: Record<ToolId, string> = {
  select: "Selection",
  spray: "Spray can",
  brush: "Paintbrush",
  fill: "Paint bucket",
  pencil: "Pencil",
  eraser: "Eraser",
  line: "Line",
  rect: "Rectangle",
  rrect: "Rounded rectangle",
  oval: "Oval",
};

export const TOOL_GRID: readonly ToolId[][] = [
  ["select", "spray"],
  ["brush", "fill"],
  ["pencil", "eraser"],
  ["line", "rect"],
  ["rrect", "oval"],
];

export const SHAPE_TOOLS = new Set<ToolId>(["line", "rect", "rrect", "oval"]);

export const SIZE_TOOLS = new Set<ToolId>(["spray", "brush", "eraser", "line", "rect", "rrect", "oval"]);

export const PEN_SIZES = [1, 2, 3, 5, 8] as const;
export type PenSize = (typeof PEN_SIZES)[number];
