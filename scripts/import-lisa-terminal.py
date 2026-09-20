#!/usr/bin/env python3
"""Rasterize LisaTerminal Paper Raw onto Decker's 1-bit %%FNT1 face.

Official source is Kreative's lisa1.zip (Relay Free Use License 1.2f).
Raw (1X1Y) is the native Lisa TILE*VT pixel grid — 8×12, 100 units/pixel.
2X3Y is the same bitmap stretched for CRT-style display and is not imported.

Usage:
  python3 scripts/import-lisa-terminal.py
  python3 scripts/import-lisa-terminal.py --ttf /path/to/LisaTerminalPaperRaw.ttf
"""

from __future__ import annotations

import argparse
import base64
import io
import re
import sys
import urllib.request
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
DROM_PATH = ROOT / "packages/ui/src/fonts/drom.ts"
OUT_PATH = ROOT / "packages/ui/src/fonts/faces/lisa.ts"
LICENSE_PATH = ROOT / "packages/ui/src/fonts/faces/LICENSE-LisaTerminal.txt"

# Pinned official archive. User-Agent is required — the host 406s bare urllib.
ZIP_URL = "https://www.kreativekorp.com/swdownload/fonts/retro/lisa1.zip"
TTF_MEMBER = "1X1Y/LisaTerminalPaperRaw.ttf"
LICENSE_MEMBER = "FreeLicense.txt"
USER_AGENT = "Mozilla/5.0 (compatible; mockintosh-font-import/1.0)"

GRID = 100
EM = 1200
FACE_NAME = "lisa"


def read_drom_chars() -> str:
    source = DROM_PATH.read_text(encoding="utf-8")
    match = re.search(r'const DROM_CHARS =\s*"([^"]*)"', source)
    if not match:
        raise SystemExit(f"Could not parse DROM_CHARS from {DROM_PATH}")
    return match.group(1)


def ordinals() -> list[tuple[int, str]]:
    pairs: list[tuple[int, str]] = []
    for code in range(32, 127):
        pairs.append((code, chr(code)))
    drom = read_drom_chars()
    for index, ch in enumerate(drom):
        pairs.append((127 + index, ch))
    return pairs


def cmap_from_ttf(path: Path) -> dict[int, int]:
    """Minimal cmap format-4 reader so we skip .notdef instead of tofu."""
    data = path.read_bytes()
    num_tables = int.from_bytes(data[4:6], "big")
    tables: dict[str, tuple[int, int]] = {}
    offset = 12
    for _ in range(num_tables):
        tag = data[offset : offset + 4].decode("ascii")
        _checksum, table_offset, length = (
            int.from_bytes(data[offset + 4 : offset + 8], "big"),
            int.from_bytes(data[offset + 8 : offset + 12], "big"),
            int.from_bytes(data[offset + 12 : offset + 16], "big"),
        )
        tables[tag] = (table_offset, length)
        offset += 16
    cmap_off, _ = tables["cmap"]
    cmap = data[cmap_off:]
    nenc = int.from_bytes(cmap[2:4], "big")
    sub = None
    for i in range(nenc):
        plat = int.from_bytes(cmap[4 + i * 8 : 6 + i * 8], "big")
        enc = int.from_bytes(cmap[6 + i * 8 : 8 + i * 8], "big")
        rec_off = int.from_bytes(cmap[8 + i * 8 : 12 + i * 8], "big")
        rec = cmap[rec_off:]
        fmt = int.from_bytes(rec[0:2], "big")
        if fmt == 4 and (sub is None or (plat == 3 and enc == 1)):
            sub = rec
            if plat == 3 and enc == 1:
                break
    if sub is None:
        raise SystemExit("LisaTerminal TTF has no cmap format 4")
    seg_count = int.from_bytes(sub[6:8], "big") // 2
    end_codes = [int.from_bytes(sub[14 + 2 * i : 16 + 2 * i], "big") for i in range(seg_count)]
    start_off = 16 + 2 * seg_count
    start_codes = [
        int.from_bytes(sub[start_off + 2 * i : start_off + 2 * i + 2], "big") for i in range(seg_count)
    ]
    id_delta = [
        int.from_bytes(sub[start_off + 2 * seg_count + 2 * i : start_off + 2 * seg_count + 2 * i + 2], "big", signed=True)
        for i in range(seg_count)
    ]
    range_off_base = start_off + 4 * seg_count
    id_range_off = [
        int.from_bytes(sub[range_off_base + 2 * i : range_off_base + 2 * i + 2], "big")
        for i in range(seg_count)
    ]

    mapping: dict[int, int] = {}
    for i, end in enumerate(end_codes):
        start = start_codes[i]
        if start == 0xFFFF:
            continue
        for cp in range(start, end + 1):
            if id_range_off[i] == 0:
                gid = (cp + id_delta[i]) & 0xFFFF
            else:
                ptr = range_off_base + 2 * i + id_range_off[i] + 2 * (cp - start)
                gid = int.from_bytes(sub[ptr : ptr + 2], "big")
                if gid:
                    gid = (gid + id_delta[i]) & 0xFFFF
            if gid:
                mapping[cp] = gid
    return mapping


