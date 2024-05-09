import Dither from "canvas-dither";

self.onmessage = async (e: MessageEvent) => {
  const { bitmap, width, height, ditheringAlgorithm } = e.data;

  const offscreen = new OffscreenCanvas(width, height);
  const ctx = offscreen.getContext("2d");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  let imageData = ctx.getImageData(0, 0, width, height);
  imageData = Dither[ditheringAlgorithm](imageData);

  // Put the processed image data back into the canvas
  ctx.putImageData(imageData, 0, 0);

  // Convert the canvas content to an ImageBitmap
  const imageBitmap = offscreen.transferToImageBitmap();

  self.postMessage({ imageBitmap }, [imageBitmap]);
};
