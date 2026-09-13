import { describe, expect, it } from "vitest";
import {
  ClosePicture,
  CopyBits,
  DrawPicture,
  FrameRect,
  InitGraf,
  LineTo,
  MapRect,
  MoveTo,
  OpenPicture,
  OpenPort,
  PaintRect,
  parsePicture,
  serializePicture,
  srcCopy,
  srcOr,
  type GrafPort,
  type GrafVerb,
  type PicHandle,
  type Point,
  type QDProcs,
  type Rect,
} from "../src";
import { cloneRect, makeRect, newBitMap, pixelsFromBitMap } from "../src/bits";

function openPort(w = 32, h = 24): GrafPort {
  InitGraf(newBitMap(w, h));
  const port = {} as GrafPort;
  OpenPort(port);
  return port;
}

function mustOpen(frame = makeRect(0, 0, 32, 24)): PicHandle {
  const pic = OpenPicture(frame);
  if (!pic) throw new Error("OpenPicture returned nil");
  return pic;
}

function recordScene(frame: Rect, draw: () => void): PicHandle {
  openPort(frame.right - frame.left, frame.bottom - frame.top);
  const pic = mustOpen(frame);
  draw();
  ClosePicture();
  return pic;
}

function pixelsOf(port: GrafPort): number[] {
  return Array.from(pixelsFromBitMap(port.portBits));
}

describe("DrawPicture 1:1", () => {
  it("replays FrameRect / PaintRect / LineTo pixel-identically into a fresh port", () => {
    const frame = makeRect(0, 0, 24, 32);
    const r1 = makeRect(2, 2, 10, 12);
    const r2 = makeRect(4, 4, 8, 8);

    const pic = recordScene(frame, () => {
      FrameRect(r1);
      PaintRect(r2);
      MoveTo(0, 0);
      LineTo(5, 6);
    });

    const oracle = openPort(32, 24);
    FrameRect(r1);
    PaintRect(r2);
    MoveTo(0, 0);
    LineTo(5, 6);
    const expected = pixelsOf(oracle);

    const play = openPort(32, 24);
    DrawPicture(pic, frame);
    expect(pixelsOf(play)).toEqual(expected);
  });

  it("restores the port and leaves txMode / clipRgn as they were", () => {
    const frame = makeRect(0, 0, 16, 16);
    const pic = recordScene(frame, () => {
      FrameRect(makeRect(1, 1, 8, 8));
    });

    const port = openPort(16, 16);
    port.txMode = srcCopy;
    port.txFont = 12;
    const clipBefore = port.clipRgn;
    DrawPicture(pic, frame);
    expect(port.txMode).toBe(srcCopy);
    expect(port.txFont).toBe(12);
    expect(port.clipRgn).toBe(clipBefore);
  });

  it("rejects an empty or inverted dstRect", () => {
    const frame = makeRect(0, 0, 16, 16);
    const pic = recordScene(frame, () => {
      PaintRect(makeRect(0, 0, 16, 16));
    });
    const port = openPort(16, 16);
    const before = pixelsOf(port);
    DrawPicture(pic, makeRect(0, 0, 0, 16));
    DrawPicture(pic, makeRect(8, 8, 2, 2));
    expect(pixelsOf(port)).toEqual(before);
  });
});

describe("DrawPicture mapping", () => {
  it("maps rects into a 2× dstRect", () => {
    const frame = makeRect(0, 0, 16, 16);
    const r = makeRect(2, 2, 8, 10);
    const pic = recordScene(frame, () => {
      FrameRect(r);
    });

    const dst = makeRect(0, 0, 32, 32);
    const mapped = cloneRect(r);
    MapRect(mapped, frame, dst);

    const seen: Rect[] = [];
    const play = openPort(32, 32);
    play.grafProcs = {
      rectProc: (_verb: GrafVerb, rect: Rect) => {
        seen.push(cloneRect(rect));
      },
    };
    DrawPicture(pic, dst);
    expect(seen.length).toBeGreaterThanOrEqual(1);
    expect(seen[seen.length - 1]).toEqual(mapped);
  });

  it("custom grafProcs see the same verb/noun calls as direct drawing", () => {
    const frame = makeRect(0, 0, 32, 24);
    const r1 = makeRect(2, 2, 10, 12);
    const r2 = makeRect(4, 4, 8, 8);

    const pic = recordScene(frame, () => {
      FrameRect(r1);
      PaintRect(r2);
      MoveTo(0, 0);
      LineTo(5, 6);
    });

    const log: string[] = [];
    const procs: QDProcs = {
      rectProc: (verb, r) => {
        log.push(`rect ${verb} ${r.top},${r.left},${r.bottom},${r.right}`);
      },
      lineProc: (pt: Point) => {
        log.push(`line ${pt.h},${pt.v}`);
      },
    };

    const direct: string[] = [];
    const dport = openPort(32, 24);
    dport.grafProcs = {
      rectProc: (verb, r) => {
        direct.push(`rect ${verb} ${r.top},${r.left},${r.bottom},${r.right}`);
      },
      lineProc: (pt: Point) => {
        direct.push(`line ${pt.h},${pt.v}`);
      },
    };
    FrameRect(r1);
    PaintRect(r2);
    MoveTo(0, 0);
    LineTo(5, 6);

    const play = openPort(32, 24);
    play.grafProcs = procs;
    DrawPicture(pic, frame);
    expect(log).toEqual(direct);
  });
});

