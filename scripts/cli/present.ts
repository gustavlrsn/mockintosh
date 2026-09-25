import { encodePackedPng } from "../../packages/agent/src/png";

export interface PresentInput {
  result: unknown;
  out?: string;
  json: boolean;
  tty: boolean;
  shell: boolean;
  hostFile: boolean;
  stdout: { write(chunk: Uint8Array | string): void };
  stderr: { write(chunk: Uint8Array | string): void };
  writeFile(path: string, data: Uint8Array): void;
}

/** Turn a trap result into terminal output. Framebuffers become PNGs. */
export function present(input: PresentInput): number {
  const { result, stdout, stderr } = input;
  if (input.shell && !input.json && isShellOutcome(result)) {
    if (result.truncated.stdout || result.truncated.stderr) stderr.write("[output truncated]\n");
    return result.exitCode;
  }
  const payload = bytePayload(result);
  if (input.hostFile && payload && input.out) {
    input.writeFile(input.out, payload.bytes);
    stdout.write(JSON.stringify({ ...payload.summary, path: input.out }) + "\n");
    return 0;
  }
  if (input.hostFile && payload && !input.json && !input.tty) {
    stdout.write(payload.bytes);
    return 0;
  }
  if (input.hostFile && payload && !input.json) {
    stdout.write(JSON.stringify(payload.summary) + "\n");
    stderr.write("Pass --out <file> to save the bytes.\n");
    return 0;
  }
  stdout.write(JSON.stringify(result, null, 2) + "\n");
  return 0;
}

function isShellOutcome(result: unknown): result is { exitCode: number; truncated: { stdout: boolean; stderr: boolean } } {
  if (!result || typeof result !== "object") return false;
  const value = result as Record<string, unknown>;
  const truncated = value.truncated as Record<string, unknown> | undefined;
  return typeof value.exitCode === "number" && !!truncated && typeof truncated.stdout === "boolean";
}

function bytePayload(result: unknown): { bytes: Uint8Array; summary: Record<string, unknown> } | undefined {
  if (!result || typeof result !== "object") return undefined;
  const value = result as Record<string, unknown>;
  if (!Array.isArray(value.bytes) || !value.bytes.every(byte => typeof byte === "number")) return undefined;
  const raw = new Uint8Array(value.bytes as number[]);
  const frame = typeof value.width === "number" && typeof value.height === "number" && typeof value.rowBytes === "number";
  const bytes = frame
    ? encodePackedPng({ width: value.width as number, height: value.height as number, rowBytes: value.rowBytes as number, bytes: raw })
    : raw;
  const { bytes: _bytes, png: _png, ...rest } = value;
  return { bytes, summary: { ...rest, byteLength: raw.length } };
}
