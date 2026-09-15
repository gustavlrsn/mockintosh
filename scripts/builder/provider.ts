import {fork} from "node:child_process";
import {fileURLToPath} from "node:url";
import {mkdtemp, rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {parseBuildResult, type BuildProvider, type BuildResult} from "../../src/shared/buildContract";
/** The parent owns the workspace, including when cancellation kills the worker. */
export const localBuilder: BuildProvider = {
  async build(request, cancellation) {
    cancellation.check();
    const directory = await mkdtemp(join(tmpdir(), "mockintosh-build-"));
    try {
      cancellation.check();
      const child = fork(fileURLToPath(new URL("./worker.ts", import.meta.url)), [], {execArgv: ["--import", "tsx"], stdio: ["ignore", "ignore", "pipe", "ipc"]});
      child.stderr?.resume();
      const closed = new Promise<void>(resolve => child.once("close", () => resolve()));
      try {
        return await new Promise<BuildResult>((resolve, reject) => {
          let done = false, release = () => {};
          const timer = setTimeout(() => finish(new Error("Build exceeded 60 seconds")), 60000);
          function finish(error?: unknown, result?: unknown) {
            if (done) return;
            done = true; clearTimeout(timer); release();
            if (error) reject(error);
            else { try { resolve(parseBuildResult(result)); } catch (error) { reject(error); } }
          }
          release = cancellation.subscribe(() => finish(Object.assign(new Error("Build cancelled"), {code: "cancellation"})));
          child.once("message", result => finish(undefined, result));
          child.once("error", error => finish(error));
          child.once("exit", code => { if (!done) finish(new Error(`Compiler exited (${code})`)); });
          child.send({request, directory});
        });
      } finally { child.kill(); await closed; }
    } finally { await rm(directory, {recursive: true, force: true}); }
  },
};
