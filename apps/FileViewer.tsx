import { Show, createSignal, onMount, type JSX } from "solid-js";
import { registerApp } from "../src/os/apps";
import { useOS } from "../src/os/context";
import { useWindow } from "../src/os/windowContext";
import { MarkdownView } from "./MarkdownView";

function looksLikeMarkdown(title: string, content: string): boolean {
  if (/\.(md|markdown)$/i.test(title)) return true;
  return /^#{1,2}\s|^\*\s|^\-\s/m.test(content.slice(0, 400));
}

export function FileViewer(props: Record<string, unknown>): JSX.Element {
  const os = useOS();
  const win = useWindow();
  const [content, setContent] = createSignal((props.content as string) ?? "");
  const title = () => String(props.title ?? "File");

  onMount(() => {
    const fileId = props.fileId as string | undefined;
    if (fileId && !props.content) {
      void os.fs.readFile(fileId).then((text) => {
        if (text !== null) setContent(text);
      });
    }
    if (props.title) win.setTitle(String(props.title));
  });

  return (
    <box
      width={win.width()}
      height={win.height()}
      padding={8}
      overflow="scroll"
      background={0}
    >
      <Show
        when={looksLikeMarkdown(title(), content())}
        fallback={
          <text font="body" wrap>
            {content() || " "}
          </text>
        }
      >
        <MarkdownView markdown={content()} />
      </Show>
    </box>
  );
}

registerApp({
  id: "file",
  title: "File",
  icon: "icon/file",
  defaultSize: { width: 350, height: 200 },
  scrollable: true,
  Component: FileViewer,
});
