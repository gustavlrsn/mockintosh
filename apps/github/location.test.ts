import { describe, expect, it } from "vitest";
import { formatGithubLocation, parseGithubLocation } from "./location";

describe("parseGithubLocation", () => {
  it("treats an empty address as the start page", () => {
    expect(parseGithubLocation("  ")).toEqual({ kind: "home" });
  });

  it("reads owner/repo and a full GitHub URL as the code tab", () => {
    expect(parseGithubLocation("octocat/Hello-World")).toEqual({
      kind: "tree", owner: "octocat", repo: "Hello-World", ref: "", path: "",
    });
    expect(parseGithubLocation("https://github.com/octocat/Hello-World/")).toEqual({
      kind: "tree", owner: "octocat", repo: "Hello-World", ref: "", path: "",
    });
  });

  it("reads tree, blob, issues, and pull URLs", () => {
    expect(parseGithubLocation("github.com/octocat/Hello-World/tree/main/src")).toEqual({
      kind: "tree", owner: "octocat", repo: "Hello-World", ref: "main", path: "src",
    });
    expect(parseGithubLocation("https://github.com/octocat/Hello-World/blob/main/README.md")).toEqual({
      kind: "blob", owner: "octocat", repo: "Hello-World", ref: "main", path: "README.md",
    });
    expect(parseGithubLocation("octocat/Hello-World/issues")).toEqual({
      kind: "issues", owner: "octocat", repo: "Hello-World",
    });
    expect(parseGithubLocation("octocat/Hello-World/issues/7")).toEqual({
      kind: "issue", owner: "octocat", repo: "Hello-World", number: 7,
    });
    expect(parseGithubLocation("octocat/Hello-World/pulls")).toEqual({
      kind: "pulls", owner: "octocat", repo: "Hello-World",
    });
    expect(parseGithubLocation("octocat/Hello-World/pull/3")).toEqual({
      kind: "pull", owner: "octocat", repo: "Hello-World", number: 3,
    });
  });

  it("drops the query string and rejects a bare owner", () => {
    expect(parseGithubLocation("octocat/Hello-World?tab=readme")).toEqual({
      kind: "tree", owner: "octocat", repo: "Hello-World", ref: "", path: "",
    });
    expect(parseGithubLocation("octocat")).toBeNull();
    expect(parseGithubLocation("octocat/Hello-World/issues/nope")).toBeNull();
  });
});

describe("formatGithubLocation", () => {
  it("round-trips the pages the address bar can open", () => {
    const samples = [
      "github.com/octocat/Hello-World",
      "github.com/octocat/Hello-World/tree/main/src",
      "github.com/octocat/Hello-World/blob/main/README.md",
      "github.com/octocat/Hello-World/issues",
      "github.com/octocat/Hello-World/issues/7",
      "github.com/octocat/Hello-World/pulls",
      "github.com/octocat/Hello-World/pull/3",
    ];
    for (const sample of samples) {
      expect(formatGithubLocation(parseGithubLocation(sample)!)).toBe(sample);
    }
  });
});
