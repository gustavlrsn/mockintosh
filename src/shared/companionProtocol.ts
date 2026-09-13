import {buildRequest, buildResult} from "./buildContract";
import * as s from "./schema";

/** The loopback wire contract is shared by all three peers. Operation payloads
 * remain unknown here: their selected boot's registry owns their validation. */
const record = { type: "object", additionalProperties: {} } as const;
const error = s.object({ code: s.string, message: s.string });
export type WireError = s.Value<typeof error>;
const action = { action: s.string };
const boot = { instance: s.string, generation: s.integer };
const call = { ...action, ...boot, operation: s.string, args: record };
const channel = { enum: ["stdout", "stderr"] } as const;
const contract = s.object({
  name: s.string, description: s.string,
  inputSchema: s.object({ type: { enum: ["object"] }, properties: record, required: s.array(s.string), additionalProperties: { enum: [false] } }),
  resultSchema: record,
});
export const liveSession = s.object({ session: s.string, ...boot, operations: s.array(contract) });
export type LiveSession = s.Value<typeof liveSession>;
const hello = {
  anyOf: [
    s.object({ type: { enum: ["hello"] }, role: { enum: ["host"] }, token: s.string }),
    s.object({ type: { enum: ["hello"] }, role: { enum: ["browser"] }, token: s.string, ...boot, operations: s.array(contract) }),
  ]
} as const;
const hostRequest = {
  anyOf: [
    s.object({ type: { enum: ["list"] }, id: s.string }),
    s.object({ type: { enum: ["outcome", "cancel"] }, id: s.string, ...action }),
    s.object({ type: { enum: ["invoke"] }, id: s.string, target: s.string, ...call }),
  ]
} as const;
const browserRequest = {
  anyOf: [
    s.object({type: {enum: ["build_result"]}, id: s.string, result: buildResult, error}, ["type", "id"]),
    s.object({ type: { enum: ["invoke"] }, caller: s.string, ...call }),
    s.object({ type: { enum: ["cancel", "reconcile"] }, ...action }),
    s.object({ type: { enum: ["revoke"] }, caller: s.string }),
    s.object({ type: { enum: ["ready"] }, id: s.string }),
  ]
} as const;
const browserReply = {
  anyOf: [
    s.object({type: {enum: ["build_request"]}, id: s.string, request: buildRequest}),
    s.object({type: {enum: ["build_cancel"]}, id: s.string}),
    s.object({ type: { enum: ["result"] }, ...action, result: {}, error }, ["type", "action"]),
    s.object({ type: { enum: ["stream"] }, ...action, channel, bytes: s.bytes }),
  ]
} as const;
const hostReply = {
  anyOf: [
    s.object({ type: { enum: ["ready"] }, id: s.string }),
    s.object({ type: { enum: ["stream"] }, id: s.string, channel, bytes: s.bytes }),
    s.object({ id: s.string, ...action, result: {}, error }, ["id"]),
  ]
} as const;

export const decodeHello = (text: string) => s.parse(hello, JSON.parse(text));
export const decodeHostRequest = (text: string) => s.parse(hostRequest, JSON.parse(text));
export const decodeBrowserRequest = (text: string) => s.parse(browserRequest, JSON.parse(text));
export const decodeBrowserReply = (text: string) => s.parse(browserReply, JSON.parse(text));
export const decodeHostReply = (text: string) => s.parse(hostReply, JSON.parse(text));
export type BrowserReply = s.Value<typeof browserReply>;
export type HostRequest = s.Value<typeof hostRequest>;
export type BrowserRequest = s.Value<typeof browserRequest>;
export type Hello = s.Value<typeof hello>;
export type HostReply = s.Value<typeof hostReply>;

/** Outbound peers also compile against the shared envelopes. */
export type WireMessage = Hello | HostRequest | BrowserRequest | BrowserReply | HostReply;
export const encodeMessage = (message: WireMessage): string => JSON.stringify(message);
/** The client's dynamic request method validates before allocating pending work. */
export const encodeHostRequest = (value: unknown): string => JSON.stringify(s.parse(hostRequest, value));
