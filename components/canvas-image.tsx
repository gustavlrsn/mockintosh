import React, { useEffect, useRef } from "react";

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
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.webkitImageSmoothingEnabled = false;

      const offscreenCanvas = new OffscreenCanvas(width, height);
      const offscreenCtx = offscreenCanvas.getContext("2d");

      const image = new Image();
      image.src = src;
      image.onload = async () => {
        if (shadowOutline) {
          offscreenCtx.drawImage(image, 0, 0, width, height);
          const imageData = offscreenCtx.getImageData(0, 0, width, height);

          // replace all non-transparent pixels with a checkered pattern
          // const imageData = context.getImageData(0, 0, width, height);
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
          context.putImageData(imageData, 0, 0);
        } else {
          context.drawImage(image, 0, 0, width, height);
        }
      };
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
