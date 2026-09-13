import {transform, registerPreset} from "@babel/standalone";
import {version} from "@babel/standalone/package.json";
import solid from "babel-preset-solid";
import {rollup, VERSION} from "@rollup/browser";
import {relativeImport, sharedBuildImports, validateSources} from "../../../shared/buildPolicy";
import type {BuildRequest, BuildResult} from "../../../shared/buildContract";
import ts from "typescript";
import {typecheck} from "./typecheck";
registerPreset("mockintosh-solid", solid);

/** Source is checked and transformed, never evaluated in the compiler worker. */
export async function compile(request: BuildRequest): Promise<BuildResult> {
  const toolchain = `browser-typescript-${ts.version}/babel-${version}/rollup-${VERSION}/solid-universal-v1/sdk-2`;
  try {
    validateSources(request);
    const diagnostics = typecheck(request);
    if (diagnostics.length) return {toolchain, diagnostics};
    const files = new Map(request.files.map(file => [file.path, file.text]));
    const bundle = await rollup({input: request.entry, external: id => sharedBuildImports.has(id), plugins: [{
      name: "submitted-project",
      resolveId(id, importer) {
        const path = importer ? relativeImport(importer, id) : id;
        const candidates = [path, ...[".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", "/index.js", "/index.jsx"].map(ext => path + ext)];
        // TypeScript permits a .js specifier to refer to a .ts source.
        if (/\.jsx?$/.test(path)) candidates.push(path.replace(/\.jsx?$/, ".ts"), path.replace(/\.jsx?$/, ".tsx"));
        const found = candidates.find(candidate => files.has(candidate));
        if (!found) throw new Error(`Missing project module: ${id}`);
        return found;
      },
      load: id => files.get(id),
      transform(code, id) {
        const result = transform(code, {filename: id, sourceMaps: true, presets: [
          ["mockintosh-solid", {generate: "universal", moduleName: "@mockintosh/ui/renderer"}],
          ["typescript", {allExtensions: true, isTSX: /[jt]sx$/.test(id)}],
        ]});
        return {code: result.code!, map: result.map};
      },
    }]});
    try {
      const {output} = await bundle.generate({format: "es", inlineDynamicImports: true, sourcemap: true});
      const chunk = output.find(item => item.type === "chunk");
      if (!chunk) throw new Error("Compiler produced no module");
      return {toolchain, diagnostics: [], code: chunk.code, map: chunk.map?.toString()};
    } finally { await bundle.close(); }
  } catch (error) {
    return {toolchain, diagnostics: [{message: error instanceof Error ? error.message : String(error)}]};
  }
}
