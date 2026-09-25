import { defineSprite, type Fill, type Sprite } from "@mockintosh/ui";
import type { Point } from "@mockintosh/quickdraw";
import type {
  CursorAnimationRecord,
  CursorCatalogFile,
  CursorRecord,
  PatternCatalogFile,
  PatternRecord,
} from "./types";
import patternFile from "./system753-patterns.json";
import cursorFile from "./system753-cursors.json";

const patterns = patternFile as PatternCatalogFile;
const cursors = cursorFile as CursorCatalogFile;

const desktopPpat = patterns.patterns
  .filter((p) => p.source === "Desktop Patterns" && p.kind === "ppat")
  .slice()
  .sort((a, b) => a.id - b.id);

const desktopById = new Map(desktopPpat.map((p) => [p.id, p]));
const patCache = new Map<string, Uint8Array>();

/** System 7.5 Desktop Patterns control panel — color `ppat`s with a 1-bit `pat`. */
export function desktopPatterns(): PatternRecord[] {
  return desktopPpat;
}

export function desktopPatternRecord(id: number): PatternRecord | undefined {
  return desktopById.get(id);
}

export function catalogPatternValue(id: number): string {
  return `ppat:${id}`;
}

/** System file `PAT#` 0 — the 38 classic 8×8 QuickDraw patterns. */
export function systemPatterns(): PatternRecord[] {
  return patterns.patterns.filter((p) => p.source === "System" && p.kind === "pat#");
}

export function patternBytes(hex: string): Uint8Array {
  const cached = patCache.get(hex);
  if (cached) return cached;
  const out = new Uint8Array(8);
  for (let i = 0; i < 8; i++) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  patCache.set(hex, out);
  return out;
}

const SOLID_HEX = {
  white: "0000000000000000",
  black: "ffffffffffffffff",
  checker: "aa55aa55aa55aa55",
} as const;

export function patternHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

/** 8 bytes painted for a persisted desktop preference. Unknown values are the checker. */
export function desktopPatternBytes(value: string): Uint8Array {
  if (value === "white" || value === "black" || value === "checker") return patternBytes(SOLID_HEX[value]);
  const custom = /^pat:([0-9a-f]{16})$/.exec(value);
  if (custom) return patternBytes(custom[1]);
  const match = /^ppat:(-?\d+)$/.exec(value);
  if (match) {
    const rec = desktopPatternRecord(Number(match[1]));
    if (rec) return patternBytes(rec.pat);
  }
  return patternBytes(SOLID_HEX.checker);
}

/** Named solid when the tile is one of those; otherwise `pat:<16 hex>`. */
export function desktopPatternToken(bytes: Uint8Array): string {
  const hex = patternHex(bytes);
  if (hex === SOLID_HEX.checker) return "checker";
  if (hex === SOLID_HEX.white) return "white";
  if (hex === SOLID_HEX.black) return "black";
  return `pat:${hex}`;
}

/** Ink or 8-byte pat for a persisted desktop preference. Unknown ids fall back to checker. */
export function desktopFill(value: string): Fill {
  if (value === "white") return 0;
  if (value === "black") return 1;
  if (value === "checker") return "checker";
  const custom = /^pat:([0-9a-f]{16})$/.exec(value);
  if (custom) return patternBytes(custom[1]);
  const match = /^ppat:(-?\d+)$/.exec(value);
  if (!match) return "checker";
  const rec = desktopPatternRecord(Number(match[1]));
  return rec ? patternBytes(rec.pat) : "checker";
}

/** System IDs overlaid by 7.5.x update bags, plus Finder cursors. */
export function shippedCursors(): CursorRecord[] {
  const system = new Map<number, CursorRecord>();
  const rest: CursorRecord[] = [];
  for (const cur of cursors.cursors) {
    if (cur.source === "System") system.set(cur.id, cur);
    else if (cur.source.startsWith("System 7.5")) {
      system.set(cur.id, { ...cur, source: "System", name: cur.name || system.get(cur.id)?.name || "" });
    } else if (cur.source === "Finder") rest.push(cur);
  }
  return [...system.values(), ...rest];
}

export function shippedCursor(id: number): CursorRecord | undefined {
  return shippedCursors().find((c) => c.id === id);
}

export function cursorSprite(record: CursorRecord): { sprite: Sprite; hotSpot: Point } {
  return {
    sprite: defineSprite(16, 16, record.sprite),
    hotSpot: { v: record.hotV, h: record.hotH },
  };
}

export function watchAnimation(): CursorAnimationRecord | undefined {
  return cursors.animations.find((a) => a.source === "System");
}
