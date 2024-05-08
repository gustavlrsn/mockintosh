import EscPosEncoder from "esc-pos-encoder";
import PixelFontCanvas from "@/lib/PixelFontCanvas";
declare global {
  interface Window {
    device: USBDevice; // Replace 'any' with the correct type for your 'device' property
  }
}

// OUT endpoint of interface for the printer
const ENDPOINT = 3;

// some constants (control commands)
// that we use to steer the printer:

// sets the printer mode
const ESC = 0x1b;
// control command to set a printer mode
const GS = 0x1d;
// Line feed
const LF = 0x0a;
// printer modes we can utilize
const PrintModes = {
  EIGHT_DOT_DENSITY: 0,
  TWENTY_FOUR_DOT_DENSITY: 33,
};

//  // helper function that lets us draw on a canvas
//  // using the (mouse) pointer
//  const canvasDraw = canvas => {
//    const ctx = canvas.getContext('2d')
//    // local pointer state
//    let pointerDown = false
//    canvas.onpointerdown = function () {
//      pointerDown = true
//    }
//    canvas.onpointerup = function () {
//      pointerDown = false
//    }
//    // draws a filled rectangle at (x, y) position
//    // whose size is determined by width and height
//    // and whose style is determined by the fillStyle attribute.
//    // void ctx.fillRect(x, y, width, height);
//    canvas.onpointermove = async function (event) {
//      if (pointerDown === false) return
//      ctx.fillStyle = 'black'
//      ctx.fillRect(event.layerX, event.layerY, 3, 3)
//    }
//  }

// walks through all of the interfaces of a WebUSB device
// checks if they're already claimed (and claimes them if not yet done)
const claimInterface = async (device) => {
  for (const config of device.configurations) {
    for (const iface of config.interfaces) {
      if (!iface.claimed) {
        await device.claimInterface(iface.interfaceNumber);
        return true;
      }
    }
  }
  return false;
};

// set the line spacing on the POS printer,
// which is set to x33 (which is suitable for barcodes for example)
async function setLineSpacing(device, dotSpacing) {
  return await sendBytes(device, new Uint8Array([ESC, 0x33, dotSpacing]));
}

// helper function that turns chars into their byte equivalent
function charToByte(char) {
  return String.prototype.charCodeAt.call(char);
}

// helper function that turns strings into their byte representation
function stringToBytes(str: string) {
  return Array.from(str).reduce((prev: any[], char) => {
    prev.push(charToByte(char));
    return prev;
  }, []);
}

// reset the device, will set it to factory default
async function reset(device) {
  try {
    return await sendBytes(device, new Uint8Array([ESC, 0x40]));
  } catch (error) {
    console.log(error);
  }
}

// send text to the WebUSB device
async function sendText(device, str) {
  const bytes = new Uint8Array(stringToBytes(str));
  return await device.transferOut(ENDPOINT, bytes);
}

// send bytes to the WebUSB device
async function sendBytes(device, bytes) {
  return await device.transferOut(ENDPOINT, bytes);
}

// helper function to set a specific character style on the printer
async function setCharacterStyle(
  device,
  style = {
    smallFont: false,
    emphasized: false,
    doubleHeight: false,
    doubleWidth: false,
    underline: false,
  }
) {
  let v = 0;
  // some byte shifting to turn the human readable
  // object into its byte representation according to the
  // POS specifications
  if (style.smallFont) v |= 1 << 0;
  if (style.emphasized) v |= 1 << 3;
  if (style.doubleHeight) v |= 1 << 4;
  if (style.doubleWidth) v |= 1 << 5;
  if (style.underline) v |= 1 << 7;
  return await sendBytes(device, new Uint8Array([ESC, 0x21, v]));
}

// sends an image to the printer,
// takes the raw image data extracted from the canvas as input
async function printImage(device, imageData, dpi = 8) {
  // we set the line spacing to match the dpi (dots per inch)
  // we selected for our drawing
  await setLineSpacing(device, dpi);
  // calculate the image width (as given from the canvas)
  const imageWidth = imageData.width;
  imageData = imageData.data;
  // switch the printer mode based on the given dpi number
  const mode =
    dpi === 8
      ? PrintModes.EIGHT_DOT_DENSITY
      : PrintModes.TWENTY_FOUR_DOT_DENSITY;

  // throw an error if the image width does not correspond with the selected dpi
  // because if we don't, we'll receive some interesting pieces of art
  // that are not quite the output we're expecting
  if (imageWidth % dpi != 0) {
    throw new Error(
      `Image width must be divisible by ${dpi} currently is ${imageWidth}`
    );
  }

  // iterate over the image data line by line
  // and send the raw bytes to the printer
  for (let y = 0; y < imageData.length; y += dpi) {
    await sendBytes(
      device,
      new Uint8Array([
        ESC,
        0x2a,
        mode,
        0x00ff & imageWidth, // nL low byte,
        (0xff00 & imageWidth) >> 8, // nH height byte
      ])
    );
    console.log(verticalSliceImageSimple(imageData, imageWidth, y, dpi));
    await sendBytes(
      device,
      verticalSliceImageSimple(imageData, imageWidth, y, dpi)
    );
    // add a line-feed at the end
    await sendBytes(device, new Uint8Array([LF]));
  }
  // reset line spacing
  await setLineSpacing(device, 30);
}

