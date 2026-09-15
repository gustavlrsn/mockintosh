/**
 * Ambient types every in-OS project compile sees. These are host globals the
 * core already assumes (`core-env.d.ts`); they are not DOM APIs.
 */
export const APP_ENV_DTS = `
declare const console: {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
};
declare function setTimeout(callback: () => void, ms?: number): number;
declare function clearTimeout(id: number | null | undefined): void;
declare function setInterval(callback: () => void, ms?: number): number;
declare function clearInterval(id: number | null | undefined): void;
declare class TextEncoder { encode(input?: string): Uint8Array }
declare class TextDecoder {
  constructor(label?: string);
  decode(input?: ArrayBufferView | ArrayBuffer): string;
}
interface AbortSignal {
  readonly aborted: boolean;
  addEventListener(type: "abort", listener: () => void, options?: { once?: boolean }): void;
  removeEventListener(type: "abort", listener: () => void): void;
}
declare class AbortController {
  readonly signal: AbortSignal;
  abort(): void;
}
`;
