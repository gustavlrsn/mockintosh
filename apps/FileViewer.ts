import { SystemApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { WHITE } from "../lib/canvas/BitCanvas";
import { measureTextBlock } from "../lib/canvas/ui/TextBlock";
import { MockFS } from "../lib/canvas/fs/MockFS";

export const FileViewerApp: SystemApp = {
  id: "file",
  title: "File",
  icon: "icon/file",
  defaultSize: { width: 350, height: 200 },
  scrollable: true,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    const fs: MockFS | undefined = props._fs;
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
      font: "Geneva9",
    });
  },

  getContentHeight(app: AppBuilder, props: any, size: WindowSize): number {
    const [content] = app.useState<string>(props.content ?? "");
    const h: number = app.useMemo(
      () => measureTextBlock(content, size.width - 16, "Geneva9"),
      [content, size.width]
    );
    return h + 16;
  },
};
