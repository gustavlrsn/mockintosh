import ImageSSIM from "image-ssim";
export {};

const rawgly = [
  "00001000",
  "00011100",
  "00111110",
  "01111111",
  "01111111",
  "00011100",
  "00111110",
  "00000000",
  "00110110",
  "01111111",
  "01111111",
  "01111111",
  "00111110",
  "00011100",
  "00001000",
  "00000000",
  "00001000",
  "00011100",
  "00111110",
  "01111111",
  "00111110",
  "00011100",
  "00001000",
  "00000000",
  "00000000",
  "00111100",
  "01111110",
  "01111110",
  "01111110",
  "01111110",
  "00111100",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000011",
  "00000100",
  "00001000",
  "00001000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "11000000",
  "00100000",
  "00010000",
  "00010000",
  "00010000",
  "00010000",
  "00100000",
  "11000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00001000",
  "00001000",
  "00000100",
  "00000011",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00001000",
  "00001000",
  "00010000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "10101010",
  "01010101",
  "10101010",
  "01010101",
  "10101010",
  "01010101",
  "10101010",
  "01010101",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "10100000",
  "01010000",
  "10100000",
  "01010000",
  "10100000",
  "01010000",
  "10100000",
  "01010000",
  "00001010",
  "00000101",
  "00001010",
  "00000101",
  "00001010",
  "00000101",
  "00001010",
  "00000101",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00011000",
  "00011000",
  "00000000",
  "00000100",
  "00001000",
  "00010000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000100",
  "00001000",
  "00010000",
  "00010000",
  "00010000",
  "00001000",
  "00000100",
  "00000000",
  "00100000",
  "00010000",
  "00001000",
  "00001000",
  "00001000",
  "00010000",
  "00100000",
  "00000000",
  "00111100",
  "01000010",
  "01000110",
  "01011010",
  "01100010",
  "01000010",
  "00111100",
  "00000000",
  "00001000",
  "00011000",
  "00101000",
  "00001000",
  "00001000",
  "00001000",
  "00111110",
  "00000000",
  "00111100",
  "01000010",
  "00000010",
  "00001100",
  "00110000",
  "01000000",
  "01111110",
  "00000000",
  "01111110",
  "01000000",
  "01111000",
  "00000100",
  "00000010",
  "01000100",
  "00111000",
  "00000000",
  "01111110",
  "01000010",
  "00000100",
  "00001000",
  "00010000",
  "00010000",
  "00010000",
  "00000000",
  "00111100",
  "01000010",
  "01000010",
  "00111110",
  "00000010",
  "00000100",
  "00111000",
  "00000000",
  "01111100",
  "00100010",
  "00100010",
  "00111100",
  "00100010",
  "00100010",
  "01111100",
  "00000000",
  "00011100",
  "00100010",
  "01000000",
  "01000000",
  "01000000",
  "00100010",
  "00011100",
  "00000000",
  "01111110",
  "01000000",
  "01000000",
  "01111000",
  "01000000",
  "01000000",
  "01111110",
  "00000000",
  "01111000",
  "00100100",
  "00100010",
  "00100010",
  "00100010",
  "00100100",
  "01111000",
  "00000000",
  "01111100",
  "01000010",
  "01000010",
  "01111100",
  "01001000",
  "01000100",
  "01000010",
  "00000000",
  "00011100",
  "00001000",
  "00001000",
  "00001000",
  "00001000",
  "00001000",
  "00011100",
  "00000000",
  "01000010",
  "01100010",
  "01010010",
  "01001010",
  "01000110",
  "01000010",
  "01000010",
  "00000000",
  "01000010",
  "01000010",
  "01000010",
  "00100100",
  "00100100",
  "00011000",
  "00011000",
  "00000000",
  "01000010",
  "01000010",
  "01000010",
  "01011010",
  "01011010",
  "01100110",
  "01000010",
  "00000000",
  "01000010",
  "01000100",
  "01001000",
  "01110000",
  "01001000",
  "01000100",
  "01000010",
  "00000000",
  "01111110",
  "00000010",
  "00000100",
  "00011000",
  "00100000",
  "01000000",
  "01111110",
  "00000000",
  "01111110",
  "01000000",
  "01000000",
  "01111000",
  "01000000",
  "01000000",
  "01000000",
  "00000000",
  "01111100",
  "01000010",
  "01000010",
  "01111100",
  "01000000",
  "01000000",
  "01000000",
  "00000000",
  "00011100",
  "00100010",
  "01000000",
  "01001110",
  "01000010",
  "00100010",
  "00011100",
  "00000000",
  "00001110",
  "00000100",
  "00000100",
  "00000100",
  "00000100",
  "01000100",
  "00111000",
  "00000000",
  "00011000",
  "00100100",
  "01000010",
  "01000010",
  "01001010",
  "00100100",
  "00011010",
  "00000000",
  "01000010",
  "01000010",
  "00100100",
  "00011000",
  "00100100",
  "01000010",
  "01000010",
  "00000000",
  "00011100",
  "00100010",
  "01001010",
  "01010110",
  "01001100",
  "00100000",
  "00011110",
  "00000000",
  "00000000",
  "01100010",
  "01100100",
  "00001000",
  "00010000",
  "00100110",
  "01000110",
  "00000000",
  "00110000",
  "01001000",
  "01001000",
  "00110000",
  "01001010",
  "01000100",
  "00111010",
  "00000000",
  "00000000",
  "01000000",
  "00100000",
  "00010000",
  "00001000",
  "00000100",
  "00000010",
  "00000000",
  "00111110",
  "00001000",
  "00001000",
  "00001000",
  "00001000",
  "00001000",
  "00001000",
  "00000000",
  "00100100",
  "00100100",
  "01111110",
  "00100100",
  "01111110",
  "00100100",
  "00100100",
  "00000000",
  "00000000",
  "00000000",
  "01111110",
  "00000000",
  "01111110",
  "00000000",
  "00000000",
  "00000000",
  "00100100",
  "00100100",
  "00100100",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00000000",
  "00011000",
  "00100100",
  "01000010",
  "01000010",
  "01000010",
  "00100100",
  "00011000",
  "00000000",
  "00000000",
  "00000000",
  "00000001",
  "00111110",
  "01010100",
  "00010100",
  "00010100",
  "00000000",
  "00000000",
  "00000000",
  "00010000",
  "00100000",
  "01111111",
  "00100000",
  "00010000",
  "00000000",
  "01000000",
  "01000000",
  "01000000",
  "01000000",
  "01000000",
  "01000000",
  "01111110",
  "00000000",
  "00111100",
  "01000010",
  "01000000",
  "00111100",
  "00000010",
  "01000010",
  "00111100",
  "00000000",
];

