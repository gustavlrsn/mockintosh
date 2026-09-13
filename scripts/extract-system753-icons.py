#!/usr/bin/env python3
"""Dump System 7.5.3 icon families from MacBinary copies of the IA image.

Reads /tmp/system753/macbin (produced by hcopy -m from System7_5_3.img) and
writes src/os/iconCatalog/system753.json. Does not commit the image or the
System/Finder files — only the icon bytes.
"""
from __future__ import annotations

import json
import os
import struct
import sys
import tempfile
from collections import defaultdict
from pathlib import Path

import rsrcfork

ROOT = Path(__file__).resolve().parents[1]
MACBIN = Path("/tmp/system753/macbin")
OUT = ROOT / "src/os/iconCatalog/system753.json"

# Inside Macintosh: More Macintosh Toolbox, “Standard Icons”.
STANDARD_NAMES = {
    -4000: "Document",
    -3999: "Folder",
    -3998: "Floppy Disk",
    -3997: "Open Folder",
    -3996: "Application",
    -3995: "Hard Disk",
    -3994: "Private Folder",
    -3993: "Trash",
    -3992: "Desktop",
    -3991: "Desk Accessory",
    -3989: "Edition File",
    -3985: "Stationery",
    -3984: "Full Trash",
    -3983: "System Folder",
    -3982: "Apple Menu Items",
    -3981: "Startup Items",
    -3980: "Owned Folder",
    -3979: "Drop Folder",
    -3978: "Shared Folder",
    -3977: "Mounted Folder",
    -3976: "Control Panels",
    -3975: "PrintMonitor Documents",
    -3974: "Preferences",
    -3973: "Extensions",
    -3972: "File Server",
    -3971: "Preferences File",
    -3970: "Suitcase",
    -3969: "Mover Object",
    -3968: "Fonts",
    -16506: "Query Document",
    -16415: "Extension",
    -16396: "Macintosh",
}

ICON_TYPES = ("ICN#", "ics#", "icl8", "ics8", "icl4", "ics4", "SICN", "ICON")

# Keep a family if it has a 1-bit drawable. Color-only (orphan icl8 / cicn) is skipped.
DRAWABLE = {"ICN#", "ics#", "ICON", "SICN"}


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
        "data": data[128 : 128 + data_len],
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


def classify(source: str, rel: str) -> str:
    if source == "System":
        return "system"
    if source == "Finder":
        return "finder"
    if "Update" in source:
        return "update"
    if "Control Panels" in rel:
        return "cdev"
    if source in ("SimpleText", "HyperCard", "Scriptable Text Editor"):
        return "app"
    if source.startswith("About HyperCard") or rel.startswith("HyperCard"):
        return "stack"
    return "app"


def unpack_bits(raw: bytes, width: int, height: int) -> list[int]:
    row_bytes = (width + 7) // 8
    out = [0] * (width * height)
    for y in range(height):
        for x in range(width):
            byte = raw[y * row_bytes + (x >> 3)]
            out[y * width + x] = (byte >> (7 - (x & 7))) & 1
    return out


def encode_sprite(data: list[int], mask: list[int]) -> str:
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
    import base64

    return base64.b64encode(bytes(raw)).decode("ascii")


def icn_to_b64(raw: bytes) -> str | None:
    if len(raw) < 256:
        return None
    data = unpack_bits(raw[:128], 32, 32)
    mask = unpack_bits(raw[128:256], 32, 32)
    return encode_sprite(data, mask)


def ics_to_b64(raw: bytes) -> str | None:
    if len(raw) < 64:
        return None
    data = unpack_bits(raw[:32], 16, 16)
    mask = unpack_bits(raw[32:64], 16, 16)
    return encode_sprite(data, mask)


def icon_to_b64(raw: bytes) -> str | None:
    if len(raw) < 128:
        return None
    data = unpack_bits(raw[:128], 32, 32)
    return encode_sprite(data, [1] * 1024)


def sicn_to_b64s(raw: bytes) -> list[str]:
    frames = []
    for off in range(0, len(raw) - 31, 32):
        data = unpack_bits(raw[off : off + 32], 16, 16)
        frames.append(encode_sprite(data, [1] * 256))
    return frames


def resource_bytes(res) -> bytes | None:
    try:
        if res.compressed_info:
            return None
    except Exception:
        pass
    raw = res.data_raw
    return bytes(raw) if raw else None


def res_name(res) -> str:
    name = res.name or ""
    if isinstance(name, bytes):
        name = name.decode("mac_roman", "replace")
    return name.strip()


def collect_file(path: Path) -> list[dict]:
    mb = parse_macbinary(path.read_bytes())
    if not mb:
        return []
    rf = open_rsrc(mb["rsrc"]) or open_rsrc(mb["data"])
    if not rf:
        return []
    rel = str(path.relative_to(MACBIN))
    source = mb["name"]
    group = classify(source, rel)
    buckets: dict[int, dict] = defaultdict(dict)
    names: dict[int, str] = {}
    try:
        for t in rf.keys():
            tname = t.decode("mac_roman") if isinstance(t, (bytes, bytearray)) else str(t)
            if tname not in ICON_TYPES:
                continue
            for rid, res in rf[t].items():
                raw = resource_bytes(res)
                if raw is None:
                    continue
                n = res_name(res)
                if n:
                    names[rid] = n
                if tname == "ICN#":
                    b64 = icn_to_b64(raw)
                    if b64:
                        buckets[rid]["icn"] = b64
                elif tname == "ics#":
                    b64 = ics_to_b64(raw)
                    if b64:
                        buckets[rid]["ics"] = b64
                elif tname == "ICON":
                    b64 = icon_to_b64(raw)
                    if b64:
                        buckets[rid]["icon"] = b64
                elif tname == "SICN":
                    frames = sicn_to_b64s(raw)
                    if frames:
                        buckets[rid]["sicn"] = frames
                elif tname in ("icl8", "ics8", "icl4", "ics4"):
                    import base64

                    buckets[rid][tname] = base64.b64encode(raw).decode("ascii")
    finally:
        rf.close()

    families = []
    for rid, members in buckets.items():
        if not (set(members) & {"icn", "ics", "icon", "sicn"}):
            continue
        name = names.get(rid) or STANDARD_NAMES.get(rid) or ""
        if not name and group == "cdev" and rid == -4064:
            name = source
        families.append(
            {
                "source": source,
                "group": group,
                "id": rid,
                "name": name,
                **members,
            }
        )
    return families


def main() -> int:
    if not MACBIN.is_dir():
        print(f"missing {MACBIN}; copy System 7.5.3 files as MacBinary first", file=sys.stderr)
        return 1
    families: list[dict] = []
    for path in sorted(MACBIN.rglob("*.bin")):
        found = collect_file(path)
        print(f"{path.relative_to(MACBIN)}: {len(found)} families")
        families.extend(found)
    families.sort(key=lambda f: (f["group"], f["source"], f["id"]))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "release": "7.5.3",
        "image": "archive.org/details/AppleMacintoshSystem753",
        "families": families,
    }
    OUT.write_text(json.dumps(payload, separators=(",", ":"), ensure_ascii=False) + "\n")
    print(f"wrote {len(families)} families → {OUT} ({OUT.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
