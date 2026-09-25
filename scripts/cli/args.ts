import { validate, ValidationError, type Schema } from "../../src/shared/schema";
import type { OperationContract } from "./contract";

export class UsageError extends Error {}

export interface Invocation {
  headless: boolean;
  connect?: string;
  url?: string;
  timeout?: number;
  json: boolean;
  help: boolean;
  command?: string;
  commandArgs: string[];
}

export interface ParsedCall {
  args: Record<string, unknown>;
  out?: string;
  json: boolean;
  help: boolean;
}

/** Flags before the command select a Mac. Flags after it belong to one trap. */
export function parseInvocation(argv: readonly string[]): Invocation {
  const invocation: Invocation = { headless: false, json: false, help: false, commandArgs: [] };
  const tokens = [...argv];
  while (tokens.length > 0) {
    const token = tokens[0]!;
    if (invocation.command !== undefined || !token.startsWith("--")) break;
    tokens.shift();
    const [name, inline] = splitFlag(token);
    const take = (label: string) => {
      if (inline !== undefined) return inline;
      const value = tokens.shift();
      if (value === undefined) throw new UsageError(`missing value for --${label}`);
      return value;
    };
    if (name === "headless") invocation.headless = true;
    else if (name === "json") invocation.json = true;
    else if (name === "help") invocation.help = true;
    else if (name === "connect") invocation.connect = take("connect");
    else if (name === "url") invocation.url = take("url");
    else if (name === "timeout") invocation.timeout = requireInteger(take("timeout"), "--timeout");
    else throw new UsageError(`unknown flag --${name}`);
  }
  invocation.command = tokens.shift();
  invocation.commandArgs = tokens;
  if (invocation.headless && invocation.connect !== undefined) throw new UsageError("Choose --headless or --connect");
  return invocation;
}

/**
 * Build a trap's argument object from its input schema.
 * Required strings and numbers can be positional, in schema order.
 * Everything else is a flag whose name is the property name.
 */
export function parseCall(operation: OperationContract, argv: readonly string[], readFile: (path: string) => Uint8Array): ParsedCall {
  const schema = operation.inputSchema;
  const args: Record<string, unknown> = {};
  const positionals: string[] = [];
  let out: string | undefined;
  let json = false;
  let help = false;
  const tokens = [...argv];
  const assign = (name: string, value: unknown) => {
    const property = schema.properties[name];
    if (!property) throw new UsageError(`unknown flag --${name}`);
    if (Object.hasOwn(args, name)) {
      if (property.type === "array" && Array.isArray(args[name]) && Array.isArray(value)) {
        args[name] = [...(args[name] as unknown[]), ...value];
        return;
      }
      throw new UsageError(`duplicate flag --${name}`);
    }
    args[name] = value;
  };
  while (tokens.length > 0) {
    const token = tokens.shift()!;
    if (token === "--") {
      positionals.push(...tokens);
      break;
    }
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }
    const [name, inline] = splitFlag(token);
    const take = () => {
      if (inline !== undefined) return inline;
      const value = tokens.shift();
      if (value === undefined || value === "--") throw new UsageError(`missing value for --${name}`);
      return value;
    };
    if (name === "help") { help = true; continue; }
    if (name === "json") { json = true; continue; }
    if (name === "out") { out = take(); continue; }
    if (name.startsWith("no-")) {
      const key = name.slice(3);
      const property = schema.properties[key];
      if (!property || property.type !== "boolean") throw new UsageError(`unknown flag --${name}`);
      if (inline !== undefined) throw new UsageError(`--${name} does not take a value`);
      assign(key, false);
      continue;
    }
    const property = schema.properties[name];
    if (!property) throw new UsageError(`unknown flag --${name}`);
    if (property.type === "boolean" && inline === undefined) {
      assign(name, true);
      continue;
    }
    assign(name, coerce(property, take(), readFile, `--${name}`));
  }
  for (const key of schema.required) {
    if (Object.hasOwn(args, key)) continue;
    const property = schema.properties[key];
    if (!property || !isPositional(property)) break;
    const value = positionals.shift();
    if (value === undefined) break;
    args[key] = coerce(property, value, readFile, key);
  }
  if (positionals.length > 0) throw new UsageError(`unexpected argument ${positionals[0]}`);
  if (!help) {
    try { validate(schema, args, "arguments"); }
    catch (error) { if (error instanceof ValidationError) throw new UsageError(error.message); throw error; }
  }
  return { args, out, json, help };
}

function splitFlag(token: string): [string, string | undefined] {
  const body = token.slice(2);
  const eq = body.indexOf("=");
  if (eq < 0) return [body, undefined];
  return [body.slice(0, eq), body.slice(eq + 1)];
}

function isPositional(schema: Schema): boolean {
  if (schema.enum) return true;
  if (schema.anyOf) return schema.anyOf.every(isPositional);
  return schema.type === "string" || schema.type === "number" || schema.type === "integer";
}

function coerce(schema: Schema, raw: string, readFile: (path: string) => Uint8Array, label: string): unknown {
  if (schema.enum) {
    const found = schema.enum.find(value => String(value) === raw);
    if (found === undefined) throw new UsageError(`${label}: expected one of ${schema.enum.map(value => JSON.stringify(value)).join(", ")}`);
    return found;
  }
  if (schema.anyOf) {
    let last = `${label}: invalid value`;
    for (const option of schema.anyOf) {
      try { return coerce(option, raw, readFile, label); }
      catch (error) { if (error instanceof UsageError) last = error.message; }
    }
    throw new UsageError(last);
  }
  if (schema.type === "string") return raw;
  if (schema.type === "boolean") {
    if (raw === "true") return true;
    if (raw === "false") return false;
    throw new UsageError(`${label}: expected true or false`);
  }
  if (schema.type === "integer") return requireInteger(raw, label);
  if (schema.type === "number") {
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new UsageError(`${label}: expected a number`);
    return value;
  }
  if (schema.type === "null") {
    if (raw === "null") return null;
    throw new UsageError(`${label}: expected null`);
  }
  if (schema.type === "array") {
    if (isByteArray(schema) && raw.startsWith("@")) return [...readFile(raw.slice(1))];
    if (raw.startsWith("[")) {
      let parsed: unknown;
      try { parsed = JSON.parse(raw); }
      catch { throw new UsageError(`${label}: invalid JSON array`); }
      if (!Array.isArray(parsed)) throw new UsageError(`${label}: expected a JSON array`);
      return parsed;
    }
    if (!schema.items) throw new UsageError(`${label}: expected a JSON array`);
    return [coerce(schema.items, raw, readFile, label)];
  }
  if (schema.type === "object" || schema.type === undefined) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new UsageError(`${label}: expected a JSON object`);
      return parsed;
    } catch (error) {
      if (error instanceof UsageError) throw error;
      throw new UsageError(`${label}: invalid JSON object`);
    }
  }
  throw new UsageError(`${label}: unsupported value`);
}

function isByteArray(schema: Schema): boolean {
  return schema.type === "array" && schema.items?.type === "integer" && schema.items.minimum === 0 && schema.items.maximum === 255;
}

function requireInteger(raw: string, label: string): number {
  if (!/^-?\d+$/.test(raw)) throw new UsageError(`${label}: expected an integer`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) throw new UsageError(`${label}: expected an integer`);
  return value;
}
