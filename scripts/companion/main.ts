import { readFileSync } from "node:fs";
import { startCompanion } from "./server";
const tokenFileIndex = process.argv.indexOf("--token-file");
const tokenFile = tokenFileIndex < 0 ? undefined : process.argv[tokenFileIndex + 1];
const suppliedToken = tokenFile ? JSON.parse(readFileSync(tokenFile, "utf8")).token : process.env.MOCKINTOSH_TOKEN;
if (tokenFile && (typeof suppliedToken !== "string" || !suppliedToken)) throw new Error("Token file must contain a nonempty token string");
const companion = startCompanion({
  origin: process.env.MOCKINTOSH_ORIGIN ?? "http://localhost:5173",
  port: Number(process.env.MOCKINTOSH_PORT ?? 4318),
  token: suppliedToken
});
companion.server.on("listening", () => {
  console.error("Mockintosh companion listening on ws://127.0.0.1:" + (process.env.MOCKINTOSH_PORT ?? "4318"));
  console.error(tokenFile ? "Using the supplied private token file." : "Pairing token: " + companion.token);
});
process.on("SIGINT", () => {
  void companion.close().then(() => process.exit(0));
});
