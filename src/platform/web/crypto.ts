import type { AppCrypto } from "@mockintosh/sdk";

export function createWebCrypto(): AppCrypto {
  return {
    randomBytes(n) {
      const out = new Uint8Array(n);
      globalThis.crypto.getRandomValues(out);
      return out;
    },
    async sha256(bytes) {
      const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes.slice());
      return new Uint8Array(digest);
    },
  };
}
