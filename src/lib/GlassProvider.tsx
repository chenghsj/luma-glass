import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { LiquidGlassProps } from "./LiquidGlass";

/** Appearance defaults inherited by all LiquidGlass components in this subtree. */
export type GlassDefaults = Pick<
  LiquidGlassProps,
  "opacity" | "refraction" | "thickness" | "radius" | "renderMode"
>;

export interface GlassProviderProps {
  /** Any omitted setting inherits from the nearest parent provider. */
  defaults?: GlassDefaults;
  children: ReactNode;
}

const builtInDefaults: Required<GlassDefaults> = {
  opacity: 0.4,
  refraction: 23,
  thickness: 0.5,
  radius: 28,
  renderMode: "auto",
};

const GlassDefaultsContext = createContext<Required<GlassDefaults>>(builtInDefaults);

/** Merge defaults by field, so nested providers preserve unspecified values. */
export function GlassProvider({ defaults = {}, children }: GlassProviderProps) {
  const parent = useContext(GlassDefaultsContext);
  const { opacity, refraction, thickness, radius, renderMode } = defaults;
  const value = useMemo<Required<GlassDefaults>>(
    () => ({
      opacity: opacity ?? parent.opacity,
      refraction: refraction ?? parent.refraction,
      thickness: thickness ?? parent.thickness,
      radius: radius ?? parent.radius,
      renderMode: renderMode ?? parent.renderMode,
    }),
    [parent, opacity, refraction, thickness, radius, renderMode],
  );
  return (
    <GlassDefaultsContext.Provider value={value}>
      {children}
    </GlassDefaultsContext.Provider>
  );
}

/** Internal hook; components use their explicit props before context values. */
export function useGlassDefaults(): Required<GlassDefaults> {
  return useContext(GlassDefaultsContext);
}
