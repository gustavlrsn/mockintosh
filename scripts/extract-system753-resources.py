#!/usr/bin/env python3
"""Dump System 7.5.3 patterns and cursors from MacBinary copies of the IA image.

Reads /tmp/system753/macbin. Writes JSON under src/os/resourceCatalog/.
Does not commit the image.
"""
from __future__ import annotations

import json
import os
import struct
import sys
import tempfile
from pathlib import Path

import rsrcfork

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dcmp3 import decompress_dcmp3  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
MACBIN = Path("/tmp/system753/macbin")
OUT_DIR = ROOT / "src/os/resourceCatalog"

CURS_NAMES = {1: "iBeam", 2: "cross", 3: "plus", 4: "watch"}


def parse_macbinary(data: bytes) -> dict | None:
    if len(data) < 128 or data[0] != 0:
        return None
    namelen = data[1]
    if namelen == 0 or namelen > 63:
        return None
    data_len = struct.unpack(">I", data[83:87])[0]
    rsrc_len = struct.unpack(">I", data[87:91])[0]
    name = data[2 : 2 + namelen].decode("mac_roman", "replace")
    data_pad = (data_len + 127) & ~127
    return {
        "name": name,
        "rsrc": data[128 + data_pad : 128 + data_pad + rsrc_len],
    }


def open_rsrc(blob: bytes):
    if not blob or len(blob) < 16:
        return None
    fd, path = tempfile.mkstemp(suffix=".rsrc")
    try:
        os.write(fd, blob)
        os.close(fd)
        try:
            return rsrcfork.ResourceFile.open(path, fork="data")
        except Exception:
            return None
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


def res_name(res) -> str:
    name = res.name or ""
    if isinstance(name, bytes):
        name = name.decode("mac_roman", "replace")
    return name.strip()


def type_name(t) -> str:
    return t.decode("mac_roman") if isinstance(t, (bytes, bytearray)) else str(t)


def resource_bytes(res) -> bytes | None:
    raw = bytes(res.data_raw)
    try:
        info = res.compressed_info
    except Exception:
        info = None
    if not info:
        return raw
    if getattr(info, "dcmp_id", None) != 3:
        return None
    header_len = info.header_length
    dest_len = info.decompressed_length
    try:
        return decompress_dcmp3(raw[header_len:], dest_len)
    except Exception as e:
        print(f"  dcmp3 failed ({e})", file=sys.stderr)
        return None


def unpack_bits(raw: bytes, width: int, height: int, row_bytes: int | None = None) -> list[int]:
    if row_bytes is None:
        row_bytes = (width + 7) // 8
    out = [0] * (width * height)
    for y in range(height):
        for x in range(width):
            byte = raw[y * row_bytes + (x >> 3)]
            out[y * width + x] = (byte >> (7 - (x & 7))) & 1
    return out


def encode_sprite(data: list[int], mask: list[int]) -> str:
    import base64

    total = len(data)
    raw = bytearray((total + 3) >> 2)
    for i in range(total):
        if mask[i] == 0:
            val = 0
        elif data[i]:
            val = 0b10
        else:
            val = 0b01
        raw[i >> 2] |= val << (6 - (i & 3) * 2)
    return base64.b64encode(bytes(raw)).decode("ascii")


def hex8(raw: bytes) -> str:
    return raw.hex()


def parse_ppat(raw: bytes) -> dict | None:
    """Flattened PixPat: pat1Data at 20, PixMap at patMap (rowBytes +4, bounds +6)."""
    if len(raw) < 28:
        return None
    pat_type = struct.unpack(">h", raw[:2])[0]
    pat_map, pat_data = struct.unpack(">II", raw[2:10])
    rec: dict = {"kind": "ppat", "patType": pat_type, "pat": hex8(raw[20:28])}
    if pat_map + 14 <= len(raw):
        row_bytes = struct.unpack(">H", raw[pat_map + 4 : pat_map + 6])[0] & 0x3FFF
        top, left, bottom, right = struct.unpack(">hhhh", raw[pat_map + 6 : pat_map + 14])
        width, height = max(0, right - left), max(0, bottom - top)
        rec["width"] = width
        rec["height"] = height
        pix_off = pat_map + 32
        if pix_off + 2 <= len(raw):
            rec["pixelSize"] = struct.unpack(">H", raw[pix_off : pix_off + 2])[0]
        if rec.get("pixelSize") == 1 and width and height and row_bytes:
            need = pat_data + row_bytes * height
            if need <= len(raw):
                bits = unpack_bits(raw[pat_data:need], width, height, row_bytes)
                rec["tile"] = encode_sprite(bits, [1] * (width * height))
    return rec


