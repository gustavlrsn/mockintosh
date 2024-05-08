// import { encodeImageData } from "@/lib/image";
// import { write } from "opfs-tools";
import React, { useEffect, useRef } from "react";
// function encodeUint8ArrayToBase64(byteArray: Uint8Array): string {
//   const binaryString = byteArray.reduce(
//     (acc, byte) => acc + String.fromCharCode(byte),
//     ""
//   );
//   return btoa(binaryString); // Encode binary string to Base64
// }
const CanvasImage = React.forwardRef(
  (
    {
      src,
      width,
      height,
      className,
      shadowOutline = false,
    }: {
      src: string;
      width: number;
      height: number;
      className?: string;
      shadowOutline?: boolean;
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Create an ImageBitmap from the source URL
      fetch(src)
        .then((response) => response.blob())
        .then((blob) => createImageBitmap(blob))
        .then((imageBitmap) => {
          const offscreenCanvas = new OffscreenCanvas(width, height);
          const offscreenCtx = offscreenCanvas.getContext(
            "2d"
          ) as OffscreenCanvasRenderingContext2D; // mismatch between VSCode and Typescript typechecking?

          if (shadowOutline) {
            offscreenCtx.drawImage(imageBitmap, 0, 0, width, height);
            const imageData = offscreenCtx.getImageData(0, 0, width, height);

            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] > 0) {
                const x = (i / 4) % width;
                const y = Math.floor(i / 4 / width);

                const color =
                  (x % 4 === 0 && y % 2 === 0) ||
                  (x % 2 === 0 && x % 4 !== 0 && y % 2 !== 0)
                    ? 0
                    : 255;

                data[i] = color;
                data[i + 1] = color;
                data[i + 2] = color;
                data[i + 3] = 255;
              }
            }
            offscreenCtx.putImageData(imageData, 0, 0);
          } else {
            offscreenCtx.drawImage(imageBitmap, 0, 0, width, height);
          }
          context.drawImage(offscreenCanvas, 0, 0);
        });
    }, [src, width, height, shadowOutline]);

    // Pass ref directly to the canvas element
    React.useImperativeHandle(ref, () => canvasRef.current);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
      />
    );
  }
);

CanvasImage.displayName = "CanvasImage";

export default CanvasImage;
