import {Lifetime} from "./kernel/lifetime";
/** Actual app launches own windows and registered cleanup. The window store
 * remains authoritative for window geometry and rendering. */
export class AppInstances {
  private records = new Map<string, {id: string; app: string; build?: string; windows: Set<string>; retained: number; lifetime: Lifetime; error?: string; kernelCaller?: {id: string; instance: string; generation: number}}>();
  private next = 0;
  constructor(private closeWindow: (id: string) => void) {}
  create(app: string, build?: string): string {
    const id = `instance-${++this.next}`;
    this.records.set(id, {id, app, build, windows: new Set(), retained: 0, lifetime: new Lifetime()});
    return id;
  }
  alive(id: string) { return this.records.has(id) && !this.records.get(id)!.lifetime.closed; }
  finishOpen(id: string) { const record = this.records.get(id); if (record && !record.windows.size && !record.retained) this.stop(id); }
  retain(id: string): () => void {
    const record = this.records.get(id);
    if (!record || record.lifetime.closed) throw new Error("App instance ended");
    record.retained++;
    let released = false;
    return () => { if (released) return; released = true; record.retained--; this.finishOpen(id); };
  }
  kernelCaller(id: string) { return this.records.get(id)?.kernelCaller; }
  setKernelCaller(id: string, caller: {id: string; instance: string; generation: number}) {
    const record = this.records.get(id);
    if (record) record.kernelCaller = caller;
  }
  own(id: string, cleanup: () => void) {
    const record = this.records.get(id);
    if (!record || record.lifetime.closed) { cleanup(); return; }
    record.lifetime.own(cleanup);
  }
  addWindow(id: string, window: string) {
    const record = this.records.get(id);
    if (!record || record.lifetime.closed) throw new Error("App instance ended");
    record.windows.add(window);
  }
  removeWindow(window: string) {
    for (const record of this.records.values()) if (record.windows.delete(window) && !record.windows.size && !record.retained) this.stop(record.id);
  }
  fail(id: string, error: unknown) {
    const record = this.records.get(id);
    if (record) { record.error = error instanceof Error ? error.message : String(error); record.lifetime.close(); }
  }
  list() { return [...this.records.values()].map(({id, app, build, windows, error}) => ({id, app, build, windows: [...windows], error})); }
  stop(id: string) {
    const record = this.records.get(id);
    if (!record) return;
    this.records.delete(id);
    record.lifetime.close();
    for (const window of record.windows) this.closeWindow(window);
  }
  stopApp(app: string) { for (const record of [...this.records.values()]) if (record.app === app) this.stop(record.id); }
  close() { for (const id of [...this.records.keys()]) this.stop(id); }
}
