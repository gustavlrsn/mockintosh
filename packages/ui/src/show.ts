/**
 * Solid `<Show>` without the `children.length > 0` test.
 *
 * Upstream Show treats a callback child as a static node when
 * `children.length === 0`. The renderer then invokes it with no argument and
 * `item()` throws.
 */

import { createMemo, untrack, type Accessor } from "solid-js";
import type { JSX } from "./jsx-runtime";

export type ShowProps<T> = {
  when: T | undefined | null | false;
  keyed?: boolean;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: Accessor<NonNullable<T>>) => JSX.Element);
};

export function Show<T>(props: ShowProps<T>): JSX.Element {
  const conditionValue = createMemo(() => props.when);
  const condition = props.keyed
    ? conditionValue
    : createMemo(conditionValue, {
        equals: (left, right) => !left === !right,
        sync: true,
      });

  return createMemo(() => {
    const current = condition();
    if (!current) return props.fallback;
    const child = props.children;
    if (typeof child !== "function") return child;
    if (props.keyed) {
      return untrack(() => (child as (value: NonNullable<T>) => JSX.Element)(current));
    }
    return untrack(() =>
      child(() => {
        if (!untrack(condition)) throw new Error("Stale read from <Show>.");
        return conditionValue() as NonNullable<T>;
      }),
    );
  }) as unknown as JSX.Element;
}