def parse_curs(raw: bytes) -> dict | None:
    if len(raw) < 68:
        return None
    data_bits = unpack_bits(raw[0:32], 16, 16, 2)
    mask_bits = unpack_bits(raw[32:64], 16, 16, 2)
    hot_v, hot_h = struct.unpack(">HH", raw[64:68])
    return {
        "hotV": hot_v,
        "hotH": hot_h,
        "sprite": encode_sprite(data_bits, mask_bits),
    }


def parse_acur(raw: bytes) -> list[int]:
    if len(raw) < 4:
        return []
    count = struct.unpack(">H", raw[:2])[0]
    frames = []
    off = 4
    for _ in range(count):
        if off + 2 > len(raw):
            break
        (rid,) = struct.unpack(">h", raw[off : off + 2])
        frames.append(rid)
        off += 4
    return frames


def collect(path: Path, want: set[str]) -> list[tuple[str, str, int, str, bytes]]:
    mb = parse_macbinary(path.read_bytes())
    if not mb:
        return []
    rf = open_rsrc(mb["rsrc"])
    if not rf:
        return []
    out = []
    try:
        for t in rf.keys():
            tn = type_name(t)
            if tn not in want:
                continue
            for rid, res in rf[t].items():
                raw = resource_bytes(res)
                if raw is None:
                    continue
                out.append((mb["name"], tn, rid, res_name(res), raw))
    finally:
        rf.close()
    return out


def main() -> int:
    if not MACBIN.is_dir():
        print(f"missing {MACBIN}", file=sys.stderr)
        return 1

    patterns: list[dict] = []
    cursors: list[dict] = []
    animations: list[dict] = []

    for path in sorted(MACBIN.rglob("*.bin")):
        found = collect(path, {"PAT ", "PAT#", "ppat", "CURS", "acur"})
        if not found:
            continue
        print(f"{path.relative_to(MACBIN)}: {len(found)} resources")
        for source, tn, rid, name, raw in found:
            if tn == "PAT ":
                if len(raw) >= 8:
                    patterns.append({"source": source, "kind": "pat", "id": rid, "name": name, "pat": hex8(raw[:8])})
            elif tn == "PAT#":
                if len(raw) < 2:
                    continue
                count = struct.unpack(">H", raw[:2])[0]
                for i in range(count):
                    off = 2 + i * 8
                    if off + 8 > len(raw):
                        break
                    patterns.append(
                        {
                            "source": source,
                            "kind": "pat#",
                            "id": rid,
                            "index": i,
                            "name": name,
                            "pat": hex8(raw[off : off + 8]),
                        }
                    )
            elif tn == "ppat":
                rec = parse_ppat(raw)
                if rec:
                    rec.update({"source": source, "id": rid, "name": name})
                    patterns.append(rec)
            elif tn == "CURS":
                rec = parse_curs(raw)
                if rec:
                    rec.update(
                        {
                            "source": source,
                            "id": rid,
                            "name": name or CURS_NAMES.get(rid, ""),
                        }
                    )
                    cursors.append(rec)
            elif tn == "acur":
                animations.append(
                    {
                        "source": source,
                        "id": rid,
                        "name": name,
                        "frames": parse_acur(raw),
                    }
                )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    meta = {"release": "7.5.3", "image": "archive.org/details/AppleMacintoshSystem753"}
    pat_path = OUT_DIR / "system753-patterns.json"
    cur_path = OUT_DIR / "system753-cursors.json"
    pat_path.write_text(
        json.dumps({**meta, "patterns": patterns}, separators=(",", ":"), ensure_ascii=False) + "\n"
    )
    cur_path.write_text(
        json.dumps({**meta, "cursors": cursors, "animations": animations}, separators=(",", ":"), ensure_ascii=False)
        + "\n"
    )
    print(f"wrote {len(patterns)} patterns → {pat_path} ({pat_path.stat().st_size} bytes)")
    print(f"wrote {len(cursors)} cursors + {len(animations)} acur → {cur_path} ({cur_path.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
