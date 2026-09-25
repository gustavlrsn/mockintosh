import type { Schema } from "../../src/shared/schema";
import type { OperationContract } from "./contract";

export function globalHelp(operations?: readonly OperationContract[]): string {
  const lines = [
    "mockintosh — drive a Mac through its trap table",
    "",
    "Usage:",
    "  mockintosh pair",
    "  mockintosh sessions",
    "  mockintosh [--headless | --connect <session>] <trap> [arguments]",
    "  mockintosh [--headless | --connect <session>] help [trap]",
    "",
    "Flags:",
    "  --headless           Boot a Mac in this process",
    "  --connect <session>  Use a paired browser boot",
    "  --url <ws>           Companion socket (MOCKINTOSH_URL, else ws://127.0.0.1:4318)",
    "  --timeout <ms>       How long to wait for one trap (place before the trap name)",
    "  --json               Print the trap result as JSON",
    "  --out <file>         Save a screenshot or byte result on this machine",
    "  --help               Show this help, or one trap's arguments",
    "",
    "Trap arguments use the operation's property names (--path, --body).",
    "Required text and numbers can be given in order, without flags.",
    "pair prints a token. Paste it into the page's Companion panel.",
    "MOCKINTOSH_TOKEN is that token, for sessions and --connect.",
  ];
  if (operations) {
    lines.push("", "Traps:");
    for (const operation of [...operations].sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`  ${operation.name.padEnd(18)} ${operation.description}`);
    }
  }
  return lines.join("\n") + "\n";
}

export function operationHelp(operation: OperationContract): string {
  const schema = operation.inputSchema;
  const required = new Set(schema.required);
  const positional = schema.required.filter(key => {
    const property = schema.properties[key];
    return property !== undefined && isPositional(property);
  });
  const flags = Object.keys(schema.properties).filter(key => !positional.includes(key));
  const usage = ["mockintosh", operation.name, ...positional.map(key => `<${key}>`), ...flags.map(key => `[--${key}]`)].join(" ");
  const lines = [`${operation.name} — ${operation.description}`, "", `Usage: ${usage}`, ""];
  for (const key of Object.keys(schema.properties)) {
    const property = schema.properties[key]!;
    lines.push(`  --${key.padEnd(16)} ${describe(property).padEnd(16)} ${required.has(key) ? "required" : ""}`.trimEnd());
  }
  if (acceptsOut(operation)) lines.push("  --out             file             write the bytes on this machine");
  return lines.join("\n") + "\n";
}

export function acceptsOut(operation: OperationContract): boolean {
  const bytes = operation.resultSchema.properties?.bytes;
  return bytes?.type === "array";
}

export function presentsAsText(operation: OperationContract): boolean {
  const properties = operation.resultSchema.properties;
  return properties !== undefined && "stdoutBytes" in properties && "exitCode" in properties;
}

function isPositional(schema: Schema): boolean {
  if (schema.enum) return true;
  if (schema.anyOf) return schema.anyOf.every(isPositional);
  return schema.type === "string" || schema.type === "number" || schema.type === "integer";
}

function describe(schema: Schema): string {
  if (schema.enum) return schema.enum.map(value => JSON.stringify(value)).join("|");
  if (schema.anyOf) return schema.anyOf.map(describe).join(" | ");
  if (schema.type === "array") return `${schema.items ? describe(schema.items) : "value"}[]`;
  if (schema.type === "object") return "json";
  return schema.type ?? "json";
}
