import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useGlassDefaults } from "./GlassProvider";
import { clamp } from "./optics";
import type { DisplacementMap, DisplacementParams } from "./displacement";
import { generateDisplacementMap, releaseDisplacementMap } from "./worker-client";
import { isBackdropRefractionSupported } from "./support";

export interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  /** Reports whether this browser is expected to render SVG backdrop refraction. */
  onSupportChange?: (supported: boolean) => void;
  /** Glass surface opacity, from 0 to 1. Default: 0.1. */
  opacity?: number;
  /** Independent opacity for the optical rim and highlights, 0 to 1. Default: 0.15. */
  borderOpacity?: number;
  /** Glass tint. Default: light. */
  tone?: "light" | "dark";
  /** Edge displacement in CSS pixels, from 0 to 60. Default: 23. */
  refraction?: number;
  /** Optical shell thickness in CSS pixels, from 0.5 to 6. Default: 0.5. */
  thickness?: number;
  /** Optical corner radius in CSS pixels. Default: 28. */
  radius?: number;
}

export const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  function LiquidGlass(
    {
      opacity: opacityProp,
      borderOpacity: borderOpacityProp,
      tone: toneProp,
      refraction: refractionProp,
      thickness: thicknessProp,
      radius: radiusProp,
      onSupportChange,
      className,
      style,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const defaults = useGlassDefaults();
    const opacity = opacityProp ?? defaults.opacity;
    const borderOpacity = borderOpacityProp ?? defaults.borderOpacity;
    const tone = toneProp ?? defaults.tone;
    const refraction = refractionProp ?? defaults.refraction;
    const thickness = thicknessProp ?? defaults.thickness;
    const radius = radiusProp ?? defaults.radius;
    const rootRef = useRef<HTMLDivElement | null>(null);
    const callbackRef = useRef(onSupportChange);
    callbackRef.current = onSupportChange;
    const [supported, setSupported] = useState(false);
    const [map, setMap] = useState<DisplacementMap | null>(null);
    const opticalValues = useRef({ refraction, thickness, radius });
    opticalValues.current = { refraction, thickness, radius };
    const scheduleRef = useRef<(() => void) | null>(null);
    const filterId = `luma-filter-` + useId().replace(/:/g, "");

    const setRootRef = useCallback(
      (element: HTMLDivElement | null) => {
        rootRef.current = element;
        if (typeof forwardedRef === "function") forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
      },
      [forwardedRef],
    );

    useEffect(() => {
      const available = isBackdropRefractionSupported();
      setSupported(available);
      callbackRef.current?.(available);
    }, []);

    useEffect(() => {
      const root = rootRef.current;
      if (!root || !supported) {
        setMap(null);
        return;
      }

      let disposed = false;
      let pendingFrame = 0;
      let lastKey = "";
      let inFlight = false;
      type Work = { key: string; params: DisplacementParams };
      let queued: Work | null = null;

      // Only one request per glass is in flight. Slider changes replace the
      // queued request instead of building a long worker message backlog.
      const process = (work: Work) => {
        inFlight = true;
        void generateDisplacementMap(work.params).then((next) => {
          if (disposed || work.key !== lastKey) {
            releaseDisplacementMap(next);
          } else {
            setMap(next);
          }
        }).catch((error) => {
          if (import.meta.env.DEV) console.warn("[luma-glass] Map generation failed:", error);
          if (!disposed && work.key === lastKey) setMap(null);
        }).finally(() => {
          inFlight = false;
          const next = queued;
          queued = null;
          if (!disposed && next && next.key === lastKey) process(next);
        });
      };

      const regenerate = () => {
        pendingFrame = 0;
        const bounds = root.getBoundingClientRect();
        const css = window.getComputedStyle(root);
        const { refraction, thickness, radius } = opticalValues.current;
        const cssRefraction = Number.parseFloat(css.getPropertyValue("--luma-refraction"));
        const cssThickness = Number.parseFloat(css.getPropertyValue("--luma-thickness"));
        const cssRadius = Number.parseFloat(css.getPropertyValue("--luma-radius"));
        const strength = clamp(Number.isFinite(cssRefraction) ? cssRefraction : refraction, 0, 60);
        const edge = clamp(Number.isFinite(cssThickness) ? cssThickness : thickness, 0.5, 6);
        const corners = Math.max(0, Number.isFinite(cssRadius) ? cssRadius : radius);
        const params: DisplacementParams = {
          width: Math.max(0, bounds.width),
          height: Math.max(0, bounds.height),
          radius: corners,
          refraction: strength,
          thickness: edge,
          devicePixelRatio: window.devicePixelRatio || 1,
        };
        const key = Object.values(params).join(":");
        if (key === lastKey) return;
        lastKey = key;
        if (params.width <= 0 || params.height <= 0 || params.refraction <= 0) {
          queued = null;
          setMap(null);
          return;
        }

        const work = { key, params };
        if (inFlight) queued = work;
        else process(work);
      };

      const schedule = () => {
        if (!pendingFrame) pendingFrame = window.requestAnimationFrame(regenerate);
      };
      scheduleRef.current = schedule;
      const resize = new ResizeObserver(schedule);
      resize.observe(root);
      const attributes = new MutationObserver(schedule);
      attributes.observe(root, { attributes: true, attributeFilter: ["class", "style"] });
      window.addEventListener("resize", schedule);
      schedule();

      return () => {
        disposed = true;
        queued = null;
        if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
        resize.disconnect();
        attributes.disconnect();
        window.removeEventListener("resize", schedule);
        scheduleRef.current = null;
      };
    }, [supported]);

    useEffect(() => {
      scheduleRef.current?.();
    }, [refraction, thickness, radius]);

    // Keep blob URLs alive until their map is replaced or the glass unmounts.
    useEffect(() => () => releaseDisplacementMap(map), [map]);

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
      ...(radiusProp !== undefined ? { "--luma-radius": Math.max(0, radius) + "px" } : {}),
    } as CSSProperties;

    const backdrop = supported && map ? { backdropFilter: `url(#` + filterId + `)`,
      WebkitBackdropFilter: `url(#` + filterId + `)` } : undefined;

    return (
      <div
        {...rest}
        ref={setRootRef}
        data-tone={tone}
        data-refraction-supported={supported ? "true" : "false"}
        className={["luma-glass", className].filter(Boolean).join(" ")}
        style={{ ...variables, ...style }}
      >
        {map && supported && (
          <svg className="luma-glass__filter" aria-hidden="true" focusable="false">
            <defs>
              <filter
                id={filterId}
                x="-50%" y="-50%" width="200%" height="200%"
                filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feImage
                  key={map.url}
                  href={map.url}
                  x="0" y="0" width={map.width} height={map.height}
                  preserveAspectRatio="none" result="displacement"
                />
                <feDisplacementMap in="SourceGraphic" in2="displacement"
                  scale={map.scale} xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>
        )}
        {backdrop && <span className="luma-glass__refraction" style={backdrop} aria-hidden="true" />}
        <span className="luma-glass__surface" aria-hidden="true" />
        <span className="luma-glass__shell" aria-hidden="true" />
        <span className="luma-glass__contact" aria-hidden="true" />
        <span className="luma-glass__highlight" aria-hidden="true" />
        <div className="luma-glass__content">{children}</div>
      </div>
    );
  },
);
