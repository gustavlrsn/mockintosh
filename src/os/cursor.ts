/**
 * Cursor compositing — the software stand-in for the Mac's VBL cursor task.
 *
 * QuickDraw tracks *which* cursor is current and whether it is hidden
 * (`cursorState`, `SetCursor`, `HideCursor`, `ObscureCursor`); it never draws
 * it. The OS draws it here, on top of the finished frame, with two `CopyBits`
 * exactly as the ROM did: punch the mask out (`srcBic`), then OR the data in.
 */
import {
  CopyBits,
  SetPort,
  cursorState,
  makeRect,
  srcBic,
  srcOr,
  type BitMap,
  type Cursor,
  type GrafPort,
} from "@mockintosh/quickdraw";

const CURSOR_SIZE = 16;
const CURSOR_RECT = makeRect(0, 0, CURSOR_SIZE, CURSOR_SIZE);

interface PackedCursor {
  data: BitMap;
  mask: BitMap;
}

/** `Cursor.data`/`.mask` are 16 words; as BitMaps they are 16 rows of 2 bytes. */
function packBits16(words: Uint16Array): BitMap {
  const bytes = new Uint8Array(CURSOR_SIZE * 2);
  for (let v = 0; v < CURSOR_SIZE; v++) {
    bytes[v * 2] = words[v] >> 8;
    bytes[v * 2 + 1] = words[v] & 0xff;
  }
  return { baseAddr: bytes, rowBytes: 2, bounds: CURSOR_RECT };
}

const packed = new WeakMap<Cursor, PackedCursor>();

function packedCursor(cursor: Cursor): PackedCursor {
  let entry = packed.get(cursor);
  if (!entry) {
    entry = { data: packBits16(cursor.data), mask: packBits16(cursor.mask) };
    packed.set(cursor, entry);
  }
  return entry;
}

/**
 * Draw the current cursor into `port` with its hot spot at (`x`, `y`).
 * Honors `HideCursor`/`ObscureCursor`; clips to the port.
 */
export function drawCursor(port: GrafPort, x: number, y: number): void {
  if (!cursorState.visible || cursorState.obscured) return;
  const cursor = cursorState.cursor;
  const { data, mask } = packedCursor(cursor);
  const top = y - cursor.hotSpot.v;
  const left = x - cursor.hotSpot.h;
  const dst = makeRect(top, left, top + CURSOR_SIZE, left + CURSOR_SIZE);
  SetPort(port);
  CopyBits(mask, port.portBits, CURSOR_RECT, dst, srcBic, null);
  CopyBits(data, port.portBits, CURSOR_RECT, dst, srcOr, null);
}
