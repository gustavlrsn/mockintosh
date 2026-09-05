/**
 * Sprite files — `image/x-mockintosh-sprite` bodies decoded into the sprite
 * `ResourceManager` under `fs:<fileId>`, so a file's picture can be drawn
 * with the same `<image>`/`blitSprite` path as any built-in sprite.
 *
 * This is codec + cache glue between the file system and the resource layer;
 * neither side knows about the other.
 */
import { MIME, type FileSystem, type FSFile, type NodeAttributes } from "@mockintosh/fs";
import type { Sprite } from "../../lib/canvas/BitCanvas";
import { defineSprite, type ResourceManager } from "../../lib/toolbox/ResourceManager";

/** JSON body of a sprite file: 2bpp base64 pixels, see `defineSprite`. */
export interface SpriteFileContent {
  width: number;
  height: number;
  data: string;
}

export function spriteResourceKey(fileId: string): string {
  return `fs:${fileId}`;
}

export async function saveSpriteFile(
  fs: FileSystem,
  sprites: ResourceManager,
  parentId: string,
  name: string,
  content: SpriteFileContent,
  attributes?: NodeAttributes
): Promise<FSFile> {
  const file = await fs.writeJSON(parentId, name, content, { type: MIME.sprite, attributes });
  sprites.register(spriteResourceKey(file.id), defineSprite(content.width, content.height, content.data));
  return file;
}

export async function loadSpriteFile(
  fs: FileSystem,
  sprites: ResourceManager,
  fileId: string
): Promise<Sprite | null> {
  const key = spriteResourceKey(fileId);
  const cached = sprites.get(key);
  if (cached) return cached;
  const parsed = await fs.readJSON<SpriteFileContent>(fileId);
  if (!parsed || typeof parsed.width !== "number" || typeof parsed.data !== "string") return null;
  const sprite = defineSprite(parsed.width, parsed.height, parsed.data);
  sprites.register(key, sprite);
  return sprite;
}
