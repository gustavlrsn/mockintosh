import { SpriteRegistry } from "../SpriteRegistry";
import { iconSprites } from "./icons";
import { cursorSprites } from "./cursors";
import { uiSprites } from "./ui";
import { chromeSprites } from "./chrome";

export function registerAllSprites(registry: SpriteRegistry): void {
  registry.registerAll(iconSprites);
  registry.registerAll(cursorSprites);
  registry.registerAll(uiSprites);
  registry.registerAll(chromeSprites);
}
