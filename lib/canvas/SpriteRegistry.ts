import { Sprite, BLACK, WHITE } from "./BitCanvas";

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

/**
 * Pre-loads images and converts them to 1-bit Sprite data.
 * Sprites can be registered synchronously (inline data) or loaded async (PNG URLs).
 */
export class SpriteRegistry {
  private cache: Map<string, Sprite> = new Map();
  private loading: Map<string, Promise<Sprite>> = new Map();

  async load(src: string, width?: number, height?: number): Promise<Sprite> {
    const cached = this.cache.get(src);
    if (cached) return cached;

    const existing = this.loading.get(src);
    if (existing) return existing;

    const promise = this._load(src, width, height);
    this.loading.set(src, promise);
    const sprite = await promise;
    this.loading.delete(src);
    this.cache.set(src, sprite);
    return sprite;
  }

  get(src: string): Sprite | undefined {
    return this.cache.get(src);
  }

  has(src: string): boolean {
    return this.cache.has(src);
  }

  register(key: string, sprite: Sprite): void {
    this.cache.set(key, sprite);
  }

  registerAll(sprites: Record<string, Sprite>): void {
    for (const [key, sprite] of Object.entries(sprites)) {
      this.cache.set(key, sprite);
    }
  }

  private async _load(
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
        mask[i] = 0; // transparent
      } else {
        // Threshold: average RGB < 128 = black
        const avg = (rgba[ri] + rgba[ri + 1] + rgba[ri + 2]) / 3;
        data[i] = avg < 128 ? BLACK : WHITE;
        mask[i] = 1; // opaque
      }
    }

    return { width: w, height: h, data, mask };
  }

  /**
   * Pre-load a batch of images in parallel.
   */
  async preload(srcs: string[]): Promise<void> {
    await Promise.all(srcs.map((src) => this.load(src)));
  }

  /**
   * Create a Sprite from raw 1-bit data (for programmatic sprites like cursors).
   */
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
}
