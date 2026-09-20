"""Apple Resource Manager 'dcmp' 3 — LZSS-like bitstream from System 7.1+.

Port of resource_dasm's decompress_system3 (fuzziqersoftware/resource_dasm).
The 7.5.3 Desktop Patterns suitcase compresses every 'ppat' with this.
"""
from __future__ import annotations


class BitReader:
    def __init__(self, data: bytes):
        self.data = data
        self.bit = 0

    def read(self, n: int) -> int:
        v = 0
        for _ in range(n):
            byte_i = self.bit >> 3
            if byte_i >= len(self.data):
                raise EOFError("dcmp3 bitstream exhausted")
            bit_i = 7 - (self.bit & 7)
            v = (v << 1) | ((self.data[byte_i] >> bit_i) & 1)
            self.bit += 1
        return v


def _decode_int_1_63(r: BitReader) -> int:
    if r.read(1) == 0:
        return 1
    kind = r.read(2)
    if kind == 0:
        return 2
    if kind == 1:
        return 3
    if kind == 2:
        return r.read(2) + 4
    which = r.read(4)
    if which < 8:
        return which + 8
    if which < 12:
        return r.read(2) + ((which - 0x08) << 2) + 0x10
    return r.read(3) + ((which - 0x0C) << 3) + 0x20


def _decode_int_0_2042(r: BitReader) -> int:
    which = 0
    while which < 10 and r.read(1):
        which += 1
    if which == 0:
        return r.read(1)
    if which == 1:
        return 2 if r.read(1) == 0 else r.read(1) + 3
    if which == 2:
        return r.read(1) + 5 if r.read(1) == 0 else r.read(2) + 7
    extras = (3, 3, 5, 6, 7, 8, 9, 10)
    bases = (11, 19, 27, 59, 123, 251, 507, 1019)
    return r.read(extras[which - 3]) + bases[which - 3]


def _read_int_a80(max_value: int, r: BitReader) -> int:
    if r.read(1) == 0:
        return r.read(7) + 1
    if r.read(1) == 0:
        return r.read(9) + 0x81
    caps = (0x282, 0x284, 0x288, 0x290, 0x2A0, 0x2C0, 0x300, 0x380, 0x480, 0x66C, 0xA80)
    bits = (1, 2, 4, 4, 5, 6, 7, 8, 9, 10, 11)
    for cap, n in zip(caps, bits):
        if max_value <= cap:
            return r.read(n) + 0x281
    raise ValueError("dcmp3 A80 overflow")


