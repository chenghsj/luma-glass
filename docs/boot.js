/* The Pages preview transpiles the actual React source mirrored in docs/source.
   No separate demo implementation or GitHub Actions build is required. */
const status = document.getElementById("boot-status");
const sourceFiles = new Set([
  "src/demo/main.tsx",
  "src/demo/App.tsx",
  "src/index.ts",
  "src/lib/GlassProvider.tsx",
  "src/lib/GlassScene.tsx",
  "src/lib/LiquidGlass.tsx",
  "src/lib/canvas.ts",
  "src/lib/webgl.ts",
  "src/lib/optics.ts",
]);
const moduleUrls = new Map();
const compiling = new Set();

function resolveSource(from, specifier) {
  const resolved = new URL(specifier, "https://luma.local/" + from)
    .pathname.slice(1);
  for (const candidate of [resolved, resolved + ".tsx", resolved + ".ts", resolved + ".js"]) {
    if (sourceFiles.has(candidate)) return candidate;
  }
  throw new Error("Cannot resolve " + specifier + " from " + from);
}

async function compileSource(path) {
  if (moduleUrls.has(path)) return moduleUrls.get(path);
  if (compiling.has(path)) throw new Error("Unexpected module cycle: " + path);
  compiling.add(path);
  try {
    const response = await fetch("./source/" + path, { cache: "no-cache" });
    if (!response.ok) throw new Error(path + ": HTTP " + response.status);
    const source = (await response.text())
      .replaceAll("import.meta.env.BASE_URL", JSON.stringify("/luma-glass/"))
      .replaceAll("import.meta.env.DEV", "false")
      .replace(/^\s*import\s+["'][^"']+\.css["'];?\s*$/gm, "");

    if (!window.Babel) {
      throw new Error("Babel compiler was not loaded. Check CDN access.");
    }
    const isTSX = path.endsWith(".tsx");
    const compiled = window.Babel.transform(source, {
      filename: path,
      sourceType: "module",
      presets: [
        ["typescript", { allExtensions: true, isTSX }],
        ["react", { runtime: "automatic" }],
      ],
      comments: false,
    }).code;

    // TypeScript removes type-only imports; the remaining relative imports
    // point to the real transpiled React library modules, not duplicated code.
    const pattern = /\b(?:from\s*|import\s*)(['"])(\.[^'"]+)\1/g;
    const relativeImports = [...compiled.matchAll(pattern)]
      .map((match) => resolveSource(path, match[2]));
    for (const dependency of new Set(relativeImports)) {
      await compileSource(dependency);
    }
    const linked = compiled.replace(
      pattern,
      (match, quote, relative) =>
        match.replace(quote + relative + quote,
          quote + moduleUrls.get(resolveSource(path, relative)) + quote),
    );
    const url = URL.createObjectURL(new Blob(
      [linked + "\n//# sourceURL=" + path],
      { type: "text/javascript" },
    ));
    moduleUrls.set(path, url);
    return url;
  } finally {
    compiling.delete(path);
  }
}

try {
  status.textContent = "Loading React components…";
  const entry = await compileSource("src/demo/main.tsx");
  await import(entry);
  status.remove();
} catch (error) {
  console.error("[luma-glass Pages React demo]", error);
  status.textContent =
    "React Demo 載入失敗：" + (error instanceof Error ? error.message : String(error)) +
    "。請檢查網路或在本地執行 npm run dev。";
  status.classList.add("boot-error");
}
