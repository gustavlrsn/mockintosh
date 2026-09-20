/**
 * "About This Macintosh…" — the Finder's About box. A Finder-owned dialog
 * window, as in System 7; there is no standalone About program.
 */
import type { JSX } from "@mockintosh/ui";
import { For } from "solid-js";
import pkg from "../../package.json";
import { useApp } from "@mockintosh/sdk";
import type { OSServices } from "../../src/os/context";
import { FINDER_APP_ID } from "../../src/os/state";
import { openSystemWindow } from "../../src/os/systemWindows";

export const ABOUT_BOX_TITLE = "About This Macintosh";

interface Contributor {
  username: string;
  commits: number;
}

const contributors: Contributor[] = [{ username: "gustavlrsn", commits: 74 }];

export function AboutBox(_props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const computer = app.getSprite("icon/computer");
  const user = app.getSprite("user2");

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
          <text font="body" nowrap>Mockintosh Classic</text>
          <text font="body" nowrap>{`System Version ${pkg.version}`}</text>
        </box>
      </box>
      <text font="body" nowrap>Contributors</text>
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
            <text font="body" nowrap>{`@${c.username}`}</text>
            <box flexGrow={1} />
            <text font="body" nowrap>{`${c.commits} commits`}</text>
          </box>
        )}
      </For>
    </box>
  );
}

/** Open the Finder's About box, or bring the open one to the front. */
export function openAboutBox(os: OSServices): string {
  return openSystemWindow(os, FINDER_APP_ID, {
    title: ABOUT_BOX_TITLE,
    kind: "dialog",
    size: { width: 343, height: 160 },
    Component: AboutBox,
  });
}
