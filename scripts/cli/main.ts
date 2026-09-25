import { run } from "./run";
import { realIO } from "./targets";

const signal = new AbortController();
process.on("SIGINT", () => signal.abort());
process.on("SIGTERM", () => signal.abort());
run(process.argv.slice(2), realIO(signal.signal)).then(code => {
  process.exitCode = code;
});
