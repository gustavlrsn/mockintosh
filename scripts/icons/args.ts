export interface ParsedArgs {
  rest: string[];
  flags: Record<string, string | boolean>;
}

/** Parse `--flag`, `--key value`, and `--key=value`. Lone `--` ends flags. */
export function parseArgs(argv: string[]): ParsedArgs {
  const rest: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      rest.push(...argv.slice(i + 1));
      break;
    }
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq !== -1) {
        flags[arg.slice(2, eq)] = arg.slice(eq + 1);
        continue;
      }
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("-")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
      continue;
    }
    rest.push(arg);
  }
  return { rest, flags };
}

export function flagString(flags: Record<string, string | boolean>, name: string): string | undefined {
  const value = flags[name];
  return typeof value === "string" ? value : undefined;
}

export function flagBool(flags: Record<string, string | boolean>, name: string): boolean {
  return flags[name] === true || flags[name] === "true";
}

export function flagNumber(
  flags: Record<string, string | boolean>,
  name: string,
  fallback: number
): number {
  const raw = flagString(flags, name);
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(`--${name} must be a number, got ${JSON.stringify(raw)}`);
  }
  return n;
}
