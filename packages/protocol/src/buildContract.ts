import * as s from "./schema";
export const buildRequest = s.object({
  requestId: s.string, sourceRevision: s.string, entry: s.string, sdkVersion: {enum: ["2"]},
  files: s.array(s.object({path: s.string, text: s.string})),
});
export const diagnostic = s.object({message: s.string, file: s.string, line: s.integer, column: s.integer}, ["message"]);
export const buildResult = s.object({code: s.string, map: s.string, toolchain: s.string, diagnostics: s.array(diagnostic)}, ["toolchain", "diagnostics"]);
export type BuildRequest = s.Value<typeof buildRequest>;
export type BuildResult = s.Value<typeof buildResult>;

/** Parse a compiler payload; on failure keep the schema path and a payload preview. */
export function parseBuildResult(value: unknown): BuildResult {
  try {
    return s.parse(buildResult, value);
  } catch (error) {
    const why = error instanceof Error ? error.message : String(error);
    throw new s.ValidationError(`Compiler result failed schema (${why}). Payload: ${s.preview(value)}`);
  }
}
/** Provider cancellation is cooperative; host adapters may terminate their compiler worker. */
export interface BuildCancellation {
  check(): void;
  subscribe(cleanup: () => void): () => void;
}
export interface BuildProvider {
  build(request: BuildRequest, cancellation: BuildCancellation): Promise<BuildResult>;
  /** Fast typecheck without bundling. */
  typecheck?(request: BuildRequest, cancellation?: BuildCancellation): Promise<BuildResult["diagnostics"]>;
}
export function projectPath(path: string): boolean {
  return /^[\w./-]+$/.test(path) && !path.startsWith("/") && !path.split("/").some(part => !part || part === "." || part === ".." || part === "node_modules");
}
