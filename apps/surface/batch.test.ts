import { describe, expect, it } from "vitest";
import { MAX_BATCH_PRINTS, parseConstant, planBatch } from "./batch";

describe("parseConstant", () => {
  it("reads numbers and constant expressions", () => {
    expect(parseConstant("0.25")).toBe(0.25);
    expect(parseConstant("pi/4")).toBeCloseTo(Math.PI / 4);
    expect(parseConstant("2pi")).toBeCloseTo(Math.PI * 2);
  });

  it("rejects blanks, junk and expressions that vary", () => {
    expect(parseConstant("")).toBeNull();
    expect(parseConstant("1 +")).toBeNull();
    expect(parseConstant("t")).toBeNull();
    expect(parseConstant("x + 1")).toBeNull();
  });
});

describe("planBatch", () => {
  it("includes both ends when the step lands on the end", () => {
    expect(planBatch(0, "0.5", "2")).toEqual({ ok: true, times: [0, 0.5, 1, 1.5, 2] });
  });

  it("stops at the last step before an end it can't land on", () => {
    expect(planBatch(0, "0.4", "1")).toEqual({ ok: true, times: [0, 0.4, 0.8] });
  });

  it("counts a whole period of pi steps without losing the last one to rounding", () => {
    const plan = planBatch(0, "pi/8", "pi");
    expect(plan.ok && plan.times.length).toBe(9);
  });

  it("goes backwards with a negative step", () => {
    expect(planBatch(2, "-1", "0")).toEqual({ ok: true, times: [2, 1, 0] });
  });

  it("prints once when the end is where it starts", () => {
    expect(planBatch(1.5, "0.1", "1.5")).toEqual({ ok: true, times: [1.5] });
  });

  it("explains a step that never reaches the end", () => {
    expect(planBatch(0, "0", "1")).toEqual({ ok: false, reason: "Step must be above 0" });
    expect(planBatch(0, "-1", "1")).toEqual({ ok: false, reason: "Step must be above 0" });
    expect(planBatch(1, "1", "0")).toEqual({ ok: false, reason: "Step must be below 0 to go back" });
  });

  it("refuses runaway batches", () => {
    const plan = planBatch(0, "0.001", "10");
    expect(plan.ok).toBe(false);
    expect("reason" in plan && plan.reason).toContain(`at most ${MAX_BATCH_PRINTS}`);
  });
});
