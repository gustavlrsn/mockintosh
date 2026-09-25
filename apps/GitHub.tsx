import { For, Show, createEffect, createMemo, createSignal } from "@mockintosh/sdk";
import type { JSX } from "@mockintosh/ui";
import { Badge, Breadcrumb, Button, Errored, Loading, Markdown, Tabs, TextInput, useApp, defineApp } from "@mockintosh/sdk";
import {
  GithubError,
  loadPage,
  type CommentInfo,
  type CommitInfo,
  type DirEntry,
  type GithubPage,
  type IssueInfo,
  type RepoInfo,
} from "./github/api";
import { commitSubject, formatAge, formatBytes, formatCount } from "./github/format";
import { formatGithubLocation, parseGithubLocation, type GithubLocation } from "./github/location";

const TOKEN_KEY = "token.txt";

function GitHub(_props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const win = app.window;
  const fetch = app.fetch!;
  const [address, setAddress] = createSignal("");
  const [location, setLocation] = createSignal<GithubLocation>({ kind: "home" });
  const [back, setBack] = createSignal<GithubLocation[]>([]);
  const [token, setToken] = createSignal("");
  const [addressError, setAddressError] = createSignal("");

  const storedToken = createMemo(async () => app.storage.read(TOKEN_KEY));
  createEffect(
    () => storedToken(),
    (saved) => {
      if (saved) setToken(saved);
    },
  );

  createEffect(
    () => ({ signedIn: token() !== "", canBack: back().length > 0 }),
    (state) => {
      app.setMenus([
        {
          label: "File",
          items: [
            { label: "Back", shortcut: "[", disabled: !state.canBack, onClick: () => pop() },
            { type: "separator" },
            { label: state.signedIn ? "Token…" : "Sign In…", onClick: () => void editToken() },
            { label: "Sign Out", disabled: !state.signedIn, onClick: () => void signOut() },
            { type: "separator" },
            { label: "Quit", shortcut: "Q", onClick: () => app.quit() },
          ],
        },
      ]);
    },
  );

  const page = createMemo(async () => {
    const current = location();
    if (current.kind === "home") return null;
    return loadPage(fetch, token(), current);
  });

  function visit(next: GithubLocation): void {
    const current = location();
    if (current.kind !== "home") setBack((stack) => [...stack, current]);
    show(next);
  }

  function pop(): void {
    const stack = back();
    const previous = stack[stack.length - 1];
    if (!previous) return;
    setBack(stack.slice(0, -1));
    show(previous);
  }

  function show(next: GithubLocation): void {
    setAddressError("");
    setLocation(next);
    setAddress(formatGithubLocation(next));
    win.setTitle(next.kind === "home" ? "GitHub" : `${next.owner}/${next.repo}`);
  }

  function submitAddress(): void {
    const parsed = parseGithubLocation(address());
    if (!parsed) {
      setAddressError("Use owner/repo or a github.com URL.");
      return;
    }
    visit(parsed);
  }

  async function editToken(): Promise<void> {
    const entered = await app.os.showDialog({
      message: "GitHub token. Public repositories load without one; a token raises the rate limit and opens private repositories.",
      showInput: true,
      inputDefault: token(),
      buttons: ["OK"],
      variant: "note",
    });
    const next = (entered ?? "").trim();
    setToken(next);
    if (next) await app.storage.write(TOKEN_KEY, next);
    else await app.storage.remove(TOKEN_KEY);
  }

  async function signOut(): Promise<void> {
    setToken("");
    await app.storage.remove(TOKEN_KEY);
  }

  return (
    <box width={win.width()} height={win.height()} flexDirection="column" background={0}>
      <box height={22} flexDirection="row" gap={4} padding={2} alignItems="center">
        <Button label="Back" onClick={pop} disabled={back().length === 0} />
        <TextInput
          value={address()}
          onChange={setAddress}
          onSubmit={() => submitAddress()}
          placeholder="owner/repo"
          width={win.width() - 120}
        />
        <Button label="Go" onClick={submitAddress} />
      </box>
      <box overflow="scroll" flexGrow={1} flexShrink={1} minHeight={0} padding={6}>
        <Show when={addressError()}>
          <text font="body" wrap>{addressError()}</text>
        </Show>
        <Loading fallback={<text font="body">Loading…</text>}>
          <Errored
            fallback={(err) => {
              const value = err();
              const message = value instanceof GithubError ? value.message : "Could not reach GitHub.";
              return <text font="body" wrap>{message}</text>;
            }}
          >
            <Show when={location().kind === "home" && !addressError()}>
              <box flexDirection="column" gap={6}>
                <text font="menu">GitHub</text>
                <text font="body" wrap>Enter a repository, the same way you would open it on github.com.</text>
              </box>
            </Show>
            <Show when={page()}>
              {(loaded) => <RepoPage page={loaded()} onVisit={visit} />}
            </Show>
          </Errored>
        </Loading>
      </box>
    </box>
  );
}

