import { SystemApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { ResourceManager } from "../lib/toolbox/ResourceManager";

let spriteRegistry: ResourceManager | null = null;

export function setSplashResources(reg: ResourceManager) {
  spriteRegistry = reg;
}

export const SplashscreenApp: SystemApp = {
  id: "splashscreen",
  title: "Splashscreen",
  icon: "",
  defaultSize: { width: 512, height: 342 },

  render(app: AppBuilder, ctx: WindowContext) {
    ctx.clear(WHITE);
    // Draw happy Mac icon centered
    const sprite = spriteRegistry?.get("icon/happy");
    if (sprite) {
      const cx = Math.floor((ctx.width - sprite.width) / 2);
      const cy = Math.floor((ctx.height - sprite.height) / 2);
      ctx.blit(sprite, cx, cy);
    }
  },
};
