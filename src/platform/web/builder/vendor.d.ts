declare module "@solidjs/compiler-wasm32-wasi" {
  export function transform(
    code: string,
    options?: {
      filename?: string;
      generate?: "dom" | "ssr" | "universal" | "dynamic";
      moduleName?: string;
      sourceMap?: boolean;
    } | null,
  ): {code: string; map?: string | null};
}
