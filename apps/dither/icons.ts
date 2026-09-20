import { defineSprite, type Sprite } from "@mockintosh/sdk";

/**
 * HyperCard "Scanned Art2" ICON — System 7.5.3 catalog, Icon Gallery
 * "ICON 32 / Scanned Art".
 */
export const APP_ICON: Sprite = defineSprite(
  32,
  32,
  "qqqqqqqqqqqqqqqqmqVVVqqpqpqpqlVWqqqqqmqapVaqqqpqpqqpVqqqqqqqaqpaqpqpVqWppWqqqqllpVqlqqqqalVpVpWmqqqmlVVVlaqqmqlVVVVlmqqpqmVVWlWqqqqmlVVVlaaqqqpVVWVlaqqqWmlWWmWqpqmmlVallZqqmqqWWqWVaqmqWWVZqlVqqmpqZVqqqWaqpaZWWqqpqqmqqVVVqaqqqpqZZaWpqpqqqalqppaaqqaqqVaqVqqqqpqllVZqaaqpqqWaVWqqpqqqmlqpmqaqqmmlpqqpqqqqqqVVVqqqapqqmlVaamqmqmmpZVqqqqqqqqqqqqqqqg==",
);

export const sprites: Record<string, Sprite> = {
  "dither/icon": APP_ICON,
};
