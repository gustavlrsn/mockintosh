/** JSON Schema subset used by registered contracts and exposed unchanged to clients. */
export type Schema = {
  type?: string | readonly string[];
  properties?: Record<string, Schema>;
  required?: readonly string[];
  additionalProperties?: boolean | Schema;
  items?: Schema;
  enum?: readonly (string | number | boolean | null)[];
  minimum?: number;
  maximum?: number;
  anyOf?: readonly Schema[];
};
/** Infer handler values from the same schemas exported to clients. */
export type Value<S extends Schema> =
  S extends { enum: readonly (infer E)[] } ? E :
  S extends { anyOf: readonly (infer A extends Schema)[] } ? Value<A> :
  S extends { type: "string" } ? string :
  S extends { type: "boolean" } ? boolean :
  S extends { type: "number" | "integer" } ? number :
  S extends { type: "null" } ? null :
  S extends { type: "array"; items: infer I extends Schema } ? readonly Value<I>[] :
  S extends { type: "object"; properties: infer P extends Record<string, Schema>; required: readonly (infer R)[] }
  ? { [K in keyof P as K extends R ? K : never]: Value<P[K]> } &
  { [K in keyof P as K extends R ? never : K]?: Value<P[K]> }
  : S extends { type: "object"; additionalProperties: infer A extends Schema } ? Record<string, Value<A>>
  : S extends { type: "object" } ? Record<string, unknown> : unknown;
export const string = { type: "string" } as const;
export const boolean = { type: "boolean" } as const;
export const number = { type: "number" } as const;
export const integer = { type: "integer", minimum: 0, maximum: Number.MAX_SAFE_INTEGER } as const;
export const array = <const S extends Schema>(items: S) => ({ type: "array", items } as const);
export function object<const P extends Record<string, Schema>, const R extends readonly (keyof P & string)[] = (keyof P & string)[]>(properties: P, required?: R) {
  return { type: "object", properties, required: required ?? Object.keys(properties) as unknown as R, additionalProperties: false } as const;
}
export const nullable = <const S extends Schema>(schema: S) => ({ anyOf: [schema, { type: "null" }] } as const);
export const bytes = array({ type: "integer", minimum: 0, maximum: 255 });

/** Short JSON for agents and diagnostics; never throws. */
export function preview(value: unknown, max = 160): string {
  try {
    const text = JSON.stringify(value);
    if (text === undefined) return String(value);
    return text.length <= max ? text : `${text.slice(0, max)}…`;
  } catch {
    return Object.prototype.toString.call(value);
  }
}

function expected(schema: Schema): string {
  if (schema.enum) return `one of ${schema.enum.map((v) => JSON.stringify(v)).join(", ")}`;
  if (schema.anyOf) return schema.anyOf.map(expected).join(" | ");
  const types = schema.type === undefined ? [] : Array.isArray(schema.type) ? [...schema.type] : [schema.type];
  if (types.includes("object") && schema.required?.length) return `object (required ${schema.required.join(", ")})`;
  if (types.length) return types.join("|");
  return "value";
}

function fail(path: string, schema: Schema, value: unknown, detail?: string): never {
  const suffix = detail ? ` (${detail})` : "";
  throw new ValidationError(`${path}: expected ${expected(schema)}, got ${preview(value)}${suffix}`, path);
}

export function validate(schema: Schema, value: unknown, path = "value"): void {
  if (schema.anyOf) {
    if (!schema.anyOf.some((candidate) => { try { validate(candidate, value, path); return true; } catch { return false; } })) {
      fail(path, schema, value);
    }
  }
  const types = schema.type === undefined ? [] : Array.isArray(schema.type) ? schema.type : [schema.type];
  const kind = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  if (types.length && !types.some((type) => type === kind || (type === "integer" && Number.isSafeInteger(value)))) {
    fail(path, schema, value);
  }
  if (schema.enum && !schema.enum.includes(value as string)) fail(path, schema, value);
  if (typeof value === "number" && (!Number.isFinite(value) || schema.minimum !== undefined && value < schema.minimum || schema.maximum !== undefined && value > schema.maximum)) {
    fail(path, schema, value, `not in [${schema.minimum ?? "-∞"}, ${schema.maximum ?? "+∞"}]`);
  }
  if (Array.isArray(value) && schema.items) value.forEach((item, index) => validate(schema.items!, item, `${path}[${index}]`));
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    for (const key of schema.required ?? []) {
      if (!Object.hasOwn(record, key) || record[key] === undefined) {
        throw new ValidationError(`${path}: missing required ${key}`, `${path}.${key}`);
      }
    }
    for (const [key, field] of Object.entries(record)) {
      const property = schema.properties && Object.hasOwn(schema.properties, key) ? schema.properties[key] : undefined;
      if (property) { if (field !== undefined) validate(property, field, `${path}.${key}`); }
      else if (schema.additionalProperties === false) {
        const allowed = schema.properties ? Object.keys(schema.properties).join(", ") : "";
        const extra = allowed ? `; allowed: ${allowed}` : "";
        throw new ValidationError(`${path}: unexpected property ${key}, got ${preview(field)}${extra}`, `${path}.${key}`);
      }
      else if (typeof schema.additionalProperties === "object") validate(schema.additionalProperties, field, `${path}.${key}`);
    }
  }
}

export class ValidationError extends Error {
  readonly code = "invalid-argument";
  constructor(message: string, readonly path = "value") {
    super(message);
    this.name = "ValidationError";
  }
}
export function parse<const S extends Schema>(schema: S, value: unknown): Value<S> {
  validate(schema, value);
  return value as Value<S>;
}
