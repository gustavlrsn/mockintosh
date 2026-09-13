/** Real stdio MCP exercise of the visible Source Editor and companion compiler. */
import {execFileSync} from "node:child_process";
import {readFile, writeFile, mkdir} from "node:fs/promises";
import {strict as assert} from "node:assert";
import {Client} from "@modelcontextprotocol/sdk/client/index.js";
import {StdioClientTransport} from "@modelcontextprotocol/sdk/client/stdio.js";
import {counterSource} from "../../src/os/projects";
const config = JSON.parse(await readFile(process.env.MOCKINTOSH_DEMO_CONFIG ?? "/tmp/mockintosh-m2-connection.json", "utf8"));
const port = process.env.MOCKINTOSH_PORT ?? "4320", tab = process.env.MOCKINTOSH_DEMO_TAB ?? "1";
const browser = (...args: string[]) => execFileSync("terminal-browser", ["action", "--tab", tab, "--", ...args], {stdio: "pipe"});
if (process.argv.includes("--pair")) {
  try {
    browser("eval", "document.querySelector('details').open = true");
    browser("fill", '[aria-label="Companion port"]', port);
    browser("fill", '[aria-label="Companion token"]', config.token);
    browser("click", "button:first-of-type");
  } catch { throw new Error("Pairing failed; inspect the companion panel"); }
  await new Promise(resolve => setTimeout(resolve, 300));
}
const transport = new StdioClientTransport({command: process.execPath, args: ["--import", "tsx", "scripts/companion/mcp.ts"], env: {...process.env, MOCKINTOSH_TOKEN: config.token, MOCKINTOSH_URL: `ws://127.0.0.1:${port}`} as Record<string, string>, stderr: "pipe"});
const client = new Client({name: "mockintosh-m2-demo", version: "1"});
await client.connect(transport);
async function call(name: string, args: Record<string, unknown> = {}) {
  const reply: any = await client.callTool({name, arguments: args});
  if (reply.isError) throw new Error(JSON.stringify(reply.content));
  if (name === "screenshot") return reply.content[0].data;
  const value = JSON.parse(reply.content.find((item: any) => item.type === "text").text);
  return value.result ?? value;
}
try {
  const sessions = await call("sessions");
  assert.equal(sessions.length, 1);
  await call("select_session", {session: sessions[0].session});
  const evidence = "/tmp/mockintosh-m2-evidence";
  await mkdir(evidence, {recursive: true});
  if (process.argv.includes("--after")) {
    const saved = JSON.parse(await readFile(evidence + "/before.json", "utf8"));
    assert.notEqual(sessions[0].session, saved.session);
    await call("open", {app: saved.id});
    await call("click", {name: "counter-increment"});
    assert.equal((await call("inspect")).find((n: any) => n.name === "counter-value").text, "1");
    await writeFile(evidence + "/reloaded.png", await call("screenshot"), "base64");
    console.log("PASS: restored app reopened after browser reload with persisted code.");
  } else {
    const id = "m2_counter_" + Date.now().toString(36), path = `/disk/Applications/${id}.app`;
    await call("project_create", {path, id, title: "M2 Counter"});
    const first = await call("run_shell", {command: `build --run ${path}`});
    assert.equal(first.exitCode, 0, first.stderr);
    await call("click", {name: "counter-increment"});
    assert.equal((await call("inspect")).find((n: any) => n.name === "counter-value").text, "1");
    await call("source_open", {path});
    const editor = (await call("windows")).find((w: any) => w.app === "source_editor" && w.active);
    await call("activate", {window: editor.id});
    for (let i = 0; i < 50; i++) {
      if ((await call("inspect", {window: editor.id})).find((n: any) => n.name === "source-code")?.value) break;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    await call("click", {name: "source-code", window: editor.id});
    await call("key", {key: "a", meta: true});
    await call("type", {name: "source-code", window: editor.id, text: counterSource(id, "M2 Counter").replace("count() + 1", "count() + 5")});
    await writeFile(evidence + "/editor.png", await call("screenshot"), "base64");
    await call("click", {name: "source-build", window: editor.id});
    let installed = false;
    for (let i = 0; i < 200; i++) {
      const current = (await call("windows")).find((w: any) => w.app === id && w.active);
      if (current) { installed = true; break; }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert(installed, "Editor build must launch the new app");
    await call("click", {name: "counter-increment"});
    assert.equal((await call("inspect")).find((n: any) => n.name === "counter-value").text, "5");
    await writeFile(evidence + "/five.png", await call("screenshot"), "base64");
    await call("app_restart", {app: id});
    assert.equal((await call("inspect")).find((n: any) => n.name === "counter-value").text, "0");
    await call("app_restore", {app: id});
    await call("click", {name: "counter-increment"});
    assert.equal((await call("inspect")).find((n: any) => n.name === "counter-value").text, "1");
    await writeFile(evidence + "/restored.png", await call("screenshot"), "base64");
    await writeFile(evidence + "/before.json", JSON.stringify({session: sessions[0].session, path, id}));
    console.log("PASS: real MCP + shell + visible editor compiled, launched, edited, rebuilt, restarted, and restored Counter.");
  }
} finally { await client.close(); }
