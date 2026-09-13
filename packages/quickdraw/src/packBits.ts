/**
 * PackBits / UnpackBits — `Bitmaps.a:889-1013`.
 *
 * One scanline. Pointers are byte indexes into the given buffers and are
 * updated the way the original `VAR srcPtr, dstPtr` arguments are.
 */

export interface BytePtr {
  value: number;
}

/**
 * `PROCEDURE PackBits(VAR srcPtr, dstPtr: Ptr; srcBytes: INTEGER)`.
 * Compresses equal runs of 3+ (`Bitmaps.a:925-929`). `srcPtr` always
 * advances by `srcBytes`; `dstPtr` lands after the last written byte.
 */
export function PackBits(
  src: Uint8Array,
  srcPtr: BytePtr,
  dst: Uint8Array,
  dstPtr: BytePtr,
  srcBytes: number
): void {
  const srcBase = srcPtr.value | 0;
  const limit = srcBase + srcBytes;
  let a0 = srcBase;
  let a1 = dstPtr.value | 0;
  let remaining = srcBytes;

  if (remaining <= 0) {
    srcPtr.value = srcBase + srcBytes;
    dstPtr.value = a1;
    return;
  }

  while (remaining > 0) {
    if (
      remaining >= 3 &&
      src[a0] === src[a0 + 1] &&
      src[a0] === src[a0 + 2]
    ) {
      const fill = src[a0]!;
      let run = 0;
      while (run < 128 && run < remaining && src[a0 + run] === fill) run++;
      dst[a1++] = (1 - run) & 0xff; // −1..−127 → fill 2..128
      dst[a1++] = fill;
      a0 += run;
      remaining -= run;
    } else {
      let lit = 0;
      while (lit < 128 && lit < remaining) {
        if (
          remaining - lit >= 3 &&
          src[a0 + lit] === src[a0 + lit + 1] &&
          src[a0 + lit] === src[a0 + lit + 2]
        ) {
          break;
        }
        lit++;
      }
      dst[a1++] = (lit - 1) & 0xff; // 0..127 → copy 1..128
      for (let i = 0; i < lit; i++) dst[a1++] = src[a0++]!;
      remaining -= lit;
    }
  }

  srcPtr.value = srcBase + srcBytes; // Bitmaps.a:965-967
  dstPtr.value = a1;
}

/**
 * `PROCEDURE UnpackBits(VAR srcPtr, dstPtr: Ptr; dstBytes: INTEGER)`.
 * `$80` is a no-op (`BVS` after `NEG.B` of −128, `Bitmaps.a:1001-1002`).
 */
export function UnpackBits(
  src: Uint8Array,
  srcPtr: BytePtr,
  dst: Uint8Array,
  dstPtr: BytePtr,
  dstBytes: number
): void {
  let a0 = srcPtr.value | 0;
  let a1 = dstPtr.value | 0;
  const limit = a1 + (dstBytes | 0);

  while (a1 < limit) {
    const op = src[a0++]!;
    const signed = (op << 24) >> 24;
    if (signed >= 0) {
      // 0..127 → copy signed+1 bytes. Bitmaps.a:1000
      let n = signed + 1;
      while (n-- > 0 && a1 < limit) dst[a1++] = src[a0++]!;
    } else if (signed === -128) {
      continue; // $80 no-op. Bitmaps.a:1001-1002
    } else {
      // −1..−127 → fill (1−signed) bytes. Bitmaps.a:1001-1006
      const fill = src[a0++]!;
      let n = 1 - signed;
      while (n-- > 0 && a1 < limit) dst[a1++] = fill;
    }
  }

  srcPtr.value = a0;
  dstPtr.value = a1;
}
