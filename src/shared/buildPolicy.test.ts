import {describe, expect, it} from "vitest";
import {validateSources} from "./buildPolicy";
import type {BuildRequest} from "./buildContract";
const request = (text: string): BuildRequest => ({requestId: "test", sourceRevision: "one", entry: "src/index.tsx", sdkVersion: "2", files: [{path: "src/index.tsx", text}]});
describe("shared compiler policy", () => {
  it("rejects escapes, unsupported dependencies, duplicates, and oversized sources", () => {
    for (const text of ['import "node:fs"', 'import "../../escape"', 'import(foo)', 'require("./file")'])
      expect(() => validateSources(request(text))).toThrow();
    const input = request(""); const duplicate = {...input, files: [input.files[0], input.files[0]]};
    expect(() => validateSources(duplicate)).toThrow("unique");
    expect(() => validateSources(request(" ".repeat(1048577)))).toThrow("oversized");
    expect(() => validateSources(request('import "./helper"'))).not.toThrow();
  });
});