function RepoPage(props: { page: GithubPage; onVisit: (location: GithubLocation) => void }): JSX.Element {
  const page = () => props.page;
  const repo = () => page().repo;
  const tab = () => {
    const view = page().view;
    if (view === "issues" || view === "issue") return "issues";
    if (view === "pulls" || view === "pull") return "pulls";
    return "code";
  };

  function openTab(value: string): void {
    const { owner, name } = repo();
    if (value === "issues") props.onVisit({ kind: "issues", owner, repo: name });
    else if (value === "pulls") props.onVisit({ kind: "pulls", owner, repo: name });
    else props.onVisit({ kind: "tree", owner, repo: name, ref: refOf(page()), path: "" });
  }

  return (
    <box flexDirection="column" gap={6} width="100%">
      <RepoHeader repo={repo()} onRoot={() => openTab("code")} />
      <Tabs
        name="github"
        value={tab()}
        onChange={openTab}
        items={[
          { value: "code", label: "Code" },
          { value: "issues", label: "Issues" },
          { value: "pulls", label: "Pull requests" },
        ]}
      />
      <Show when={page().view === "tree"}>
        <TreeView page={page() as Extract<GithubPage, { view: "tree" }>} onVisit={props.onVisit} />
      </Show>
      <Show when={page().view === "blob"}>
        <BlobView page={page() as Extract<GithubPage, { view: "blob" }>} onVisit={props.onVisit} />
      </Show>
      <Show when={page().view === "issues" || page().view === "pulls"}>
        <IssueList
          items={page().view === "pulls" ? (page() as Extract<GithubPage, { view: "pulls" }>).pulls : (page() as Extract<GithubPage, { view: "issues" }>).issues}
          empty={page().view === "pulls" ? "No open pull requests." : "No open issues."}
          onOpen={(number) => {
            const { owner, name } = repo();
            props.onVisit(page().view === "pulls"
              ? { kind: "pull", owner, repo: name, number }
              : { kind: "issue", owner, repo: name, number });
          }}
        />
      </Show>
      <Show when={page().view === "issue" || page().view === "pull"}>
        <IssueView
          item={page().view === "pull" ? (page() as Extract<GithubPage, { view: "pull" }>).pull : (page() as Extract<GithubPage, { view: "issue" }>).issue}
          comments={page().view === "pull" ? (page() as Extract<GithubPage, { view: "pull" }>).comments : (page() as Extract<GithubPage, { view: "issue" }>).comments}
        />
      </Show>
    </box>
  );
}

function RepoHeader(props: { repo: RepoInfo; onRoot: () => void }): JSX.Element {
  const repo = () => props.repo;
  return (
    <box flexDirection="column" gap={3}>
      <box flexDirection="row" gap={6} alignItems="center">
        <box cursor="pointer" onClick={props.onRoot}>
          <text font="menu" nowrap>{`${repo().owner} / ${repo().name}`}</text>
        </box>
        <Badge>{repo().visibility}</Badge>
      </box>
      <Show when={repo().description}>
        <text font="body" wrap>{repo().description}</text>
      </Show>
      <text font="body" wrap>
        {`Star ${formatCount(repo().stars)}    Fork ${formatCount(repo().forks)}    Watch ${formatCount(repo().watchers)}`}
      </text>
      <Show when={repo().language || repo().license || repo().topics.length > 0}>
        <text font="body" wrap>
          {[repo().language, repo().license, ...repo().topics].filter(Boolean).join("  ·  ")}
        </text>
      </Show>
      <Show when={repo().homepage}>
        <text font="body" wrap>{repo().homepage}</text>
      </Show>
    </box>
  );
}

function TreeView(props: { page: Extract<GithubPage, { view: "tree" }>; onVisit: (location: GithubLocation) => void }): JSX.Element {
  const page = () => props.page;
  return (
    <box flexDirection="column" gap={6} width="100%">
      <text font="body" nowrap>{page().ref}</text>
      <Show when={page().commit}>
        {(commit) => <CommitBar commit={commit()} />}
      </Show>
      <PathBar
        repo={page().repo}
        refName={page().ref}
        path={page().path}
        onVisit={props.onVisit}
      />
      <box flexDirection="column" borderColor={1} borderWidth={1}>
        <For each={page().entries}>
          {(entry) => (
            <FileRow
              entry={entry}
              onOpen={() => {
                const { owner, name } = page().repo;
                props.onVisit(entry.type === "dir"
                  ? { kind: "tree", owner, repo: name, ref: page().ref, path: entry.path }
                  : { kind: "blob", owner, repo: name, ref: page().ref, path: entry.path });
              }}
            />
          )}
        </For>
      </box>
      <Show when={page().readme}>
        {(readme) => (
          <box flexDirection="column" gap={4} borderColor={1} borderWidth={1} padding={6}>
            <text font="menu">README</text>
            <Markdown text={readme()} />
          </box>
        )}
      </Show>
    </box>
  );
}

