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
function App() {
    const [opacity, setOpacity] = (0, react_1.useState)(0.4);
    const [refraction, setRefraction] = (0, react_1.useState)(23);
    const [showOriginal, setShowOriginal] = (0, react_1.useState)(false);
    const [thickness, setThickness] = (0, react_1.useState)(1.8);
    const [renderMode, setRenderMode] = (0, react_1.useState)("canvas");
    const [activeRenderer, setActiveRenderer] = (0, react_1.useState)("none");
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

    return ((0, jsx_runtime_1.jsxs)("div", { className: "page", children: [(0, jsx_runtime_1.jsxs)("header", { className: "topbar", children: [(0, jsx_runtime_1.jsxs)("a", { className: "brand", href: "#", "aria-label": "Luma Glass home", children: [(0, jsx_runtime_1.jsx)("span", { className: "brand-symbol", children: "\u2733" }), (0, jsx_runtime_1.jsx)("span", { children: "LUMA GLASS" })] }), (0, jsx_runtime_1.jsxs)("a", { className: "github-link", href: "https://github.com/chenghsj/luma-glass", target: "_blank", rel: "noreferrer", children: ["GitHub ", (0, jsx_runtime_1.jsx)("span", { "aria-hidden": "true", children: "\u2197" })] })] }), (0, jsx_runtime_1.jsxs)("main", { className: "main", children: [(0, jsx_runtime_1.jsxs)("div", { className: "heading", children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "OPEN SOURCE \u00B7 REACT + TYPESCRIPT" }), (0, jsx_runtime_1.jsx)("h1", { children: "Light becomes an interface." }), (0, jsx_runtime_1.jsx)("p", { children: "A crisp, fixed glass silhouette with adjustable refraction, translucency, and optical edge thickness." })] }), (0, jsx_runtime_1.jsx)(index_1.GlassProvider, { defaults: {
                            opacity,
                            refraction: showOriginal ? 0 : refraction,
                            thickness,
                            radius: 40,
                            renderMode,
                        }, children: (0, jsx_runtime_1.jsxs)(index_1.GlassScene, { image: `${"/luma-glass/"}scene.svg`, className: "demo-stage", children: [(0, jsx_runtime_1.jsx)(index_1.LiquidGlass, { className: "demo-glass", ref: glassRef, title: "Drag to move the glass card", onPointerDown: onGlassPointerDown, onPointerUp: onGlassPointerEnd, onPointerCancel: onGlassPointerEnd, onLostPointerCapture: onGlassPointerEnd, onRendererChange: setActiveRenderer, children: (0, jsx_runtime_1.jsxs)("div", { className: "glass-inner", children: [(0, jsx_runtime_1.jsxs)("div", { className: "glass-eyebrow", children: [(0, jsx_runtime_1.jsx)("span", { className: "glass-star", children: "\u2733" }), " OPTICAL MATERIAL"] }), (0, jsx_runtime_1.jsxs)("div", { className: "glass-title", children: ["Liquid", (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("span", { children: "Glass." })] }), (0, jsx_runtime_1.jsx)("div", { className: "glass-description", children: "Light, depth and refraction." }), (0, jsx_runtime_1.jsxs)("div", { className: "glass-pill", children: ["LIVE REFRACTION ", (0, jsx_runtime_1.jsx)("span", { "aria-hidden": "true", children: "\u2197" })] })] }) })] }) }), (0, jsx_runtime_1.jsx)("p", { className: "demo-drag-hint", children: "Drag the glass to explore refraction." }), (0, jsx_runtime_1.jsxs)("section", { className: "controls", "aria-label": "Glass appearance controls", children: [(0, jsx_runtime_1.jsxs)("div", { className: "control", children: [(0, jsx_runtime_1.jsxs)("div", { className: "control-head", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "opacity", children: "Glass opacity" }), (0, jsx_runtime_1.jsxs)("output", { htmlFor: "opacity", children: [Math.round(opacity * 100), "%"] })] }), (0, jsx_runtime_1.jsx)("input", { id: "opacity", type: "range", min: "0", max: "0.75", step: "0.01", value: opacity, onChange: (event) => setOpacity(Number(event.target.value)) }), (0, jsx_runtime_1.jsxs)("div", { className: "control-scale", children: [(0, jsx_runtime_1.jsx)("span", { children: "Clear" }), (0, jsx_runtime_1.jsx)("span", { children: "Milky" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "control", children: [(0, jsx_runtime_1.jsxs)("div", { className: "control-head", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "refraction", children: "Refraction" }), (0, jsx_runtime_1.jsxs)("output", { htmlFor: "refraction", children: [refraction, " / 60"] })] }), (0, jsx_runtime_1.jsx)("input", { id: "refraction", type: "range", min: "0", max: "60", step: "1", value: refraction, onChange: (event) => {
                                            setRefraction(Number(event.target.value));
                                            setShowOriginal(false);
                                        } }), (0, jsx_runtime_1.jsxs)("div", { className: "control-scale", children: [(0, jsx_runtime_1.jsx)("span", { children: "None" }), (0, jsx_runtime_1.jsx)("span", { children: "Strong" })] }), (0, jsx_runtime_1.jsx)("p", { className: "control-hint", children: "Compare the Lower Layer card border behind the glass." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "control", children: [(0, jsx_runtime_1.jsxs)("div", { className: "control-head", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "thickness", children: "Optical edge thickness" }), (0, jsx_runtime_1.jsxs)("output", { htmlFor: "thickness", children: [thickness.toFixed(1), " px"] })] }), (0, jsx_runtime_1.jsx)("input", { id: "thickness", type: "range", min: "0.5", max: "6", step: "0.1", value: thickness, onChange: (event) => setThickness(Number(event.target.value)) }), (0, jsx_runtime_1.jsxs)("div", { className: "control-scale", children: [(0, jsx_runtime_1.jsx)("span", { children: "Thin" }), (0, jsx_runtime_1.jsx)("span", { children: "Thick" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "controls-bottom", children: [(0, jsx_runtime_1.jsxs)("span", { className: "status", children: [(0, jsx_runtime_1.jsx)("i", {}), " ", showOriginal ? "Original background · refraction paused" : activeRenderer === "canvas" ? "Canvas 2D active · no WebGL" : activeRenderer === "webgl" ? "WebGL active" : "Image refraction unavailable"] }), (0, jsx_runtime_1.jsxs)("div", { className: "control-actions", children: [(0, jsx_runtime_1.jsxs)("label", { className: "render-picker", htmlFor: "render-mode", children: ["Renderer", (0, jsx_runtime_1.jsxs)("select", { id: "render-mode", value: renderMode, onChange: (event) => setRenderMode(event.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "canvas", children: "Canvas 2D \u00B7 no WebGL" }), (0, jsx_runtime_1.jsx)("option", { value: "auto", children: "Auto \u00B7 WebGL \u2192 Canvas" }), (0, jsx_runtime_1.jsx)("option", { value: "webgl", children: "WebGL \u00B7 Canvas fallback" })] })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", "aria-pressed": showOriginal, onClick: () => setShowOriginal((value) => !value), children: showOriginal ? "Show refraction" : "Show original" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                                                    setOpacity(0.4);
                                                    setRefraction(23);
                                                    setThickness(1.8);
                                                    setShowOriginal(false);
                                                    dragRef.current = null;
                                                    glassRef.current?.classList.remove("is-dragging");
                                                    glassRef.current?.style.removeProperty("left");
                                                    glassRef.current?.style.removeProperty("top");
                                                }, children: "\u21BA \u00A0 Reset" })] })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "footnote", children: "Refraction samples the scene image, not arbitrary DOM beneath it. Use a same-origin or CORS-enabled image in your own scene." })] })] }));
}

  };

  modules["src/index.ts"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidGlass = exports.GlassProvider = exports.GlassScene = void 0;
require("./lib/styles.css");
var GlassScene_1 = require("./lib/GlassScene");
Object.defineProperty(exports, "GlassScene", { enumerable: true, get: function () { return GlassScene_1.GlassScene; } });
var GlassProvider_1 = require("./lib/GlassProvider");
Object.defineProperty(exports, "GlassProvider", { enumerable: true, get: function () { return GlassProvider_1.GlassProvider; } });
var LiquidGlass_1 = require("./lib/LiquidGlass");
Object.defineProperty(exports, "LiquidGlass", { enumerable: true, get: function () { return LiquidGlass_1.LiquidGlass; } });

  };

  modules["src/lib/GlassProvider.tsx"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlassProvider = GlassProvider;
exports.useGlassDefaults = useGlassDefaults;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const builtInDefaults = {
    opacity: 0.4,
    refraction: 23,
    thickness: 1.8,
    radius: 28,
    renderMode: "auto",
};
const GlassDefaultsContext = (0, react_1.createContext)(builtInDefaults);
function GlassProvider({ defaults = {}, children }) {
    const parent = (0, react_1.useContext)(GlassDefaultsContext);
    const { opacity, refraction, thickness, radius, renderMode } = defaults;
    const value = (0, react_1.useMemo)(() => ({
        opacity: opacity ?? parent.opacity,
        refraction: refraction ?? parent.refraction,
        thickness: thickness ?? parent.thickness,
        radius: radius ?? parent.radius,
        renderMode: renderMode ?? parent.renderMode,
    }), [parent, opacity, refraction, thickness, radius, renderMode]);
    return ((0, jsx_runtime_1.jsx)(GlassDefaultsContext.Provider, { value: value, children: children }));
}
function useGlassDefaults() {
    return (0, react_1.useContext)(GlassDefaultsContext);
}

  };

  modules["src/lib/GlassScene.tsx"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlassSceneContext = void 0;
exports.GlassScene = GlassScene;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
exports.GlassSceneContext = (0, react_1.createContext)(null);
function GlassScene({ image, backgroundColor = "#b6b4e8", children, className, style, ...rest }) {
    const sceneRef = (0, react_1.useRef)(null);
    const [imageElement, setImageElement] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        setImageElement(null);
        const element = new Image();
        element.crossOrigin = "anonymous";
        element.decoding = "async";
        element.onload = () => {
            if (!cancelled)
                setImageElement(element);
        };
        element.onerror = () => {
            if (!cancelled)
                setImageElement(null);
        };
        element.src = image;
        return () => {
            cancelled = true;
            element.onload = null;
            element.onerror = null;
        };
    }, [image]);
    const contextValue = (0, react_1.useMemo)(() => ({ sceneRef, imageElement }), [imageElement]);
    return ((0, jsx_runtime_1.jsx)(exports.GlassSceneContext.Provider, { value: contextValue, children: (0, jsx_runtime_1.jsx)("div", { ...rest, ref: sceneRef, className: ["luma-scene", className].filter(Boolean).join(" "), style: {
                backgroundColor,
                backgroundImage: 'url("' + image.replace(/"/g, "\\\"") + '")',
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                ...style,
            }, children: children }) }));
}

  };

  modules["src/lib/LiquidGlass.tsx"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiquidGlass = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const GlassScene_1 = require("./GlassScene");
const GlassProvider_1 = require("./GlassProvider");
const optics_1 = require("./optics");
const canvas_1 = require("./canvas");
const webgl_1 = require("./webgl");
exports.LiquidGlass = (0, react_1.forwardRef)(function LiquidGlass({ opacity: opacityProp, refraction: refractionProp, thickness: thicknessProp, radius: radiusProp, renderMode: renderModeProp, onRendererChange, className, style, children, ...rest }, forwardedRef) {
    const scene = (0, react_1.useContext)(GlassScene_1.GlassSceneContext);
    const defaults = (0, GlassProvider_1.useGlassDefaults)();
    const opacity = opacityProp ?? defaults.opacity;
    const refraction = refractionProp ?? defaults.refraction;
    const thickness = thicknessProp ?? defaults.thickness;
    const radius = radiusProp ?? defaults.radius;
    const renderMode = renderModeProp ?? defaults.renderMode;
    const rootRef = (0, react_1.useRef)(null);
    const webglCanvasRef = (0, react_1.useRef)(null);
    const cpuCanvasRef = (0, react_1.useRef)(null);
    const rendererRef = (0, react_1.useRef)(null);
    const redrawRef = (0, react_1.useRef)(null);
    const opticalValues = (0, react_1.useRef)({ refraction, thickness });
    opticalValues.current = { refraction, thickness };
    const onChangeRef = (0, react_1.useRef)(onRendererChange);
    onChangeRef.current = onRendererChange;
    const setRootRef = (0, react_1.useCallback)((element) => {
        rootRef.current = element;
        if (typeof forwardedRef === "function") {
            forwardedRef(element);
        }
        else if (forwardedRef) {
            forwardedRef.current = element;
        }
    }, [forwardedRef]);
    (0, react_1.useEffect)(() => {
        const root = rootRef.current;
        const sceneRoot = scene?.sceneRef.current;
        const image = scene?.imageElement;
        const webglCanvas = webglCanvasRef.current;
        const cpuCanvas = cpuCanvasRef.current;
        if (!root || !sceneRoot || !image || !webglCanvas || !cpuCanvas) {
            onChangeRef.current?.("none");
            return;
        }
        let renderer = null;
        let active = "none";
        if (renderMode !== "canvas") {
            try {
                renderer = (0, webgl_1.createRefractionRenderer)(webglCanvas, image);
                if (renderer)
                    active = "webgl";
            }
            catch (error) {
                if (false) {
                    console.warn("[luma-glass] WebGL unavailable; trying Canvas 2D:", error);
                }
            }
        }
        if (!renderer) {
            try {
                renderer = (0, canvas_1.createCanvasRefractionRenderer)(cpuCanvas, image);
                active = "canvas";
            }
            catch (error) {
                if (false) {
                    console.warn("[luma-glass] Image refraction unavailable:", error);
                }
            }
        }
        onChangeRef.current?.(active);
        if (!renderer)
            return;
        rendererRef.current = renderer;
        let currentRenderer = renderer;
        let pending = 0;
        const draw = () => {
            pending = 0;
            const values = opticalValues.current;
            const frame = {
                scene: sceneRoot.getBoundingClientRect(),
                glass: root.getBoundingClientRect(),
                strength: (0, optics_1.clamp)(values.refraction, 0, 60),
                thickness: (0, optics_1.clamp)(values.thickness, 0.5, 6),
            };
            try {
                currentRenderer.draw(frame);
            }
            catch (error) {
                if (false)
                    console.warn("[luma-glass] Renderer failed:", error);
                if (active === "webgl") {
                    currentRenderer.dispose();
                    try {
                        currentRenderer = (0, canvas_1.createCanvasRefractionRenderer)(cpuCanvas, image);
                        currentRenderer.draw(frame);
                        rendererRef.current = currentRenderer;
                        active = "canvas";
                        onChangeRef.current?.("canvas");
                        return;
                    }
                    catch (fallbackError) {
                        if (false) {
                            console.warn("[luma-glass] Canvas fallback failed:", fallbackError);
                        }
                    }
                }
                currentRenderer.dispose();
                rendererRef.current = null;
                onChangeRef.current?.("none");
            }
        };
        const schedule = () => {
            if (!pending && rendererRef.current) {
                pending = window.requestAnimationFrame(draw);
            }
        };
        redrawRef.current = schedule;
        const observer = new ResizeObserver(schedule);
        observer.observe(sceneRoot);
        observer.observe(root);
        const positionObserver = new MutationObserver(schedule);
        positionObserver.observe(root, { attributes: true, attributeFilter: ["style", "class"] });
        window.addEventListener("scroll", schedule, true);
        window.addEventListener("resize", schedule);
        schedule();
        return () => {
            if (pending)
                window.cancelAnimationFrame(pending);
            observer.disconnect();
            positionObserver.disconnect();
            window.removeEventListener("scroll", schedule, true);
            window.removeEventListener("resize", schedule);
            currentRenderer.dispose();
            rendererRef.current = null;
            redrawRef.current = null;
        };
    }, [scene?.imageElement, scene?.sceneRef, renderMode]);
    (0, react_1.useEffect)(() => {
        redrawRef.current?.();
    }, [refraction, thickness, scene?.imageElement, renderMode]);
    const variables = {
        "--luma-opacity": (0, optics_1.clamp)(opacity, 0, 1),
        "--luma-thickness": (0, optics_1.clamp)(thickness, 0.5, 6) + "px",
        "--luma-radius": Math.max(0, radius) + "px",
    };
    return ((0, jsx_runtime_1.jsxs)("div", { ...rest, ref: setRootRef, className: ["luma-glass", className].filter(Boolean).join(" "), style: { ...variables, ...style }, children: [(0, jsx_runtime_1.jsx)("canvas", { ref: webglCanvasRef, className: "luma-glass__refraction", "aria-hidden": "true" }), (0, jsx_runtime_1.jsx)("canvas", { ref: cpuCanvasRef, className: "luma-glass__refraction", "aria-hidden": "true" }), (0, jsx_runtime_1.jsx)("span", { className: "luma-glass__surface", "aria-hidden": "true" }), (0, jsx_runtime_1.jsx)("span", { className: "luma-glass__shell", "aria-hidden": "true" }), (0, jsx_runtime_1.jsx)("span", { className: "luma-glass__contact", "aria-hidden": "true" }), (0, jsx_runtime_1.jsx)("span", { className: "luma-glass__highlight", "aria-hidden": "true" }), (0, jsx_runtime_1.jsx)("div", { className: "luma-glass__content", children: children })] }));
});

  };

  modules["src/lib/canvas.ts"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCanvasRefractionRenderer = createCanvasRefractionRenderer;
const optics_1 = require("./optics");
function createCanvasRefractionRenderer(canvas, image) {
    const context = canvas.getContext("2d", { alpha: true });
    if (!context)
        throw new Error("Canvas 2D is unavailable.");
    const source = document.createElement("canvas");
    const sourceContext = source.getContext("2d", { willReadFrequently: true });
    if (!sourceContext)
        throw new Error("Image sampling is unavailable.");
    let cachedWidth = 0;
    let cachedHeight = 0;
    let pixels = null;
    return {
        draw({ scene, glass, strength, thickness }) {
            if (!scene.width || !scene.height || !glass.width || !glass.height)
                return;
            if (strength <= 0) {
                canvas.style.opacity = "0";
                return;
            }
            const sourceWidth = Math.max(1, Math.round(scene.width));
            const sourceHeight = Math.max(1, Math.round(scene.height));
            if (sourceWidth !== cachedWidth || sourceHeight !== cachedHeight) {
                source.width = sourceWidth;
                source.height = sourceHeight;
                const cover = (0, optics_1.getCoverLayout)(sourceWidth, sourceHeight, image.naturalWidth, image.naturalHeight);
                sourceContext.clearRect(0, 0, sourceWidth, sourceHeight);
                sourceContext.drawImage(image, -cover.cropX, -cover.cropY, cover.displayWidth, cover.displayHeight);
                pixels = sourceContext.getImageData(0, 0, sourceWidth, sourceHeight).data;
                cachedWidth = sourceWidth;
                cachedHeight = sourceHeight;
            }
            if (!pixels)
                return;
            const width = Math.max(1, Math.round(glass.width));
            const height = Math.max(1, Math.round(glass.height));
            if (canvas.width !== width)
                canvas.width = width;
            if (canvas.height !== height)
                canvas.height = height;
            const result = context.createImageData(width, height);
            const destination = result.data;
            const originX = glass.left - scene.left;
            const originY = glass.top - scene.top;
            const falloff = Math.max(42, Math.min(glass.width, glass.height) * 0.23)
                + thickness * 0.8;
            for (let y = 0; y < height; y++) {
                const v = (y + 0.5) / height;
                const influenceY = 0.07 + 0.93 * Math.exp(-Math.min(v, 1 - v) * glass.height / falloff);
                const offsetY = (v * 2 - 1) * influenceY * strength * 0.92;
                for (let x = 0; x < width; x++) {
                    const u = (x + 0.5) / width;
                    const influenceX = 0.07 + 0.93 * Math.exp(-Math.min(u, 1 - u) * glass.width / falloff);
                    const offsetX = (u * 2 - 1) * influenceX * strength * 0.92;
                    const sx = Math.min(sourceWidth - 1, Math.max(0, Math.round((originX + u * glass.width + offsetX) * sourceWidth / scene.width)));
                    const sy = Math.min(sourceHeight - 1, Math.max(0, Math.round((originY + v * glass.height + offsetY) * sourceHeight / scene.height)));
                    const from = (sy * sourceWidth + sx) * 4;
                    const to = (y * width + x) * 4;
                    destination[to] = pixels[from];
                    destination[to + 1] = pixels[from + 1];
                    destination[to + 2] = pixels[from + 2];
                    destination[to + 3] = pixels[from + 3];
                }
            }
            context.putImageData(result, 0, 0);
            canvas.style.opacity = "1";
        },
        dispose() {
            canvas.style.opacity = "0";
        },
    };
}

  };

  modules["src/lib/webgl.ts"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefractionRenderer = createRefractionRenderer;
const optics_1 = require("./optics");
const vertexShader = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = vec2((a_position.x + 1.0) * 0.5, (1.0 - a_position.y) * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
const fragmentShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_sceneSize;
uniform vec2 u_displaySize;
uniform vec2 u_crop;
uniform vec2 u_origin;
uniform vec2 u_glassSize;
uniform float u_strength;
uniform float u_thickness;

void main() {
  // A curved lens samples a broad strip, not just a few edge pixels.
  // Keep a small center contribution; the direction stays continuous at center.
  vec2 distanceToEdge = min(v_uv, 1.0 - v_uv) * u_glassSize;
  float falloff = max(42.0, min(u_glassSize.x, u_glassSize.y) * 0.23)
    + u_thickness * 0.8;
  vec2 influence = mix(vec2(0.07), vec2(1.0), exp(-distanceToEdge / falloff));
  vec2 direction = v_uv * 2.0 - 1.0;
  vec2 offset = direction * influence * (u_strength * 0.92);
  vec2 point = clamp(
    u_origin + v_uv * u_glassSize + offset,
    vec2(0.0), u_sceneSize
  );
  vec2 sourceUv = clamp((point + u_crop) / u_displaySize, vec2(0.0), vec2(1.0));
  gl_FragColor = texture2D(u_image, sourceUv);
}
`;
function compile(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader)
        throw new Error("Unable to allocate shader.");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error";
        gl.deleteShader(shader);
        throw new Error(message);
    }
    return shader;
}
function createRefractionRenderer(canvas, image) {
    const gl = canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        premultipliedAlpha: false,
    });
    if (!gl)
        return null;
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    const program = gl.createProgram();
    if (!program)
        throw new Error("Unable to allocate WebGL program.");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "Unable to link WebGL.");
    }
    const buffer = gl.createBuffer();
    const texture = gl.createTexture();
    if (!buffer || !texture)
        throw new Error("Unable to allocate WebGL buffers.");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (!image.naturalWidth || !image.naturalHeight) {
        throw new Error("Background image has no intrinsic dimensions.");
    }
    const sourceUrl = (image.currentSrc || image.src).toLowerCase();
    const isVector = sourceUrl.includes(".svg") ||
        sourceUrl.startsWith("data:image/svg+xml");
    const bitmap = document.createElement("canvas");
    const bitmapContext = bitmap.getContext("2d");
    if (!bitmapContext)
        throw new Error("Cannot rasterize background image.");
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxByTexture = maxTextureSize /
        Math.max(image.naturalWidth, image.naturalHeight);
    const maxByPixels = Math.sqrt(8000000 / (image.naturalWidth * image.naturalHeight));
    let textureWidth = 0;
    let textureHeight = 0;
    function uploadTexture(displayWidth, displayHeight, pixelRatio) {
        const requestedScale = isVector
            ? Math.max(1, Math.ceil(Math.max(displayWidth / image.naturalWidth, displayHeight / image.naturalHeight) * pixelRatio * 2) / 2)
            : 1;
        const scale = Math.min(requestedScale, 3, maxByTexture, maxByPixels);
        const width = Math.max(1, Math.floor(image.naturalWidth * scale));
        const height = Math.max(1, Math.floor(image.naturalHeight * scale));
        if (width === textureWidth && height === textureHeight)
            return;
        bitmap.width = width;
        bitmap.height = height;
        bitmapContext.clearRect(0, 0, width, height);
        bitmapContext.drawImage(image, 0, 0, width, height);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
        const textureError = gl.getError();
        if (textureError !== gl.NO_ERROR) {
            throw new Error("Canvas-backed background texture upload failed (WebGL error 0x" +
                textureError.toString(16) + ").");
        }
        textureWidth = width;
        textureHeight = height;
    }
    const position = gl.getAttribLocation(program, "a_position");
    if (position < 0)
        throw new Error("Missing WebGL position attribute.");
    const uniform = (name) => {
        const location = gl.getUniformLocation(program, name);
        if (location === null)
            throw new Error("Missing WebGL uniform: " + name);
        return location;
    };
    const uniforms = {
        image: uniform("u_image"),
        sceneSize: uniform("u_sceneSize"),
        displaySize: uniform("u_displaySize"),
        crop: uniform("u_crop"),
        origin: uniform("u_origin"),
        glassSize: uniform("u_glassSize"),
        strength: uniform("u_strength"),
        thickness: uniform("u_thickness"),
    };
    return {
        draw({ scene, glass, strength, thickness }) {
            if (!glass.width || !glass.height || !scene.width || !scene.height)
                return;
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.max(1, Math.round(glass.width * pixelRatio));
            const height = Math.max(1, Math.round(glass.height * pixelRatio));
            if (canvas.width !== width)
                canvas.width = width;
            if (canvas.height !== height)
                canvas.height = height;
            const cover = (0, optics_1.getCoverLayout)(scene.width, scene.height, image.naturalWidth, image.naturalHeight);
            uploadTexture(cover.displayWidth, cover.displayHeight, pixelRatio);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(position);
            gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(uniforms.image, 0);
            gl.uniform2f(uniforms.sceneSize, scene.width, scene.height);
            gl.uniform2f(uniforms.displaySize, cover.displayWidth, cover.displayHeight);
            gl.uniform2f(uniforms.crop, cover.cropX, cover.cropY);
            gl.uniform2f(uniforms.origin, glass.left - scene.left, glass.top - scene.top);
            gl.uniform2f(uniforms.glassSize, glass.width, glass.height);
            gl.uniform1f(uniforms.strength, strength);
            gl.uniform1f(uniforms.thickness, thickness);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            canvas.style.opacity = strength > 0 ? "1" : "0";
        },
        dispose() {
            canvas.style.opacity = "0";
            gl.deleteTexture(texture);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
            gl.deleteShader(vertex);
            gl.deleteShader(fragment);
        },
    };
}

  };

  modules["src/lib/optics.ts"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoverLayout = getCoverLayout;
exports.clamp = clamp;
function getCoverLayout(sceneWidth, sceneHeight, imageWidth, imageHeight) {
    if (sceneWidth <= 0 ||
        sceneHeight <= 0 ||
        imageWidth <= 0 ||
        imageHeight <= 0) {
        throw new RangeError("Scene and image dimensions must be positive.");
    }
    const scale = Math.max(sceneWidth / imageWidth, sceneHeight / imageHeight);
    const displayWidth = imageWidth * scale;
    const displayHeight = imageHeight * scale;
    return {
        displayWidth,
        displayHeight,
        cropX: (displayWidth - sceneWidth) / 2,
        cropY: (displayHeight - sceneHeight) / 2,
    };
}
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
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
