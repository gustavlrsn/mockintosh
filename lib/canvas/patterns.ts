export type PatternName =
  | "black"
  | "white"
  | "checkers"
  | "stripes"
  | "gray25"
  | "gray50"
  | "gray75"
  | "darkCheckers";

// 8x8 patterns stored as flat arrays; 1 = black, 0 = white
const P: Record<PatternName, Uint8Array> = {
  black: new Uint8Array(64).fill(1),
  white: new Uint8Array(64).fill(0),
  checkers: new Uint8Array(64),
  stripes: new Uint8Array(64),
  gray25: new Uint8Array(64),
  gray50: new Uint8Array(64),
  gray75: new Uint8Array(64),
  darkCheckers: new Uint8Array(64),
};

for (let y = 0; y < 8; y++) {
  for (let x = 0; x < 8; x++) {
    const i = y * 8 + x;
    P.checkers[i] = (x + y) % 2 === 0 ? 1 : 0;
    P.darkCheckers[i] = (x + y) % 2 === 0 ? 0 : 1;
    P.gray50[i] = (x + y) % 2 === 0 ? 1 : 0;
    P.gray25[i] =
      (x % 4 === 0 && y % 2 === 0) ||
      (x % 2 === 0 && x % 4 !== 0 && y % 2 !== 0)
        ? 1
        : 0;
    P.gray75[i] = P.gray25[i] === 1 ? 0 : 1;
    // Classic Mac title bar stripes: 1px black lines with 1px white gaps
    P.stripes[i] = y % 2 === 0 ? 1 : 0;
  }
}

export const patterns = P;

export function getPattern(name: PatternName): Uint8Array {
  return P[name];
}

export function samplePattern(
  pattern: Uint8Array,
  x: number,
  y: number
): number {
  return pattern[(y & 7) * 8 + (x & 7)];
}
