import { SystemApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { ResourceManager } from "../lib/toolbox/ResourceManager";
import { OSEvent } from "../lib/toolbox/EventManager";

export const PictureApp: SystemApp = {
  id: "picture",
  title: "Picture",
  icon: "icon/MacFlim",
  defaultSize: { width: 256, height: 256 },
  scrollable: true,

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const sprites: ResourceManager = props._sprites;
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
