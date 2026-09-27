import ts from "typescript";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const files = [
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

const compiled = [];
for (const file of files) {
  const source = (await readFile(file, "utf8"))
    .replaceAll("import.meta.env.BASE_URL", JSON.stringify("/luma-glass/"))
    .replaceAll("import.meta.env.DEV", "false");
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      removeComments: true,
      sourceMap: false,
      esModuleInterop: true,
    },
  });
  const errors = (result.diagnostics ?? [])
    .filter(({ category }) => category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    throw new Error(file + ": " + errors.map(
      (d) => ts.flattenDiagnosticMessageText(d.messageText, " "),
    ).join("; "));
  }
  compiled.push(
    "  modules[" + JSON.stringify(file) +
    "] = function(require, module, exports) {\n" +
    result.outputText + "\n  };\n",
  );
}

const template = await readFile("scripts/pages-runtime.template.js", "utf8");
const marker = "/*__COMPILED_MODULES__*/";
if (!template.includes(marker)) throw new Error("Pages runtime template is missing its marker.");
const bundle = template.replace(marker, compiled.join("\n"));
await mkdir("docs/vendor", { recursive: true });
await writeFile("docs/app.js", bundle);

for (const name of ["react", "react-dom"]) {
  const file = name + ".production.min.js";
  const source = "node_modules/" + name + "/umd/" + file;
  const destination = "docs/vendor/" + file;
  try {
    await copyFile(source, destination);
  } catch (error) {
    try {
      await readFile(destination);
    } catch {
      throw new Error("Missing " + source + ". Run npm install first.", { cause: error });
    }
  }
}
const [demoCss, libraryCss] = await Promise.all([
  readFile("src/demo/demo.css", "utf8"),
  readFile("src/lib/styles.css", "utf8"),
]);
const styles =
  "/* Generated from the React demo and library. */\n" +
  demoCss + "\n" + libraryCss +
  "\n#boot-status{margin:7rem auto;max-width:630px;text-align:center;font:600 14px -apple-system,BlinkMacSystemFont,sans-serif;color:#65728c;padding:20px}\n" +
  "#boot-status.boot-error{color:#a4374a;background:#fff1f3;border:1px solid #ffd7de;border-radius:14px}\n";
await writeFile("docs/styles.css", styles);

// Change asset URLs whenever either the JavaScript or the stylesheet changes.
const indexTemplate = await readFile("scripts/pages-index.template.html", "utf8");
const versionMarker = "__LUMA_ASSET_VERSION__";
if (!indexTemplate.includes(versionMarker)) {
  throw new Error("Pages index template is missing its asset version marker.");
}
const assetVersion = createHash("sha256")
  .update(bundle)
  .update(styles)
  .digest("hex")
  .slice(0, 12);
await writeFile(
  "docs/index.html",
  indexTemplate.replaceAll(versionMarker, assetVersion),
);
await copyFile("public/scene.svg", "docs/scene.svg");
await writeFile("docs/.nojekyll", "");
await Promise.all([
  rm("docs/boot.js", { force: true }),
  rm("docs/demo.js", { force: true }),
  rm("docs/source", { recursive: true, force: true }),
  rm("docs/assets", { recursive: true, force: true }),
]);
console.log("Precompiled React demo written to docs/ without browser Babel or external JS.");
