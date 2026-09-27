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
  modules["src/demo/main.tsx"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_1 = require("react-dom/client");
const App_1 = require("./App");
require("./demo.css");
const root = document.getElementById("root");
if (!root)
    throw new Error("Missing #root");
(0, client_1.createRoot)(root).render((0, jsx_runtime_1.jsx)(react_1.StrictMode, { children: (0, jsx_runtime_1.jsx)(App_1.App, {}) }));

  };

  modules["src/demo/App.tsx"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const index_1 = require("../index");
function OpticalStar() {
    return (0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.65, strokeLinecap: "round", "aria-hidden": "true", focusable: "false", children: (0, jsx_runtime_1.jsx)("path", { d: "M12 2.75v18.5M2.75 12h18.5M5.46 5.46l13.08 13.08M18.54 5.46 5.46 18.54" }) });
}
function App() {
    const [opacity, setOpacity] = (0, react_1.useState)(0.1);
    const [borderOpacity, setBorderOpacity] = (0, react_1.useState)(0.15);
    const [tone, setTone] = (0, react_1.useState)("dark");
    const [refraction, setRefraction] = (0, react_1.useState)(23);
    const [showOriginal, setShowOriginal] = (0, react_1.useState)(false);
    const [thickness, setThickness] = (0, react_1.useState)(0.5);
    const [supported, setSupported] = (0, react_1.useState)(null);
    const glassRef = (0, react_1.useRef)(null);
    const dragRef = (0, react_1.useRef)(null);
    const onGlassPointerDown = (event) => {
        if (!event.isPrimary || event.button !== 0) return;
        if (event.target instanceof Element &&
            event.target.closest("a, button, input, select, textarea, [data-no-drag]")) return;
        const glass = glassRef.current;
        const scene = glass?.parentElement;
        if (!glass || !scene) return;
        const sceneRect = scene.getBoundingClientRect();
        const glassRect = glass.getBoundingClientRect();
        dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            left: glassRect.left - sceneRect.left,
            top: glassRect.top - sceneRect.top,
        };
        event.preventDefault();
        glass.setPointerCapture(event.pointerId);
        glass.classList.add("is-dragging");
    };
    const onGlassPointerMove = (event) => {
        const drag = dragRef.current;
        const glass = glassRef.current;
        if (!drag || !glass || drag.pointerId !== event.pointerId) return;
        const scene = glass.parentElement;
        if (!scene) return;
        if (event.cancelable) event.preventDefault();
        const sceneRect = scene.getBoundingClientRect();
        const glassRect = glass.getBoundingClientRect();
        const visibleX = Math.min(72, glassRect.width, sceneRect.width);
        const visibleY = Math.min(72, glassRect.height, sceneRect.height);
        const left = Math.max(visibleX - glassRect.width, Math.min(
            sceneRect.width - visibleX,
            drag.left + event.clientX - drag.startX,
        ));
        const top = Math.max(visibleY - glassRect.height, Math.min(
            sceneRect.height - visibleY,
            drag.top + event.clientY - drag.startY,
        ));
        glass.style.left = `${(left / sceneRect.width) * 100}%`;
        glass.style.top = `${(top / sceneRect.height) * 100}%`;
    };
    const onGlassPointerEnd = (event) => {
        if (dragRef.current?.pointerId !== event.pointerId) return;
        dragRef.current = null;
        const glass = glassRef.current;
        glass?.classList.remove("is-dragging");
        if (glass?.hasPointerCapture(event.pointerId)) {
            glass.releasePointerCapture(event.pointerId);
        }
    };
    (0, react_1.useEffect)(() => {
        window.addEventListener("pointermove", onGlassPointerMove, { passive: false });
        window.addEventListener("pointerup", onGlassPointerEnd);
        window.addEventListener("pointercancel", onGlassPointerEnd);
        return () => {
            window.removeEventListener("pointermove", onGlassPointerMove);
            window.removeEventListener("pointerup", onGlassPointerEnd);
            window.removeEventListener("pointercancel", onGlassPointerEnd);
        };
    }, []);

    return ((0, jsx_runtime_1.jsxs)("div", { className: "page", children: [(0, jsx_runtime_1.jsxs)("header", { className: "topbar", children: [(0, jsx_runtime_1.jsxs)("a", { className: "brand", href: "#", "aria-label": "Luma Glass home", children: [(0, jsx_runtime_1.jsx)("span", { className: "brand-symbol", "aria-hidden": "true", children: (0, jsx_runtime_1.jsx)(OpticalStar, {}) }), (0, jsx_runtime_1.jsx)("span", { children: "LUMA GLASS" })] }), (0, jsx_runtime_1.jsxs)("a", { className: "github-link", href: "https://github.com/chenghsj/luma-glass", target: "_blank", rel: "noreferrer", children: ["GitHub ", (0, jsx_runtime_1.jsx)("span", { "aria-hidden": "true", children: "\u2197" })] })] }), (0, jsx_runtime_1.jsxs)("main", { className: "main", children: [(0, jsx_runtime_1.jsxs)("div", { className: "heading", children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "OPEN SOURCE \u00B7 REACT + TYPESCRIPT" }), (0, jsx_runtime_1.jsx)("h1", { children: "Light becomes an interface." }), (0, jsx_runtime_1.jsx)("p", { children: "A crisp, fixed glass silhouette with adjustable refraction, translucency, and optical edge thickness." })] }), (0, jsx_runtime_1.jsx)(index_1.GlassProvider, { defaults: {
                            opacity,
                            borderOpacity,
                            tone,
                            refraction: showOriginal ? 0 : refraction,
                            thickness,
                            radius: 40,
                        }, children: (0, jsx_runtime_1.jsxs)("div", { className: "demo-stage", style: { backgroundImage: "url(/luma-glass/scene.svg)" }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "demo-underlay", "aria-label": "React component behind the glass", children: [(0, jsx_runtime_1.jsx)("span", { className: "underlay-check", "aria-hidden": "true", children: "\u2713" }), (0, jsx_runtime_1.jsxs)("div", { className: "underlay-copy", children: [(0, jsx_runtime_1.jsx)("strong", { children: "LOWER LAYER" }), (0, jsx_runtime_1.jsx)("span", { children: "Real React component" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "underlay-footer", children: [(0, jsx_runtime_1.jsx)("span", { children: "BEHIND GLASS" }), (0, jsx_runtime_1.jsx)("span", { className: "underlay-dots", "aria-hidden": "true", children: "\u25CF \u25CF" })] })] }), (0, jsx_runtime_1.jsx)(index_1.LiquidGlass, { className: "demo-glass", ref: glassRef, title: "Drag to move the glass card", onPointerDown: onGlassPointerDown, onPointerUp: onGlassPointerEnd, onPointerCancel: onGlassPointerEnd, onLostPointerCapture: onGlassPointerEnd, onSupportChange: setSupported, children: (0, jsx_runtime_1.jsxs)("div", { className: "glass-inner", children: [(0, jsx_runtime_1.jsxs)("div", { className: "glass-eyebrow", children: [(0, jsx_runtime_1.jsx)("span", { className: "glass-star", "aria-hidden": "true", children: (0, jsx_runtime_1.jsx)(OpticalStar, {}) }), " OPTICAL MATERIAL"] }), (0, jsx_runtime_1.jsxs)("div", { className: "glass-title", children: ["Liquid", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("span", { children: "Glass." })] }), (0, jsx_runtime_1.jsx)("div", { className: "glass-description", children: "Light, depth and refraction." })] }) })] }) }), (0, jsx_runtime_1.jsx)("p", { className: "demo-drag-hint", children: "Drag the glass to explore refraction." }), (0, jsx_runtime_1.jsxs)("section", { className: "controls", "aria-label": "Glass appearance controls", children: [(0, jsx_runtime_1.jsxs)("div", { className: "control", children: [(0, jsx_runtime_1.jsxs)("div", { className: "control-head", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "opacity", children: "Surface opacity" }), (0, jsx_runtime_1.jsxs)("output", { htmlFor: "opacity", children: [Math.round(opacity * 100), "%"] })] }), (0, jsx_runtime_1.jsx)("input", { id: "opacity", type: "range", min: "0", max: "0.75", step: "0.01", value: opacity, onChange: (event) => setOpacity(Number(event.target.value)) }), (0, jsx_runtime_1.jsxs)("div", { className: "control-scale", children: [(0, jsx_runtime_1.jsx)("span", { children: "Clear" }), (0, jsx_runtime_1.jsx)("span", { children: "Milky" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "control", children: [(0, jsx_runtime_1.jsxs)("div", { className: "control-head", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "refraction", children: "Refraction" }), (0, jsx_runtime_1.jsxs)("output", { htmlFor: "refraction", children: [refraction, " / 60"] })] }), (0, jsx_runtime_1.jsx)("input", { id: "refraction", type: "range", min: "0", max: "60", step: "1", value: refraction, onChange: (event) => {
                                            setRefraction(Number(event.target.value));
                                            setShowOriginal(false);
                                        } }), (0, jsx_runtime_1.jsxs)("div", { className: "control-scale", children: [(0, jsx_runtime_1.jsx)("span", { children: "None" }), (0, jsx_runtime_1.jsx)("span", { children: "Strong" })] }), (0, jsx_runtime_1.jsx)("p", { className: "control-hint", children: "Move the glass over the React component to see its text and border bend." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "control", children: [(0, jsx_runtime_1.jsxs)("div", { className: "control-head", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "thickness", children: "Optical edge thickness" }), (0, jsx_runtime_1.jsxs)("output", { htmlFor: "thickness", children: [thickness.toFixed(1), " px"] })] }), (0, jsx_runtime_1.jsx)("input", { id: "thickness", type: "range", min: "0.5", max: "6", step: "0.1", value: thickness, onChange: (event) => setThickness(Number(event.target.value)) }), (0, jsx_runtime_1.jsxs)("div", { className: "control-scale", children: [(0, jsx_runtime_1.jsx)("span", { children: "Thin" }), (0, jsx_runtime_1.jsx)("span", { children: "Thick" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "control", children: [(0, jsx_runtime_1.jsxs)("div", { className: "control-head", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "border-opacity", children: "Border opacity" }), (0, jsx_runtime_1.jsxs)("output", { htmlFor: "border-opacity", children: [Math.round(borderOpacity * 100), "%"] })] }), (0, jsx_runtime_1.jsx)("input", { id: "border-opacity", type: "range", min: "0", max: "1", step: "0.01", value: borderOpacity, onChange: (event) => setBorderOpacity(Number(event.target.value)) }), (0, jsx_runtime_1.jsxs)("div", { className: "control-scale", children: [(0, jsx_runtime_1.jsx)("span", { children: "Subtle" }), (0, jsx_runtime_1.jsx)("span", { children: "Bright" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "controls-bottom", children: [(0, jsx_runtime_1.jsxs)("span", { className: "status", "data-supported": supported === null ? "unknown" : supported ? "true" : "false", children: [(0, jsx_runtime_1.jsx)("i", {}), " ", supported === null ? "Checking browser support…" : !supported ? "SVG backdrop refraction not supported in this browser" : showOriginal ? "Refraction supported · paused" : "SVG backdrop refraction supported · Chromium"] }), (0, jsx_runtime_1.jsxs)("div", { className: "control-actions", children: [(0, jsx_runtime_1.jsxs)("label", { className: "render-picker tone-picker", htmlFor: "glass-tone", children: ["Glass tone", (0, jsx_runtime_1.jsxs)("select", { id: "glass-tone", value: tone, onChange: (event) => setTone(event.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "dark", children: "Dark" }), (0, jsx_runtime_1.jsx)("option", { value: "light", children: "Light" })] })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", "aria-pressed": showOriginal, onClick: () => setShowOriginal((value) => !value), children: showOriginal ? "Show refraction" : "Show original" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                                    setOpacity(0.1);
                                                    setBorderOpacity(0.15);
                                                    setTone("dark");
                                                    setRefraction(23);
                                                    setThickness(0.5);
                                                    setShowOriginal(false);
                                                    dragRef.current = null;
                                                    glassRef.current?.classList.remove("is-dragging");
                                                    glassRef.current?.style.removeProperty("left");
                                                    glassRef.current?.style.removeProperty("top");
                                                }, children: "\u21BA \u00A0 Reset" })] })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "footnote", children: "The lower layer is a real React component. SVG backdrop refraction is currently supported in Chromium; other browsers display the glass surface without displacement." })] })] }));
}

  };

  modules["src/index.ts"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBackdropRefractionSupported = exports.LiquidGlass = exports.GlassProvider = void 0;
require("./lib/styles.css");
const GlassProvider_1 = require("./lib/GlassProvider");
Object.defineProperty(exports, "GlassProvider", { enumerable: true, get: function () { return GlassProvider_1.GlassProvider; } });
const LiquidGlass_1 = require("./lib/LiquidGlass");
Object.defineProperty(exports, "LiquidGlass", { enumerable: true, get: function () { return LiquidGlass_1.LiquidGlass; } });
const support_1 = require("./lib/support");
Object.defineProperty(exports, "isBackdropRefractionSupported", { enumerable: true, get: function () { return support_1.isBackdropRefractionSupported; } });
  };

  modules["src/lib/GlassProvider.tsx"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlassProvider = GlassProvider;
exports.useGlassDefaults = useGlassDefaults;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const builtInDefaults = {
    opacity: 0.1,
    borderOpacity: 0.15,
    tone: "light",
    refraction: 23,
    thickness: 0.5,
    radius: 28,
};
const GlassDefaultsContext = (0, react_1.createContext)(builtInDefaults);
function GlassProvider({ defaults = {}, children }) {
    const parent = (0, react_1.useContext)(GlassDefaultsContext);
    const { opacity, borderOpacity, tone, refraction, thickness, radius } = defaults;
    const value = (0, react_1.useMemo)(() => ({
        opacity: opacity ?? parent.opacity,
        borderOpacity: borderOpacity ?? parent.borderOpacity,
        tone: tone ?? parent.tone,
        refraction: refraction ?? parent.refraction,
        thickness: thickness ?? parent.thickness,
        radius: radius ?? parent.radius,
    }), [parent, opacity, borderOpacity, tone, refraction, thickness, radius]);
    return ((0, jsx_runtime_1.jsx)(GlassDefaultsContext.Provider, { value: value, children: children }));
}
function useGlassDefaults() {
    return (0, react_1.useContext)(GlassDefaultsContext);
}

  };

  modules["src/lib/LiquidGlass.tsx"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const { useGlassDefaults } = require("./GlassProvider");
const { clamp } = require("./optics");
const { createDisplacementMap } = require("./displacement");
const { isBackdropRefractionSupported } = require("./support");
const h = React.createElement;
exports.LiquidGlass = React.forwardRef(function LiquidGlass({
  opacity: opacityProp, borderOpacity: borderOpacityProp, tone: toneProp,
  refraction: refractionProp, thickness: thicknessProp, radius: radiusProp,
  onSupportChange, className, style, children, ...rest
}, forwardedRef) {
  const defaults = useGlassDefaults();
  const opacity = opacityProp ?? defaults.opacity;
  const borderOpacity = borderOpacityProp ?? defaults.borderOpacity;
  const tone = toneProp ?? defaults.tone;
  const refraction = refractionProp ?? defaults.refraction;
  const thickness = thicknessProp ?? defaults.thickness;
  const radius = radiusProp ?? defaults.radius;
  const rootRef = React.useRef(null);
  const callbackRef = React.useRef(onSupportChange);
  callbackRef.current = onSupportChange;
  const [supported, setSupported] = React.useState(false);
  const [map, setMap] = React.useState(null);
  const filterId = "luma-filter-" + React.useId().replace(/:/g, "");
  const setRootRef = React.useCallback((element) => {
    rootRef.current = element;
    if (typeof forwardedRef === "function") forwardedRef(element);
    else if (forwardedRef) forwardedRef.current = element;
  }, [forwardedRef]);
  React.useEffect(() => {
    const available = isBackdropRefractionSupported();
    setSupported(available);
    callbackRef.current?.(available);
  }, []);
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || !supported) { setMap(null); return; }
    let pending = 0;
    let lastKey = "";
    const regenerate = () => {
      pending = 0;
      const bounds = root.getBoundingClientRect();
      const css = window.getComputedStyle(root);
      const rawStrength = Number.parseFloat(css.getPropertyValue("--luma-refraction"));
      const rawEdge = Number.parseFloat(css.getPropertyValue("--luma-thickness"));
      const rawCorners = Number.parseFloat(css.getPropertyValue("--luma-radius"));
      const strength = clamp(Number.isFinite(rawStrength) ? rawStrength : refraction, 0, 60);
      const edge = clamp(Number.isFinite(rawEdge) ? rawEdge : thickness, 0.5, 6);
      const corners = Math.max(0, Number.isFinite(rawCorners) ? rawCorners : radius);
      const width = Math.max(0, bounds.width);
      const height = Math.max(0, bounds.height);
      const key = [width, height, strength, edge, corners].join(":");
      if (lastKey === key) return;
      lastKey = key;
      try { setMap(createDisplacementMap(width, height, corners, strength, edge)); }
      catch (error) { console.warn("[luma-glass] Displacement map unavailable:", error); setMap(null); }
    };
    const schedule = () => { if (!pending) pending = window.requestAnimationFrame(regenerate); };
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    const attributes = new MutationObserver(schedule);
    attributes.observe(root, { attributes: true, attributeFilter: ["class", "style"] });
    schedule();
    return () => {
      if (pending) window.cancelAnimationFrame(pending);
      resize.disconnect();
      attributes.disconnect();
    };
  }, [supported, refraction, thickness, radius]);
  const variables = {
    "--luma-opacity-base": clamp(opacity, 0, 1),
    "--luma-border-opacity-base": clamp(borderOpacity, 0, 1),
    "--luma-refraction-base": clamp(refraction, 0, 60),
    "--luma-thickness-base": clamp(thickness, 0.5, 6) + "px",
    "--luma-radius-base": Math.max(0, radius) + "px",
    ...(opacityProp !== undefined ? { "--luma-opacity": clamp(opacity, 0, 1) } : {}),
    ...(borderOpacityProp !== undefined ? { "--luma-border-opacity": clamp(borderOpacity, 0, 1) } : {}),
    ...(refractionProp !== undefined ? { "--luma-refraction": clamp(refraction, 0, 60) } : {}),
    ...(thicknessProp !== undefined ? { "--luma-thickness": clamp(thickness, 0.5, 6) + "px" } : {}),
    ...(radiusProp !== undefined ? { "--luma-radius": Math.max(0, radius) + "px" } : {})
  };
  const backdrop = supported && map ? {
    backdropFilter: "url(#" + filterId + ")",
    WebkitBackdropFilter: "url(#" + filterId + ")"
  } : undefined;
  const svg = map && supported ? h("svg", { className: "luma-glass__filter", "aria-hidden": "true", focusable: "false" },
    h("defs", null, h("filter", {
      id: filterId, x: "-50%", y: "-50%", width: "200%", height: "200%",
      filterUnits: "objectBoundingBox", primitiveUnits: "userSpaceOnUse", colorInterpolationFilters: "sRGB"
    }, h("feImage", {
      key: map.url, href: map.url, x: "0", y: "0", width: map.width, height: map.height,
      preserveAspectRatio: "none", result: "displacement"
    }), h("feDisplacementMap", {
      in: "SourceGraphic", in2: "displacement", scale: map.scale,
      xChannelSelector: "R", yChannelSelector: "G"
    })))) : null;
  return h("div", {
    ...rest, ref: setRootRef, "data-tone": tone,
    "data-refraction-supported": supported ? "true" : "false",
    className: ["luma-glass", className].filter(Boolean).join(" "),
    style: { ...variables, ...style }
  }, svg,
    backdrop ? h("span", { className: "luma-glass__refraction", style: backdrop, "aria-hidden": "true" }) : null,
    h("span", { className: "luma-glass__surface", "aria-hidden": "true" }),
    h("span", { className: "luma-glass__shell", "aria-hidden": "true" }),
    h("span", { className: "luma-glass__contact", "aria-hidden": "true" }),
    h("span", { className: "luma-glass__highlight", "aria-hidden": "true" }),
    h("div", { className: "luma-glass__content" }, children)
  );
});
  };

  modules["src/lib/optics.ts"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.getLensOffset = getLensOffset;
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
function getLensOffset(
  x, y,
  width, height,
  radius, strength, thickness,
  out = { x: 0, y: 0 },
) {
  out.x = 0;
  out.y = 0;
  if (width <= 0 || height <= 0 || strength <= 0) return out;
  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  const r = Math.min(Math.max(0, radius), halfWidth, halfHeight);
  const localX = x - halfWidth;
  const localY = y - halfHeight;
  const qx = Math.abs(localX) - (halfWidth - r);
  const qy = Math.abs(localY) - (halfHeight - r);
  const positiveX = Math.max(qx, 0);
  const positiveY = Math.max(qy, 0);
  const cornerLength = Math.hypot(positiveX, positiveY);
  const signedDistance = cornerLength + Math.min(Math.max(qx, qy), 0) - r;
  if (signedDistance > 0) return out;

  const band = Math.min(44, Math.max(16, Math.min(width, height) * 0.12))
    + thickness * 0.45;
  const proximity = Math.max(0, Math.min(1, 1 + signedDistance / band));
  if (proximity === 0) return out;
  const influence = proximity * proximity * (3 - 2 * proximity);
  const displacement = strength * 0.82 * influence;

  if (cornerLength > 0.0001) {
    out.x = Math.sign(localX) * positiveX / cornerLength * displacement;
    out.y = Math.sign(localY) * positiveY / cornerLength * displacement;
  } else if (qx > qy) {
    out.x = Math.sign(localX) * displacement;
  } else {
    out.y = Math.sign(localY) * displacement;
  }
  return out;
}

  };

  modules["src/lib/displacement.ts"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDisplacementMap = createDisplacementMap;
exports.getMapDimensions = getMapDimensions;
exports.getDisplacementScale = getDisplacementScale;
const { clamp, getLensOffset } = require("./optics");
function getMapDimensions(width, height, devicePixelRatio = 1) {
  const dpr = Number.isFinite(devicePixelRatio) ? Math.max(1, devicePixelRatio) : 1;
  const resolution = Math.min(1.5, dpr, Math.sqrt(750000 / (width * height)));
  return {
    width: Math.max(1, Math.floor(width * resolution)),
    height: Math.max(1, Math.floor(height * resolution))
  };
}
function getDisplacementScale(refraction) {
  return Math.max(2, Math.ceil(clamp(refraction, 0, 60) * 0.82 * 2.1));
}
function createDisplacementMap(width, height, radius, refraction, thickness) {
  if (width <= 0 || height <= 0 || refraction <= 0) return null;
  const { width: mapWidth, height: mapHeight } = getMapDimensions(
    width, height, typeof window === "undefined" ? 1 : window.devicePixelRatio
  );
  const canvas = document.createElement("canvas");
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const image = context.createImageData(mapWidth, mapHeight);
  const pixels = image.data;
  const offset = { x: 0, y: 0 };
  const strength = clamp(refraction, 0, 60);
  const scale = getDisplacementScale(strength);
  const edgeThickness = clamp(thickness, 0.5, 6);
  for (let y = 0; y < mapHeight; y += 1) {
    const sourceY = (y + 0.5) * height / mapHeight;
    for (let x = 0; x < mapWidth; x += 1) {
      const sourceX = (x + 0.5) * width / mapWidth;
      getLensOffset(sourceX, sourceY, width, height, radius, strength, edgeThickness, offset);
      const index = (y * mapWidth + x) * 4;
      pixels[index] = clamp(Math.round(127.5 + offset.x * 255 / scale), 0, 255);
      pixels[index + 1] = clamp(Math.round(127.5 + offset.y * 255 / scale), 0, 255);
      pixels[index + 2] = 128;
      pixels[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return { url: canvas.toDataURL("image/png"), width, height, scale };
}
  };

  modules["src/lib/support.ts"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportsBackdropRefraction = supportsBackdropRefraction;
exports.isBackdropRefractionSupported = isBackdropRefractionSupported;
function supportsBackdropRefraction(userAgent, acceptsSvgBackdrop) {
  if (!acceptsSvgBackdrop) return false;
  if (/(?:iPhone|iPad|iPod|CriOS|EdgiOS|FxiOS)/i.test(userAgent)) return false;
  return /(?:Chrome|Chromium|Edg|OPR|SamsungBrowser)\/\d+/i.test(userAgent);
}
function isBackdropRefractionSupported() {
  if (typeof window === "undefined" || typeof CSS === "undefined") return false;
  const supported = CSS.supports("backdrop-filter", "url(#luma-support-probe)") ||
    CSS.supports("-webkit-backdrop-filter", "url(#luma-support-probe)");
  return supportsBackdropRefraction(navigator.userAgent, supported);
}
  };

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
