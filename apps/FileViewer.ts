import { NativeApp, WindowSize } from "../lib/canvas/AppRegistry";
import { AppBuilder } from "../lib/canvas/AppBuilder";
import { AppContext } from "../lib/canvas/AppContext";
import { WHITE } from "../lib/canvas/BitCanvas";
import { measureTextBlock } from "../lib/canvas/ui/TextBlock";

export const FileViewerApp: NativeApp = {
  id: "file",
  title: "File",
  icon: "/icons/file.png",
  defaultSize: { width: 350, height: 200 },
  scrollable: true,

  render(app: AppBuilder, ctx: AppContext, props: any) {
    ctx.clear(WHITE);
    ctx.drawTextBlock({
      text: props.content ?? "",
      x: 8,
      y: 8,
      maxWidth: ctx.width - 16,
      font: "Geneva9",
    });
  },

  getContentHeight(app: AppBuilder, props: any, size: WindowSize): number {
    const h: number = app.useMemo(
      () => measureTextBlock(props.content ?? "", size.width - 16, "Geneva9"),
      [props.content, size.width]
    );
    return h + 16;
  },
};
