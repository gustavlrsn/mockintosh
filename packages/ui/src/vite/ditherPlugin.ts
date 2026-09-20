/**
 * Vite plugin: `import pic from "./photo.jpg?dither=ascii&width=200&height=200"`
 * yields a `DitheredAsset` so the JPEG never ships to the browser.
 *
 * Requires `sharp` in the app that uses the plugin (devDependency).
 */
import { readFile } from "node:fs/promises";
import type { Plugin } from "vite";
import { rasterizeFrame, type DitherMode, type ImageFrame } from "../dither.ts";

const MODES = new Set<DitherMode>(["threshold", "atkinson", "bayer", "ascii"]);

function parseDitherId(id: string): { path: string; params: URLSearchParams } | null {
  const clean = id.split("\0")[0];
  const q = clean.indexOf("?");
  if (q < 0) return null;
  const params = new URLSearchParams(clean.slice(q + 1));
  if (!params.has("dither")) return null;
  return { path: clean.slice(0, q), params };
}

function emitAsset(width: number, height: number, pixels: Uint8Array): string {
  const base64 = Buffer.from(pixels).toString("base64");
  return `const pixels = Uint8Array.from(atob(${JSON.stringify(base64)}), (c) => c.charCodeAt(0));
export default { width: ${width}, height: ${height}, pixels };
`;
}

export function ditherImagePlugin(): Plugin {
  return {
    name: "mockintosh-dither-image",
    enforce: "pre",
    async load(id) {
      const parsed = parseDitherId(id);
      if (!parsed) return null;
      if (!/\.(png|jpe?g|gif|webp)$/i.test(parsed.path)) return null;

      const modeParam = parsed.params.get("dither") ?? "ascii";
      if (!MODES.has(modeParam as DitherMode)) {
        throw new Error(`Unknown dither mode "${modeParam}"`);
      }
      const width = Math.max(1, Number(parsed.params.get("width") ?? 200));
      const height = Math.max(1, Number(parsed.params.get("height") ?? width));
      const mirror = parsed.params.get("mirror") === "1" || parsed.params.get("mirror") === "true";

      const sharp = (await import("sharp")).default;
      const file = await readFile(parsed.path);
      const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const src: ImageFrame = {
        width: info.width,
        height: info.height,
        rgba: new Uint8ClampedArray(data),
      };
      const pixels = rasterizeFrame(src, width, height, modeParam as DitherMode, { mirror });
      return emitAsset(width, height, pixels);
    },
  };
}
