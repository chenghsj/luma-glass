import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { GlassSceneContext } from "./GlassScene";
import { useGlassDefaults } from "./GlassProvider";
import { clamp } from "./optics";
import { createCanvasRefractionRenderer } from "./canvas";
import {
  createRefractionRenderer,
  type RefractionRenderer,
} from "./webgl";

export type RefractionMode = "auto" | "canvas" | "webgl";
export type ActiveRenderer = "none" | "canvas" | "webgl";

export interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  /** canvas never creates a WebGL context; auto prefers WebGL, then Canvas 2D. */
  renderMode?: RefractionMode;
  /** Reports the actual renderer, including any fallback. */
  onRendererChange?: (renderer: ActiveRenderer) => void;
  /** White glass opacity, from 0 to 1. Default: 0.4. */
  opacity?: number;
  /** Optical displacement in CSS pixels, from 0 to 60. Default: 23. */
  refraction?: number;
  /** Optical shell thickness in CSS pixels, from 0.5 to 6. Default: 0.5. */
  thickness?: number;
  /** Fixed glass corner radius in CSS pixels. Default: 28. */
  radius?: number;
}

export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  function LiquidGlass(
    {
      opacity: opacityProp,
      refraction: refractionProp,
      thickness: thicknessProp,
      radius: radiusProp,
      renderMode: renderModeProp,
      onRendererChange,
      className,
      style,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const scene = useContext(GlassSceneContext);
    const defaults = useGlassDefaults();
    // Explicit component props always win over provider and built-in defaults.
    const opacity = opacityProp ?? defaults.opacity;
    const refraction = refractionProp ?? defaults.refraction;
    const thickness = thicknessProp ?? defaults.thickness;
    const radius = radiusProp ?? defaults.radius;
    const renderMode = renderModeProp ?? defaults.renderMode;
    const rootRef = useRef<HTMLDivElement | null>(null);
    const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const cpuCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<RefractionRenderer | null>(null);
    const redrawRef = useRef<(() => void) | null>(null);
    const opticalValues = useRef({ refraction, thickness });
    opticalValues.current = { refraction, thickness };
    const onChangeRef = useRef(onRendererChange);
    onChangeRef.current = onRendererChange;

    const setRootRef = useCallback(
      (element: HTMLDivElement | null) => {
        rootRef.current = element;
        if (typeof forwardedRef === "function") {
          forwardedRef(element);
        } else if (forwardedRef) {
          forwardedRef.current = element;
        }
      },
      [forwardedRef],
    );

    useEffect(() => {
      const root = rootRef.current;
      const sceneRoot = scene?.sceneRef.current;
      const image = scene?.imageElement;
      const webglCanvas = webglCanvasRef.current;
      const cpuCanvas = cpuCanvasRef.current;
      if (!root || !sceneRoot || !image || !webglCanvas || !cpuCanvas) {
        onChangeRef.current?.("none");
        return;
      }

      let renderer: RefractionRenderer | null = null;
      let active: ActiveRenderer = "none";
      if (renderMode !== "canvas") {
        try {
          renderer = createRefractionRenderer(webglCanvas, image);
          if (renderer) active = "webgl";
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn("[luma-glass] WebGL unavailable; trying Canvas 2D:", error);
          }
        }
      }
      if (!renderer) {
        try {
          renderer = createCanvasRefractionRenderer(cpuCanvas, image);
          active = "canvas";
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn("[luma-glass] Image refraction unavailable:", error);
          }
        }
      }
      onChangeRef.current?.(active);
      if (!renderer) return;

      rendererRef.current = renderer;
      let currentRenderer = renderer;
      let pending = 0;
      const draw = () => {
        pending = 0;
        const values = opticalValues.current;
        const frame = {
          scene: sceneRoot.getBoundingClientRect(),
          glass: root.getBoundingClientRect(),
          strength: clamp(values.refraction, 0, 60),
          thickness: clamp(values.thickness, 0.5, 6),
        };
        try {
          currentRenderer.draw(frame);
        } catch (error) {
          if (import.meta.env.DEV) console.warn("[luma-glass] Renderer failed:", error);
          if (active === "webgl") {
            currentRenderer.dispose();
            try {
              currentRenderer = createCanvasRefractionRenderer(cpuCanvas, image);
              currentRenderer.draw(frame);
              rendererRef.current = currentRenderer;
              active = "canvas";
              onChangeRef.current?.("canvas");
              return;
            } catch (fallbackError) {
              if (import.meta.env.DEV) {
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
      // Moving a glass via left/top or transform does not fire ResizeObserver.
      const positionObserver = new MutationObserver(schedule);
      positionObserver.observe(root, { attributes: true, attributeFilter: ["style", "class"] });
      window.addEventListener("scroll", schedule, true);
      window.addEventListener("resize", schedule);
      schedule();

      return () => {
        if (pending) window.cancelAnimationFrame(pending);
        observer.disconnect();
        positionObserver.disconnect();
        window.removeEventListener("scroll", schedule, true);
        window.removeEventListener("resize", schedule);
        currentRenderer.dispose();
        rendererRef.current = null;
        redrawRef.current = null;
      };
    }, [scene?.imageElement, scene?.sceneRef, renderMode]);

    useEffect(() => {
      // The renderer effect owns error handling and WebGL → Canvas fallback.
      redrawRef.current?.();
    }, [refraction, thickness, scene?.imageElement, renderMode]);

    const variables = {
      "--luma-opacity": clamp(opacity, 0, 1),
      "--luma-thickness": clamp(thickness, 0.5, 6) + "px",
      "--luma-radius": Math.max(0, radius) + "px",
    } as CSSProperties;

    return (
      <div
        {...rest}
        ref={setRootRef}
        className={["luma-glass", className].filter(Boolean).join(" ")}
        style={{ ...variables, ...style }}
      >
        <canvas ref={webglCanvasRef} className="luma-glass__refraction" aria-hidden="true" />
        <canvas ref={cpuCanvasRef} className="luma-glass__refraction" aria-hidden="true" />
        <span className="luma-glass__surface" aria-hidden="true" />
        <span className="luma-glass__shell" aria-hidden="true" />
        <span className="luma-glass__contact" aria-hidden="true" />
        <span className="luma-glass__highlight" aria-hidden="true" />
        <div className="luma-glass__content">{children}</div>
      </div>
    );
  },
);