def units_to_px(value: float) -> int:
    return int(round(value / GRID))


def measure(font: ImageFont.FreeTypeFont, ch: str) -> tuple[int, int, int, int, int]:
    left, top, right, bottom = font.getbbox(ch, anchor="ls")
    advance = units_to_px(font.getlength(ch))
    return left, top, right, bottom, advance


def raster_glyph(
    font: ImageFont.FreeTypeFont,
    ch: str,
    advance: int,
    ascent: int,
    height: int,
    max_width: int,
) -> bytes:
    byte_width = (max_width + 7) // 8
    packed = bytearray(byte_width * height)
    if ch == " " or advance < 1:
        return bytes(packed)

    pad = GRID * 4
    baseline = pad + ascent * GRID
    canvas_w = pad + max(advance, 1) * GRID + pad
    canvas_h = pad + height * GRID + pad
    image = Image.new("L", (canvas_w, canvas_h), 255)
    draw = ImageDraw.Draw(image)
    draw.text((pad, baseline), ch, font=font, fill=0, anchor="ls")

    for py in range(height):
        for px in range(advance):
            cx = pad + int((px + 0.5) * GRID)
            cy = int(baseline - (ascent - py - 0.5) * GRID)
            if image.getpixel((cx, cy)) < 128:
                packed[py * byte_width + (px >> 3)] |= 1 << (7 - (px & 7))
    return bytes(packed)


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


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request) as response:
        return response.read()


def ts_escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ttf", type=Path, help="Local LisaTerminalPaperRaw.ttf (otherwise downloaded)")
    args = parser.parse_args()

    ttf_path = args.ttf
    if ttf_path is None:
        print(f"Downloading {ZIP_URL}", file=sys.stderr)
        archive = zipfile.ZipFile(io.BytesIO(fetch(ZIP_URL)))
        ttf_path = Path("/tmp/lisa-terminal/LisaTerminalPaperRaw.ttf")
        ttf_path.parent.mkdir(parents=True, exist_ok=True)
        ttf_path.write_bytes(archive.read(TTF_MEMBER))
        if not LICENSE_PATH.exists():
            LICENSE_PATH.write_bytes(archive.read(LICENSE_MEMBER))
            print(f"Wrote {LICENSE_PATH}", file=sys.stderr)
    elif not LICENSE_PATH.exists():
        print(f"Downloading license via {ZIP_URL}", file=sys.stderr)
        archive = zipfile.ZipFile(io.BytesIO(fetch(ZIP_URL)))
        LICENSE_PATH.write_bytes(archive.read(LICENSE_MEMBER))

    font = ImageFont.truetype(str(ttf_path), size=EM)
    present = cmap_from_ttf(ttf_path)

    measured: list[tuple[int, str, int, int, int]] = []
    max_ascent = 0
    max_descent = 0
    max_advance = 1
    skipped: list[str] = []
    for ordinal, ch in ordinals():
        if ord(ch) not in present:
            skipped.append(ch)
            continue
        _left, top, _right, bottom, advance = measure(font, ch)
        ascent = max(0, -units_to_px(top))
        descent = max(0, units_to_px(bottom))
        max_ascent = max(max_ascent, ascent)
        max_descent = max(max_descent, descent)
        max_advance = max(max_advance, max(1, advance))
        measured.append((ordinal, ch, advance, ascent, descent))

    height = max_ascent + max_descent
    glyphs: list[tuple[int, int, bytes]] = []
    for ordinal, ch, advance, _ascent, _descent in measured:
        packed = raster_glyph(font, ch, advance, max_ascent, height, max_advance)
        glyphs.append((ordinal, advance, packed))

    record = encode_fnt1(max_advance, height, 0, glyphs)
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(
        f"""\
// Generated from LisaTerminal Paper Raw (Kreative Relay Free Use 1.2f). Do not hand-edit.
//   python3 scripts/import-lisa-terminal.py
// Official archive: {ZIP_URL} ({TTF_MEMBER})
// License: packages/ui/src/fonts/faces/LICENSE-LisaTerminal.txt
//
// Native 1:1 raster: {GRID} units/pixel, cell {max_advance}×{height}
// (ascent {max_ascent} + descent {max_descent}), {len(glyphs)} glyphs.
export const BUILTIN_FONT_LISA = "{ts_escape(record)}";
""",
        encoding="utf-8",
    )
    print(
        f"Wrote {OUT_PATH} — {len(glyphs)} glyphs, "
        f"{max_advance}×{height} cell, ascent {max_ascent}, descent {max_descent}"
    )
    if skipped:
        print(f"Skipped {len(skipped)} DROM chars missing from the TTF: {''.join(skipped)}")


if __name__ == "__main__":
    main()
