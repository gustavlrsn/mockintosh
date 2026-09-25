import { describe, expect, it } from "vitest";
import { parseCall, parseInvocation, UsageError } from "./args";
import type { OperationContract } from "./contract";
import { string, boolean, integer, array, object } from "../../src/shared/schema";

const bytes = array({ type: "integer", minimum: 0, maximum: 255 });

function operation(properties: OperationContract["inputSchema"]["properties"], required: string[]): OperationContract {
  return {
    name: "sample", description: "Sample", resultSchema: { type: "null" },
    inputSchema: { type: "object", properties, required, additionalProperties: false },
  };
}

const readFile = (path: string) => new Uint8Array(Buffer.from(path));

describe("parseInvocation", () => {
  it("keeps trap flags behind the command", () => {
    expect(parseInvocation(["--headless", "--timeout", "1000", "list", "/disk", "--recursive"])).toMatchObject({
      headless: true, timeout: 1000, command: "list", commandArgs: ["/disk", "--recursive"],
    });
  });

  it("refuses both targets", () => {
    expect(() => parseInvocation(["--headless", "--connect", "boot"])).toThrow(UsageError);
  });
});

describe("parseCall", () => {
  const list = operation({ path: string, recursive: boolean }, ["path"]);
  const write = operation({ path: string, body: string, expectedRevision: integer }, ["path", "body"]);

  it("fills required text in schema order and lets a boolean flag follow", () => {
    expect(parseCall(list, ["/disk", "--recursive"], readFile).args).toEqual({ path: "/disk", recursive: true });
  });

  it("turns --no-name off", () => {
    expect(parseCall(list, ["--path", "/disk", "--no-recursive"], readFile).args).toEqual({ path: "/disk", recursive: false });
  });

  it("reads a byte file and repeats array flags", () => {
    const op = operation({ path: string, bytes, tags: array(string) }, ["path", "bytes"]);
    expect(parseCall(op, ["/disk/a", "--bytes", "@hi", "--tags", "one", "--tags", "two"], readFile).args).toEqual({
      path: "/disk/a", bytes: [...Buffer.from("hi")], tags: ["one", "two"],
    });
  });

  it("rejects an unknown flag and a missing argument", () => {
    expect(() => parseCall(list, ["--nope"], readFile)).toThrow(/unknown flag/);
    expect(() => parseCall(write, ["/disk/a"], readFile)).toThrow(/missing required body/);
  });

  it("keeps --out and --help out of the trap arguments", () => {
    const call = parseCall(list, ["/disk", "--out", "shot.png", "--help"], readFile);
    expect(call.args).toEqual({ path: "/disk" });
    expect(call.out).toBe("shot.png");
    expect(call.help).toBe(true);
  });

  it("accepts an enum and a JSON object", () => {
    const op = operation({
      kind: { enum: ["checker", "white"] },
      point: object({ x: integer, y: integer }),
    }, ["kind"]);
    expect(parseCall(op, ["checker", "--point", "{\"x\":1,\"y\":2}"], readFile).args).toEqual({
      kind: "checker", point: { x: 1, y: 2 },
    });
  });
});
