/**
 * A tiny, safe expression language for `z = f(x, y, t)`. Parsed by recursive
 * descent and compiled to closures — user text never reaches `eval`.
 *
 *   sum     := product (("+" | "-") product)*
 *   product := unary (("*" | "/") unary | implicit unary)*
 *   unary   := ("-" | "+") unary | power
 *   power   := atom ("^" unary)?
 *   atom    := number | name | name "(" args ")" | "(" sum ")"
 *
 * Implicit multiplication (`4x`, `2(x+y)`, `x y`) binds like `*`, and `^` is
 * right-associative and tighter than unary minus, so `-x^2` is `-(x^2)`.
 */

/** The free variables a surface expression may read. */
export interface SurfaceVars {
  x: number;
  y: number;
  t: number;
}

export type SurfaceFn = (x: number, y: number, t: number) => number;

export interface CompiledSurface {
  fn: SurfaceFn;
  /** True when the expression reads `t`, i.e. animating it changes the surface. */
  usesTime: boolean;
}

export class ExprError extends Error {
  constructor(
    message: string,
    /** Character offset in the source where the problem starts. */
    readonly at: number,
  ) {
    super(message);
    this.name = "ExprError";
  }
}

type Evaluator = (vars: SurfaceVars) => number;

type Token =
  | { kind: "num"; value: number; at: number }
  | { kind: "name"; value: string; at: number }
  | { kind: "op"; value: string; at: number }
  | { kind: "end"; at: number };

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const FUNCTIONS: Record<string, { arity: number; call: (...args: number[]) => number }> = {
  sin: { arity: 1, call: Math.sin },
  cos: { arity: 1, call: Math.cos },
  tan: { arity: 1, call: Math.tan },
  asin: { arity: 1, call: Math.asin },
  acos: { arity: 1, call: Math.acos },
  atan: { arity: 1, call: Math.atan },
  sinh: { arity: 1, call: Math.sinh },
  cosh: { arity: 1, call: Math.cosh },
  tanh: { arity: 1, call: Math.tanh },
  exp: { arity: 1, call: Math.exp },
  log: { arity: 1, call: Math.log },
  ln: { arity: 1, call: Math.log },
  sqrt: { arity: 1, call: Math.sqrt },
  abs: { arity: 1, call: Math.abs },
  floor: { arity: 1, call: Math.floor },
  ceil: { arity: 1, call: Math.ceil },
  round: { arity: 1, call: Math.round },
  sign: { arity: 1, call: Math.sign },
  atan2: { arity: 2, call: Math.atan2 },
  min: { arity: 2, call: Math.min },
  max: { arity: 2, call: Math.max },
  mod: { arity: 2, call: (a, b) => a - b * Math.floor(a / b) },
};

/** Variables beyond x, y, t that are derived from them. */
const DERIVED: Record<string, Evaluator> = {
  r: (v) => Math.hypot(v.x, v.y),
  theta: (v) => Math.atan2(v.y, v.x),
};

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      const match = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(src.slice(i));
      if (!match) throw new ExprError(`Bad number`, i);
      tokens.push({ kind: "num", value: Number(match[0]), at: i });
      i += match[0].length;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      const match = /^[A-Za-z_][A-Za-z_0-9]*/.exec(src.slice(i))!;
      tokens.push({ kind: "name", value: match[0].toLowerCase(), at: i });
      i += match[0].length;
      continue;
    }
    if (ch === "*" && src[i + 1] === "*") {
      tokens.push({ kind: "op", value: "^", at: i });
      i += 2;
      continue;
    }
    if ("+-*/^(),".includes(ch)) {
      tokens.push({ kind: "op", value: ch, at: i });
      i++;
      continue;
    }
    if (ch === "²") {
      tokens.push({ kind: "op", value: "^", at: i }, { kind: "num", value: 2, at: i });
      i++;
      continue;
    }
    if (ch === "·" || ch === "×") {
      tokens.push({ kind: "op", value: "*", at: i });
      i++;
      continue;
    }
    throw new ExprError(`Unexpected "${ch}"`, i);
  }
  tokens.push({ kind: "end", at: src.length });
  return tokens;
}

class Parser {
  private pos = 0;
  usesTime = false;

  constructor(private readonly tokens: Token[]) {}

