import type { FileResource } from "../kernel";
import type { MenubarDefinition } from "@mockintosh/sdk";
import type { InspectionNode } from "@mockintosh/ui";

/** Keep names and values on one line, including untrusted terminal control bytes. */
function text(value: string): string {
  return value.replace(/[\x00-\x1f\x7f-\x9f]/g, char => {
    if (char === "\n") return "\\n";
    if (char === "\r") return "\\r";
    if (char === "\t") return "\\t";
    return `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
  });
}
function lines(rows: string[]): string {
  return rows.length ? rows.join("\n") + "\n" : "";
}
function table(headers: string[], rows: string[][]): string {
  const widths = headers.map((header, i) => Math.max(header.length, ...rows.map(row => row[i].length)));
  return lines([headers, ...rows].map(row => row.map((cell, i) => i === row.length - 1 ? cell : cell.padEnd(widths[i])).join("  ")));
}

/** Presentation functions are selected by each command definition. */
export const formatters = {
  ls: (result: unknown): string => {
    return lines((result as FileResource[]).map(resource =>
      text(resource.path.split("/").pop() || "/") + (resource.kind === "directory" ? "/" : "")
    ).sort());
  },
  stat: (result: unknown): string => {
    const resource = result as FileResource;
    return lines([
      `Path: ${text(resource.path)}`,
      `Type: ${resource.kind}`,
      `Content type: ${text(resource.contentType)}`,
      `Revision: ${resource.revision}`,
      `Id: ${text(resource.id)}`,
    ]);
  },
  apps: (result: unknown): string => {
    return table(["APP", "TITLE"], (result as { id: string; title: string }[])
      .map(app => [text(app.id), text(app.title)]));
  },
  windows: (result: unknown): string => {
    return table(["WINDOW", "APP", "STATE", "TITLE"], (result as { id: string; app: string; active: boolean; title: string }[])
      .map(window => [text(window.id), text(window.app ?? "-"), window.active ? "active" : "inactive", text(window.title)]));
  },
  inspect: (result: unknown): string => {
    // Omit anonymous layout containers; --json exposes the complete snapshot.
    return table(["NODE", "WINDOW", "ROLE", "NAME", "STATE", "ACTIONS", "TEXT / VALUE"],
      (result as InspectionNode[]).filter(node => node.name || node.actions.length || node.role === "text").map(node => [
        String(node.id), text(node.windowId ?? "-"), text(node.role), text(node.name ?? "-"),
        [node.enabled ? "enabled" : "disabled", ...(node.focused ? ["focused"] : []),
        ...(node.bounds.width <= 0 || node.bounds.height <= 0 ? ["clipped"] : [])].join(","),
        node.actions.join(",") || "-", text(node.value ?? (node.role === "window" ? "" : node.text)),
      ]));
  },
  menu: (result: unknown, args: string[]): string => {
    if (args.length) return "";
    return lines((result as MenubarDefinition[]).flatMap(menu => [text(menu.label), ...menu.items.flatMap(item => {
      if (item.type === "separator") return ["  ---"];
      if (item.type === "radiogroup") return item.items.map(option =>
        `  ${option.value === item.value ? "* " : "  "}${text(option.label)}${option.disabled ? " (disabled)" : ""}`);
      return [`  ${text(item.label)}${item.disabled ? " (disabled)" : ""}`];
    })]));
  },
  screenshot: (result: unknown): string => {
    return text((result as FileResource).path) + "\n";
  },
};
