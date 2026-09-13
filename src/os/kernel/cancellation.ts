import { ServiceError } from "./errors";
export class Cancellation {
  private listeners = new Set<() => void>();
  cancelled = false;
  cancel() {
    if (this.cancelled) return;
    this.cancelled = true;
    for (const fn of this.listeners) fn();
    this.listeners.clear();
  }
  check() {
    if (this.cancelled) throw new ServiceError("cancellation", "Operation cancelled");
  }
  subscribe(fn: () => void) {
    if (this.cancelled) fn();else this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  /** Stop waiting without abandoning observation of a later rejection. */
  wait<T>(promise: Promise<T>): Promise<T> {
    this.check();
    return new Promise((resolve, reject) => {
      const off = this.subscribe(() => reject(new ServiceError("cancellation", "Operation cancelled")));
      promise.then(value => { off(); resolve(value); }, error => { off(); reject(error); });
    });
  }
  delay(ms: number): Promise<void> {
    this.check();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        off();
        resolve();
      }, ms);
      const off = this.subscribe(() => {
        clearTimeout(timer);
        reject(new ServiceError("cancellation", "Operation cancelled"));
      });
    });
  }
}
