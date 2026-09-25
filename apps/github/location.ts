/** A place on github.com that the app can show. */
export type GithubLocation =
  | { kind: "home" }
  | { kind: "tree"; owner: string; repo: string; ref: string; path: string }
  | { kind: "blob"; owner: string; repo: string; ref: string; path: string }
  | { kind: "issues"; owner: string; repo: string }
  | { kind: "issue"; owner: string; repo: string; number: number }
  | { kind: "pulls"; owner: string; repo: string }
  | { kind: "pull"; owner: string; repo: string; number: number };

const NAME = /^[\w.-]+$/;

/** Turn an address-bar string into a location. Empty input is the start page. */
export function parseGithubLocation(raw: string): GithubLocation | null {
  let text = raw.trim();
  if (!text) return { kind: "home" };
  text = text.replace(/[?#].*$/, "").replace(/\/+$/, "");
  text = text.replace(/^https?:\/\//i, "").replace(/^(?:www\.)?github\.com\//i, "").replace(/^\/+/, "");
  const parts = text.split("/").filter((part) => part.length > 0);
  if (parts.length < 2) return null;
  const [owner, repo, ...rest] = parts;
  if (!NAME.test(owner) || !NAME.test(repo)) return null;
  if (rest.length === 0) return { kind: "tree", owner, repo, ref: "", path: "" };

  const [head, second, ...tail] = rest;
  if (head === "issues") {
    if (rest.length === 1) return { kind: "issues", owner, repo };
    const number = issueNumber(second);
    return number === null || tail.length > 0 ? null : { kind: "issue", owner, repo, number };
  }
  if (head === "pulls") return rest.length === 1 ? { kind: "pulls", owner, repo } : null;
  if (head === "pull") {
    const number = issueNumber(second);
    return number === null ? null : { kind: "pull", owner, repo, number };
  }
  if (head === "tree" || head === "blob") {
    if (!second) return { kind: "tree", owner, repo, ref: "", path: "" };
    const path = tail.map(decodeSegment).join("/");
    return { kind: head, owner, repo, ref: decodeSegment(second), path };
  }
  return null;
}

/** Address-bar text for a location, without a scheme. */
export function formatGithubLocation(location: GithubLocation): string {
  if (location.kind === "home") return "";
  const root = `github.com/${location.owner}/${location.repo}`;
  if (location.kind === "issues") return `${root}/issues`;
  if (location.kind === "issue") return `${root}/issues/${location.number}`;
  if (location.kind === "pulls") return `${root}/pulls`;
  if (location.kind === "pull") return `${root}/pull/${location.number}`;
  if (!location.ref && !location.path) return root;
  const ref = encodeSegment(location.ref || "HEAD");
  const path = location.path.split("/").filter(Boolean).map(encodeSegment).join("/");
  const suffix = path ? `${ref}/${path}` : ref;
  return `${root}/${location.kind}/${suffix}`;
}

export function repoOf(location: GithubLocation): { owner: string; repo: string } | null {
  return location.kind === "home" ? null : { owner: location.owner, repo: location.repo };
}

function issueNumber(segment: string | undefined): number | null {
  if (!segment || !/^\d+$/.test(segment)) return null;
  const number = Number(segment);
  return number > 0 ? number : null;
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function encodeSegment(segment: string): string {
  return encodeURIComponent(segment).replace(/%2F/gi, "/");
}
