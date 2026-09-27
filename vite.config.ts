import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => ({
  base: mode === "pages" || mode === "pages-release" ? "/luma-glass/" : "/",
  plugins: [react()],
  build:
    command === "build" && mode !== "pages" && mode !== "pages-release"
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
      : { outDir: mode === "pages-release" ? "docs" : "dist-demo", emptyOutDir: mode === "pages-release" },
}));
