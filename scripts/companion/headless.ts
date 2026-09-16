import {localBuilder} from "../builder/provider";
import type {BootedOS} from "../../src/os/boot";
import type {FSBackend} from "@mockintosh/fs";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
/** Vite transforms universal Solid JSX, isolated in this CLI process. */
export async function withHeadless<T>(work: (os: BootedOS) => Promise<T>, storage?: FSBackend): Promise<T> {
  const artifacts = new Map<string, string>();
  const vite = await createServer({
    plugins: [{name: "headless-artifacts", resolveId(id) { if (id.startsWith("virtual:mockintosh-app/")) return "\0" + id; }, load(id) { return artifacts.get(id); }}],
    server: {
      middlewareMode: true,
      hmr: false,
      ws: false,
      watch: null
    },
    // A headless screen still needs reactive Solid, not its SSR no-effect runtime.
    resolve: { alias: [
      { find: /^solid-js$/, replacement: fileURLToPath(new URL("../../node_modules/solid-js/dist/solid.js", import.meta.url)) },
    ] },
    appType: "custom",
    logLevel: "error",
    ssr: {
      noExternal: ["solid-js", "@mockintosh/ui", "@mockintosh/fs", "@mockintosh/sdk", "@mockintosh/quickdraw"]
    }
  });
  let os: any, timer: ReturnType<typeof setInterval> | undefined;
  try {
    const runtime = await vite.ssrLoadModule("/scripts/companion/headlessRuntime.ts");
    const boot = await runtime.create({...(storage ? {storage} : {}), builder: localBuilder,
      loadArtifact: async (code: string, id: string) => {
        const name = `virtual:mockintosh-app/${id}`;
        artifacts.set("\0" + name, code);
        return vite.ssrLoadModule(name);
      },
    });
    os = boot.os;
    timer = setInterval(() => boot.platform.tick(16), 16);
    return await work(os);
  } finally {
    if (timer) clearInterval(timer);
    os?.shutdown();
    await vite.close();
  }
}

export async function runHeadless(command: string) {
  return withHeadless(async os => {
    const caller = os.kernel.createSession();
    return await os.kernel.invoke(caller, "run_shell", {command}) as import("../../src/os/shell").ShellOutcome;
  });
}
