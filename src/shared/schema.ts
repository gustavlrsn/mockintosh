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
export function validate(schema: Schema, value: unknown, path = "value"): void {
  const fail = () => { throw new ValidationError(`Invalid ${path}`); };
  if (schema.anyOf) {
    if (!schema.anyOf.some(candidate => { try { validate(candidate, value, path); return true; } catch { return false; } })) fail();
  }
  const types = schema.type === undefined ? [] : Array.isArray(schema.type) ? schema.type : [schema.type];
  const kind = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
  if (types.length && !types.some(type => type === kind || type === "integer" && Number.isSafeInteger(value))) fail();
  if (schema.enum && !schema.enum.includes(value as string)) fail();
  if (typeof value === "number" && (!Number.isFinite(value) || schema.minimum !== undefined && value < schema.minimum || schema.maximum !== undefined && value > schema.maximum)) fail();
  if (Array.isArray(value) && schema.items) value.forEach((item, index) => validate(schema.items!, item, `${path}[${index}]`));
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    for (const key of schema.required ?? []) if (!Object.hasOwn(record, key) || record[key] === undefined) fail();
    for (const [key, field] of Object.entries(record)) {
      const property = schema.properties && Object.hasOwn(schema.properties, key) ? schema.properties[key] : undefined;
      if (property) { if (field !== undefined) validate(property, field, `${path}.${key}`); }
      else if (schema.additionalProperties === false) fail();
      else if (typeof schema.additionalProperties === "object") validate(schema.additionalProperties, field, `${path}.${key}`);
    }
  }
}

export class ValidationError extends Error {
  readonly code = "invalid-argument";
}
export function parse<const S extends Schema>(schema: S, value: unknown): Value<S> {
  validate(schema, value);
  return value as Value<S>;
}
