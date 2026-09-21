import { flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { createPress } from "../src/primitives/press";
import { createToggle } from "../src/primitives/toggle";
import { createSlider } from "../src/primitives/slider";

const SLIDER = { thumb: 12, trackH: 16 };

describe("createPress", () => {
  it("fires on mouseup and Enter, not when disabled", () => {
    let n = 0;
    const props = { name: "ok", onClick: () => { n += 1; }, disabled: false };
    const press = createPress(props);

    press.rootProps().onMouseDown();
    flush();
    expect(press.pressed()).toBe(true);
    press.rootProps().onMouseUp();
    flush();
    expect(press.pressed()).toBe(false);
    expect(n).toBe(1);

    press.rootProps().onKeyDown("Enter");
    press.rootProps().onKeyDown(" ");
    press.rootProps().onKeyDown("a");
    expect(n).toBe(3);

    press.rootProps().onMouseDown();
    press.rootProps().onMouseLeave();
    flush();
    expect(press.pressed()).toBe(false);

    props.disabled = true;
    press.rootProps().onMouseDown();
    flush();
    expect(press.pressed()).toBe(false);
    press.rootProps().onMouseUp();
    press.rootProps().onKeyDown("Enter");
    expect(n).toBe(3);
    expect(press.rootProps().semantic).toEqual({
      name: "ok",
      role: "button",
      enabled: false,
    });
    expect(press.rootProps().tabIndex).toBeUndefined();
  });
});

describe("createToggle", () => {
  it("flips on click and Space, not when disabled", () => {
    let checked = false;
    const props = {
      name: "agree",
      get checked() { return checked; },
      onChange: (next: boolean) => { checked = next; },
      disabled: false,
    };
    const toggle = createToggle(props);

    toggle.flip();
    expect(checked).toBe(true);
    toggle.rootProps().onClick();
    expect(checked).toBe(false);
    toggle.rootProps().onKeyDown(" ");
    expect(checked).toBe(true);
    toggle.rootProps().onKeyDown("Enter");
    expect(checked).toBe(false);
    toggle.rootProps().onKeyDown("a");
    expect(checked).toBe(false);

    expect(toggle.rootProps().semantic).toEqual({
      name: "agree",
      role: "checkbox",
      value: "false",
      enabled: true,
    });
    expect(toggle.rootProps().cursor).toBe("pointer");

    props.disabled = true;
    toggle.flip();
    expect(checked).toBe(false);
    expect(toggle.rootProps().semantic.enabled).toBe(false);
    expect(toggle.rootProps().tabIndex).toBeUndefined();
    expect(toggle.rootProps().cursor).toBe("default");
  });
});

describe("createSlider", () => {
  it("maps local x and arrow keys through snap", () => {
    let value = 0;
    const props = {
      name: "vol",
      get value() { return value; },
      onChange: (next: number) => { value = next; },
      min: 0,
      max: 10,
      step: 1,
      width: 112,
      disabled: false,
    };
    const slider = createSlider(props, SLIDER);

    expect(slider.valueFromLocalX(110)).toBe(10);
    slider.rootProps().onMouseDown(110);
    expect(value).toBe(10);
    expect(slider.thumbX()).toBe(100);

    value = 4;
    expect(slider.thumbX()).toBe(Math.round((4 / 10) * (112 - 12)));
    slider.rootProps().onKeyDown("ArrowRight");
    expect(value).toBe(5);
    slider.rootProps().onKeyDown("ArrowLeft");
    expect(value).toBe(4);
    slider.rootProps().onKeyDown("ArrowUp");
    expect(value).toBe(5);
    slider.rootProps().onKeyDown("a");
    expect(value).toBe(5);

    expect(slider.rootProps().semantic).toEqual({
      name: "vol",
      role: "slider",
      value: "5",
      enabled: true,
    });

    props.disabled = true;
    slider.rootProps().onMouseDown(0);
    slider.rootProps().onKeyDown("ArrowLeft");
    expect(value).toBe(5);
  });

  it("uses the skin thumb size for hit math", () => {
    let value = 0;
    const slider = createSlider(
      { get value() { return value; }, onChange: (next) => { value = next; }, min: 0, max: 10, width: 100 },
      { thumb: 20, trackH: 16 },
    );
    expect(slider.valueFromLocalX(10)).toBe(0);
    expect(slider.valueFromLocalX(90)).toBe(10);
    value = 5;
    expect(slider.thumbX()).toBe(40);
  });
});