const turnStringBinaryIntoGlyphs = (rawgs) => {
  const glyphs = [];
  for (let i = 0; i < rawgs.length; i += 8) {
    const glyph = [];
    for (let j = 0; j < 8; j++) {
      const row = rawgs[i + j];
      for (let k = 0; k < 8; k++) {
        glyph.push(row[k] === "1" ? 1 : 0);
      }
    }
    glyphs.push(glyph);
  }
  return glyphs;
};

function createGlyph(isBlack) {
  const glyph = [];
  const width = 8;
  const height = 8;

  for (let i = 0; i < width * height; i++) {
    let x = i % width;
    let y = Math.floor(i / width);
    glyph.push(isBlack(x, y) ? 1 : 0);
  }
  return glyph;
}

function createGlyphs() {
  const glyphs = [];

  // black square
  glyphs.push(createGlyph((x, y) => true));

  // single lines from left to right
  for (let i = 0; i < 8; i++) {
    glyphs.push(createGlyph((x, y) => x === i));
  }

  // block from left to right, skipping first and last line
  for (let i = 1; i < 7; i++) {
    glyphs.push(createGlyph((x, y) => x <= i));
  }

  // single lines from top to bottom
  for (let i = 0; i < 8; i++) {
    glyphs.push(createGlyph((x, y) => y === i));
  }

  // block from top to bottom, skipping first and last line
  for (let i = 1; i < 7; i++) {
    glyphs.push(createGlyph((x, y) => y <= i));
  }

  // cross-pattern
  glyphs.push(createGlyph((x, y) => x === y));

  // diagonal block lower left corner
  glyphs.push(createGlyph((x, y) => x < y));

  // diagonal block upper right corner
  glyphs.push(createGlyph((x, y) => x > y));

  // diagonal block upper left corner
  glyphs.push(createGlyph((x, y) => x + y < 7));

  // diagonal block lower right corner
  glyphs.push(createGlyph((x, y) => x + y > 7));

  // diagonal line lower left to upper right
  glyphs.push(createGlyph((x, y) => x + y === 7));

  // diagonal line upper left to lower right
  glyphs.push(createGlyph((x, y) => x - y === 0));

  // black in the upper left quadrant
  glyphs.push(createGlyph((x, y) => x < 4 && y < 4));

  // black in the upper right quadrant
  glyphs.push(createGlyph((x, y) => x >= 4 && y < 4));

  // black in the lower left quadrant
  glyphs.push(createGlyph((x, y) => x < 4 && y >= 4));

  // black in the lower right quadrant
  glyphs.push(createGlyph((x, y) => x >= 4 && y >= 4));

  // diagonal cross
  glyphs.push(createGlyph((x, y) => x === y || x + y === 7));

  // line following left and bottom side
  glyphs.push(createGlyph((x, y) => x === 0 || y === 7));

  // line following right and bottom side
  glyphs.push(createGlyph((x, y) => x === 7 || y === 7));

  // line following left and top side
  glyphs.push(createGlyph((x, y) => x === 0 || y === 0));

  // line following right and top side
  glyphs.push(createGlyph((x, y) => x === 7 || y === 0));

  const customGlyphs = turnStringBinaryIntoGlyphs(rawgly);
  glyphs.push(...customGlyphs);

  const invertedGlyphs = glyphs.map((glyph) => {
    return glyph.map((bit) => (bit === 1 ? 0 : 1));
  });

  glyphs.push(...invertedGlyphs);

  return glyphs.map((glyph) => convert1BArrayToGreyChannel(glyph));
}

