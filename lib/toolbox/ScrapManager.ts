/**
 * ScrapManager.ts — Macintosh Toolbox Scrap Manager
 *
 * Manages the system clipboard (scrap) with typed data formats.
 * Multiple formats can coexist on the scrap simultaneously (e.g. TEXT + PICT
 * after a copy, so paste targets can choose their preferred format).
 *
 * Original Mac routines mapped:
 *   ZeroScrap  → ZeroScrap()
 *   PutScrap   → PutScrap(type, data)
 *   GetScrap   → GetScrap(type)
 *   InfoScrap  → InfoScrap()
 *
 * Dropped: disk scrap (UnloadScrap/LoadScrap), translation manager.
 * All data is held in memory.
 */

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

/**
 * Scrap format type codes. Matches original Mac four-character codes.
 * TEXT = plain text, PICT = QuickDraw picture data, BMAP = raw bitmap.
 */
export type ScrapType = "TEXT" | "PICT" | "BMAP";

export interface ScrapInfo {
  /** Number of distinct format types currently on the scrap. */
  count: number;
  /** The format types currently stored. */
  types: ScrapType[];
}

// -------------------------------------------------------------------------
// Internal state
// -------------------------------------------------------------------------

const scrapData: Map<ScrapType, string | Uint8Array> = new Map();

// -------------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------------

/**
 * Clear the scrap, removing all format types.
 * Call before writing new data (standard Mac pattern: ZeroScrap then PutScrap).
 *
 * Equivalent to Mac ZeroScrap.
 */
export function ZeroScrap(): void {
  scrapData.clear();
}

/**
 * Write data to the scrap in a specific format.
 * Can be called multiple times to add the same content in different formats.
 *
 * Equivalent to Mac PutScrap.
 */
export function PutScrap(type: ScrapType, data: string | Uint8Array): void {
  scrapData.set(type, data);
}

/**
 * Read data from the scrap in a specific format.
 * Returns null if the requested format is not available.
 *
 * Equivalent to Mac GetScrap.
 */
export function GetScrap(type: ScrapType): string | Uint8Array | null {
  return scrapData.get(type) ?? null;
}

/**
 * Get information about the current scrap contents.
 *
 * Equivalent to Mac InfoScrap.
 */
export function InfoScrap(): ScrapInfo {
  return {
    count: scrapData.size,
    types: Array.from(scrapData.keys()),
  };
}

/**
 * Convenience: check if the scrap has data of a given type.
 */
export function HasScrap(type: ScrapType): boolean {
  return scrapData.has(type);
}
