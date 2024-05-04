import React, { useEffect, useRef } from "react";

export function Background({ width, height }) {
  const canvasRef = useRef(null);
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
  useEffect(() => {
    const pattern = createCheckeredPattern(8, 8);

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.webkitImageSmoothingEnabled = false;
    let pixels = context.getImageData(0, 0, width, height);

    // write pattern to canvas
    for (let i = 0; i < pixels.data.length; i += 4) {
      const x = (i / 4) % width;
      const y = Math.floor(i / 4 / width);
      const color = pattern
        .getContext("2d")
        .getImageData(x % 8, y % 8, 1, 1).data;
      pixels.data[i] = color[0];
      pixels.data[i + 1] = color[1];
      pixels.data[i + 2] = color[2];
      pixels.data[i + 3] = color[3];
    }
    context.putImageData(pixels, 0, 0);
  }, [width, height]);

  // Pass ref directly to the canvas element

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={"absolute inset-0 -z-10"}
    />
  );
}
