import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";

const DEV_MODE = process.env.NODE_ENV === "development";

declare global {
  var canvas: fabric.Canvas | undefined;
}

export const Canvas = React.forwardRef<
  fabric.Canvas,
  { onLoad?(canvas: fabric.Canvas): void }
>(({ onLoad }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      //   uniformScaling: true,

      //   enableRetinaScaling: false,
      imageSmoothingEnabled: false,
      selectionBorderColor: "rgb(0,0,0)",
      selectionColor: "transparent",
      selectionLineWidth: 1,
      selectionDashArray: [1, 1],
    });

    DEV_MODE && (window.canvas = canvas);

    if (typeof ref === "function") {
      ref(canvas);
    } else if (typeof ref === "object" && ref) {
      ref.current = canvas;
    }

    // it is crucial `onLoad` is a dependency of this effect
    // to ensure the canvas is disposed and re-created if it changes
    onLoad?.(canvas);

    return () => {
      DEV_MODE && delete window.canvas;

      if (typeof ref === "function") {
        ref(null);
      } else if (typeof ref === "object" && ref) {
        ref.current = null;
      }

      // `dispose` is async
      // however it runs a sync DOM cleanup
      // its async part ensures rendering has completed
      // and should not affect react
      canvas.dispose();
    };
  }, [canvasRef, onLoad]);

  return <canvas ref={canvasRef} />;
});

Canvas.displayName = "Canvas";
