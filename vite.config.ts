import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  build:
    command === "build"
      ? {
          lib: {
            entry: resolve(process.cwd(), "src/index.ts"),
            formats: ["es"],
            fileName: "index",
            cssFileName: "style",
          },
          rollupOptions: {
            external: ["react", "react-dom", "react/jsx-runtime"],
          },
        }
      : undefined,
}));
