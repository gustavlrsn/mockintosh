import { SystemApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { ResourceManager } from "../lib/toolbox/ResourceManager";
import { OSEvent } from "../lib/toolbox/EventManager";
import { measureText } from "../lib/canvas/fontAdapter";
import { makeRect } from "@mockintosh/quickdraw";
import {
  NewControl,
  DrawControls,
  inButton,
} from "../lib/toolbox/ControlManager";

export const PictureApp: SystemApp = {
  id: "picture",
  title: "Picture",
  icon: "icon/MacFlim",
  defaultSize: { width: 256, height: 256 },
  scrollable: true,

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const sprites: ResourceManager = props._sprites;
    const src: string = props.src ?? "";
    const controlsCreatedRef = app.useRef(false);

    ctx.clear(WHITE);

    const win = ctx.getWindow();
    if (win !== null) {
      if (!controlsCreatedRef.current) {
        const printW = measureText("Print", "ChiKareGo") + 20;
        const boundsRect = makeRect(4, 4, 24, 4 + printW);
        const handle = NewControl(
          win,
          boundsRect,
          "Print",
          true,
          0,
          0,
          1,
          0,
          0
        );
        handle.ref.contrlAction = (_c, partCode) => {
          if (partCode === inButton) {
            // Future: trigger print
          }
        };
        controlsCreatedRef.current = true;
      }
      DrawControls(win, ctx.port);
    }

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
