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
import { clamp } from "./optics";
import {
  createRefractionRenderer,
  type RefractionRenderer,
} from "./webgl";

export interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  /** White glass opacity, from 0 to 1. Default: 0.4. */
  opacity?: number;
  /** Optical displacement in CSS pixels, from 0 to 60. Default: 23. */
  refraction?: number;
  /** Optical shell thickness in CSS pixels, from 0.5 to 6. Default: 1.8. */
  thickness?: number;
  /** Fixed glass corner radius in CSS pixels. Default: 28. */
  radius?: number;
}

export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  function LiquidGlass(
    {
      opacity = 0.4,
      refraction = 23,
      thickness = 1.8,
      radius = 28,
      className,
      style,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const scene = useContext(GlassSceneContext);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rendererRef = useRef<RefractionRenderer | null>(null);
    const opticalValues = useRef({ refraction, thickness });
    opticalValues.current = { refraction, thickness };

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
      const canvas = canvasRef.current;
      const image = scene?.imageElement;
      const sceneRoot = scene?.sceneRef.current;
      if (!root || !canvas || !image || !sceneRoot) return;

      let renderer: RefractionRenderer | null = null;
      try {
        renderer = createRefractionRenderer(canvas, image);
      } catch (error) {
        // A CSS-only glass is still usable when WebGL or CORS is unavailable.
        if (import.meta.env.DEV) console.warn("[luma-glass] WebGL fallback:", error);
      }
      if (!renderer) return;
      rendererRef.current = renderer;
      const activeRenderer = renderer;
      let pending = 0;
      const draw = () => {
        pending = 0;
        const values = opticalValues.current;
        activeRenderer.draw({
          scene: sceneRoot.getBoundingClientRect(),
          glass: root.getBoundingClientRect(),
          strength: clamp(values.refraction, 0, 60),
          thickness: clamp(values.thickness, 0.5, 6),
        });
      };
      const schedule = () => {
        if (!pending) pending = window.requestAnimationFrame(draw);
      };
      const observer = new ResizeObserver(schedule);
      observer.observe(sceneRoot);
      observer.observe(root);
      window.addEventListener("scroll", schedule, true);
      window.addEventListener("resize", schedule);
      schedule();

      return () => {
        if (pending) window.cancelAnimationFrame(pending);
        observer.disconnect();
        window.removeEventListener("scroll", schedule, true);
        window.removeEventListener("resize", schedule);
        activeRenderer.dispose();
        rendererRef.current = null;
      };
    }, [scene?.imageElement, scene?.sceneRef]);

    useEffect(() => {
      const root = rootRef.current;
      const sceneRoot = scene?.sceneRef.current;
      if (!root || !sceneRoot || !rendererRef.current) return;
      rendererRef.current.draw({
        scene: sceneRoot.getBoundingClientRect(),
        glass: root.getBoundingClientRect(),
        strength: clamp(refraction, 0, 60),
        thickness: clamp(thickness, 0.5, 6),
      });
    }, [refraction, thickness, scene?.sceneRef, scene?.imageElement]);

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
        <canvas ref={canvasRef} className="luma-glass__refraction" aria-hidden="true" />
        <span className="luma-glass__surface" aria-hidden="true" />
        <span className="luma-glass__shell" aria-hidden="true" />
        <span className="luma-glass__contact" aria-hidden="true" />
        <span className="luma-glass__highlight" aria-hidden="true" />
        <div className="luma-glass__content">{children}</div>
      </div>
    );
  },
);
