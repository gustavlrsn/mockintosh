import type { JSX } from "@mockintosh/ui";
import { For } from "solid-js";

export interface PaginationProps {
  name?: string;
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

function pages(current: number, count: number): number[] {
  const out: number[] = [];
  const start = Math.max(1, Math.min(current - 2, count - 4));
  const end = Math.min(count, start + 4);
  for (let n = Math.max(1, end - 4); n <= end; n++) out.push(n);
  return out;
}

/** Prev / page / next. */
export function Pagination(props: PaginationProps): JSX.Element {
  const count = () => Math.max(1, props.pageCount);
  const page = () => Math.min(count(), Math.max(1, props.page));
  const go = (n: number) => {
    const next = Math.min(count(), Math.max(1, n));
    if (next !== page()) props.onChange(next);
  };

  return (
    <box
      semantic={{ name: props.name, role: "navigation", value: String(page()) }}
      flexDirection="row"
      gap={4}
      alignItems="center"
      alignSelf="flex-start"
    >
      <PageChip
        name={props.name ? `${props.name}:prev` : "prev"}
        label="Prev"
        disabled={page() <= 1}
        onClick={() => go(page() - 1)}
      />
      <For each={pages(page(), count())}>
        {(n) => (
          <PageChip
            name={props.name ? `${props.name}:${n}` : String(n)}
            label={String(n)}
            current={n === page()}
            onClick={() => go(n)}
          />
        )}
      </For>
      <PageChip
        name={props.name ? `${props.name}:next` : "next"}
        label="Next"
        disabled={page() >= count()}
        onClick={() => go(page() + 1)}
      />
    </box>
  );
}

function PageChip(props: {
  name: string;
  label: string;
  current?: boolean;
  disabled?: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <box
      semantic={{ name: props.name, role: "button", enabled: !props.disabled }}
      paddingLeft={5}
      paddingRight={5}
      paddingTop={2}
      paddingBottom={2}
      background={props.current ? 1 : 0}
      borderColor={1}
      borderWidth={1}
      tabIndex={props.disabled ? undefined : 0}
      cursor={props.disabled ? "default" : "pointer"}
      onClick={() => {
        if (!props.disabled) props.onClick();
      }}
      onKeyDown={(key: string) => {
        if ((key === "Enter" || key === " ") && !props.disabled) props.onClick();
      }}
    >
      <text font="body" color={props.current ? 0 : 1} stipple={props.disabled} nowrap>
        {props.label}
      </text>
    </box>
  );
}
