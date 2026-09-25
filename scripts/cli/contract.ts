import type { Schema } from "../../src/shared/schema";

/** One trap, as the kernel publishes it. The CLI does not keep its own copy. */
export interface OperationContract {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, Schema>;
    required: readonly string[];
    additionalProperties: false;
  };
  resultSchema: Schema;
}

export interface InvokeOptions {
  timeout?: number;
  signal: AbortSignal;
  stdout?(bytes: Uint8Array): void;
  stderr?(bytes: Uint8Array): void;
}

/** A selected boot: its trap table and a way to call one trap. */
export interface Mac {
  operations: readonly OperationContract[];
  invoke(name: string, args: Record<string, unknown>, options: InvokeOptions): Promise<unknown>;
}

export interface ListedSession {
  session: string;
  instance: string;
  generation: number;
}

export interface LiveClient {
  list(): Promise<readonly ListedSession[]>;
  open(session: string): Promise<Mac>;
}
