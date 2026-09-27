import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const sources = [
  "src/demo/main.tsx",
  "src/demo/App.tsx",
  "src/index.ts",
  "src/lib/GlassProvider.tsx",
  "src/lib/GlassScene.tsx",
  "src/lib/LiquidGlass.tsx",
  "src/lib/canvas.ts",
  "src/lib/webgl.ts",
  "src/lib/optics.ts",
];
for (const path of sources) {
  const destination = join("docs/source", path);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(path, destination);
}
const [demoCss, libraryCss] = await Promise.all([
  readFile("src/demo/demo.css", "utf8"),
  readFile("src/lib/styles.css", "utf8"),
]);
await writeFile(
  "docs/styles.css",
  "/* Generated from the React demo and library. */\n" +
    demoCss + "\n" + libraryCss +
    "\n#boot-status{margin:7rem auto;max-width:630px;text-align:center;font:600 14px -apple-system,BlinkMacSystemFont,sans-serif;color:#65728c;padding:20px}\n" +
    "#boot-status.boot-error{color:#a4374a;background:#fff1f3;border:1px solid #ffd7de;border-radius:14px}\n",
);
await copyFile("public/scene.svg", "docs/scene.svg");
console.log("React demo sources, styles and sample background synced to docs/.");
