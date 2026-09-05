import type { JSX } from "solid-js";
import { For } from "solid-js";
import { useOS } from "../src/os/context";
import { registerApp } from "../src/os/apps";
import pkg from "../package.json";

const contributors = [{ username: "gustavlrsn", commits: 74 }];

export function About(props: Record<string, unknown>): JSX.Element {
  const os = useOS();
  const computer = os.sprites.get("icon/computer");
  const user = os.sprites.get("user2");

  return (
    <box width="100%" height="100%" padding={8} flexDirection="column" gap={4} background={0}>
      <box flexDirection="row" gap={8} alignItems="center">
        {computer && (
          <image
            width={computer.width}
            height={computer.height}
            src={{ width: computer.width, height: computer.height, data: computer.data, mask: computer.mask }}
          />
        )}
        <box flexDirection="column" gap={2}>
          <text font="body">Mockintosh Classic</text>
          <text font="body">{`System Version ${pkg.version}`}</text>
        </box>
      </box>
      <text font="body">Contributors</text>
      <box height={1} background={1} />
      <For each={contributors}>
        {(c) => (
          <box flexDirection="row" alignItems="center" gap={8}>
            {user && (
              <image
                width={user.width}
                height={user.height}
                src={{ width: user.width, height: user.height, data: user.data, mask: user.mask }}
              />
            )}
            <text font="body">{`@${c.username}`}</text>
            <box flexGrow={1} />
            <text font="body">{`${c.commits} commits`}</text>
          </box>
        )}
      </For>
    </box>
  );
}

registerApp({
  id: "about",
  title: "About This Mockintosh",
  icon: "icon/computer",
  defaultSize: { width: 343, height: 160 },
  windowKind: "dialog",
  scrollable: false,
  singleInstance: true,
  Component: About,
});
