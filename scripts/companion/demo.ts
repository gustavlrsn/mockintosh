import { execFileSync } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { strict as assert } from "node:assert";
/** The Apple menu's label (the Apple logo glyph), as the `menu` trap names it. */
const APPLE_MENU = "\uF8FF";
const config = JSON.parse(await readFile(process.env.MOCKINTOSH_DEMO_CONFIG ?? "/tmp/mockintosh-m1-connection.json", "utf8"));
if (process.argv.includes("--pair")) {
  const action = (...args: string[]) => execFileSync("terminal-browser", ["action", "--tab", process.env.MOCKINTOSH_DEMO_TAB ?? "4", "--", ...args], {
    stdio: "pipe"
  });
  action("eval", "document.querySelector('details').open = true");
  action("fill", '[aria-label="Companion token"]', config.token);
  action("click", "button:first-of-type");
  await new Promise(resolve => setTimeout(resolve, 200));
}
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["--import", "tsx", "scripts/companion/mcp.ts"],
  env: {
    ...process.env,
    MOCKINTOSH_TOKEN: config.token
  } as Record<string, string>,
  stderr: "pipe"
});
const client = new Client({
  name: "mockintosh-m1-evidence",
  version: "1.0.0"
});
transport.stderr?.on("data", data => process.stderr.write(data));
await client.connect(transport);
async function call(name: string, args: Record<string, unknown> = {}) {
  const reply: any = await client.callTool({
    name,
    arguments: args
  });
  if (reply.isError) throw new Error(JSON.stringify(reply.content));
  if (name === "screenshot") return reply;
  const body = JSON.parse(reply.content.find((item: any) => item.type === "text").text);
  return body.result ?? body;
}
try {
  const sessions = await call("sessions");
  assert.equal(sessions.length, 1, "Demo requires one explicitly paired browser");
  const session = sessions[0];
  await call("select_session", {
    session: session.session
  });
  const tools = await client.listTools();
  assert(tools.tools.some(t => t.name === "run_shell"));
  const phase = process.argv[2] ?? "before";
  if (phase === "before") {
    // The Control Panel is a Finder window; it opens from the Apple menu, as for a user.
    await call("menu", {
      menu: APPLE_MENU,
      item: "Control Panel"
    });
    const windows = await call("windows"),
      panel = windows.find((w: any) => w.app === "finder" && w.title === "Control Panel");
    assert(panel);
    const nodes = await call("inspect", {
      window: panel.id
    });
    assert(nodes.some((n: any) => n.name === "desktop-pattern-prev"));
    await call("activate", {
      window: panel.id
    });
    for (let i = 0; i < 3; i++) await call("click", {
      name: "desktop-pattern-prev",
      window: panel.id
    });
    assert.equal((await call("desktop_pattern")).pattern, "black");
    const image = await call("screenshot");
    await mkdir("/tmp/mockintosh-m1-evidence", {
      recursive: true
    });
    await writeFile("/tmp/mockintosh-m1-evidence/black.png", image.content[0].data, "base64");
    await writeFile("/tmp/mockintosh-m1-evidence/before.json", JSON.stringify({
      session: session.session,
      panel: panel.id,
      controls: nodes.filter((n: any) => n.name),
      tools: tools.tools.map(t => t.name)
    }, null, 2));
    console.log("PASS: real stdio MCP opened Control Panel, inspected and clicked black, captured PNG.");
  } else if (phase === "after") {
    const before = JSON.parse(await readFile("/tmp/mockintosh-m1-evidence/before.json", "utf8"));
    assert.notEqual(session.session, before.session);
    assert.equal((await call("desktop_pattern")).pattern, "black");
    const result = await call("run_shell", {
      command: "ls /disk; desktop_pattern; screenshot /disk/reloaded.pbm"
    });
    assert.equal(result.exitCode, 0);
    await writeFile("/tmp/mockintosh-m1-evidence/after.json", JSON.stringify({
      session: session.session,
      persisted: "black",
      shell: result
    }, null, 2));
    console.log("PASS: new boot selected after reload; black persisted; shell captured PBM.");
  } else if (phase === "terminal") {
    await call("open", {
      app: "terminal"
    });
    const win = (await call("windows")).find((w: any) => w.app === "terminal" && w.active);
    assert(win);
    await call("activate", {
      window: win.id
    });
    const terminalNodes = await call("inspect", {
      window: win.id
    });
    await writeFile("/tmp/mockintosh-m1-evidence/terminal-nodes.json", JSON.stringify(terminalNodes, null, 2));
    const capturePath = `/disk/terminal-${Date.now().toString(36)}.pbm`;
    const command = `ls /disk; desktop_pattern white; menu ${APPLE_MENU} 'Control Panel'; screenshot ${capturePath}`;
    await call("click", {
      name: "terminal-command",
      window: win.id
    });
    await call("type", {
      name: "terminal-command",
      window: win.id,
      text: command
    });
    await call("key", {
      key: "Enter"
    });
    let created = false;
    for (let i = 0; i < 50; i++) {
      const resources = await call("list", {
        path: "/disk"
      });
      if (resources.some((r: any) => r.path === capturePath)) {
        created = true;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert(created, "Terminal screenshot must persist");
    assert.equal((await call("desktop_pattern")).pattern, "white");
    const image = await call("screenshot");
    await writeFile("/tmp/mockintosh-m1-evidence/terminal.png", image.content[0].data, "base64");
    console.log("PASS: visible Terminal explored /disk, wrote the setting, opened Control Panel, and captured PBM.");
  } else if (phase === "cli") {
    const stdout = execFileSync(process.execPath, ["--import", "tsx", "scripts/mockintosh-sh.ts", "--connect", session.session, "-c", `desktop_pattern black; menu ${APPLE_MENU} 'Control Panel'; screenshot /disk/cli.pbm; desktop_pattern`], {
      env: {
        ...process.env,
        MOCKINTOSH_TOKEN: config.token
      },
      encoding: "utf8"
    });
    assert(stdout.endsWith("black\n"));
    assert.equal((await call("desktop_pattern")).pattern, "black");
    await writeFile("/tmp/mockintosh-m1-evidence/cli.txt", stdout);
    console.log("PASS: host CLI independently controlled the same live browser; MCP observed its setting.");
  } else if (phase === "rename") {
    const fixtureId = Date.now().toString(36);
    const originalName = `M1 original-${fixtureId}.txt`, renamedName = `M1 renamed-${fixtureId}.txt`;
    const roots = await call("list", {
      path: "/disk"
    });
    const desktop = roots.find((r: any) => r.path.endsWith("/Desktop Folder"));
    assert(desktop);
    await call("write", {
      path: desktop.path + "/" + originalName,
      body: "rename verification"
    });
    await call("click", {
      name: originalName
    });
    await call("key", {
      key: "Enter"
    });
    let nodes = await call("inspect");
    const field = nodes.find((n: any) => n.name === "rename");
    assert(field, "Finder rename field must be visible");
    await call("key", {
      key: "a",
      meta: true
    });
    await call("type", {
      id: field.id,
      text: renamedName
    });
    await call("key", {
      key: "Enter"
    });
    assert.equal(await call("read", {
      path: desktop.path + "/" + renamedName
    }), "rename verification");
    await writeFile("/tmp/mockintosh-m1-evidence/rename.json", JSON.stringify({
      field,
      renamed: desktop.path + "/" + renamedName
    }, null, 2));
    console.log("PASS: named Finder typing renamed the real VFS file.");
  }
} finally {
  await client.close();
}
