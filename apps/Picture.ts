import { NativeApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { SpriteRegistry } from "../lib/canvas/SpriteRegistry";
import { OSEvent } from "../lib/canvas/EventManager";

export const PictureApp: NativeApp = {
  id: "picture",
  title: "Picture",
  icon: "icon/MacFlim",
  defaultSize: { width: 256, height: 256 },
  scrollable: true,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const sprites: SpriteRegistry = props._sprites;
    const src: string = props.src ?? "";

    ctx.clear(WHITE);

    // Print button at top
    ctx.drawButton({
      x: 4,
      y: 4,
      label: "Print",
    });

    // Image
    const sprite = sprites?.get(src);
    if (sprite) {
      ctx.blit(sprite, 0, 28);
    }
  },

  getContentHeight(app: AppBuilder, props: any): number {
    return (props.height ?? 200) + 32;
  },
};
