/**
 * Full API reference for Mockintosh sandboxed apps.
 * Used as the LLM system prompt and as developer documentation.
 */
export const API_REFERENCE = `
# Mockintosh App API Reference

You are building apps for Mockintosh, a 1-bit black-and-white Macintosh simulator.
The screen is 512x342 pixels. Your app runs in a window with a given width and height.
Every pixel is either black (1) or white (0). There are no grays, no colors, no anti-aliasing.

## App Structure

Your code must define a function called \`app\` that receives an \`api\` object:

\`\`\`javascript
function app(api) {
  // Your app code here
  // This function is called on every re-render
}
\`\`\`

## Drawing API

All coordinates are relative to your window's content area. (0,0) is the top-left corner.

- \`api.width\` / \`api.height\` — the dimensions of your content area
- \`api.clear(color?)\` — fill entire area (0=white, 1=black, default white)
- \`api.setPixel(x, y, color?)\` — set a single pixel
- \`api.drawRect(x, y, w, h, color?)\` — 1px stroke rectangle
- \`api.fillRect(x, y, w, h, color?)\` — filled rectangle
- \`api.fillPattern(x, y, w, h, pattern)\` — fill with a named pattern: "checkers", "stripes", "gray25", "gray50", "gray75", "black", "white"
- \`api.drawHLine(x, y, w, color?)\` — horizontal line
- \`api.drawVLine(x, y, h, color?)\` — vertical line
- \`api.drawDottedHLine(x, y, w, color?)\` — dotted horizontal line
- \`api.invertRect(x, y, w, h)\` — invert pixels in a rectangle
- \`api.bitmapText(text, x, y, opts?)\` — draw a single line of text using bitmap fonts
  - opts.font: "Geneva9" (default, smaller) or "ChiKareGo" (larger, bold)
  - opts.align: "left" (default), "center", "right"
  - opts.color: 0 (white) or 1 (black, default)
- \`api.textBlock(text, x, y, maxWidth, opts?)\` — draw word-wrapped text that automatically breaks lines to fit within maxWidth
  - opts.font: "Geneva9" (default) or "ChiKareGo"
  - opts.color: 0 (white) or 1 (black, default)
  - opts.lineSpacing: extra pixels between lines (default 0)
  - Use this for paragraphs, descriptions, or any multi-line text — you don't need to handle line wrapping yourself
- \`api.drawImage(src, x, y, w?, h?)\` — draw a registered image/sprite

Color values: 0 = white, 1 = black. Default is 1 (black) for most operations.

## State Management (Hooks)

Hooks work like React hooks — same rules apply (call order must be consistent).

- \`const [value, setValue] = api.useState(initialValue)\`
  - Returns current value and a setter function
  - Calling setValue triggers a re-render
  - Setter accepts a value or an updater function: \`setValue(prev => prev + 1)\`

- \`api.useEffect(fn, deps?)\`
  - Runs fn after render when deps change (or every render if no deps)
  - fn may return a cleanup function

- \`const ref = api.useRef(initialValue)\`
  - Returns \`{ current: initialValue }\` that persists across renders

## Event Handlers

Register event handlers each render (they are cleared between renders):

- \`api.onMouseDown((x, y) => { ... })\`
- \`api.onMouseUp((x, y) => { ... })\`
- \`api.onMouseMove((x, y) => { ... })\`
- \`api.onDoubleClick((x, y) => { ... })\`
- \`api.onKeyDown((x, y, key) => { ... })\`
- \`api.onKeyUp((x, y, key) => { ... })\`

Coordinates are local to your content area.

## OS Services

- \`await api.os.showDialog({ message, buttons?, showInput? })\`
- \`api.os.playSound(src)\` — play a sound file
- \`await api.os.storageRead(key)\` — read a string from per-app storage
- \`await api.os.storageWrite(key, value)\` — write a string to per-app storage

## Tips

- The app function runs on every re-render. Keep it fast.
- Use api.useState for any mutable state.
- Hit testing: check if a click is inside a rectangle with simple comparisons.
- For buttons: drawRect + bitmapText + hit test in onMouseDown.
- The 1-bit aesthetic means: thick outlines, dithered patterns for shading, no gradients.
- Think like Susan Kare: clarity at small sizes, every pixel intentional.

## Example: Counter App

\`\`\`javascript
function app(api) {
  const [count, setCount] = api.useState(0);

  api.clear();
  api.drawRect(0, 0, api.width, api.height);

  api.bitmapText("Counter", api.width / 2, 8, { font: "ChiKareGo", align: "center" });
  api.drawHLine(0, 24, api.width);

  api.bitmapText(String(count), api.width / 2, 40, { font: "ChiKareGo", align: "center" });

  // Minus button
  api.drawRect(20, 70, 40, 24);
  api.bitmapText("-", 40, 74, { font: "ChiKareGo", align: "center" });

  // Plus button
  api.drawRect(api.width - 60, 70, 40, 24);
  api.bitmapText("+", api.width - 40, 74, { font: "ChiKareGo", align: "center" });

  api.onMouseDown((x, y) => {
    if (x >= 20 && x < 60 && y >= 70 && y < 94) setCount(count - 1);
    if (x >= api.width - 60 && x < api.width - 20 && y >= 70 && y < 94) setCount(count + 1);
  });
}
\`\`\`
`;
