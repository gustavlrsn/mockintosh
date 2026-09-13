import { createRequire } from "node:module";
import { dirname, join } from "node:path";
// OS tests select Solid's browser condition. The companion always needs Node ws.
const require = createRequire(import.meta.url);
export const {
  WebSocket,
  WebSocketServer
} = require(join(dirname(require.resolve("ws/package.json")), "index.js")) as typeof import("ws");