// slice the image, which means, walk over every pixel in the image (vertically)
// and convert it to its byte equivalent
function verticalSliceImage(img, imageWidth, yOffset = 0, dpi = 8) {
  // determine number of bytes, based on the dpi
  const bytesPerSlice = dpi / 8;
  // convrt bitmap data to slices of bytes
  const ret = new Uint8Array(imageWidth * bytesPerSlice).fill(0);
  for (let x = 0; x < imageWidth; x++) {
    for (let byte = 0; byte < bytesPerSlice; byte++) {
      for (let y = byte * 8 + yOffset; y < byte * 8 + 8 + yOffset; y++) {
        const setBitValue = 1 << (7 - (y % 8));
        ret[x * bytesPerSlice + byte] |= img[y][x] ? setBitValue : 0;
      }
    }
  }
  return ret;
}

// slice the image, which means, walk over every pixel in the image (vertically)
// and convert it to its byte equivalent
function verticalSliceImageSimple(img, imageWidth, yOffset = 0, dpi = 8) {
  // determine number of bytes, based on the dpi
  const bytesPerSlice = 8 / 8;
  // convrt bitmap data to slices of bytes
  const ret = new Uint8Array(imageWidth * bytesPerSlice).fill(0);
  for (let x = 0; x < imageWidth; x++) {
    // const setBitValue = 1 << (7 - (y % 8));
    ret[x] = img[yOffset][x];
    // }
  }
  return ret;
}

let device = null;

// async function connect() {
//   if (device === null) {
//     // get all connected usb devices
//     rawdevice = await navigator.usb.requestDevice({ filters: [] });
//     // do the setup procedure on the connected device
//     device = await setup(rawdevice);
//     // display the device stats
//     // displayDeviceStats(device)
//     // changeConnectedHeadline()
//   }
//   return device;
// }

export const connectClickHandler = async function (event) {
  // const device = await connect();

  const devices = await navigator.usb.getDevices();
  console.log({ devices });
  // if (devices.length) {
  // if (devices[0].opened === false) {
  //   await devices[0].open();
  // }

  navigator.usb.requestDevice({ filters: [] }).then(async (device) => {
    console.log({ device });
    window.device = device;
    await device.open();
    await claimInterface(device);
    // reset device commands, just in case
    // await reset(device);
    // await setCharacterStyle(device, {
    //   smallFont: false,
    //   emphasized: false,
    //   underline: false,
    //   doubleWidth: false,
    //   doubleHeight: false,
    // });
  });
  //}
};

const authClickHandler = async function (event) {
  const devices = await navigator.usb.getDevices();
  console.log({ devices });
  if (devices.length) {
    if (devices[0].opened === false) {
      await devices[0].open();
    }

    navigator.usb.requestDevice({ filters: [] }).then(async (device) => {
      window.device = device;
      await claimInterface(device);
      // reset device commands, just in case
      await reset(device);
      await setCharacterStyle(device, {
        smallFont: false,
        emphasized: false,
        underline: false,
        doubleWidth: false,
        doubleHeight: false,
      });
    });
  }
};

// a function to a canvas 90 degrees
const rotateCanvas = (canvas, width, height) => {
  // create a new canvas
  const rotatedCanvas = document.createElement("canvas");
  // set the width and height of the new canvas
  rotatedCanvas.width = height;
  rotatedCanvas.height = width;
  // get the context of the new canvas
  const ctx = rotatedCanvas.getContext("2d");
  // rotate the canvas
  ctx.translate(height, 0);
  ctx.rotate(Math.PI / 2);
  // draw the old canvas on the new one
  ctx.drawImage(canvas, 0, 0);
  // return the new canvas
  return rotatedCanvas;
};

const scaleImage = (imageData, scale) => {
  const scaledImage = new ImageData(
    imageData.width * scale,
    imageData.height * scale
  );

  for (let x = 0; x < scaledImage.width; x++) {
    for (let y = 0; y < scaledImage.height; y++) {
      // Find the corresponding pixel in the original canvas
      const origX = Math.floor(x / 2);
      const origY = Math.floor(y / 2);

      const origIndex = (origX + origY * imageData.width) * 4;
      const newIndex = (x + y * scaledImage.width) * 4;
      scaledImage.data[newIndex] = imageData.data[origIndex];
      scaledImage.data[newIndex + 1] = imageData.data[origIndex + 1];
      scaledImage.data[newIndex + 2] = imageData.data[origIndex + 2];
      scaledImage.data[newIndex + 3] = imageData.data[origIndex + 3];
    }
  }

  return scaledImage;
};

