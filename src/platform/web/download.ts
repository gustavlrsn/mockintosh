import type { DownloadService } from "@mockintosh/sdk";

/** Browser download: an `<a download>` click. Must run from a user gesture. */
export function createWebDownloadService(): DownloadService {
  return {
    async save(file) {
      const blob = new Blob([file.bytes as BlobPart], { type: file.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  };
}
