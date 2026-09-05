import { Show, createSignal, onMount, type JSX } from "solid-js";
import { MIME } from "@mockintosh/fs";
import { MarkdownView } from "./MarkdownView";
import { defineApp, useApp } from "@mockintosh/sdk";

function looksLikeMarkdown(title: string, content: string): boolean {
  if (/\.(md|markdown)$/i.test(title)) return true;
  return /^#{1,2}\s|^\*\s|^\-\s/m.test(content.slice(0, 400));
}

function FileViewer(props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const win = app.window;
  const [content, setContent] = createSignal((props.content as string) ?? "");
  const title = () => String(props.title ?? "File");

  onMount(() => {
    const fileId = props.fileId as string | undefined;
    if (fileId && !props.content) {
      void app.fs.readText(fileId).then((text) => {
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

export default defineApp({
  id: "file",
  title: "File",
  icon: "icon/file",
  defaultSize: { width: 350, height: 200 },
  scrollable: true,
  fileTypes: [MIME.text, MIME.markdown, MIME.json],
  Component: FileViewer,
});
