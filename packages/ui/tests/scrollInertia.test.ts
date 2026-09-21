import { describe, it, expect } from "vitest";
import {
  createPanVelocity,
  FLICK_MIN_VELOCITY,
  FLICK_STOP_VELOCITY,
  stepFlick,
} from "../src/scrollInertia";

describe("stepFlick", () => {
  it("decays toward zero and integrates a positive displacement", () => {
    const first = stepFlick(1, 16);
    expect(first.dy).toBeGreaterThan(0);
    expect(first.velocity).toBeGreaterThan(0);
    expect(first.velocity).toBeLessThan(1);
    expect(stepFlick(first.velocity, 16).velocity).toBeLessThan(first.velocity);
  });

  it("stops once slower than the rest threshold", () => {
    const next = stepFlick(FLICK_STOP_VELOCITY * 0.5, 16);
    expect(next.velocity).toBe(0);
    expect(next.dy).toBeGreaterThan(0);
  });
});

describe("createPanVelocity", () => {
  it("reports a flick after a fast upward swipe", () => {
    const v = createPanVelocity();
    v.reset(40, 0);
    v.sample(20, 16);
    expect(v.release(16)).toBeGreaterThan(FLICK_MIN_VELOCITY);
  });

  it("ignores a paused finger", () => {
    const v = createPanVelocity();
    v.reset(40, 0);
    v.sample(20, 16);
    expect(v.release(200)).toBe(0);
  });

  it("does not invent a flick from same-timestamp samples", () => {
    const v = createPanVelocity();
    v.reset(40, 0);
    v.sample(8, 0);
    expect(v.release(0)).toBe(0);
  });
});
