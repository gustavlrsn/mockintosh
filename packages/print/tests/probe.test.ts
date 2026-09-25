import { describe, it, expect } from "vitest";
import { describeProbeResults, probeMasung, probePrinterId, probeUserSettings } from "../src/probe";
import { setUserSettingBytes, writeUserSetting } from "../src/userSettings";
import type { PrinterTransport } from "../src/transport";

/** Replies are looked up by the hex of the command written just before. */
function fakeTransport(replies: Record<string, number[][]>) {
  const writes: number[][] = [];
  let queue: number[][] = [];
  const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(" ");
  const transport: PrinterTransport = {
    connected: true,
    deviceName: "Fake",
    connect: async () => {},
    choose: async () => {},
    forget: async () => {},
    disconnect: async () => {},
    write: async (bytes) => {
      writes.push(Array.from(bytes));
      queue = [...(replies[hex(bytes)] ?? [])];
    },
    read: async () => {
      const chunk = queue.shift();
      return chunk ? Uint8Array.from(chunk) : null;
    },
  };
  return { transport, writes };
}

describe("probePrinterId", () => {
  it("collects single-byte and NUL-terminated replies, split or not", async () => {
    const { transport } = fakeTransport({
      "1d 49 01": [[0x20]],
      "1d 49 43": [[0x5f, 0x4d, 0x53], [0x2d, 0x31, 0x00]],
    });
    const lines = describeProbeResults(await probePrinterId(transport));
    expect(lines).toContain("GS I 1 (model ID): 20");
    expect(lines).toContain('GS I 67 (model): 5f 4d 53 2d 31 00 "_MS-1"');
    expect(lines).toContain("GS I 2 (type ID): no reply");
  });
});

describe("probeMasung", () => {
  it("sends only complete read commands, starting with Masung's own", async () => {
    const { transport, writes } = fakeTransport({ "13 76": [[0x4d, 0x53, 0x00]], "1b cc 01": [[0x00]] });
    const lines = describeProbeResults(await probeMasung(transport));
    expect(writes.slice(0, 2)).toEqual([[0x13, 0x76], [0x1b, 0xcc, 0x01]]);
    expect(writes.some((w) => w[0] === 0x13 && w[1] === 0x74)).toBe(false);
    expect(lines).toContain('DC3 v (name): 4d 53 00 "MS"');
    expect(lines).toContain("ESC CC 1 (sensors): 00");
    expect(lines).toContain("GS r 1 (paper): no reply");
  });
});

describe("probeUserSettings", () => {
  it("enters settings mode, reads density and speed, and always leaves", async () => {
    const { transport, writes } = fakeTransport({
      "1d 28 45 02 00 06 05": [[0x37, 0x27, 0x05, 0x1f, 0x30, 0x00]],
    });
    const results = await probeUserSettings(transport);
    expect(writes[0]).toEqual([0x1d, 0x28, 0x45, 0x03, 0x00, 0x01, 0x49, 0x4e]);
    expect(writes.at(-1)).toEqual([0x1d, 0x28, 0x45, 0x04, 0x00, 0x02, 0x4f, 0x55, 0x54]);
    expect(describeProbeResults(results, { collapseSilent: true })).toEqual([
      'GS ( E 6 a=5 (density): 37 27 05 1f 30 00 "7\'|0"',
      "No reply to 20 of 21 queries.",
    ]);
  });

  it("stops a string reply at CR LF", async () => {
    const { transport } = fakeTransport({ "1d 49 42": [[0x4d, 0x41, 0x0d, 0x0a], [0x58]] });
    const lines = describeProbeResults(await probePrinterId(transport));
    expect(lines).toContain('GS I 66 (maker): 4d 41 0d 0a "MA"');
  });

  it("refuses a transport that can't read", async () => {
    const { transport } = fakeTransport({});
    delete (transport as { read?: unknown }).read;
    await expect(probeUserSettings(transport)).rejects.toThrow("can't read");
  });
});

describe("writeUserSetting", () => {
  it("encodes negative values as 16-bit two's complement", () => {
    expect(Array.from(setUserSettingBytes(5, -3))).toEqual([0x1d, 0x28, 0x45, 0x04, 0x00, 0x05, 0x05, 0xfd, 0xff]);
    expect(Array.from(setUserSettingBytes(5, 6))).toEqual([0x1d, 0x28, 0x45, 0x04, 0x00, 0x05, 0x05, 0x06, 0x00]);
  });

  it("sets the value only after the printer acknowledges settings mode, then waits for it to restart", async () => {
    const { transport, writes } = fakeTransport({
      "1d 28 45 03 00 01 49 4e": [[0x37, 0x20, 0x00]],
      "10 04 01": [[0x12]],
    });
    await writeUserSetting(transport, 5, 3);
    expect(writes.slice(0, 3)).toEqual([
      [0x1d, 0x28, 0x45, 0x03, 0x00, 0x01, 0x49, 0x4e],
      [0x1d, 0x28, 0x45, 0x04, 0x00, 0x05, 0x05, 0x03, 0x00],
      [0x1d, 0x28, 0x45, 0x04, 0x00, 0x02, 0x4f, 0x55, 0x54],
    ]);
    expect(writes.at(-1)).toEqual([0x10, 0x04, 0x01]);
  });

  it("changes nothing when settings mode isn't acknowledged", async () => {
    const { transport, writes } = fakeTransport({});
    await expect(writeUserSetting(transport, 5, 3)).rejects.toThrow("nothing was changed");
    expect(writes.some((w) => w[5] === 0x05)).toBe(false);
  });
});
