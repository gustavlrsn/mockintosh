import { describe, expect, it } from "vitest";
import {
  ClipRect,
  ClosePicture,
  ClosePoly,
  CloseRgn,
  ForeColor,
  FrameRect,
  HidePen,
  InitGraf,
  LineTo,
  MoveTo,
  NewRgn,
  OpenPicture,
  OpenPoly,
  OpenPort,
  OpenRgn,
  PaintPoly,
  PaintRect,
  PaintRgn,
  redColor,
  type GrafPort,
  type PicHandle,
} from "../src";
import { makeRect, newBitMap, pixelsFromBitMap } from "../src/bits";

function openPort(w = 32, h = 24): GrafPort {
  InitGraf(newBitMap(w, h));
  const port = {} as GrafPort;
  OpenPort(port);
  return port;
}

function hex(data: number[]): string {
  return data.map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

function mustOpen(frame = makeRect(0, 0, 32, 24)): PicHandle {
  const pic = OpenPicture(frame);
  if (!pic) throw new Error("OpenPicture returned nil");
  return pic;
}

describe("picture recording", () => {
  it("OpenPicture writes version, HidePen; ClosePicture writes $FF and ShowPen", () => {
    const port = openPort();
    const vis = port.pnVis;
    const pic = mustOpen(makeRect(0, 0, 16, 16));
    expect(port.pnVis).toBe(vis - 1);
    expect(pic.pic._data.slice(0, 2)).toEqual([0x11, 0x01]);
    expect(OpenPicture(makeRect(0, 0, 8, 8))).toBeNull();
    ClosePicture();
    expect(port.picSave).toBeNull();
    expect(port.pnVis).toBe(vis);
    expect(pic.pic._data[pic.pic._data.length - 1]).toBe(0xff);
    expect(pic.pic.picSize).toBe(10 + pic.pic._data.length);
  });

  it("CheckPic emits $0E on ForeColor and $01 on clip change", () => {
    const port = openPort();
    const pic = mustOpen();
    ForeColor(redColor);
    FrameRect(makeRect(2, 2, 10, 12));
    expect(pic.pic._data).toContain(0x0e);
    const fgAt = pic.pic._data.indexOf(0x0e);
    expect(pic.pic._data.slice(fgAt, fgAt + 5)).toEqual([
      0x0e, 0x00, 0x00, 0x00, redColor,
    ]);
    expect(pic.pic._data).toContain(0x01);
    ClipRect(makeRect(1, 1, 20, 20));
    FrameRect(makeRect(3, 3, 7, 7));
    const clips = pic.pic._data.filter((b) => b === 0x01);
    expect(clips.length).toBeGreaterThanOrEqual(2);
    ClosePicture();
    expect(port.picSave).toBeNull();
  });

  it("pnVis < -1 records nothing beyond the version word", () => {
    openPort();
    const pic = mustOpen();
    HidePen();
    const n = pic.pic._data.length;
    expect(n).toBe(2);
    ForeColor(redColor);
    FrameRect(makeRect(0, 0, 8, 8));
    LineTo(4, 4);
    expect(pic.pic._data.length).toBe(n);
    ClosePicture();
    expect(pic.pic._data[pic.pic._data.length - 1]).toBe(0xff);
  });

  it("FrameRect writes $30 + rect, then $38 for the same rect", () => {
    openPort();
    const pic = mustOpen();
    const r = makeRect(2, 2, 10, 12);
    FrameRect(r);
    FrameRect(r);
    const data = pic.pic._data;
    const i30 = data.indexOf(0x30);
    expect(i30).toBeGreaterThanOrEqual(0);
    expect(data.slice(i30, i30 + 9)).toEqual([
      0x30, 0x00, 0x02, 0x00, 0x02, 0x00, 0x0a, 0x00, 0x0c,
    ]);
    expect(data.slice(i30 + 9).includes(0x38)).toBe(true);
    ClosePicture();
  });

  it("LineTo from the snapshot origin emits a short line-from", () => {
    openPort();
    MoveTo(0, 0);
    const pic = mustOpen();
    LineTo(5, 6);
    expect(hex(pic.pic._data)).toContain("23 05 06");
    ClosePicture();
  });
});

describe("rgnSave / polySave", () => {
  it("OpenRgn; FrameRect; CloseRgn; PaintRgn matches PaintRect", () => {
    const a = openPort(16, 16);
    const r = makeRect(2, 3, 11, 9);
    const rgn = NewRgn();
    OpenRgn();
    FrameRect(r);
    CloseRgn(rgn);
    PaintRgn(rgn);
    const paintedRgn = Uint8Array.from(pixelsFromBitMap(a.portBits));

    const b = openPort(16, 16);
    PaintRect(r);
    const paintedRect = pixelsFromBitMap(b.portBits);
    expect(Array.from(paintedRgn)).toEqual(Array.from(paintedRect));
  });

  it("PaintPoly of a closed rectangle matches PaintRect", () => {
    const a = openPort(16, 16);
    const poly = OpenPoly();
    MoveTo(2, 2);
    LineTo(10, 2);
    LineTo(10, 8);
    LineTo(2, 8);
    LineTo(2, 2);
    ClosePoly();
    PaintPoly(poly);
    const paintedPoly = Uint8Array.from(pixelsFromBitMap(a.portBits));

    const b = openPort(16, 16);
    PaintRect(makeRect(2, 2, 8, 10));
    expect(Array.from(paintedPoly)).toEqual(
      Array.from(pixelsFromBitMap(b.portBits))
    );
  });
});
