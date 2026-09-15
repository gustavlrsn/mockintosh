function coded(message: string, code: string): Error {
  return Object.assign(new Error(message), { code });
}

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw coded("Operation cancelled", "cancellation");
}

export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      off();
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(coded("Operation cancelled", "cancellation"));
    };
    const off = () => signal?.removeEventListener("abort", onAbort);
    signal?.addEventListener("abort", onAbort);
  });
}

export function wait<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(coded("Operation cancelled", "cancellation"));
    signal?.addEventListener("abort", onAbort);
    promise.then(
      (value) => { signal?.removeEventListener("abort", onAbort); resolve(value); },
      (error) => { signal?.removeEventListener("abort", onAbort); reject(error); },
    );
  });
}

export function errorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "code" in error && typeof (error as { code: unknown }).code === "string") {
    return (error as { code: string }).code;
  }
  return undefined;
}
