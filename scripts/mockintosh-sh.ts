import { parse } from "../src/shared/schema";
import { shellOutcome } from "../src/os/kernel/schema";
import { randomUUID } from "node:crypto";
import { CompanionClient } from "./companion/client";
const args = process.argv.slice(2),
  value = (flag: string) => {
    const index = args.indexOf(flag);
    return index < 0 ? undefined : args[index + 1];
  };
async function main() {
  let command = value("-c");
  if (command === undefined && !process.stdin.isTTY) {
    command = "";
    for await (const chunk of process.stdin) command += chunk.toString();
  }
  if (args.includes("--headless")) {
    if (value("--connect")) throw new Error("Choose live --connect or --headless");
    const {
      runHeadless
    } = await import("./companion/headless");
    const result = await runHeadless(command ?? "help");
    process.stdout.write(new Uint8Array(result.stdoutBytes));
    process.stderr.write(new Uint8Array(result.stderrBytes));
    process.exitCode = result.exitCode;
    return;
  }
  const token = process.env.MOCKINTOSH_TOKEN;
  if (!token) throw new Error("Set MOCKINTOSH_TOKEN to the companion pairing token");
  const client = await CompanionClient.connect(process.env.MOCKINTOSH_URL ?? "ws://127.0.0.1:4318", token);
  try {
    if (args.includes("--list")) {
      process.stdout.write(JSON.stringify(await client.list(), null, 2) + "\n");
      return;
    }
    const target = value("--connect");
    if (!target || command === undefined) throw new Error("Usage: mockintosh-sh --connect <session> -c <command>, --list, or --headless -c <command>");
    const session = await client.select(target),
      action = randomUUID();
    const interrupt = () => {
      void client.cancel(action);
    };
    process.on("SIGINT", interrupt);
    try {
      const result = parse(shellOutcome, await client.invoke(session, "run_shell", {
        command
      }, action, 65000, (channel, bytes) => { (channel === "stdout" ? process.stdout : process.stderr).write(new Uint8Array(bytes)); }));
      if (result.truncated.stdout || result.truncated.stderr) process.stderr.write("[output truncated]\n");
      process.exitCode = result.exitCode;
    } finally {
      process.off("SIGINT", interrupt);
    }
  } finally {
    client.close();
  }
}
main().catch(error => {
  console.error(error.message);
  if (error.action) console.error(`Reconcile action ${error.action} before retrying.`);
  process.exitCode = 1;
});
