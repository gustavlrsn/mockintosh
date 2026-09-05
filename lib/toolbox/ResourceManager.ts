/**
 * ResourceManager.ts — Macintosh Toolbox Resource Manager
 *
 * A typed resource store keyed by (ResType, ResID), and the single source
 * of truth for all bitmap/sprite resources. Absorbs the former SpriteRegistry
 * cache and async-loading logic.
 *
 * Original Mac routines mapped:
 *   GetResource      → GetResource(type, id)
 *   GetNamedResource → GetNamedResource(type, name)
 *   AddResource      → AddResource(type, id, name, data)
 *   CountResources   → CountResources(type)
 *   Get1Resource     → not needed (single resource file)
 *
 * Dropped: resource forks, handle purging, ResEdit, file format.
 */

import { Sprite, BLACK, WHITE } from "../canvas/BitCanvas";

// -------------------------------------------------------------------------
// Free functions (formerly in SpriteRegistry.ts)
// -------------------------------------------------------------------------

/**
 * Decode a base64-encoded 2bpp sprite.
 * Pixel encoding: 00=transparent, 01=white, 10=black, 11=reserved.
 * 4 pixels per byte, MSB-first.
 */
export function defineSprite(
  width: number,
  height: number,
  b64: string
): Sprite {
  const raw = atob(b64);
  const total = width * height;
  const data = new Uint8Array(total);
  const mask = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    const byteIdx = i >> 2;
    const shift = 6 - (i & 3) * 2;
    const val = (raw.charCodeAt(byteIdx) >> shift) & 0x03;
    data[i] = val === 2 ? BLACK : WHITE;
    mask[i] = val === 0 ? 0 : 1;
  }
  return { width, height, data, mask };
}

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

/** Four-character resource type codes. */
export type ResType = "ICON" | "CURS" | "PAT " | "PICT";

export type ResID = number;

export interface ResourceEntry {
  resType: ResType;
  resID: ResID;
  name: string;
  data: Sprite;
}

// -------------------------------------------------------------------------
// ResourceManager
// -------------------------------------------------------------------------

export class ResourceManager {
  private entries: Map<string, ResourceEntry> = new Map();
  private nameIndex: Map<string, ResourceEntry> = new Map();

  // Sprite cache (formerly SpriteRegistry internals)
  private cache: Map<string, Sprite> = new Map();
  private loading: Map<string, Promise<Sprite>> = new Map();

  private _key(type: ResType, id: ResID): string {
    return `${type}:${id}`;
  }

  private _nameKey(type: ResType, name: string): string {
    return `${type}:${name}`;
  }

  // -----------------------------------------------------------------------
  // Sprite cache API (formerly SpriteRegistry)
  // -----------------------------------------------------------------------

  get(key: string): Sprite | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  register(key: string, sprite: Sprite): void {
    this.cache.set(key, sprite);
  }

  registerAll(sprites: Record<string, Sprite>): void {
    for (const [key, sprite] of Object.entries(sprites)) {
      this.cache.set(key, sprite);
    }
  }

  async load(src: string, width?: number, height?: number): Promise<Sprite> {
    const cached = this.cache.get(src);
    if (cached) return cached;

    const existing = this.loading.get(src);
    if (existing) return existing;

    const promise = this._loadImage(src, width, height);
    this.loading.set(src, promise);
    const sprite = await promise;
    this.loading.delete(src);
    this.cache.set(src, sprite);
    return sprite;
  }

  async preload(srcs: string[]): Promise<void> {
    await Promise.all(srcs.map((src) => this.load(src)));
  }

  static fromBits(
    width: number,
    height: number,
    bits: number[],
    hasMask = false
  ): Sprite {
    const data = new Uint8Array(width * height);
    const mask = new Uint8Array(width * height);
    if (hasMask) {
      const half = bits.length / 2;
      for (let i = 0; i < half; i++) {
        data[i] = bits[i] ? BLACK : WHITE;
        mask[i] = bits[half + i] ? 1 : 0;
      }
    } else {
      for (let i = 0; i < bits.length; i++) {
        data[i] = bits[i] ? BLACK : WHITE;
        mask[i] = 1;
      }
    }
    return { width, height, data, mask };
  }

  private async _loadImage(
    src: string,
    forcedWidth?: number,
    forcedHeight?: number
  ): Promise<Sprite> {
    const resp = await fetch(src);
    const blob = await resp.blob();
    const bmp = await createImageBitmap(blob);
    const w = forcedWidth ?? bmp.width;
    const h = forcedHeight ?? bmp.height;

    const offscreen = new OffscreenCanvas(w, h);
    const ctx = offscreen.getContext("2d") as OffscreenCanvasRenderingContext2D;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();

    const imageData = ctx.getImageData(0, 0, w, h);
    const rgba = imageData.data;
    const data = new Uint8Array(w * h);
    const mask = new Uint8Array(w * h);

    for (let i = 0; i < w * h; i++) {
      const ri = i * 4;
      const alpha = rgba[ri + 3];
      if (alpha < 128) {
        data[i] = WHITE;
        mask[i] = 0;
      } else {
        const avg = (rgba[ri] + rgba[ri + 1] + rgba[ri + 2]) / 3;
        data[i] = avg < 128 ? BLACK : WHITE;
        mask[i] = 1;
      }
    }

    return { width: w, height: h, data, mask };
  }

  // -----------------------------------------------------------------------
  // Mac-style typed resource API
  // -----------------------------------------------------------------------

  AddResource(type: ResType, id: ResID, name: string, data: Sprite): void {
    const entry: ResourceEntry = { resType: type, resID: id, name, data };
    this.entries.set(this._key(type, id), entry);
    if (name) {
      this.nameIndex.set(this._nameKey(type, name), entry);
    }
    this.cache.set(name, data);
  }

  AddSpriteResource(
    type: ResType,
    id: ResID,
    name: string,
    width: number,
    height: number,
    b64: string
  ): void {
    const sprite = defineSprite(width, height, b64);
    this.AddResource(type, id, name, sprite);
  }

  GetResource(type: ResType, id: ResID): Sprite | null {
    const entry = this.entries.get(this._key(type, id));
    return entry?.data ?? null;
  }

  GetNamedResource(type: ResType, name: string): Sprite | null {
    const entry = this.nameIndex.get(this._nameKey(type, name));
    if (entry) return entry.data;
    const sprite = this.cache.get(name);
    return sprite ?? null;
  }

  CountResources(type: ResType): number {
    let count = 0;
    for (const entry of this.entries.values()) {
      if (entry.resType === type) count++;
    }
    return count;
  }

  GetResourceIDs(type: ResType): ResID[] {
    const ids: ResID[] = [];
    for (const entry of this.entries.values()) {
      if (entry.resType === type) ids.push(entry.resID);
    }
    return ids;
  }

  RemoveResource(type: ResType, id: ResID): void {
    const key = this._key(type, id);
    const entry = this.entries.get(key);
    if (entry) {
      this.entries.delete(key);
      if (entry.name) {
        this.nameIndex.delete(this._nameKey(type, entry.name));
      }
    }
  }
}
