import PixelFontCanvas from "@/lib/PixelFontCanvas";
import React, { useEffect, useRef } from "react";

export type Font = "ChiKareGo" | "Geneva9";

interface TextProps {
  text: string;
  width?: number;
  height?: number;
  font?: Font;
  align?: string;
  color?: string;
  bg?: string;
  className?: string;
}

const getLineHeight = (font: Font) => {
  switch (font) {
    case "Geneva9":
      return 12;
    case "ChiKareGo":
      return 16;
    default:
      return null;
  }
};

export const Text = React.forwardRef(
  (
    {
      text,
      width,
      font = "Geneva9",
      height,
      align = "left",
      color = "black",
      bg,
      className,
    }: TextProps,
    ref
  ) => {
    const canvasRef = useRef(null);
    height = height ?? getLineHeight(font);
    useEffect(() => {
      if (!text) return;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.webkitImageSmoothingEnabled = false;

      PixelFontCanvas.drawText(canvas, text, {
        font,
        x: 0,
        y: 0,
        scale: 1,
        width,
        height,
        align: align,
        tint: color,
        bg,
      });
    }, [text, width, align, bg, font, color, height]);

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

Text.displayName = "Text";
