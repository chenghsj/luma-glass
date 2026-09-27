import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { LiquidGlassProps } from "./LiquidGlass";

/** Presets affect only optical appearance; shape, tint and renderer stay independent. */
export const glassVariantPresets = {
  default: { opacity: 0.1, borderOpacity: 0.15, refraction: 23 },
  subtle: { opacity: 0.06, borderOpacity: 0.08, refraction: 12 },
  pronounced: { opacity: 0.16, borderOpacity: 0.25, refraction: 38 },
} as const;

export type GlassVariant = keyof typeof glassVariantPresets;

/** Appearance defaults inherited by all LiquidGlass components in this subtree. */
export type GlassDefaults = Pick<
  LiquidGlassProps,
  "variant" | "opacity" | "borderOpacity" | "tone" | "refraction" | "thickness" | "radius" | "renderMode"
>;

export interface GlassProviderProps {
  /** Any omitted setting inherits from the nearest parent provider. */
  defaults?: GlassDefaults;
  children: ReactNode;
}

const builtInDefaults: Required<GlassDefaults> = {
  variant: "default",
  ...glassVariantPresets.default,
  tone: "light",
  thickness: 0.5,
  radius: 28,
  renderMode: "auto",
};

const GlassDefaultsContext = createContext<Required<GlassDefaults>>(builtInDefaults);

/** Merge defaults by field, so nested providers preserve unspecified values. */
export function GlassProvider({ defaults = {}, children }: GlassProviderProps) {
  const parent = useContext(GlassDefaultsContext);
  const { variant, opacity, borderOpacity, tone, refraction, thickness, radius, renderMode } = defaults;
  const value = useMemo<Required<GlassDefaults>>(
    () => {
      // A nested variant replaces only the optical preset values.
      const preset = variant === undefined ? parent : glassVariantPresets[variant];
      return {
        variant: variant ?? parent.variant,
        opacity: opacity ?? preset.opacity,
        borderOpacity: borderOpacity ?? preset.borderOpacity,
        tone: tone ?? parent.tone,
        refraction: refraction ?? preset.refraction,
      thickness: thickness ?? parent.thickness,
      radius: radius ?? parent.radius,
        renderMode: renderMode ?? parent.renderMode,
      };
    },
    [parent, variant, opacity, borderOpacity, tone, refraction, thickness, radius, renderMode],
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
