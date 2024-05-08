import useWindowSize from "@/lib/hooks/useWindowSize";
import { SystemContext } from "@/pages";
import React from "react";
import CanvasImage from "@/components/canvas-image";
import { Background } from "./background";

export default function Screen({ children, width, height }) {
  const { zoom } = React.useContext(SystemContext);
  const screenRef = React.useRef(null);
  const cursorRef = React.useRef(null);

  function getDimensions(e) {
    const screenPosition = screenRef.current.getBoundingClientRect();
    const cursorPosition = {
      x: (e.clientX - screenPosition.x) / zoom,
      y: (e.clientY - screenPosition.y) / zoom,
    };
    // round to nearest 1, 2, or 3 (depending on zoom level)
    cursorPosition.x = Math.floor(cursorPosition.x);
    cursorPosition.y = Math.floor(cursorPosition.y);
    cursorRef.current.style.top = `${cursorPosition.y}px`; // -25px for the size of the circle
    cursorRef.current.style.left = `${cursorPosition.x}px`;
  }
  React.useEffect(() => {
    window.addEventListener("mousemove", getDimensions);

    return () => {
      window.removeEventListener("mousemove", getDimensions);
    };
  }, [zoom]);

  React.useEffect(() => {
    (async () => {
      const url = "/cursor3.png";
      const textCursorUrl = "/cursor-text.png";
      try {
        // screenRef.current.style.setProperty(
        //   "cursor",
        //   `image-set(${await getScaledImage(
        //     url,
        //     1,
        //     zoom
        //   )}, ${await getScaledImage(url, 2, zoom)}, ${await getScaledImage(
        //     url,
        //     3,
        //     zoom
        //   )}) 0 0, pointer`
        // );
        // document.body.style.setProperty(
        //   "cursor",
        //   `image-set(${await getScaledImage(
        //     textCursorUrl,
        //     1,
        //     zoom
        //   )}, ${await getScaledImage(
        //     textCursorUrl,
        //     2,
        //     zoom
        //   )}, ${await getScaledImage(textCursorUrl, 3, zoom)}) 0 0, text`
        // );
      } catch (error) {
        console.error(error);
      }
    })();
  }, [zoom]);
  console.log({ width, height });
  return (
    <div>
      <div
        style={{
          width,
          height,
          transform: `scale(${zoom})`,
        }}
        className="flex flex-col relative overflow-hidden !cursor-none"
        ref={screenRef}
      >
        <Background width={width} height={height} />

        <div className="absolute inset-0 corner z-50 pointer-events-none" />
        <CanvasImage
          width={16}
          height={16}
          ref={cursorRef}
          src="/cursors/default-1x.png"
          className="absolute z-50 pointer-events-none"
        />
        {children}
      </div>
    </div>
  );
}

// async function getScaledImage(url, scale = 1, zoom) {
//   const resp = await fetch(url);
//   if (!resp.ok) {
//     throw "network error";
//   }
//   const blob = await resp.blob();
//   const bmp = await createImageBitmap(blob);
//   const { width, height } = bmp;
//   const canvas = new OffscreenCanvas(bmp.width, bmp.height);
//   canvas.width = width * scale * zoom;
//   canvas.height = height * scale * zoom;
//   const ctx = canvas.getContext("2d");
//   ctx.imageSmoothingEnabled = false;
//   ctx.drawImage(bmp, 0, 0, width * scale * zoom, height * scale * zoom);
//   bmp.close();
//   const output = await canvas.convertToBlob();
//   return `url(${URL.createObjectURL(output)}) ${scale}x`;
// }
