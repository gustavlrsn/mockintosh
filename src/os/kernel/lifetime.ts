/** A lifetime owns cleanup, not authority or a process id. Cleanup is idempotent
 * and all resources are released even if one disposer fails. */
export class Lifetime {
  private cleanups = new Set<() => void>();
  closed = false;
  own(cleanup: () => void): () => void {
    if (this.closed) { cleanup(); return () => {}; }
    this.cleanups.add(cleanup);
    return () => this.cleanups.delete(cleanup);
  }
  close(): void {
    if (this.closed) return;
    this.closed = true;
    const cleanups = [...this.cleanups].reverse();
    this.cleanups.clear();
    for (const cleanup of cleanups) {
      try { cleanup(); } catch (error) { console.error("Resource cleanup failed", error); }
    }
  }
}
