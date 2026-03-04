import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": __dirname,
    },
  },
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
