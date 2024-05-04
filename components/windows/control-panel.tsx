import React, { useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { Window } from "@/components/ui/window";

function upscaleImage(imageData8x8, context) {
  const sourceWidth = 8;
  const sourceHeight = 8;
  const destinationWidth = 39;
  const destinationHeight = 39;
  const scaleFactor = 4;
  const gutterSize = 1;

  for (let y = 0; y < sourceHeight; y++) {
    for (let x = 0; x < sourceWidth; x++) {
      const sourceIndex = (y * sourceWidth + x) * 4;
      const pixelColor = imageData8x8.slice(sourceIndex, sourceIndex + 4);

      for (let dy = 0; dy < scaleFactor; dy++) {
        for (let dx = 0; dx < scaleFactor; dx++) {
          const destX = x * scaleFactor + dx + gutterSize * x;
          const destY = y * scaleFactor + dy + gutterSize * y;
          const destIndex = (destY * destinationWidth + destX) * 4;
          context.fillStyle = `rgba(${pixelColor[0]}, ${pixelColor[1]}, ${pixelColor[2]}, ${pixelColor[3]})`;
          context.fillRect(destX, destY, 1, 1);
        }
      }
    }
  }
}

const createCheckeredPattern = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const imageData = context.createImageData(width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    const color = (x + y) % 2 === 0 ? 0 : 255;
    data[i] = color;
    data[i + 1] = color;
    data[i + 2] = color;
    data[i + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
};

function PatternEditor({}) {
  const canvasRef = useRef(null);
  const width = 39;
  const height = 39;
  React.useEffect(() => {
    if (!canvasRef.current) return;
    const pattern = createCheckeredPattern(8, 8);
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    upscaleImage(
      pattern.getContext("2d").getImageData(0, 0, 8, 8).data,
      context
    );
    // const canvas = canvasRef.current;
    // const context = canvas.getContext("2d");
    // context.webkitImageSmoothingEnabled = false;
    // let pixels = context.getImageData(0, 0, width, height);

    // // write pattern to canvas.
    // // the pattern is 8x8, and will be represented in the 39x39 canvas as 4x4 blocks, with 1px white gutters
    // for (let i = 0; i < pixels.data.length; i += 4) {
    //   const x = (i / 4) % width;
    //   const y = Math.floor(i / 4 / width);
    //   const color = pattern
    //     .getContext("2d")
    //     .getImageData((x % 8) % 8, (y % 8) % 8, 1, 1).data;
    //   pixels.data[i] = color[0];
    //   pixels.data[i + 1] = color[1];
    //   pixels.data[i + 2] = color[2];
    //   pixels.data[i + 3] = color[3];
    // }

    // context.putImageData(pixels, 0, 0);
  }, [canvasRef.current]);
  return (
    <canvas className="border" width={width} height={height} ref={canvasRef} />
  );
}

export function ControlPanel({ i, window }) {
  const [selectedPane, setSelectedPane] = React.useState("General");
  return (
    <Window i={i} title="Control Panel" {...window} width={320}>
      <div className="flex max-h-[200px] border-t border-l">
        <div className="overflow-y-scroll py-2 scroll w-16 flex flex-col items-center">
          <div>
            <Icon
              selected={selectedPane === "General"}
              onClick={() => setSelectedPane("General")}
              label="General"
              img="/icons/computer.png"
            />
          </div>
        </div>
        <div className="border-l-2 p-4 font-geneva">
          <div>
            <PatternEditor />
            <div className="font-geneva">Desktop pattern</div>
          </div>
        </div>
      </div>
    </Window>
  );
}
