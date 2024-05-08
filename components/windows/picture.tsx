import React from "react";
import { Window, WindowScrollArea } from "../ui/window";
import { Button } from "../ui/button";
import { printClickHandler, printPortrait } from "@/lib/print";
import { Dialog, DialogContent } from "../ui/dialog";
import { Input } from "../ui/input";
import SystemButton from "@/components/button";
import PixelFontCanvas from "@/lib/PixelFontCanvas";
async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
}
export default function Picture({ src, height, width, window, i }) {
  const canvasRef = React.useRef(null);
  const [printDialogOpen, setPrintDialogOpen] = React.useState(false);
  const [caption, setCaption] = React.useState("");
  React.useEffect(() => {
    // PixelFontCanvas.loadFont("/fonts/", "Redaction20-Regular.fnt", (data) => {
    //   setFontLoaded(true);
    // });
    PixelFontCanvas.loadFont("/fonts/", "Redaction35-Regular.fnt", (data) =>
      console.log("Font loaded", data)
    );
  }, []);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.webkitImageSmoothingEnabled = false;

    const image = new Image();
    image.src = src;
    image.onload = () => {
      context.drawImage(image, 0, 0, width, height);
    };
  }, [src, width, height]);

  return (
    <>
      <Window i={i} {...window}>
        <WindowScrollArea resizable>
          <Button
            onClick={() =>
              // printPortrait(
              //   canvasRef.current
              //     .getContext("2d")
              //     .getImageData(0, 0, width, height)
              // )
              setPrintDialogOpen(true)
            }
          >
            Print
          </Button>
          <canvas ref={canvasRef} width={width} height={height} />
        </WindowScrollArea>
      </Window>
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent>
          <div className="space-y-3">
            <div className="font-chicago">Print with caption?</div>
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full"
            />
            <div className="flex gap-2 items-center justify-end">
              <SystemButton onClick={() => setPrintDialogOpen(false)}>
                Cancel
              </SystemButton>
              <SystemButton
                onClick={() => {
                  //console.log({ canvasData });
                  // printClickHandler(imageData, { caption });
                  printPortrait(
                    canvasRef.current
                      .getContext("2d")
                      .getImageData(0, 0, width, height)
                  );
                }}
              >
                Print
              </SystemButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
