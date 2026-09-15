import { defineConfig, type Plugin } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import solid from "vite-plugin-solid";

const __dirname = dirname(fileURLToPath(import.meta.url));

function sharedRuntimeImportMap(): Plugin {
  return {
    name: "mockintosh-shared-runtime-importmap",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const chunkFile = (name: string): string | undefined => {
          for (const [file, info] of Object.entries(ctx.bundle)) {
            if (info.type === "chunk" && info.name === name) return `/${file}`;
          }
          return undefined;
        };
        const ui = chunkFile("ui-runtime");
        const renderer = chunkFile("ui-renderer-runtime");
        const sdk = chunkFile("sdk-runtime");
        const solidJs = chunkFile("solid-runtime");
        const store = chunkFile("solid-store-runtime");
        if (!ui || !renderer || !sdk) return html;
        const map = {
          imports: {
            "solid-js": solidJs ?? "/node_modules/solid-js/dist/solid.js",
            "solid-js/store": store ?? "/node_modules/solid-js/store/dist/store.js",
            "@mockintosh/ui": ui,
            // Third-party JSX compiles to calls into the universal renderer.
            "@mockintosh/ui/renderer": renderer,
            "@mockintosh/sdk": sdk,
            "@mockintosh/agent": chunkFile("agent-runtime") ?? "/packages/agent/src/index.ts",
          },
        };
        return html.replace(
          /<script type="importmap">[\s\S]*?<\/script>/,
          `<script type="importmap">${JSON.stringify(map)}</script>`
        );
      },
    },
  };
}

export default defineConfig({
  // Babel 7 reads this Node-only feature flag. Empty strings are also falsy
  // when Vite exposes defines to an SSR host through process.env.
  define: {"process.env.BABEL_TYPES_8_BREAKING": '""', "process.env.BABEL_8_BREAKING": '""'},
  // Prebundle the complete reactive runtime together. Late discovery of universal
  // can otherwise serve the same Solid chunk under different cache identities.
  optimizeDeps: {exclude: ["@rollup/browser"], include: ["solid-js", "solid-js/store", "solid-js/universal", "@babel/standalone", "babel-preset-solid", "typescript"]},
  plugins: [
    // Only transform files in packages/ui and apps that use Solid JSX.
    // Must use "universal" generate mode so JSX compiles to the custom
    // CanvasNode renderer instead of the DOM.
    solid({
      include: [
        /packages\/ui\/.*\.[tj]sx?$/,
        /packages\/sdk\/.*\.[tj]sx?$/,
        /apps\/.*\.[tj]sx?$/,
        /src\/os\/.*\.[tj]sx?$/,
      ],
      solid: {
        generate: "universal",
        moduleName: "@mockintosh/ui/renderer",
      },
    }),
    sharedRuntimeImportMap(),
  ],
  resolve: {
    alias: {
      "@": __dirname,
      // Solid’s Babel preset uses Node assertions inside the browser compiler.
      "assert": "assert/",
      "@mockintosh/quickdraw/bits": resolve(__dirname, "packages/quickdraw/src/bits.ts"),
      "@mockintosh/quickdraw": resolve(__dirname, "packages/quickdraw/src/index.ts"),
      "@mockintosh/ui/renderer": resolve(__dirname, "packages/ui/src/renderer.ts"),
      "@mockintosh/ui": resolve(__dirname, "packages/ui/src/index.ts"),
      "@mockintosh/protocol": resolve(__dirname, "packages/protocol/src/index.ts"),
      "@mockintosh/agent": resolve(__dirname, "packages/agent/src/index.ts"),
      "@mockintosh/print": resolve(__dirname, "packages/print/src/index.ts"),
      // mdast's default Vite `browser` condition reads `document` at import time.
      "decode-named-character-reference": resolve(
        __dirname,
        "node_modules/decode-named-character-reference/index.js"
      ),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["scripts/vitest-setup.ts"],
    include: [
      "packages/quickdraw/tests/**/*.test.ts",
      "packages/ui/tests/**/*.test.ts",
      "packages/agent/src/**/*.test.ts",
      "packages/fs/tests/**/*.test.ts",
      "packages/print/tests/**/*.test.ts",
      "src/os/**/*.test.ts",
      "src/shared/**/*.test.ts",
      "scripts/**/*.test.ts",
      "apps/**/*.test.ts",
    ],
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      // The *-runtime entries are served to third-party bundles through the
      // import map, so their public export names must survive minification.
      // Vite defaults app builds to `false`, which mangles entry exports.
      preserveEntrySignatures: "strict",
      input: {
        main: resolve(__dirname, "index.html"),
        "3d": resolve(__dirname, "3d.html"),
        "ui-runtime": resolve(__dirname, "packages/ui/src/index.ts"),
        "ui-renderer-runtime": resolve(__dirname, "packages/ui/src/renderer.ts"),
        "sdk-runtime": resolve(__dirname, "packages/sdk/src/index.ts"),
        "agent-runtime": resolve(__dirname, "packages/agent/src/index.ts"),
        "solid-runtime": resolve(__dirname, "node_modules/solid-js/dist/solid.js"),
        "solid-store-runtime": resolve(
          __dirname,
          "node_modules/solid-js/store/dist/store.js"
        ),
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        // ws: true enables WebSocket proxy for /api/stream
        ws: true,
      },
    },
  },
});
