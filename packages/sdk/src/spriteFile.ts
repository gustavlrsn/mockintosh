/**
 * Sprite files — `image/x-mockintosh-sprite` — are how apps keep 1-bit
 * pictures in the file system: a JSON body with the sprite's size and its
 * base64 2 bpp pixels (`encodeSprite`). PhotoBooth writes them; Picture opens
 * them; the Finder shows them with a picture icon.
 */
import { MIME, type FSFile, type NodeAttributes } from "@mockintosh/fs";
import { defineSprite, encodeSprite, type Sprite } from "@mockintosh/ui";
import type { AppFileSystem } from "./index";

/** JSON body of a sprite file. */
export interface SpriteFileContent {
  width: number;
  height: number;
  /** Base64 2 bpp pixels, see `defineSprite`. */
  data: string;
}

function isSpriteFileContent(v: unknown): v is SpriteFileContent {
  const c = v as Partial<SpriteFileContent> | null;
  return !!c && typeof c.width === "number" && typeof c.height === "number" && typeof c.data === "string";
}

/** Decode a sprite file, or `null` if the body is not one. */
export async function readSpriteFile(fs: AppFileSystem, fileId: string): Promise<Sprite | null> {
  const content = await fs.readJSON<unknown>(fileId);
  if (!isSpriteFileContent(content)) return null;
  return defineSprite(content.width, content.height, content.data);
}

export interface WriteSpriteFileOptions {
  /** Attributes for the new node, e.g. a Finder `icon`. */
  attributes?: NodeAttributes;
}

/** Write `sprite` as a sprite file named `name` in the directory `parentId`. */
export function writeSpriteFile(
  fs: AppFileSystem,
  parentId: string,
  name: string,
  sprite: Sprite,
  options: WriteSpriteFileOptions = {}
): Promise<FSFile> {
  const content: SpriteFileContent = {
    width: sprite.width,
    height: sprite.height,
    data: encodeSprite(sprite),
  };
  return fs.writeJSON(parentId, name, content, { type: MIME.sprite, attributes: options.attributes });
}
