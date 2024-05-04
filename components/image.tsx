import React, { useEffect, useRef } from "react";

// export default function CanvasImage({ src, width, height }) {
//   const canvas = useRef<HTMLCanvasElement>();

//   useEffect(() => {
//     const context = canvas.current.getContext("2d");
//     const image = new Image();
//     image.src = src;
//     image.onload = () => {
//       context.drawImage(image, 0, 0, width, height);
//     };
//   }, [src, width, height]);

//   return <canvas ref={canvas} width={width} height={height} />;
// }

const CanvasImage = React.forwardRef(
  (
    {
      src,
      width,
      height,
      className,
    }: { src: string; width: number; height: number; className: string },
    ref
  ) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.webkitImageSmoothingEnabled = false;

      const image = new Image();
      image.src = src;
      image.onload = () => {
        context.drawImage(image, 0, 0, width, height);
      };
    }, [src, width, height]);

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
