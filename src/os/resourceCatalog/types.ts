/** 8-byte QuickDraw `Pattern` (8×8, 1-bit), stored as 16 hex chars. */
export type PatternHex = string;

export type PatternKind = "pat" | "pat#" | "ppat";

export interface PatternRecord {
  source: string;
  kind: PatternKind;
  id: number;
  index?: number;
  name: string;
  pat: PatternHex;
  width?: number;
  height?: number;
  pixelSize?: number;
  /** 1-bit pixmap tile when the ppat itself is 1-bit and larger than 8×8. */
  tile?: string;
}

export interface CursorRecord {
  source: string;
  id: number;
  name: string;
  hotV: number;
  hotH: number;
  sprite: string;
}

export interface CursorAnimationRecord {
  source: string;
  id: number;
  name: string;
  frames: number[];
}

export interface PatternCatalogFile {
  release: string;
  image: string;
  patterns: PatternRecord[];
}

export interface CursorCatalogFile {
  release: string;
  image: string;
  cursors: CursorRecord[];
  animations: CursorAnimationRecord[];
}
