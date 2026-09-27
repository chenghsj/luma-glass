/* Generated from src/demo and src/lib using TypeScript 5.8.3.
   Uses the same React component implementations as the local playground.
   No browser-side TypeScript/Babel compilation or external JS requests. */
(() => {
  "use strict";
  const status = document.getElementById("boot-status");
  try {
    const React = window.React;
    const ReactDOM = window.ReactDOM;
    if (!React || !ReactDOM || typeof ReactDOM.createRoot !== "function") {
      throw new Error("React runtime is unavailable; check docs/vendor/");
    }
    const jsx = (type, props, key) => React.createElement(
      type, key === undefined ? props : { ...props, key },
    );
    const jsxRuntime = { jsx, jsxs: jsx, Fragment: React.Fragment };
    const modules = Object.create(null);
/*__COMPILED_MODULES__*/
    const cache = Object.create(null);
    function load(id) {
      if (cache[id]) return cache[id].exports;
      const factory = modules[id];
      if (!factory) throw new Error("Missing compiled module: " + id);
      const module = { exports: {} };
      cache[id] = module;
      const require = (specifier) => {
        if (specifier === "react") return React;
        if (specifier === "react/jsx-runtime") return jsxRuntime;
        if (specifier === "react-dom/client") return { createRoot: ReactDOM.createRoot };
        if (specifier.endsWith(".css")) return {};
        if (!specifier.startsWith(".")) {
          throw new Error("Unexpected external dependency: " + specifier);
        }
        const parts = id.split("/");
        parts.pop();
        for (const part of specifier.split("/")) {
          if (part === "..") parts.pop();
          else if (part !== "." && part) parts.push(part);
        }
        const base = parts.join("/");
        const resolved = [base, base + ".tsx", base + ".ts", base + ".js"]
          .find((candidate) => modules[candidate]);
        if (!resolved) {
          throw new Error("Cannot resolve " + specifier + " in " + id);
        }
        return load(resolved);
      };
      factory(require, module, module.exports);
      return module.exports;
    }

    const mount = document.getElementById("root");
    if (!mount) throw new Error("Missing #root");
    const observer = new MutationObserver(() => {
      if (mount.firstChild) {
        status?.remove();
        observer.disconnect();
      }
    });
    observer.observe(mount, { childList: true });
    load("src/demo/main.tsx");
    if (mount.firstChild) {
      status?.remove();
      observer.disconnect();
    }
  } catch (error) {
    console.error("[luma-glass React demo]", error);
    if (status) {
      status.textContent = "React Demo 載入失敗：" +
        (error instanceof Error ? error.message : String(error));
      status.classList.add("boot-error");
    }
  }
})();
