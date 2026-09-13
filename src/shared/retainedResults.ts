export interface RetentionLimits { maxEntries: number; maxBytes: number; ttlMs: number }
export const defaultRetention: RetentionLimits = {maxEntries: 256, maxBytes: 8 * 1024 * 1024, ttlMs: 5 * 60 * 1000};
/** Serialized bounded journal: entries cannot retain sockets or mutable runtime objects. */
export class RetainedResults<T> {
  private records = new Map<string, {json: string; bytes: number; expires: number}>();
  private bytes = 0;
  constructor(private limits = defaultRetention, private now = Date.now) {}
  prune() {
    for (const [id, record] of this.records) if (record.expires <= this.now()) this.delete(id);
  }
  delete(id: string) {
    const record = this.records.get(id);
    if (record) this.bytes -= record.bytes;
    this.records.delete(id);
  }
  set(id: string, value: T) {
    this.prune(); this.delete(id);
    const json = JSON.stringify(value), bytes = new TextEncoder().encode(json).length;
    if (bytes > this.limits.maxBytes || this.limits.maxEntries < 1) return;
    while (this.records.size >= this.limits.maxEntries || this.bytes + bytes > this.limits.maxBytes) this.delete(this.records.keys().next().value!);
    this.records.set(id, {json, bytes, expires: this.now() + this.limits.ttlMs});
    this.bytes += bytes;
  }
  get(id: string): T | undefined {
    this.prune();
    const record = this.records.get(id);
    return record ? JSON.parse(record.json) as T : undefined;
  }
  has(id: string) { return this.get(id) !== undefined; }
  entries(): [string, T][] { this.prune(); return [...this.records].map(([id, record]) => [id, JSON.parse(record.json) as T]); }
  clear() { this.records.clear(); this.bytes = 0; }
}
