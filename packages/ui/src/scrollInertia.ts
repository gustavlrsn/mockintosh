/**
 * Touch-flick coast for overflow:scroll. Exponential decay after finger-up
 * so a pan does not stop on the last drag sample.
 */

/** UIScrollView "normal" rate, per millisecond. */
export const FLICK_DECELERATION = 0.998;
export const FLICK_STOP_VELOCITY = 0.015;
export const FLICK_MIN_VELOCITY = 0.08;
export const FLICK_STALE_MS = 80;

export function stepFlick(velocity: number, dt: number): { velocity: number; dy: number } {
  if (dt <= 0 || velocity === 0) return { velocity, dy: 0 };
  const next = velocity * Math.pow(FLICK_DECELERATION, dt);
  const dy = (velocity + next) * 0.5 * dt;
  return {
    velocity: Math.abs(next) < FLICK_STOP_VELOCITY ? 0 : next,
    dy,
  };
}

export interface PanVelocity {
  reset(y: number, t: number): void;
  /** `y` is pointer Y; velocity is scroll-space (finger up → positive). */
  sample(y: number, t: number): void;
  /** 0 if the finger paused or the flick is too slow. */
  release(t: number): number;
}

export function createPanVelocity(): PanVelocity {
  let v = 0;
  let lastY = 0;
  let lastT = 0;
  let armed = false;

  return {
    reset(y, t) {
      v = 0;
      lastY = y;
      lastT = t;
      armed = true;
    },
    sample(y, t) {
      if (!armed) {
        lastY = y;
        lastT = t;
        armed = true;
        return;
      }
      const dt = t - lastT;
      const dy = lastY - y;
      lastY = y;
      lastT = t;
      if (dt < 1) return;
      const inst = dy / dt;
      if (dt > FLICK_STALE_MS) {
        v = inst;
        return;
      }
      const alpha = 1 - Math.exp(-dt / 16);
      v += (inst - v) * alpha;
    },
    release(t) {
      if (!armed || t - lastT > FLICK_STALE_MS) return 0;
      return Math.abs(v) < FLICK_MIN_VELOCITY ? 0 : v;
    },
  };
}
