import { UPSTREAM_ICON_URL } from "./types";

const FETCH_HEADERS = {
  "User-Agent": "mockintosh-icon-archive",
  Accept: "image/png",
};

export function iconRawUrl(file: string): string {
  const encoded = file.split("/").map(encodeURIComponent).join("/");
  return `${UPSTREAM_ICON_URL}/${encoded}`;
}

export async function fetchIconPng(file: string): Promise<Buffer> {
  const url = iconRawUrl(file);
  const response = await fetch(url, { headers: FETCH_HEADERS });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}
