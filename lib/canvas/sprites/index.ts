import { ResourceManager } from "../../toolbox/ResourceManager";
import { iconSprites } from "./icons";
import { cursorSprites } from "./cursors";
import { uiSprites } from "./ui";
import { chromeSprites } from "./chrome";

export function registerAllSprites(registry: ResourceManager): void {
  registry.registerAll(iconSprites);
  registry.registerAll(cursorSprites);
  registry.registerAll(uiSprites);
  registry.registerAll(chromeSprites);
}
