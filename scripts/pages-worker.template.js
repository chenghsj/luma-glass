/* Standalone GitHub Pages worker, compiled from src/lib/*.ts. */
(() => {
  "use strict";
  const modules = Object.create(null);
/*__WORKER_COMPILED_MODULES__*/
  const cache = Object.create(null);
  function load(id) {
    if (cache[id]) return cache[id].exports;
    const factory = modules[id];
    if (!factory) throw new Error("Missing worker module: " + id);
    const module = { exports: {} };
    cache[id] = module;
    const require = (specifier) => {
      if (!specifier.startsWith(".")) throw new Error("Unexpected worker import: " + specifier);
      const parts = id.split("/");
      parts.pop();
      for (const part of specifier.split("/")) {
        if (part === "..") parts.pop();
        else if (part !== "." && part) parts.push(part);
      }
      const base = parts.join("/");
      const resolved = [base, base + ".ts", base + ".tsx", base + ".js"]
        .find((candidate) => modules[candidate]);
      if (!resolved) throw new Error("Cannot resolve worker import: " + specifier);
      return load(resolved);
    };
    factory(require, module, module.exports);
    return module.exports;
  }
  load("src/lib/displacement.worker.ts");
})();
