import { createSignal, onMount, Show, type JSX } from "solid-js";
import { useApp, type PrintableImage, defineApp, Button, MIME, readSpriteFile, toBits, type Sprite } from "@mockintosh/sdk";

const BROWSER_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif"];

/**
 * Picture — views image files. Mockintosh sprite files draw directly; browser
 * image formats are decoded through `useApp().images` and thresholded to 1-bit.
 */
function Picture(props: Record<string, unknown>): JSX.Element {
  const app = useApp();
  const win = app.window;
  const { print } = useApp();
  const [sprite, setSprite] = createSignal<Sprite | undefined>(
    props.src ? app.getSprite(String(props.src)) : undefined
  );
  const [pixels, setPixels] = createSignal<Uint8Array | null>(null);
  const [pw, setPw] = createSignal(0);
  const [ph, setPh] = createSignal(0);

  onMount(async () => {
    if (props.title) win.setTitle(String(props.title));
    const fileId = props.fileId as string | undefined;
    if (!fileId) return;
    const file = app.fs.file(fileId);
    if (!file) return;

    if (file.type === MIME.sprite) {
      const s = await readSpriteFile(app.fs, fileId);
      if (s) setSprite(s);
      return;
    }
    if (!app.images) {
      void app.os.showDialog({ message: `This Macintosh cannot decode "${file.name}".` });
      return;
    }
    const bytes = await app.fs.readBytes(fileId);
    if (!bytes) return;
    try {
      const frame = await app.images.decode(bytes, file.type, {
        maxWidth: win.width() - 8,
        maxHeight: win.height() - 28,
      });
      setPw(frame.width);
      setPh(frame.height);
      setPixels(toBits(frame, "threshold"));
    } catch {
      void app.os.showDialog({ message: `Couldn't decode "${file.name}".` });
    }
  });

  /** The picture as shown, whichever way it was loaded. */
  function printableImage(): PrintableImage | null {
    const s = sprite();
    if (s) return { width: s.width, height: s.height, data: s.data };
    const px = pixels();
    return px ? { width: pw(), height: ph(), data: px } : null;
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

  return (
    <box width={win.width()} height={win.height()} padding={4} flexDirection="column" gap={4} background={0}>
      <Show when={print}>
        <Button label="Print" disabled={!printableImage()} onClick={() => void printPicture()} />
      </Show>
      <Show when={sprite()} fallback={
        <raster
          width={win.width() - 8}
          height={win.height() - 28}
          onPaint={({ blitPixels }) => {
            const px = pixels();
            if (px) blitPixels(px, pw(), ph());
          }}
        />
      }>
        {(s: () => Sprite) => (
          <image
            width={s().width}
            height={s().height}
            src={{ width: s().width, height: s().height, data: s().data, mask: s().mask }}
          />
        )}
      </Show>
    </box>
  );
}

export default defineApp({
  id: "picture",
  title: "Picture",
  icon: "icon/MacFlim",
  defaultSize: { width: 256, height: 256 },
  scrollable: true,
  fileTypes: [MIME.sprite, ...BROWSER_IMAGE_TYPES],
  Component: Picture,
});
