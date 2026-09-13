import {mkdtemp, mkdir, writeFile, symlink, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join, resolve, dirname} from "node:path";
import {fileURLToPath} from "node:url";
import ts from "typescript";
import {build, version as viteVersion} from "vite";
import solid from "vite-plugin-solid";
import type {BuildRequest, BuildResult} from "../../src/shared/buildContract";
import {compilerOptions, sharedBuildImports as shared, validateSources} from "../../src/shared/buildPolicy";
const repo = fileURLToPath(new URL("../../", import.meta.url));

/** Fixed compiler configuration. Source is parsed/typechecked/bundled, never executed here. */
export async function compile(request: BuildRequest, directory?: string): Promise<BuildResult> {
  const toolchain = `typescript-${ts.version}/vite-${viteVersion}/solid-universal-v1/sdk-2`;
  const root = directory ?? await mkdtemp(join(tmpdir(), "mockintosh-build-"));
  try {
    validateSources(request);
    for (const file of request.files) {
      const destination = join(root, file.path);
      await mkdir(dirname(destination), {recursive: true});
      await writeFile(destination, file.text);
    }
    await symlink(join(repo, "node_modules"), join(root, "node_modules"), "dir");
    const program = ts.createProgram(request.files.map(file => join(root, file.path)), compilerOptions);
    const diagnostics = ts.getPreEmitDiagnostics(program).filter(d => !d.file || d.file.fileName.startsWith(root + "/src/")).map(d => {
      const location = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start) : undefined;
      return {message: ts.flattenDiagnosticMessageText(d.messageText, "\n"), ...(d.file ? {file: d.file.fileName.slice(root.length + 1)} : {}), ...(location ? {line: location.line + 1, column: location.character + 1} : {})};
    });
    if (diagnostics.length) return {toolchain, diagnostics};
    const output = await build({root, configFile: false, logLevel: "silent", publicDir: false,
      plugins: [solid({solid: {generate: "universal", moduleName: "@mockintosh/ui/renderer"}})],
      build: {write: false, minify: false, sourcemap: true, lib: {entry: join(root, request.entry), formats: ["es"], fileName: "index"},
        rollupOptions: {external: id => shared.has(id), output: {inlineDynamicImports: true}, plugins: [{
          name: "project-imports", resolveId(id, importer) {
            if (!importer || shared.has(id) || id.startsWith(root + "/") || id.startsWith(".") && resolve(dirname(importer), id).startsWith(root + "/")) return null;
            throw new Error(`Unsupported bundle dependency: ${id}`);
          },
        }]},
      },
    });
    const bundles = Array.isArray(output) ? output : [output];
    const chunk = bundles.flatMap(bundle => "output" in bundle ? bundle.output : []).find(part => part.type === "chunk");
    if (!chunk || chunk.type !== "chunk") throw new Error("Compiler produced no module");
    return {toolchain, diagnostics: [], code: chunk.code, map: chunk.map?.toString()};
  } catch (error) { return {toolchain, diagnostics: [{message: error instanceof Error ? error.message : String(error)}]}; }
  finally { await rm(root, {recursive: true, force: true}); }
}