describe("opcode stream", () => {
  it("does not abort on $11 $01 and stops at $FF", () => {
    const frame = makeRect(0, 0, 16, 16);
    const r = makeRect(2, 2, 8, 8);
    const pic = recordScene(frame, () => {
      FrameRect(r);
    });
    expect(pic.pic._data.slice(0, 2)).toEqual([0x11, 0x01]);
    expect(pic.pic._data[pic.pic._data.length - 1]).toBe(0xff);

    const seen: number[] = [];
    const play = openPort(16, 16);
    play.grafProcs = {
      rectProc: (verb) => {
        seen.push(verb);
      },
    };
    DrawPicture(pic, frame);
    expect(seen).toEqual([0]);
  });

  it("treats unknown opcodes as NOP and continues", () => {
    const frame = makeRect(0, 0, 16, 16);
    const pic = recordScene(frame, () => {
      FrameRect(makeRect(1, 1, 7, 7));
    });
    // Splice reserved $12 after the version word.
    pic.pic._data.splice(2, 0, 0x12);
    pic.pic.picSize += 1;

    const seen: Rect[] = [];
    const play = openPort(16, 16);
    play.grafProcs = {
      rectProc: (_verb, r) => {
        seen.push(cloneRect(r));
      },
    };
    DrawPicture(pic, frame);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toEqual(makeRect(1, 1, 7, 7));
  });

  it("calls textProc for $28 with play-state numer/denom", () => {
    const frame = makeRect(0, 0, 16, 16);
    const pic: PicHandle = {
      pic: {
        picSize: 20,
        picFrame: frame,
        _data: [
          0x11, 0x01, 0x28, 0x00, 0x03, 0x00, 0x04, 0x03, 0x41, 0x42, 0x43,
          0xff,
        ],
      },
    };
    const calls: { count: number; bytes: number[]; numer: Point; denom: Point }[] =
      [];
    const play = openPort(16, 16);
    play.grafProcs = {
      textProc: (count, textAddr, numer, denom) => {
        calls.push({
          count,
          bytes: textAddr.slice(0, count),
          numer: { h: numer.h, v: numer.v },
          denom: { h: denom.h, v: denom.v },
        });
      },
    };
    DrawPicture(pic, frame);
    expect(calls).toHaveLength(1);
    expect(calls[0]!.count).toBe(3);
    expect(calls[0]!.bytes).toEqual([0x41, 0x42, 0x43]);
    expect(calls[0]!.numer).toEqual({ h: 16, v: 16 });
    expect(calls[0]!.denom).toEqual({ h: 16, v: 16 });
  });

  it("dispatches $A0 through commentProc", () => {
    const frame = makeRect(0, 0, 8, 8);
    const pic: PicHandle = {
      pic: {
        picSize: 16,
        picFrame: frame,
        _data: [0x11, 0x01, 0xa0, 0x00, 0x64, 0xff],
      },
    };
    const kinds: number[] = [];
    const play = openPort(8, 8);
    play.grafProcs = {
      commentProc: (kind) => {
        kinds.push(kind);
      },
    };
    DrawPicture(pic, frame);
    expect(kinds).toEqual([100]);
  });
});

describe("serializePicture / parsePicture", () => {
  it("round-trips PICT v1 header + opcodes", () => {
    const frame = makeRect(0, 2, 16, 18);
    const pic = recordScene(makeRect(0, 0, 32, 24), () => {
      FrameRect(makeRect(2, 2, 10, 12));
    });
    pic.pic.picFrame = frame;
    const bytes = serializePicture(pic);
    expect(bytes.length).toBe(10 + pic.pic._data.length);
    expect((bytes[0]! << 8) | bytes[1]!).toBe(10 + pic.pic._data.length);
    const back = parsePicture(bytes);
    expect(back.pic.picFrame).toEqual(frame);
    expect(back.pic._data).toEqual(pic.pic._data);
    expect(back.pic.picSize).toBe(10 + pic.pic._data.length);
  });
});

describe("DrawPicture bits", () => {
  it("replays CopyBits at 1:1", () => {
    const frame = makeRect(0, 0, 16, 16);
    const src = newBitMap(8, 8);
    for (let i = 0; i < src.baseAddr.length; i++) src.baseAddr[i] = 0xaa;
    const srcR = makeRect(0, 0, 8, 8);
    const dstR = makeRect(2, 2, 10, 10);

    const rec = openPort(16, 16);
    const handle = mustOpen(frame);
    CopyBits(src, rec.portBits, srcR, dstR, srcCopy, null);
    ClosePicture();

    const oracle = openPort(16, 16);
    CopyBits(src, oracle.portBits, srcR, dstR, srcCopy, null);

    const play = openPort(16, 16);
    DrawPicture(handle, frame);
    expect(pixelsOf(play)).toEqual(pixelsOf(oracle));
  });
});

describe("playback port defaults", () => {
  it("uses srcOr (1) for txMode during play, then restores", () => {
    const frame = makeRect(0, 0, 8, 8);
    let seenMode = -1;
    const pic: PicHandle = {
      pic: {
        picSize: 14,
        picFrame: frame,
        _data: [0x11, 0x01, 0xa0, 0x00, 0x01, 0xff],
      },
    };
    const play = openPort(8, 8);
    play.txMode = srcCopy;
    play.grafProcs = {
      commentProc: () => {
        seenMode = play.txMode;
      },
    };
    DrawPicture(pic, frame);
    expect(seenMode).toBe(srcOr);
    expect(play.txMode).toBe(srcCopy);
  });
});
