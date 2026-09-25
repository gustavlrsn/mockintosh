import { defineSprite, type Sprite } from "@mockintosh/sdk";

/** ryos: system-7/system/system-generic-application-system.png · threshold */
export const APP_ICON: Sprite = defineSprite(
  32,
  32,
  "AAAAAgAAAAAAAAAJgAAAAAAAACVgAAAAAAAAlVgAAAAAAAJVVgAAAAAACVVVgAAAAAAlVVVgAAAAAJVVVVgAAAACVVVVVgAAAAlVVVVVgAAAJVVVVVVgAACVVVVVVVgAAlVVVVVVVgAJVVVVVVVVgCVVVVVaqlVglVVVVWVVlVglVVVVlVVlVglVVVZaVVlYAlVVVqWVVmAAlVWpaqqVqgAlVVlaVVVqAAlVVlVVVWoAAlVVlVVVagAAlVVpVVVqAAAlVVaqqWoAAAlVVVgCqgAAAlVVYAAqAAAAlVWAAAAAAAAlVgAAAAAAAAlYAAAAAAAAAmAAAAAAAAAAgAAAAA==",
);

export const sprites: Record<string, Sprite> = {
  "trace/icon": APP_ICON,
};
