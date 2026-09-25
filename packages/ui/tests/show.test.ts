import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { Show } from "../src/show";

describe("Show", () => {
  it("calls zero-length callback children with an accessor", () => {
    let seen: unknown;
    const child = function (this: void) {
      seen = arguments[0];
      return "ok";
    };
    expect(child.length).toBe(0);

    createRoot(() => {
      const view = Show({
        when: "Macintosh HD",
        children: child as (item: () => string) => string,
      });
      const value = typeof view === "function" ? (view as () => unknown)() : view;
      expect(typeof seen).toBe("function");
      expect((seen as () => string)()).toBe("Macintosh HD");
      expect(value).toBe("ok");
    });
  });

  it("renders fallback when when is falsy", () => {
    createRoot(() => {
      const view = Show({
        when: false,
        fallback: "empty",
        children: () => "hidden",
      });
      const value = typeof view === "function" ? (view as () => unknown)() : view;
      expect(value).toBe("empty");
    });
  });
});
