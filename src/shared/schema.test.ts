import { describe, expect, it } from "vitest";
import { parse, preview, validate, ValidationError, integer, object, string } from "./schema";
import { parseBuildResult } from "./buildContract";

const job = object({ id: string, count: integer }, ["id"]);

describe("schema validation messages", () => {
  it("names the path, expected type, and received value", () => {
    expect(() => validate(string, 1, "arguments.text")).toThrow(ValidationError);
    expect(() => validate(string, 1, "arguments.text")).toThrow(/arguments\.text: expected string, got 1/);
  });

  it("names missing required keys and unexpected properties", () => {
    expect(() => parse(job, {})).toThrow(/value: missing required id/);
    expect(() => parse(job, { id: "a", extra: true })).toThrow(
      /unexpected property extra, got true; allowed: id, count/,
    );
  });

  it("names enum mismatches", () => {
    expect(() => validate({ enum: ["building", "failed"] }, "nope", "state")).toThrow(
      /state: expected one of "building", "failed", got "nope"/
    );
  });

  it("previews objects without throwing", () => {
    expect(preview({ toolchain: "browser", diagnostics: [] })).toContain("toolchain");
    expect(preview({ x: 1 }, 4).endsWith("…")).toBe(true);
  });
});

describe("parseBuildResult", () => {
  it("keeps the schema path and payload instead of Invalid value", () => {
    expect(() => parseBuildResult({ diagnostics: [] })).toThrow(ValidationError);
    expect(() => parseBuildResult({ diagnostics: [] })).toThrow(/Compiler result failed schema/);
    expect(() => parseBuildResult({ diagnostics: [] })).toThrow(/missing required toolchain/);
    expect(() => parseBuildResult({ diagnostics: [] })).toThrow(/Payload: \{/);
    expect(() => parseBuildResult({ diagnostics: [] })).not.toThrow(/Invalid value$/);
  });

  it("accepts a well-formed compiler success", () => {
    expect(parseBuildResult({ toolchain: "t", diagnostics: [], code: "export default 1" })).toMatchObject({
      toolchain: "t",
      code: "export default 1",
    });
  });
});
