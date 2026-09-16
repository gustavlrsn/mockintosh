export type ProjectTemplate = "counter" | "blank" | "canvas";

export function counterSource(id: string, title: string): string {
  return `import { defineApp, createSignal, Button } from "@mockintosh/sdk";
function Counter() {
  const [count, setCount] = createSignal(0);
  return <box padding={12} gap={8}>
    <text semantic={{name: "counter-value"}}>{String(count())}</text>
    <Button name="counter-increment" label="Add one" onClick={() => setCount(count() + 1)} />
  </box>;
}
export default defineApp({ id: ${JSON.stringify(id)}, title: ${JSON.stringify(title)}, icon: "icon/computer",
  defaultSize: {width: 220, height: 100}, Component: Counter });
`;
}

export function blankSource(id: string, title: string): string {
  return `import { defineApp } from "@mockintosh/sdk";

function App() {
  return <box padding={12}>
    <text font="body" semantic={{name: "app-title"}}>${title}</text>
  </box>;
}

export default defineApp({
  id: ${JSON.stringify(id)},
  title: ${JSON.stringify(title)},
  icon: "icon/computer",
  defaultSize: { width: 220, height: 120 },
  Component: App,
});
`;
}

export function canvasSource(id: string, title: string): string {
  return `import { defineApp, createSignal, Button } from "@mockintosh/sdk";

const W = 200;
const H = 140;

function paint(pixels: Uint8Array, x: number, y: number, ink: number) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  pixels[y * W + x] = ink;
}

function App() {
  const [pixels, setPixels] = createSignal(new Uint8Array(W * H));
  const [tool, setTool] = createSignal<"pencil" | "eraser">("pencil");
  const stamp = (x: number, y: number) => {
    const next = pixels().slice();
    paint(next, Math.floor(x), Math.floor(y), tool() === "pencil" ? 1 : 0);
    setPixels(next);
  };
  return <box padding={8} gap={6}>
    <bitmap
      semantic={{name: "canvas"}}
      pixels={pixels()}
      width={W}
      height={H}
      onMouseDown={(x, y) => stamp(x, y)}
      onDrag={(x, y) => stamp(x, y)}
    />
    <box flexDirection="row" gap={4}>
      <Button name="tool-pencil" label="Pencil" onClick={() => setTool("pencil")} />
      <Button name="tool-eraser" label="Eraser" onClick={() => setTool("eraser")} />
      <Button name="tool-clear" label="Clear" onClick={() => setPixels(new Uint8Array(W * H))} />
    </box>
  </box>;
}

export default defineApp({
  id: ${JSON.stringify(id)},
  title: ${JSON.stringify(title)},
  icon: "icon/computer",
  defaultSize: { width: 240, height: 220 },
  Component: App,
});
`;
}

export function sourceForTemplate(template: ProjectTemplate, id: string, title: string): string {
  if (template === "blank") return blankSource(id, title);
  if (template === "canvas") return canvasSource(id, title);
  return counterSource(id, title);
}
