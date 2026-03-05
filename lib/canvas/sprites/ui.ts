import { Sprite } from "../BitCanvas";
import { defineSprite } from "../SpriteRegistry";

const EATEN_APPLE = defineSprite(9, 11, "ACgAKAAIAKioqqqqqgqqgqqqqqqKqoCigA==");
const USER2 = defineSprite(12, 15, "KqqolVVWlVVWlVZWlVZWlVZWlVVWlVVWlVWolVVYlVlYlVaolVVYlVVYKqqg");
const MICRODESKTOP_DISK = defineSprite(51, 34, "mZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZqqqqmZmZmZmZmZmZmVlVlpmZmZmZmZmZmaVlZlaZmZmZmZmZmZmVlVlZmZmZmZmZmZmaVaqVaZmZmZmZmZmZmVVVVZmZmZmZmZmZmaaqqqaZmZmZmZmZmZmZVVWZmZmZmZmZmZmaZWpWaZmZmZmZmZmZmZZWWZmZmZmZmZmZmaZVZWaZmZmZmZmZmZmZVlWZmZmZmZmZmZmaZVVWaZmZmZmZmZmZmZVlWZmZmZmZmZmZmaZVVWaZmZmZmZmZmZmqqqqpmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZA=");

export const uiSprites: Record<string, Sprite> = {
  "eaten_apple": EATEN_APPLE,
  "user2": USER2,
  "microdesktop-disk": MICRODESKTOP_DISK,
};
