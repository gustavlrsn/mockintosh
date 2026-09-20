#!/usr/bin/env python3
"""Bake System 7.5.3 FONT 396 (Geneva 12) into a Decker %%FNT1 face.

Apple's Geneva FOND only lists plain 9 (FONT 393) and 12 (FONT 396).
Decker already vendors Geneva 9 as `body`. This import is the 12-point
strike from the same System file used for the 7.5.3 cursor/pattern catalogs.

The FONT rectangle is 15px (ascent 12 + descent 3). Two blank rows are
cropped from the top — the same packing Decker used for Geneva 9 / Chicago 12 —
so the cell is 13px. FontInfo stays the FONT header (12 / 3 / 1).

Does not commit the disk image. Default source:

  /tmp/system753/macbin/System Folder/System.bin

Usage:
  python3 scripts/import-geneva-12.py
  python3 scripts/import-geneva-12.py --system /path/to/System.bin
"""

from __future__ import annotations

import argparse
import base64
import os
import re
import struct
import sys
import tempfile
from pathlib import Path

import rsrcfork

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dcmp3 import decompress_dcmp3  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
DROM_PATH = ROOT / "packages/ui/src/fonts/drom.ts"
OUT_PATH = ROOT / "packages/ui/src/fonts/faces/geneva12.ts"
DEFAULT_SYSTEM = Path("/tmp/system753/macbin/System Folder/System.bin")

FONT_ID = 396
CROP_TOP = 2
FACE_NAME = "geneva12"


def parse_macbinary(data: bytes) -> bytes:
    if len(data) < 128 or data[0] != 0:
        raise SystemExit("not MacBinary")
    namelen = data[1]
    data_len = struct.unpack(">I", data[83:87])[0]
    rsrc_len = struct.unpack(">I", data[87:91])[0]
    data_pad = (data_len + 127) & ~127
    return data[128 + data_pad : 128 + data_pad + rsrc_len]


def resource_bytes(res) -> bytes:
    raw = bytes(res.data_raw)
    try:
        info = res.compressed_info
    except Exception:
        info = None
    if not info:
        return raw
    if getattr(info, "dcmp_id", None) != 3:
        raise SystemExit(f"FONT {FONT_ID} is compressed with dcmp {getattr(info, 'dcmp_id', None)}")
    return decompress_dcmp3(raw[info.header_length :], info.decompressed_length)


def read_drom_chars() -> str:
    source = DROM_PATH.read_text(encoding="utf-8")
    match = re.search(r'const DROM_CHARS =\s*"([^"]*)"', source)
    if not match:
        raise SystemExit(f"Could not parse DROM_CHARS from {DROM_PATH}")
    return match.group(1)


def decker_ordinal(ch: str, drom: str) -> int | None:
    code = ord(ch)
    if code == 10 or 32 <= code <= 126:
        return code
    index = drom.find(ch)
    if index >= 0:
        return 127 + index
    return None


def parse_font(raw: bytes) -> dict:
    (
        _font_type,
        first_char,
        last_char,
        wid_max,
        _kern_max,
        _n_descent,
        _f_rect_width,
        f_rect_height,
        _ow_t_loc,
        ascent,
        descent,
        leading,
        row_words,
    ) = struct.unpack(">13h", raw[:26])
    strike_bytes = row_words * 2 * f_rect_height
    n_loc = last_char - first_char + 3
    n_ow = last_char - first_char + 2
    loc_off = 26 + strike_bytes
    ow_off = loc_off + n_loc * 2
    loc = [struct.unpack(">H", raw[loc_off + i * 2 : loc_off + i * 2 + 2])[0] for i in range(n_loc)]
    ow = [struct.unpack(">h", raw[ow_off + i * 2 : ow_off + i * 2 + 2])[0] for i in range(n_ow)]
    return {
        "first": first_char,
        "last": last_char,
        "widMax": wid_max,
        "fRectHeight": f_rect_height,
        "ascent": ascent,
        "descent": descent,
        "leading": leading,
        "rowWords": row_words,
        "loc": loc,
        "ow": ow,
        "bitImage": raw[26 : 26 + strike_bytes],
    }


def bit_at(font: dict, x: int, y: int) -> bool:
    if y < 0 or y >= font["fRectHeight"] or x < 0:
        return False
    row_bytes = font["rowWords"] * 2
    byte = font["bitImage"][y * row_bytes + (x >> 3)]
    return bool((byte >> (7 - (x & 7))) & 1)


