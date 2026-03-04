/**
 * Lightweight hook-based state management for apps.
 * Provides useState, useEffect, useMemo with the same
 * cursor-based slot pattern as React hooks.
 */
export class AppBuilder {
  private hooks: any[] = [];
  private hookIndex = 0;
  private effects: { fn: () => (() => void) | void; deps: any[] | undefined; cleanup?: () => void }[] = [];
  private effectIndex = 0;
  private _needsRender = false;
  private _renderFn: (() => void) | null = null;
  private _rafId: number | null = null;

  /**
   * Call before each render to reset hook cursors.
   */
  resetForRender() {
    this.hookIndex = 0;
    this.effectIndex = 0;
  }

  /**
   * Call after render to run pending effects.
   */
  flushEffects() {
    // effects were registered during render; now run them
    for (let i = 0; i < this.effects.length; i++) {
      const eff = this.effects[i];
      if (eff && (eff as any).__pendingRun) {
        if (eff.cleanup) eff.cleanup();
        eff.cleanup = eff.fn() as any || undefined;
        (eff as any).__pendingRun = false;
      }
    }
  }

  /**
   * Clean up all effects (on app close).
   */
  destroy() {
    for (const eff of this.effects) {
      if (eff?.cleanup) eff.cleanup();
    }
    this.effects = [];
    this.hooks = [];
    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
  }

  setRenderFunction(fn: () => void) {
    this._renderFn = fn;
  }

  scheduleRender() {
    if (this._needsRender) return;
    this._needsRender = true;
    this._rafId = requestAnimationFrame(() => {
      this._needsRender = false;
      this._rafId = null;
      this._renderFn?.();
    });
  }

  // --- Hooks ---

  useState<T>(initial: T): [T, (value: T | ((prev: T) => T)) => void] {
    const idx = this.hookIndex++;
    if (this.hooks[idx] === undefined) {
      this.hooks[idx] = initial;
    }
    const setState = (value: T | ((prev: T) => T)) => {
      const prev = this.hooks[idx];
      const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
      if (prev !== next) {
        this.hooks[idx] = next;
        this.scheduleRender();
      }
    };
    return [this.hooks[idx] as T, setState];
  }

  useEffect(fn: () => (() => void) | void, deps?: any[]) {
    const idx = this.effectIndex++;
    const prev = this.effects[idx];
    if (!prev) {
      this.effects[idx] = { fn, deps, __pendingRun: true } as any;
    } else {
      if (!deps || !prev.deps || !depsEqual(prev.deps, deps)) {
        this.effects[idx] = { ...prev, fn, deps, __pendingRun: true } as any;
      }
    }
  }

  useMemo<T>(fn: () => T, deps: any[]): T {
    const idx = this.hookIndex++;
    const prev = this.hooks[idx];
    if (!prev || !depsEqual(prev.deps, deps)) {
      const value = fn();
      this.hooks[idx] = { value, deps };
      return value;
    }
    return prev.value;
  }

  useRef<T>(initial: T): { current: T } {
    const idx = this.hookIndex++;
    if (this.hooks[idx] === undefined) {
      this.hooks[idx] = { current: initial };
    }
    return this.hooks[idx];
  }
}

function depsEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}