const rotateImage = (imageData) => {
  // rotate 90 degrees
  let rotatedImageData = new ImageData(imageData.height, imageData.width);
  for (let x = 0; x < imageData.width; x++) {
    for (let y = 0; y < imageData.height; y++) {
      const index = (x + y * imageData.width) * 4;
      const newIndex = (y + x * rotatedImageData.width) * 4;
      rotatedImageData.data[newIndex] = imageData.data[index];
      rotatedImageData.data[newIndex + 1] = imageData.data[index + 1];
      rotatedImageData.data[newIndex + 2] = imageData.data[index + 2];
      rotatedImageData.data[newIndex + 3] = imageData.data[index + 3];
    }
  }
  return rotatedImageData;
};

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
}

export const printClickHandler = async (
  ogImageData,
  { width, height, caption, format = "polaroid" }
) => {
  const scaledImageData = scaleImage(ogImageData, 2);
  const newHeight = scaledImageData.height + 296;
  const newWidth = 576;

  const canvasImage = document.createElement("canvas");
  canvasImage.width = newWidth;
  canvasImage.height = newHeight;
  const ctx = canvasImage.getContext("2d");

  ctx?.putImageData(scaledImageData, 0, 0);
  PixelFontCanvas.drawText(canvasImage, `${caption}`, {
    font: "Redaction35-Regular",
    x: 0,
    y: scaledImageData.height + 44,
    scale: 2,
    width: newWidth,
    align: "center",
    tint: "black",
  });

  const encoder = new EscPosEncoder({
    imageMode: "raster",
  });

  const feedToStartingPosition = encoder
    .initialize()
    .image(canvasImage, newWidth, newHeight)
    .raw([0x1b, 0x4a, 0x7c]) // 80: 128 dots, 7e: 126 dots, (x) 7c: 124 dots, 7a: 122
    .cut("full")
    .encode();

  await sendBytes(window.device, feedToStartingPosition);
};

export const printPanorama = async (imageData) => {
  console.log({ imageData });

  imageData = scaleImage(imageData, 2);
  imageData = rotateImage(imageData);

  const newHeight = 824;
  const newWidth = 576;

  const canvasImage = document.createElement("canvas");
  canvasImage.width = newWidth;
  canvasImage.height = newHeight;
  const ctx = canvasImage.getContext("2d");

  ctx?.putImageData(imageData, 0, 0);

  const encoda = new EscPosEncoder({
    imageMode: "raster",
  });

  const printerCommands = encoda
    .initialize()
    .image(canvasImage, newWidth, newHeight)
    .raw([0x1b, 0x4a, 0xb0]) // 176 dots
    .cut("full")
    .encode();

  await sendBytes(window.device, printerCommands);
};

export const printPortrait = async (imageData) => {
  imageData = scaleImage(imageData, 2);

  const newHeight = 824;
  const newWidth = 576;

  const canvasImage = document.createElement("canvas");
  canvasImage.width = newWidth;
  canvasImage.height = newHeight;
  const ctx = canvasImage.getContext("2d");

  ctx?.putImageData(imageData, 0, 0);

  const encoda = new EscPosEncoder({
    imageMode: "raster",
  });

  const printerCommands = encoda
    .initialize()
    .image(canvasImage, newWidth, newHeight)
    .raw([0x1b, 0x4a, 0xb0]) // 176 dots
    .cut("full")
    .encode();

  await sendBytes(window.device, printerCommands);
};

export const printFourPortrait = async (imageData) => {
  imageData = scaleImage(imageData, 2);

  const newHeight = 824;
  const newWidth = 576;

  const canvasImage = document.createElement("canvas");
  canvasImage.width = newWidth;
  canvasImage.height = newHeight;
  const ctx = canvasImage.getContext("2d");

  ctx?.putImageData(imageData, 0, 0);
  ctx?.putImageData(imageData, 288, 0);
  ctx?.putImageData(imageData, 0, 288);
  ctx?.putImageData(imageData, 288, 288);

  const encoda = new EscPosEncoder({
    imageMode: "raster",
  });

  const printerCommands = encoda
    .initialize()
    .image(canvasImage, newWidth, newHeight)
    .raw([0x1b, 0x4a, 0xb0]) // 176 dots
    .cut("full")
    .encode();

  await sendBytes(window.device, printerCommands);
};

export const adjustPaper = async (adjustment) => {
  const dots = 1000 + adjustment;
  const rest = dots % 255;
  const fullRounds = Math.floor(dots / 255);

  const encoder = new EscPosEncoder({
    imageMode: "raster",
  });

  const printerCommands = encoder.initialize();

  // Add full rounds
  for (let i = 0; i < fullRounds; i++) {
    printerCommands.raw([0x1b, 0x4a, 0xff]);
  }

  // Add rest
  if (rest > 0) {
    printerCommands.raw([0x1b, 0x4a, rest]);
  }

  const encodedData = printerCommands.cut("full").encode();

  await sendBytes(window.device, encodedData);
};
