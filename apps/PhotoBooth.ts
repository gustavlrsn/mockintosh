import { NativeApp } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { BLACK, WHITE } from "../lib/canvas/BitCanvas";
import { OSEvent } from "../lib/canvas/EventManager";
import { OSServices } from "../lib/canvas/OSServices";
import { MenubarDefinition } from "../lib/canvas/ui/drawMenubar";
import Dither from "canvas-dither";

const WIDTH = 288;
const HEIGHT = 288;

export const PhotoBoothApp: NativeApp = {
  id: "photobooth",
  title: "Photo Booth",
  icon: "/icons/photobooth-smr-32.png",
  defaultSize: { width: WIDTH, height: HEIGHT + 40 },
  scrollable: false,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const os: OSServices = props._os;
    const [loading] = app.useState(true);
    const [errorText] = app.useState("");
    const [countdown] = app.useState<number | undefined>(undefined);
    const [viewingPhoto] = app.useState<number | null>(null);
    const [photos] = app.useState<any[]>([]);
    const [flash] = app.useState(false);
    const frameRef = app.useRef<ImageData | null>(null);

    ctx.clear(WHITE);

    if (flash) {
      ctx.fillRect(0, 0, ctx.width, ctx.height, WHITE);
      return;
    }

    if (viewingPhoto !== null && photos.length > viewingPhoto) {
      const photo = photos[viewingPhoto];
      if (photo.imageData) {
        ctx.blitImageData(photo.imageData, 0, 0);
      }
    } else if (frameRef.current) {
      ctx.blitImageData(frameRef.current, 0, 0);
    }

    if (loading) {
      ctx.drawText("Initializing camera...", WIDTH / 2 - 60, HEIGHT / 2 - 6, {
        font: "ChiKareGo",
        color: BLACK,
        bg: WHITE,
      });
    }

    if (errorText) {
      ctx.drawText(errorText, 8, HEIGHT / 2, {
        font: "ChiKareGo",
        color: BLACK,
        bg: WHITE,
      });
    }

    if (countdown !== undefined && countdown > 0) {
      ctx.drawText(String(countdown), WIDTH / 2 - 4, HEIGHT / 2 - 8, {
        font: "ChiKareGo",
        color: BLACK,
        bg: WHITE,
      });
    }

    const barY = HEIGHT;
    ctx.fillRect(0, barY, ctx.width, 40, WHITE);
    ctx.drawHLine(0, barY, ctx.width, BLACK);

    if (viewingPhoto === null) {
      ctx.drawButton({
        x: WIDTH / 2 - 20,
        y: barY + 8,
        width: 40,
        height: 24,
        label:
          countdown !== undefined && countdown > 0 ? String(countdown) : "Snap",
      });
    } else {
      let bx = 8;
      ctx.drawButton({ x: bx, y: barY + 8, label: "Print" });
      bx += 56;
      ctx.drawButton({ x: bx, y: barY + 8, label: "Delete" });
      bx += 64;
      ctx.drawButton({ x: bx, y: barY + 8, label: "Save" });
      bx += 56;
      ctx.drawButton({ x: bx, y: barY + 8, label: "Back" });
    }
  },

  onEvent(app: AppBuilder, event: OSEvent, props: any) {
    // Event handling for PhotoBooth buttons would go here
    // (simplified for initial implementation)
  },

  getMenubar(app: AppBuilder, props: any): MenubarDefinition[] {
    return [
      {
        label: "File",
        items: [
          { label: "Take Photo" },
          { label: "Start Recording", disabled: true },
        ],
      },
      {
        label: "Dithering",
        items: [
          {
            type: "radiogroup",
            value: "atkinson",
            onValueChange: () => {},
            items: [
              { label: "Atkinson", value: "atkinson" },
              { label: "Bayer", value: "bayer" },
            ],
          },
        ],
      },
    ];
  },
};
