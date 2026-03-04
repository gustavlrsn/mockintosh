import { NativeApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { OSEvent } from "../lib/canvas/EventManager";
import Dither from "canvas-dither";

const VIDEO_WIDTH = 340;

export const VideoPlayerApp: NativeApp = {
  id: "video",
  title: "1984.mp4",
  icon: "/icons/MacFlim.png",
  defaultSize: { width: VIDEO_WIDTH, height: 260 },
  scrollable: false,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const [isPlaying, setIsPlaying] = app.useState(false);
    const frameRef = app.useRef<ImageData | null>(null);
    const videoRef = app.useRef<HTMLVideoElement | null>(null);

    ctx.clear(WHITE);

    if (frameRef.current) {
      ctx.blitImageData(frameRef.current, 0, 0);
    }

    const controlY = ctx.height - 18;
    ctx.fillRect(0, controlY, ctx.width, 18, WHITE);

    ctx.drawButton({
      x: 4,
      y: controlY + 1,
      width: 16,
      height: 16,
      label: isPlaying ? "||" : ">",
      id: "play-btn",
      onClick: () => setIsPlaying(!isPlaying),
    });

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
  },
};
