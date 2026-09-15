import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/schema";
import { formatToolError } from "./execute";

describe("formatToolError", () => {
  it("surfaces ValidationError like a kernel invalid-argument", () => {
    const error = new ValidationError("arguments.id: expected string, got 12", "arguments.id");
    expect(JSON.parse(formatToolError(error))).toEqual({
      error: "invalid-argument",
      message: "arguments.id: expected string, got 12",
    });
  });

  it("keeps structured error codes", () => {
    expect(JSON.parse(formatToolError(Object.assign(new Error("No build"), { code: "missing-resource" })))).toEqual({
      error: "missing-resource",
      message: "No build",
    });
  });
});
