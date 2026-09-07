import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sites } from "@openai/sites-vite-plugin";

export default defineConfig({
  plugins: [react(), sites()],
  build: {
    // Keep the hero self-contained in the stylesheet because the hosted worker
    // serves its app assets directly and may not expose arbitrary public paths.
    assetsInlineLimit: 300_000,
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.js",
        chunkFileNames: "assets/chunk-[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