def read_int_max(max_value: int, r: BitReader) -> int:
    """Backreference offset. Mirrors resource_dasm's per-range readers exactly."""
    if max_value <= 0x0A:
        if r.read(1) == 0:
            return 1
        if r.read(1) == 0:
            return r.read(2) + 2
        if max_value <= 7:
            return r.read(1) + 6
        if max_value <= 9:
            return r.read(2) + 6
        if max_value <= 13:
            return r.read(3) + 6
        return r.read(4) + 6
    if max_value <= 0x14:
        if r.read(1) == 0:
            return r.read(1) + 1
        if r.read(1) == 0:
            return r.read(3) + 3
        if max_value <= 12:
            return r.read(1) + 11
        if max_value <= 14:
            return r.read(2) + 11
        if max_value <= 18:
            return r.read(3) + 11
        if max_value <= 26:
            return r.read(4) + 11
        return r.read(5) + 11
    if max_value <= 0x28:
        if r.read(1) == 0:
            return r.read(2) + 1
        if r.read(1) == 0:
            return r.read(4) + 5
        if max_value <= 0x16:
            return r.read(1) + 0x15
        if max_value <= 0x18:
            return r.read(2) + 0x15
        if max_value <= 0x1C:
            return r.read(3) + 0x15
        if max_value <= 0x24:
            return r.read(4) + 0x15
        if max_value <= 0x34:
            return r.read(5) + 0x15
        return r.read(6) + 0x15
    if max_value <= 0x50:
        if r.read(1) == 0:
            return r.read(3) + 1
        if r.read(1) == 0:
            return r.read(5) + 9
        if max_value <= 0x2A:
            return r.read(1) + 0x29
        if max_value <= 0x2C:
            return r.read(2) + 0x29
        if max_value <= 0x30:
            return r.read(3) + 0x29
        if max_value <= 0x38:
            return r.read(4) + 0x29
        if max_value <= 0x48:
            return r.read(5) + 0x29
        if max_value <= 0x68:
            return r.read(6) + 0x29
        return r.read(7) + 0x29
    if max_value <= 0xA0:
        if r.read(1) == 0:
            return r.read(4) + 1
        if r.read(1) == 0:
            return r.read(6) + 0x11
        if max_value <= 0x52:
            return r.read(1) + 0x51
        if max_value <= 0x54:
            return r.read(2) + 0x51
        if max_value <= 0x58:
            return r.read(3) + 0x51
        if max_value <= 0x60:
            return r.read(4) + 0x51
        if max_value <= 0x70:
            return r.read(5) + 0x51
        if max_value <= 0x90:
            return r.read(6) + 0x51
        if max_value <= 0xD0:
            return r.read(7) + 0x51
        return r.read(8) + 0x51
    if max_value <= 0x2A0:
        if r.read(1) == 0:
            return r.read(5) + 1
        if r.read(1) == 0:
            return r.read(7) + 0x21
        if max_value <= 0xA2:
            return r.read(1) + 0xA1
        if max_value <= 0xA4:
            return r.read(2) + 0xA1
        if max_value <= 0xA8:
            return r.read(3) + 0xA1
        if max_value <= 0xB0:
            return r.read(4) + 0xA1
        if max_value <= 0xC0:
            return r.read(5) + 0xA1
        if max_value <= 0xE0:
            return r.read(6) + 0xA1
        if max_value <= 0x120:
            return r.read(7) + 0xA1
        if max_value <= 0x1A0:
            return r.read(8) + 0xA1
        return r.read(9) + 0xA1
    if max_value <= 0x3E8:
        if r.read(1) == 0:
            return r.read(6) + 1
        if r.read(1) == 0:
            return r.read(8) + 0x41
        if max_value <= 0x142:
            return r.read(1) + 0x141
        if max_value <= 0x144:
            return r.read(2) + 0x141
        if max_value <= 0x148:
            return r.read(3) + 0x141
        if max_value <= 0x150:
            return r.read(4) + 0x141
        if max_value <= 0x160:
            return r.read(5) + 0x141
        if max_value <= 0x180:
            return r.read(6) + 0x141
        if max_value <= 0x1C0:
            return r.read(7) + 0x141
        if max_value <= 0x240:
            return r.read(8) + 0x141
        if max_value <= 0x340:
            return r.read(9) + 0x141
        return r.read(10) + 0x141
    if max_value <= 0xA80:
        return _read_int_a80(max_value, r)
    if max_value <= 0x1500:
        if r.read(1) == 0:
            return r.read(8) + 1
        if r.read(1) == 0:
            return r.read(10) + 0x101
        steps = (
            (0x502, 1), (0x504, 2), (0x508, 3), (0x510, 4), (0x520, 5), (0x540, 6),
            (0x580, 7), (0x600, 8), (0x700, 9), (0x900, 10), (0xD00, 11), (0x1500, 12),
        )
        for cap, n in steps:
            if max_value <= cap:
                return r.read(n) + 0x501
    if max_value <= 0x2A00:
        if r.read(1) == 0:
            return r.read(9) + 1
        if r.read(1) == 0:
            return r.read(11) + 0x201
        steps = (
            (0xA02, 1), (0xA04, 2), (0xA08, 3), (0xA10, 4), (0xA20, 5), (0xA40, 6),
            (0xA80, 7), (0xB00, 8), (0xC00, 9), (0xE00, 10), (0x1200, 11), (0x1A00, 12), (0x2A00, 13),
        )
        for cap, n in steps:
            if max_value <= cap:
                return r.read(n) + 0xA01
    if max_value <= 0x5400:
        if r.read(1) == 0:
            return r.read(10) + 1
        if r.read(1) == 0:
            return r.read(12) + 0x401
        steps = (
            (0x1402, 1), (0x1404, 2), (0x1408, 3), (0x1410, 4), (0x1420, 5), (0x1440, 6),
            (0x1480, 7), (0x1500, 8), (0x1600, 9), (0x1800, 10), (0x1C00, 11), (0x2400, 12),
            (0x3400, 13), (0x5400, 14),
        )
        for cap, n in steps:
            if max_value <= cap:
                return r.read(n) + 0x1401
    if max_value <= 0xA800:
        if r.read(1) == 0:
            return r.read(11) + 1
        if r.read(1) == 0:
            return r.read(13) + 0x801
        steps = (
            (0x2802, 1), (0x2804, 2), (0x2808, 3), (0x2810, 4), (0x2820, 5), (0x2840, 6),
            (0x2880, 7), (0x2900, 8), (0x2A00, 9), (0x2C00, 10), (0x3000, 11), (0x3800, 12),
            (0x4800, 13), (0x6800, 14), (0xA800, 15),
        )
        for cap, n in steps:
            if max_value <= cap:
                return r.read(n) + 0x2801
    if max_value <= 0x11170:
        if r.read(1) == 0:
            return r.read(12) + 1
        if r.read(1) == 0:
            return r.read(14) + 0x1001
        steps = (
            (0x5002, 1), (0x5004, 2), (0x5008, 3), (0x5010, 4), (0x5020, 5), (0x5040, 6),
            (0x5080, 7), (0x5100, 8), (0x5200, 9), (0x5400, 10), (0x5800, 11), (0x6000, 12),
            (0x7000, 13), (0x9000, 14), (0xD000, 15), (0x15000, 16),
        )
        for cap, n in steps:
            if max_value <= cap:
                return r.read(n) + 0x5001
    if max_value <= 0x2A000:
        if r.read(1) == 0:
            return r.read(13) + 1
        if r.read(1) == 0:
            return r.read(15) + 0x2001
        steps = (
            (0xA002, 1), (0xA004, 2), (0xA008, 3), (0xA010, 4), (0xA020, 5), (0xA040, 6),
            (0xA080, 7), (0xA100, 8), (0xA200, 9), (0xA400, 10), (0xA800, 11), (0xB000, 12),
            (0xC000, 13), (0xE000, 14), (0x12000, 15), (0x1A000, 16), (0x2A000, 17),
        )
        for cap, n in steps:
            if max_value <= cap:
                return r.read(n) + 0xA001
    if r.read(1) == 0:
        return r.read(14) + 1
    if r.read(1) == 0:
        return r.read(16) + 0x4001
    steps = (
        (0x14002, 1), (0x14004, 2), (0x14008, 3), (0x14010, 4), (0x14020, 5), (0x14040, 6),
        (0x200C, 7), (0x14100, 8), (0x14200, 9), (0x14400, 10), (0x14800, 11), (0x15000, 12),
        (0x16000, 13), (0x18000, 14), (0x1C000, 15), (0x24000, 16), (0x34000, 17), (0x54000, 18),
    )
    for cap, n in steps:
        if max_value <= cap:
            return r.read(n) + 0x14001
    raise ValueError(f"dcmp3 offset max {max_value:#x}")


def decompress_dcmp3(payload: bytes, decompressed_size: int) -> bytes:
    r = BitReader(payload)
    out = bytearray()
    stream_block_allowed = True
    while len(out) < decompressed_size:
        before = len(out)
        back_bytes = _decode_int_0_2042(r)
        back_off = 0
        stream_bytes = 0
        if back_bytes <= 0 and stream_block_allowed:
            stream_bytes = _decode_int_1_63(r)
            stream_block_allowed = stream_bytes >= 0x3F
        else:
            back_bytes += 2
            if not stream_block_allowed:
                back_bytes += 1
            stream_block_allowed = True
            back_off = read_int_max(before, r)
        if back_bytes <= 0:
            for _ in range(stream_bytes):
                out.append(r.read(8))
        else:
            if back_off > len(out):
                raise ValueError("dcmp3 backreference past start")
            for _ in range(back_bytes):
                out.append(out[len(out) - back_off])
        if len(out) <= before:
            raise ValueError("dcmp3 did not advance")
        if len(out) > decompressed_size:
            out = out[:decompressed_size]
            break
    return bytes(out)