function binaryArrayToBitUint8Array(binaryArray) {
  const length = binaryArray.length;
  const uint8ArrayLength = Math.ceil(length / 8);
  const uint8Array = new Uint8Array(uint8ArrayLength);

  for (let i = 0; i < length; i++) {
    const bitIndex = i % 8;
    const byteIndex = Math.floor(i / 8);
    uint8Array[byteIndex] |= binaryArray[i] << bitIndex;
  }

  return uint8Array;
}

function bitUint8ArrayToBinaryArray(uint8Array) {
  const length = uint8Array.length * 8;
  const binaryArray = new Array(length);

  for (let i = 0; i < length; i++) {
    const bitIndex = i % 8;
    const byteIndex = Math.floor(i / 8);
    binaryArray[i] = (uint8Array[byteIndex] >> bitIndex) & 1;
  }

  return binaryArray;
}

function convert1DArrayTo2DArray(array, width, height) {
  const array2d = new Array(height);

  for (let i = 0; i < height; i++) {
    array2d[i] = array.slice(i * width, (i + 1) * width);
  }

  return array2d;
}

function convert1BArrayToGreyChannel(array) {
  const greyArray = new Array(array.length);
  for (let i = 0; i < array.length; i++) {
    greyArray[i] = array[i] * 255;
  }
  return greyArray;
}

const glyphs = createGlyphs();

// glyphs.map((glyph) => console.table(convert1DArrayTo2DArray(glyph, 8, 8)));
// console.log(glyphs.length);

function getMatchingGlyph(block) {
  let diffs = [];
  for (let i = 0; i < glyphs.length; i++) {
    const { ssim, mcs } = ImageSSIM.compare(
      { height: 8, width: 8, data: glyphs[i], channels: 1 },
      { height: 8, width: 8, data: block, channels: 1 },
      8,
      0.01,
      0.03,
      true
    );
    //console.log({ glyph: glyphs[i], block, ssim });
    diffs.push(ssim);
  }
  console.log({ diffs });
  // index of highest diff
  const index = diffs.indexOf(Math.max(...diffs));
  return glyphs[index];
}

// convert imagedata to 1-bit array
function convertImageDataToBinaryArray(imageData) {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const binaryArray = new Array(width * height);

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const index = i * width + j;
      const r = data[index * 4];
      const g = data[index * 4 + 1];
      const b = data[index * 4 + 2];
      const a = data[index * 4 + 3];
      const brightness = (r + g + b) / 3;
      binaryArray[index] = brightness < 128 ? 1 : 0;
    }
  }

  return binaryArray;
}

export function asciiDither(imageData) {
  // divide image into 8x8 blocks
  const blocks = [];
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  console.log({ imageData });
  for (let i = 0; i < height; i += 8) {
    for (let j = 0; j < width; j += 8) {
      const block = [];
      for (let k = 0; k < 8; k++) {
        for (let l = 0; l < 8; l++) {
          const index = (i + k) * width + (j + l);
          const r = data[index * 4];
          const g = data[index * 4 + 1];
          const b = data[index * 4 + 2];
          const a = data[index * 4 + 3];
          const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          console.log(brightness);
          // unneccessary to do if this is already the dithered version?
          block.push(brightness);
        }
      }
      //console.log(block);
      const glyph = getMatchingGlyph(block);
      //console.log(glyph);
      blocks.push(glyph);
    }
  }

  const pixelData = new Uint8ClampedArray(width * height * 4);
  console.log({ blocks });
  blocks.forEach((block, i) => {
    for (let bY = 0; bY < 8; bY++) {
      for (let bX = 0; bX < 8; bX++) {
        const blockIndex = bY * 8 + bX;
        const v = block[blockIndex];
        const a = 255;
        const pY = Math.floor(i / (width / 8));
        const pX = i % (width / 8);
        const pixelIndex = (pY * 8 + bY) * width * 4 + (pX * 8 + bX) * 4;
        pixelData[pixelIndex] = v;
        pixelData[pixelIndex + 1] = v;
        pixelData[pixelIndex + 2] = v;
        pixelData[pixelIndex + 3] = a;
      }
    }
  });
  return new ImageData(pixelData, width, height, {});
}
