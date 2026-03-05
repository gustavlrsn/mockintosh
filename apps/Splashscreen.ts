import { NativeApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { SpriteRegistry } from "../lib/canvas/SpriteRegistry";

let spriteRegistry: SpriteRegistry | null = null;

export function setSplashSpriteRegistry(reg: SpriteRegistry) {
  spriteRegistry = reg;
}

export const SplashscreenApp: NativeApp = {
  id: "splashscreen",
  title: "Splashscreen",
  icon: "",
  defaultSize: { width: 512, height: 342 },

  render(app: AppBuilder, ctx: AppContext) {
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
