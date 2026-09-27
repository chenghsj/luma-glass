import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";

export interface GlassSceneProps extends HTMLAttributes<HTMLDivElement> {
  /** Image displayed behind glass. It must be same-origin or CORS-enabled for WebGL. */
  image: string;
  backgroundColor?: string;
  children: ReactNode;
}

export interface GlassSceneContextValue {
  sceneRef: RefObject<HTMLDivElement>;
  imageElement: HTMLImageElement | null;
}

export const GlassSceneContext = createContext<GlassSceneContextValue | null>(null);

export function GlassScene({
  image,
  backgroundColor = "#b6b4e8",
  children,
  className,
  style,
  ...rest
}: GlassSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setImageElement(null);
    const element = new Image();
    element.crossOrigin = "anonymous";
    element.decoding = "async";
    element.onload = () => {
      if (!cancelled) setImageElement(element);
    };
    element.onerror = () => {
      if (!cancelled) setImageElement(null);
    };
    element.src = image;
    return () => {
      cancelled = true;
      element.onload = null;
      element.onerror = null;
    };
  }, [image]);

  const contextValue = useMemo(
    () => ({ sceneRef, imageElement }),
    [imageElement],
  );

  return (
    <GlassSceneContext.Provider value={contextValue}>
      <div
        {...rest}
        ref={sceneRef}
        className={["luma-scene", className].filter(Boolean).join(" ")}
        style={{
          backgroundColor,
          backgroundImage: 'url("' + image.replace(/"/g, "\\\"") + '")',
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          ...style,
        }}
      >
        {children}
      </div>
    </GlassSceneContext.Provider>
  );
}
