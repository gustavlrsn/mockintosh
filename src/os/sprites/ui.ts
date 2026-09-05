import { defineSprite, type Sprite } from "@mockintosh/ui";

const EATEN_APPLE = defineSprite(9, 11, "ACgAKAAIAKioqqqqqgqqgqqqqqqKqoCigA==");
const USER2 = defineSprite(
  12,
  15,
  "KqqolVVWlVVWlVZWlVZWlVZWlVVWlVVWlVWolVVYlVlYlVaolVVYlVVYKqqg"
);
const MICRODESKTOP_DISK = defineSprite(
  51,
  34,
  "mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZqqqqmZmZmZmZmZmZmVlVlpmZmZmZmZmZmaVlZlaZmZmZmZmZmZmVlVlZmZmZmZmZmZmaVaqVaZmZmZmZmZmZmVVVVZmZmZmZmZmZmaaqqqaZmZmZmZmZmZmZVVWZmZmZmZmZmZmaZWpWaZmZmZmZmZmZmZZWWZmZmZmZmZmZmaZVZWaZmZmZmZmZmZmZVlWZmZmZmZmZmZmaZVVWaZmZmZmZmZmZmZVlWZmZmZmZmZmZmaZVVWaZmZmZmZmZmZmqqqqpmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZA="
);
const CORNER_LT = defineSprite(5, 5, "qqoKAgCAAA==");
const CORNER_RT = defineSprite(5, 5, "qoKgKAIAgA==");
const CORNER_LB = defineSprite(5, 5, "gCAKAqCqgA==");
const CORNER_RB = defineSprite(5, 5, "AIAgKCqqgA==");
const SCROLLBAR_BG = defineSprite(4, 2, "ZVY=");

export const uiSprites: Record<string, Sprite> = {
  eaten_apple: EATEN_APPLE,
  user2: USER2,
  "microdesktop-disk": MICRODESKTOP_DISK,
  "corner-lt": CORNER_LT,
  "corner-rt": CORNER_RT,
  "corner-lb": CORNER_LB,
  "corner-rb": CORNER_RB,
  "scrollbar-bg": SCROLLBAR_BG,
};
