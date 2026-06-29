import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      agentation: path.resolve(__dirname, "../node_modules/agentation/dist/index.mjs"),
    },
  },
  server: {
    port: 5500,
    strictPort: false,
    open: "/",
  },
  optimizeDeps: {
    entries: ["index.html"],
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
