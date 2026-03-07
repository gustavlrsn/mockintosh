import { Sprite } from "../BitCanvas";
import { defineSprite } from "../../toolbox/ResourceManager";

const CHROME_UP = defineSprite(
  16,
  16,
  "qqqqqpVVVVaVVlVWlVmVVpVlZVaVlVlWllVWVplVVZaqlVqmlZVZVpWVWVaVlVlWlaqpVpVVVVaVVVVWqqqqqg=="
);
const CHROME_DOWN = defineSprite(
  16,
  16,
  "qqqqqpVVVVaVVVVWlaqpVpWVWVaVlVlWlZVZVqqVWqaZVVWWllVWVpWVWVaVZWVWlVmVVpVWVVaVVVVWqqqqqg=="
);
const CHROME_LEFT = defineSprite(
  16,
  16,
  "qqqqqpVWVVaVWlVWlWZVVpWWqlaWVVZWmVVWVqVVVlaZVVZWllVWVpWWqlaVZlVWlVpVVpVWVVaVVVVWqqqqqg=="
);
const CHROME_RIGHT = defineSprite(
  16,
  16,
  "qqqqqpVVlVaVVaVWlVWZVpWqllaVlVWWlZVVZpWVVVqVlVVmlZVVlpWqllaVVZlWlVWlVpVVlVaVVVVWqqqqqg=="
);
const CHROME_CLOSE = defineSprite(
  11,
  11,
  "qqqqVVVpVVWlVVaVVVpVVWlVVaVVVpVVWlVVaqqqgA=="
);
const CHROME_CLOSING = defineSprite(
  11,
  11,
  "qqqqVZVpllmlmZaVVVqpWqlVVaWZlpllmlWVaqqqgA=="
);
const CHROME_RESIZE = defineSprite(
  16,
  16,
  "qqqqqpVVVVaVVVVWlqqlVpZVZVaWVWqmllVlZpZVZWaWVWVmlqqlZpVlVWaVZVVmlWVVZpVqqqaVVVVWqqqqqg=="
);
const CHROME_ZOOM = defineSprite(
  11,
  11,
  "qqqqVWVpVZWlVlaVWVpVZWqqlaVVVpVVWlVVaqqqgA=="
);

export const chromeSprites: Record<string, Sprite> = {
  "chrome/up": CHROME_UP,
  "chrome/down": CHROME_DOWN,
  "chrome/left": CHROME_LEFT,
  "chrome/right": CHROME_RIGHT,
  "chrome/close": CHROME_CLOSE,
  "chrome/closing": CHROME_CLOSING,
  "chrome/resize": CHROME_RESIZE,
  "chrome/zoom": CHROME_ZOOM,
};
