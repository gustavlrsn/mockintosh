/**
 * Build-time script: converts markdown files to plain text and writes them
 * into public/content/ so Vite can serve them as static assets.
 *
 * Strips markdown/frontmatter syntax so the FileViewer can render them
 * directly without any runtime processing.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const FILES = ["README.md"];
const OUT_DIR = path.join(ROOT, "public", "content");

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/\*\*(.+?)\*\*/g, "$1") // bold
    .replace(/\*(.+?)\*/g, "$1") // italic
    .replace(/__(.+?)__/g, "$1") // bold alt
    .replace(/_(.+?)_/g, "$1") // italic alt
    .replace(/`{3}[\s\S]*?`{3}/g, "") // fenced code blocks
    .replace(/`(.+?)`/g, "$1") // inline code
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links and images
    .replace(/^\s*[-*+]\s+/gm, "  - ") // list items
    .replace(/^\s*\d+\.\s+/gm, "  - ") // ordered list items
    .replace(/^>\s?/gm, "") // blockquotes
    .replace(/^---+$/gm, "") // horizontal rules
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function convert(filename: string): void {
  const filepath = path.join(ROOT, filename);
  if (!fs.existsSync(filepath)) {
    console.warn(`⚠ ${filename} not found, writing placeholder`);
    fs.writeFileSync(
      path.join(OUT_DIR, `${filename}.txt`),
      `${filename} not found`
    );
    return;
  }
  const raw = fs.readFileSync(filepath, "utf-8");
  const { content } = matter(raw);
  const plain = stripMarkdown(content);
  fs.writeFileSync(path.join(OUT_DIR, `${filename}.txt`), plain);
  console.log(`✓ ${filename} → public/content/${filename}.txt`);
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  FILES.map(convert);
}

main();
