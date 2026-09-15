import type { Schema } from "@mockintosh/protocol";

/** A kernel trap this app may call. `kernel:*` is every registered operation. */
export type KernelPermission = `kernel:${string}`;

export interface OperationContract {
  name: string;
  description: string;
  inputSchema: Schema;
  resultSchema: Schema;
}

export interface KernelInvokeOptions {
  signal?: AbortSignal;
  stdout?: (bytes: Uint8Array) => void;
  stderr?: (bytes: Uint8Array) => void;
}

export interface KernelClient {
  invoke(name: string, args?: Record<string, unknown>, options?: KernelInvokeOptions): Promise<unknown>;
  describe(): readonly OperationContract[];
}