function BlobView(props: { page: Extract<GithubPage, { view: "blob" }>; onVisit: (location: GithubLocation) => void }): JSX.Element {
  const page = () => props.page;
  const file = () => page().file;
  return (
    <box flexDirection="column" gap={4} width="100%">
      <PathBar repo={page().repo} refName={page().ref} path={file().path} onVisit={props.onVisit} />
      <text font="body" nowrap>{formatBytes(file().size)}</text>
      <Show when={file().note}>
        <text font="body" wrap>{file().note}</text>
      </Show>
      <Show when={file().text}>
        {(text) => (
          <box borderColor={1} borderWidth={1} padding={4}>
            <text font="mono" wrap>{text()}</text>
          </box>
        )}
      </Show>
    </box>
  );
}

function FileRow(props: { entry: DirEntry; onOpen: () => void }): JSX.Element {
  const entry = () => props.entry;
  const label = () => (entry().type === "dir" ? `${entry().name}/` : entry().name);
  return (
    <box padding={3} cursor="pointer" onClick={props.onOpen}>
      <text font="body" nowrap>{label()}</text>
    </box>
  );
}

function CommitBar(props: { commit: CommitInfo }): JSX.Element {
  const commit = () => props.commit;
  return (
    <text font="body" wrap>
      {`${commit().sha}  ${commitSubject(commit().message)}  ${commit().author}  ${formatAge(commit().date, Date.now())}`}
    </text>
  );
}

function PathBar(props: {
  repo: RepoInfo;
  refName: string;
  path: string;
  onVisit: (location: GithubLocation) => void;
}): JSX.Element {
  const parts = () => props.path.split("/").filter(Boolean);
  return (
    <Breadcrumb
      items={[
        {
          label: props.repo.name,
          onClick: () => props.onVisit({ kind: "tree", owner: props.repo.owner, repo: props.repo.name, ref: props.refName, path: "" }),
        },
        ...parts().map((part, index) => ({
          label: part,
          onClick: () => props.onVisit({
            kind: "tree" as const,
            owner: props.repo.owner,
            repo: props.repo.name,
            ref: props.refName,
            path: parts().slice(0, index + 1).join("/"),
          }),
        })),
      ]}
    />
  );
}

function IssueList(props: { items: IssueInfo[]; empty: string; onOpen: (number: number) => void }): JSX.Element {
  return (
    <Show when={props.items.length > 0} fallback={<text font="body">{props.empty}</text>}>
      <box flexDirection="column" gap={4}>
        <For each={props.items}>
          {(issue) => (
            <box flexDirection="column" gap={1} cursor="pointer" onClick={() => props.onOpen(issue.number)}>
              <text font="menu" wrap>{issue.title}</text>
              <text font="body" wrap>
                {`#${issue.number} opened ${formatAge(issue.createdAt, Date.now())} by ${issue.user}  ·  ${issue.comments} comments`}
              </text>
            </box>
          )}
        </For>
      </box>
    </Show>
  );
}

function IssueView(props: { item: IssueInfo; comments: CommentInfo[] }): JSX.Element {
  const item = () => props.item;
  return (
    <box flexDirection="column" gap={6}>
      <text font="menu" wrap>{item().title}</text>
      <text font="body" wrap>
        {`#${item().number} ${item().state}  opened ${formatAge(item().createdAt, Date.now())} by ${item().user}`}
      </text>
      <Show when={item().body} fallback={<text font="body">No description.</text>}>
        <Markdown text={item().body} />
      </Show>
      <For each={props.comments}>
        {(comment) => (
          <box flexDirection="column" gap={2} borderColor={1} borderWidth={1} padding={4}>
            <text font="body">{`${comment.user}  ${formatAge(comment.createdAt, Date.now())}`}</text>
            <Markdown text={comment.body} />
          </box>
        )}
      </For>
    </box>
  );
}

function refOf(page: GithubPage): string {
  if (page.view === "tree" || page.view === "blob") return page.ref;
  return page.repo.defaultBranch;
}

export default defineApp({
  id: "github",
  requires: ["network"],
  title: "GitHub",
  icon: "icon/safari",
  about: { description: "Opens a GitHub repository the way the website does: files, README, issues, and pull requests." },
  defaultSize: { width: 460, height: 300 },
  scrollable: true,
  resizable: true,
  minSize: { width: 280, height: 180 },
  Component: GitHub,
});
