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
  plugins: [
    // Only transform files in packages/ui and apps that use Solid JSX.
    // Must use "universal" generate mode so JSX compiles to the custom
    // CanvasNode renderer instead of the DOM.
    solid({
      include: [
        /packages\/ui\/.*\.[tj]sx?$/,
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
    },
  },
  test: {
    environment: "node",
    include: [
      "packages/ui/tests/**/*.test.ts",
      "packages/fs/tests/**/*.test.ts",
      "src/os/**/*.test.ts",
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
