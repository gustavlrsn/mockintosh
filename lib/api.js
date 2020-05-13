import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import markdownToHtml from "./markdownToHtml";

export async function getFileContent(file) {
  const path = join("", file);
  const fileContents = fs.readFileSync(path, "utf8");
  const { content } = matter(fileContents);
  const html = await markdownToHtml(content);
  return html;
}
