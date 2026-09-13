#!/usr/bin/env npx tsx
/**
 * Serve a local page of every pinned native 1-bit catalog icon.
 *
 *   npm run icons:gallery
 */
import { spawn } from "child_process";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { loadCatalog } from "./icons/catalog";
import { iconRawUrl } from "./icons/fetchIcon";
import { previewRoot } from "./icons/paths";

const PORT = Number(process.env.ICON_GALLERY_PORT || 8766);

function page(icons: ReturnType<typeof loadCatalog>): string {
  const payload = icons.map((icon) => ({
    file: icon.file,
    name: icon.name,
    collection: icon.collection,
    category: icon.category,
    description: icon.description,
    src: iconRawUrl(icon.file),
  }));
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Mockintosh 1-bit icon catalog</title>
  <style>
    :root { font-family: Geneva, "Lucida Grande", sans-serif; font-size: 12px; }
    body { margin: 16px; background: #ccc; }
    h1 { font-size: 16px; font-weight: normal; }
    input { width: 240px; font: inherit; }
    .stats { margin: 8px 0 16px; }
    .grid { display: flex; flex-wrap: wrap; gap: 12px; }
    .icon { width: 120px; text-align: center; }
    .icon img {
      width: 64px; height: 64px; image-rendering: pixelated;
      background: #fff; border: 1px solid #000;
    }
    .icon .name { margin-top: 4px; }
    .icon .meta { color: #333; font-size: 10px; word-break: break-all; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <h1>Native 1-bit catalog (ICN# / ics# / SICN)</h1>
  <input id="q" type="search" placeholder="Filter…">
  <div class="stats"><span id="shown"></span> / ${payload.length} icons</div>
  <div class="grid" id="grid"></div>
  <script>
    const icons = ${JSON.stringify(payload)};
    const grid = document.getElementById("grid");
    const shown = document.getElementById("shown");
    const q = document.getElementById("q");
    for (const icon of icons) {
      const el = document.createElement("div");
      el.className = "icon";
      el.dataset.hay = [icon.name, icon.file, icon.collection, icon.category, icon.description].join(" ").toLowerCase();
      el.innerHTML = '<img src="' + icon.src + '" alt="">' +
        '<div class="name"></div><div class="meta"></div>';
      el.querySelector(".name").textContent = icon.name;
      el.querySelector(".meta").textContent = icon.collection + " · " + icon.file;
      grid.appendChild(el);
    }
    function filter() {
      const needle = q.value.toLowerCase();
      let n = 0;
      for (const el of grid.children) {
        const on = !needle || el.dataset.hay.includes(needle);
        el.classList.toggle("hidden", !on);
        if (on) n++;
      }
      shown.textContent = n;
    }
    q.addEventListener("input", filter);
    filter();
  </script>
</body>
</html>
`;
}

async function main(): Promise<void> {
  const icons = loadCatalog();
  const dir = join(previewRoot(), "catalog-gallery");
  await mkdir(dir, { recursive: true });
  const index = join(dir, "index.html");
  await writeFile(index, page(icons));
  console.log(`${icons.length} icons`);
  console.log(`http://127.0.0.1:${PORT}/`);
  const child = spawn("python3", ["-m", "http.server", String(PORT), "--directory", dir], {
    stdio: "inherit",
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