def pack_glyph(font: dict, code: int, cell_height: int, max_width: int) -> tuple[int, bytes] | None:
    index = code - font["first"]
    if index < 0 or index >= len(font["ow"]):
        return None
    ow = font["ow"][index]
    if ow == -1:
        return None
    offset = (ow >> 8) & 0xFF
    if offset >= 128:
        offset -= 256
    advance = ow & 0xFF
    if advance < 1:
        return None
    x0 = font["loc"][index]
    x1 = font["loc"][index + 1]
    image_width = x1 - x0
    byte_width = (max_width + 7) // 8
    packed = bytearray(byte_width * cell_height)
    for y in range(cell_height):
        src_y = y + CROP_TOP
        for x in range(image_width):
            dest_x = offset + x
            if dest_x < 0 or dest_x >= max_width:
                continue
            if bit_at(font, x0 + x, src_y):
                packed[y * byte_width + (dest_x >> 3)] |= 1 << (7 - (dest_x & 7))
    return advance, bytes(packed)


def encode_fnt1(max_width: int, height: int, spacing: int, glyphs: list[tuple[int, int, bytes]]) -> str:
    payload = bytearray([max_width, height, spacing])
    stride = ((max_width + 7) // 8) * height
    for ordinal, width, data in glyphs:
        if len(data) != stride:
            raise SystemExit(f"glyph {ordinal} packed to {len(data)} bytes, expected {stride}")
        payload.append(ordinal)
        payload.append(width)
        payload.extend(data)
    return "%%FNT1" + base64.b64encode(payload).decode("ascii")


def ts_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def load_system_font(system_path: Path) -> bytes:
    blob = system_path.read_bytes()
    rsrc = parse_macbinary(blob) if blob[:1] == b"\x00" else blob
    fd, tmp = tempfile.mkstemp(suffix=".rsrc")
    try:
        os.write(fd, rsrc)
        os.close(fd)
        rf = rsrcfork.ResourceFile.open(tmp, fork="data")
        try:
            if b"FONT" not in rf or FONT_ID not in rf[b"FONT"]:
                raise SystemExit(f"{system_path}: no FONT {FONT_ID}")
            return resource_bytes(rf[b"FONT"][FONT_ID])
        finally:
            rf.close()
    finally:
        try:
            os.unlink(tmp)
        except OSError:
            pass


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--system", type=Path, default=DEFAULT_SYSTEM, help="MacBinary System file")
    args = parser.parse_args()
    if not args.system.is_file():
        raise SystemExit(f"missing System file: {args.system}")

    font = parse_font(load_system_font(args.system))
    if font["fRectHeight"] != 15 or font["ascent"] != 12:
        raise SystemExit(
            f"unexpected FONT {FONT_ID} metrics: "
            f"{font['fRectHeight']}px ascent {font['ascent']}"
        )

    cell_height = font["fRectHeight"] - CROP_TOP
    max_width = font["widMax"]
    drom = read_drom_chars()
    glyphs: list[tuple[int, int, bytes]] = []
    skipped: list[str] = []
    seen: set[int] = set()

    for code in range(font["first"], font["last"] + 1):
        try:
            ch = bytes([code]).decode("mac_roman")
        except UnicodeDecodeError:
            continue
        ordinal = decker_ordinal(ch, drom)
        if ordinal is None:
            if code >= 32 and font["ow"][code - font["first"]] != -1:
                skipped.append(ch)
            continue
        packed = pack_glyph(font, code, cell_height, max_width)
        if packed is None:
            continue
        if ordinal in seen:
            continue
        seen.add(ordinal)
        advance, data = packed
        glyphs.append((ordinal, advance, data))

    glyphs.sort(key=lambda item: item[0])
    record = encode_fnt1(max_width, cell_height, 0, glyphs)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(
        f"""\
// Generated from System 7.5.3 FONT {FONT_ID} (Geneva 12). Do not hand-edit.
//   python3 scripts/import-geneva-12.py
// Source image is not committed; default path is {DEFAULT_SYSTEM}.
//
// FONT header: ascent {font["ascent"]}, descent {font["descent"]}, leading {font["leading"]}.
// Cell {max_width}×{cell_height} after cropping {CROP_TOP} blank rows, {len(glyphs)} glyphs.
export const BUILTIN_FONT_GENEVA_12 = "{ts_escape(record)}";
""",
        encoding="utf-8",
    )
    print(
        f"Wrote {OUT_PATH} — {len(glyphs)} glyphs, "
        f"{max_width}×{cell_height} cell, "
        f"ascent {font['ascent']} descent {font['descent']} leading {font['leading']}"
    )
    if skipped:
        print(f"Skipped {len(skipped)} MacRoman glyphs with no DROM slot")


if __name__ == "__main__":
    main()
