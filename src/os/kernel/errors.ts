export type ServiceErrorCode =
  | "missing-resource"
  | "permission"
  | "unsupported-operation"
  | "stale-reference"
  | "conflict"
  | "disconnect"
  | "cancellation"
  | "invalid-argument"
  | "ambiguity";

export class ServiceError extends Error {
  constructor(readonly code: ServiceErrorCode, message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

export function normalizePath(path: string): string {
  if (!path.startsWith("/") || path.includes("\0")) throw new ServiceError("invalid-argument", "Expected an absolute path");
  const parts: string[] = [];
  for (const part of path.split("/")) {
    if (part === "..") parts.pop();
    else if (part && part !== ".") parts.push(part);
  }
  return "/" + parts.join("/");
}