  parse(): Evaluator {
    const body = this.sum();
    const next = this.peek();
    if (next.kind !== "end") throw new ExprError(`Unexpected "${describe(next)}"`, next.at);
    return body;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private take(): Token {
    return this.tokens[this.pos++];
  }

  private isOp(value: string): boolean {
    const tok = this.peek();
    return tok.kind === "op" && tok.value === value;
  }

  private expectOp(value: string): void {
    const tok = this.take();
    if (tok.kind !== "op" || tok.value !== value) {
      throw new ExprError(`Expected "${value}"`, tok.at);
    }
  }

  private sum(): Evaluator {
    let left = this.product();
    while (this.isOp("+") || this.isOp("-")) {
      const op = (this.take() as { value: string }).value;
      const a = left;
      const b = this.product();
      left = op === "+" ? (v) => a(v) + b(v) : (v) => a(v) - b(v);
    }
    return left;
  }

  /** A token that can start an operand, so `4x` / `2(x)` multiply implicitly. */
  private startsImplicitOperand(): boolean {
    const tok = this.peek();
    return tok.kind === "num" || tok.kind === "name" || (tok.kind === "op" && tok.value === "(");
  }

  private product(): Evaluator {
    let left = this.unary();
    for (;;) {
      if (this.isOp("*") || this.isOp("/")) {
        const op = (this.take() as { value: string }).value;
        const a = left;
        const b = this.unary();
        left = op === "*" ? (v) => a(v) * b(v) : (v) => a(v) / b(v);
      } else if (this.startsImplicitOperand()) {
        const a = left;
        const b = this.power();
        left = (v) => a(v) * b(v);
      } else {
        return left;
      }
    }
  }

  private unary(): Evaluator {
    if (this.isOp("-")) {
      this.take();
      const inner = this.unary();
      return (v) => -inner(v);
    }
    if (this.isOp("+")) {
      this.take();
      return this.unary();
    }
    return this.power();
  }

  private power(): Evaluator {
    const base = this.atom();
    if (!this.isOp("^")) return base;
    this.take();
    const exponent = this.unary();
    return (v) => Math.pow(base(v), exponent(v));
  }

  private atom(): Evaluator {
    const tok = this.take();
    if (tok.kind === "num") {
      const value = tok.value;
      return () => value;
    }
    if (tok.kind === "op" && tok.value === "(") {
      const inner = this.sum();
      this.expectOp(")");
      return inner;
    }
    if (tok.kind === "name") return this.named(tok.value, tok.at);
    throw new ExprError(tok.kind === "end" ? "Expression ends too soon" : `Unexpected "${describe(tok)}"`, tok.at);
  }

  private named(name: string, at: number): Evaluator {
    const fn = FUNCTIONS[name];
    if (fn) {
      if (!this.isOp("(")) throw new ExprError(`"${name}" needs parentheses`, at);
      this.take();
      const args: Evaluator[] = [this.sum()];
      while (this.isOp(",")) {
        this.take();
        args.push(this.sum());
      }
      this.expectOp(")");
      if (args.length !== fn.arity) {
        throw new ExprError(`"${name}" takes ${fn.arity} argument${fn.arity === 1 ? "" : "s"}`, at);
      }
      const call = fn.call;
      if (args.length === 1) {
        const [a] = args;
        return (v) => call(a(v));
      }
      const [a, b] = args;
      return (v) => call(a(v), b(v));
    }
    if (name === "x") return (v) => v.x;
    if (name === "y") return (v) => v.y;
    if (name === "t") {
      this.usesTime = true;
      return (v) => v.t;
    }
    const derived = DERIVED[name];
    if (derived) return derived;
    if (name in CONSTANTS) {
      const value = CONSTANTS[name];
      return () => value;
    }
    throw new ExprError(`Unknown name "${name}"`, at);
  }
}

function describe(tok: Token): string {
  return tok.kind === "end" ? "end" : String(tok.value);
}

/** Strip an optional leading `z =` so users can type the equation the way it reads. */
function stripLhs(src: string): { body: string; offset: number } {
  const match = /^\s*(?:z|f\s*\(\s*x\s*,\s*y\s*\))\s*=/i.exec(src);
  return match ? { body: src.slice(match[0].length), offset: match[0].length } : { body: src, offset: 0 };
}

/** Compile `z = f(x, y, t)`. Throws `ExprError` with the offending offset. */
export function compileSurface(src: string): CompiledSurface {
  const { body, offset } = stripLhs(src);
  if (!body.trim()) throw new ExprError("Type an equation", offset);
  try {
    const parser = new Parser(tokenize(body));
    const evaluate = parser.parse();
    const vars: SurfaceVars = { x: 0, y: 0, t: 0 };
    return {
      usesTime: parser.usesTime,
      fn: (x, y, t) => {
        vars.x = x;
        vars.y = y;
        vars.t = t;
        return evaluate(vars);
      },
    };
  } catch (err) {
    if (err instanceof ExprError) throw new ExprError(err.message, err.at + offset);
    throw err;
  }
}
