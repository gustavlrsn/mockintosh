import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { WindowContext } from "../lib/toolbox/WindowContext";
import { WHITE } from "../lib/canvas/BitCanvas";
import { measureTextBlock } from "../lib/canvas/ui/TextBlock";
import { FileManager } from "../lib/toolbox/FileManager";

export const FileViewerApp: SystemApp = {
  id: "file",
  title: "File",
  icon: "icon/file",
  defaultSize: { width: 350, height: 200 },
  scrollable: true,

  render(app: AppBuilder, ctx: WindowContext, props: any) {
    const fs: FileManager | undefined = props._fs;
    const fileId: string | undefined = props.fileId;
    const [content, setContent] = app.useState<string>(props.content ?? "");

    app.useEffect(() => {
      if (fs && fileId && !props.content) {
        fs.readFile(fileId).then((text) => {
          if (text !== null) setContent(text);
        });
      }
    }, [fileId]);

    ctx.clear(WHITE);
    ctx.drawTextBlock({
      text: content,
      x: 8,
      y: 8,
      maxWidth: ctx.width - 16,
      font: "body",
    });
  },

  getContentHeight(app: AppBuilder, props: any, size: WindowSize): number {
    const [content] = app.useState<string>(props.content ?? "");
    const h: number = app.useMemo(
      () => measureTextBlock(content, size.width - 16, "body"),
      [content, size.width]
    );
    return h + 16;
  },
};
