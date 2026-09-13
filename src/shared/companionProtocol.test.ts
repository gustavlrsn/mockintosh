import { describe, expect, it } from "vitest";
import { decodeHello, decodeHostRequest, decodeBrowserRequest, decodeBrowserReply, decodeHostReply, encodeHostRequest, encodeMessage } from "./companionProtocol";

describe("shared companion envelopes", () => {
  it("keeps operation payloads opaque while validating routing and boot identity", () => {
    const request = { type: "invoke" as const, id: "request", action: "action", target: "os:1", instance: "os", generation: 1, operation: "future_operation", args: { arbitrary: [1, "two"] } };
    expect(decodeHostRequest(encodeMessage(request))).toEqual(request);
    for (const replacement of [{ generation: 1.5 }, { args: [] }, { operation: null }, { caller: "spoofed" }]) {
      expect(() => decodeHostRequest(JSON.stringify({ ...request, ...replacement }))).toThrow();
    }
    expect(() => encodeHostRequest({ type: "invoke", id: "request" })).toThrow();
    expect(() => decodeBrowserRequest(encodeMessage(request))).toThrow();
  });
  it("rejects malformed streams, errors, handshakes and message directions", () => {
    const stream = { type: "stream" as const, action: "action", channel: "stdout" as const, bytes: [0, 255] };
    expect(decodeBrowserReply(encodeMessage(stream))).toEqual(stream);
    for (const replacement of [{ bytes: [256] }, { bytes: [1.5] }, { channel: "stdin" }]) {
      expect(() => decodeBrowserReply(JSON.stringify({ ...stream, ...replacement }))).toThrow();
    }
    expect(() => decodeHostReply(JSON.stringify({ id: "request", error: { message: 1 } }))).toThrow();
    expect(() => decodeHello(JSON.stringify({ type: "hello", role: "browser", token: "fixture" }))).toThrow();
    expect(() => decodeHostRequest(encodeMessage({ type: "revoke", caller: "caller" }))).toThrow();
    expect(() => decodeBrowserRequest("null")).toThrow();
  });
});
