import {parseBuildResult, type BuildProvider} from "../../../shared/buildContract";

/** Each build owns one worker. Cancellation/timeout terminates compilation,
 * including synchronous compiler phases; no compiler runs on the UI thread. */
export const browserBuilder: BuildProvider = {
  typecheck(request, cancellation) {
    cancellation?.check();
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./worker.ts", import.meta.url), {type: "module"});
      let settled = false;
      let unsubscribe = () => {};
      const finish = (error?: Error, value?: unknown) => {
        if (settled) return;
        settled = true;
        unsubscribe();
        worker.terminate();
        if (error) reject(error);
        else resolve(Array.isArray(value) ? value as import("../../../shared/buildContract").BuildResult["diagnostics"] : []);
      };
      unsubscribe = cancellation?.subscribe(() => finish(new Error("Typecheck cancelled"))) ?? (() => {});
      worker.onmessage = event => finish(undefined, event.data?.diagnostics ?? event.data);
      worker.onerror = event => { event.preventDefault(); finish(new Error(event.message || "Typecheck worker failed")); };
      worker.postMessage({ kind: "typecheck", request });
    });
  },
  build(request, cancellation) {
    cancellation.check();
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./worker.ts", import.meta.url), {type: "module"});
      let settled = false;
      let unsubscribe = () => {};
      const finish = (error?: Error, value?: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        unsubscribe();
        worker.terminate();
        if (error) reject(error);
        else { try { resolve(parseBuildResult(value)); } catch (error) { reject(error); } }
      };
      const timer = setTimeout(() => finish(new Error("Browser build timed out after 60 seconds")), 60000);
      unsubscribe = cancellation.subscribe(() => finish(new Error("Build cancelled")));
      worker.onmessage = event => finish(undefined, event.data);
      worker.onerror = event => { event.preventDefault(); finish(new Error(event.message || "Browser compiler failed to start")); };
      worker.onmessageerror = () => finish(new Error("Invalid browser compiler response"));
      if (!settled) {
        try { worker.postMessage(request); } catch (error) { finish(error instanceof Error ? error : new Error(String(error))); }
      }
    });
  },
};
