import { defineSprite, type Sprite } from "@mockintosh/sdk";

/** Rendered by `apps/surface/render.ts`: exp(-1.2r²) on a 6×6 hidden-line mesh. */
export const APP_ICON: Sprite = defineSprite(
  32,
  32,
  "AAAAAqAAAAAAAAAKaAAAAAAAACZYAAAAAAAAmVoAAAAAAAKZVoAAAAAAAllWgAAAAAAKZVWgAAAAABZlVqgAAAAAJqlWaoAAAABZlllmoAAAAaWVmWmaAAAKZZVlWZWAACWVlWlZZaAAlZZVmVZqaAKmVlWWVppYClqqlZWaVloJVlZqVZmWlilZWVZVZZWWaVlZVqapZaWZWVlZWVllZWVZZVlaWllqZWVlWWZWWUipZWVlZpaWoAKlZWVllZIAAAqVZWWlqAAAAKGVlWUgAAAACqWVaoAAAAAACpVYAAAAAAAAJUgAAAAAAAAJYAAAAAAAAAkgAAAAAAAAAoAAAA==",
);

export const sprites: Record<string, Sprite> = {
  "surface/icon": APP_ICON,
};
