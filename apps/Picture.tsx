import { createMemo, createEffect, Show, Loading } from "solid-js";
import type { JSX } from "@mockintosh/ui";
import { useApp, type PrintableImage, defineApp, Button, Errored, IMAGE_TYPES, MIME, readSpriteFile, toBits, type Sprite } from "@mockintosh/sdk";

/**
 * Picture — views image files. Mockintosh sprite files draw directly; browser
 * image formats are decoded through `useApp().images` and thresholded to 1-bit.
 */
function Picture(props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const win = app.window;
  const { print } = useApp();
  const initialSprite = props.src ? app.getSprite(String(props.src)) : undefined;

  const loaded = createMemo(async () => {
    const fileId = props.fileId as string | undefined;
    if (!fileId) return null;
    const file = app.fs.file(fileId);
    if (!file) return null;
    if (file.type === MIME.sprite) {
      const s = await readSpriteFile(app.fs, fileId);
      return s ? { kind: "sprite" as const, sprite: s } : null;
    }
    if (!app.images) {
      throw new Error(`This Macintosh cannot decode "${file.name}".`);
    }
    const bytes = await app.fs.readBytes(fileId);
    if (!bytes) return null;
    const frame = await app.images.decode(bytes, file.type, {
      maxWidth: win.width() - 8,
      maxHeight: win.height() - 28,
    });
    return { kind: "pixels" as const, pixels: toBits(frame, "threshold"), width: frame.width, height: frame.height };
  });

  createEffect(
    () => props.title,
    (title) => { if (title) win.setTitle(String(title)); },
  );

  /** The picture as shown, whichever way it was loaded. */
  function printableImage(): PrintableImage | null {
    const value = loaded();
    if (value?.kind === "sprite") return { width: value.sprite.width, height: value.sprite.height, data: value.sprite.data };
    if (value?.kind === "pixels") return { width: value.width, height: value.height, data: value.pixels };
    const s = initialSprite;
    if (s) return { width: s.width, height: s.height, data: s.data };
    return null;
  }

  async function printPicture(): Promise<void> {
    const image = printableImage();
    if (!print || !image) return;
    try {
      await print.printPicture(image, { caption: props.title ? String(props.title) : undefined });
    } catch (err) {
      await app.os.showDialog({
        message: `Couldn't print: ${err instanceof Error ? err.message : String(err)}`,
        buttons: ["OK"],
      });
    }
  }

  function shownSprite(): Sprite | undefined {
    const value = loaded();
    if (value?.kind === "sprite") return value.sprite;
    return initialSprite;
  }

  return (
    <box width={win.width()} height={win.height()} padding={4} flexDirection="column" gap={4} background={0}>
      <Loading fallback={<text font="body">Opening…</text>}>
        <Errored
          fallback={(err) => (
            <text font="body">{err instanceof Error ? err.message : String(err)}</text>
          )}
        >
          <Show when={print}>
            <Button label="Print" disabled={!printableImage()} onClick={() => void printPicture()} />
          </Show>
          <Show
            when={shownSprite()}
            fallback={
              <raster
                width={win.width() - 8}
                height={win.height() - 28}
                onPaint={({ blitPixels }) => {
                  const value = loaded();
                  if (value?.kind === "pixels") blitPixels(value.pixels, value.width, value.height);
                }}
              />
            }
          >
            {(s) => (
              <image
                width={s().width}
                height={s().height}
                src={s()}
              />
            )}
          </Show>
        </Errored>
      </Loading>
    </box>
  );
}

export default defineApp({
  id: "picture",
  title: "Picture",
  icon: "icon/MacFlim",
  defaultSize: { width: 256, height: 256 },
  scrollable: true,
  fileTypes: [MIME.sprite, ...IMAGE_TYPES],
  Component: Picture,
});
