import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { OSEvent } from "../lib/toolbox/EventManager";
import { makeRect } from "@mockintosh/quickdraw";
import Dither from "canvas-dither";
import {
  NewControl,
  DrawControls,
  inButton,
} from "../lib/toolbox/ControlManager";

const VIDEO_WIDTH = 340;

export const VideoPlayerApp: SystemApp = {
  id: "video",
  title: "1984.mp4",
  icon: "icon/MacFlim",
  defaultSize: { width: VIDEO_WIDTH, height: 260 },
  scrollable: false,

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const [isPlaying, setIsPlaying] = app.useState(false);
    const frameRef = app.useRef<ImageData | null>(null);
    const videoRef = app.useRef<HTMLVideoElement | null>(null);
    const controlsCreatedRef = app.useRef(false);

    ctx.clear(WHITE);

    if (frameRef.current) {
      ctx.blitImageData(frameRef.current, 0, 0);
    }

    const controlY = ctx.height - 18;
    ctx.fillRect(0, controlY, ctx.width, 18, WHITE);

    const win = ctx.getWindow();
    if (win !== null) {
      if (!controlsCreatedRef.current) {
        const boundsRect = makeRect(controlY + 1, 4, controlY + 17, 20);
        const handle = NewControl(win, boundsRect, ">", true, 0, 0, 1, 0, 0);
        handle.ref.contrlAction = (_c, partCode) => {
          if (partCode === inButton) {
            setIsPlaying((p) => !p);
          }
        };
        controlsCreatedRef.current = true;
      }
      // Update label for play/pause
      const playControl = win.controlList[0];
      if (playControl) {
        playControl.ref.contrlTitle = isPlaying ? "||" : ">";
      }
      DrawControls(win, ctx.port);
    }

    const trackX = 24;
    const trackW = ctx.width - 28;
    ctx.drawRect(trackX, controlY + 1, trackW, 16, BLACK);

    ctx.fillRect(trackX + 1, controlY + 2, 14, 14, WHITE);
    ctx.drawVLine(trackX + 14, controlY + 1, 16, BLACK);
    ctx.fillRect(trackX + trackW - 15, controlY + 2, 14, 14, WHITE);
    ctx.drawVLine(trackX + trackW - 15, controlY + 1, 16, BLACK);

    ctx.fillPattern(trackX + 15, controlY + 2, trackW - 30, 14, "gray50");
  },

  onOpen(app: AppBuilder, props: any) {},

  onEvent(app: AppBuilder, event: OSEvent, props: any, size: WindowSize) {
    app.useState(false); // isPlaying
    app.useRef<ImageData | null>(null); // frameRef
    app.useRef<HTMLVideoElement | null>(null); // videoRef
    app.useRef(false); // controlsCreatedRef
  },
};
