import { describe, expect, it } from "vitest";
import type { CSSProperties } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GlassProvider, useGlassDefaults } from "./GlassProvider";
import { LiquidGlass } from "./LiquidGlass";

function ModeProbe() {
  return <span>{useGlassDefaults().renderMode}</span>;
}

describe("GlassProvider", () => {
  it("preserves the built-in defaults outside a provider", () => {
    const markup = renderToStaticMarkup(<LiquidGlass>Standalone</LiquidGlass>);
    expect(markup).toContain("--luma-opacity-base:0.1");
    expect(markup).toContain("--luma-border-opacity-base:0.15");
    expect(markup).toContain('data-tone="light"');
    expect(markup).toContain("--luma-thickness-base:0.5px");
    expect(markup).toContain("--luma-radius-base:28px");
  });

  it("applies shared settings to every glass and allows a local override", () => {
    const markup = renderToStaticMarkup(
      <GlassProvider defaults={{ opacity: 0.64, borderOpacity: 0.3, tone: "dark", thickness: 2.4, radius: 36 }}>
        <LiquidGlass>First</LiquidGlass>
        <LiquidGlass thickness={1} borderOpacity={0.8}>Second</LiquidGlass>
      </GlassProvider>,
    );
    expect(markup.match(/--luma-opacity-base:0\.64/g)).toHaveLength(2);
    expect(markup).toContain("--luma-border-opacity-base:0.3");
    expect(markup).toContain("--luma-border-opacity:0.8");
    expect(markup.match(/data-tone="dark"/g)).toHaveLength(2);
    expect(markup).toContain("--luma-thickness-base:2.4px");
    expect(markup).toContain("--luma-thickness-base:1px");
    expect(markup.match(/--luma-radius-base:36px/g)).toHaveLength(2);
  });

  it("merges nested defaults without losing inherited renderer settings", () => {
    const markup = renderToStaticMarkup(
      <GlassProvider defaults={{ opacity: 0.5, borderOpacity: 0.2, renderMode: "canvas" }}>
        <GlassProvider defaults={{ thickness: 3 }}>
          <LiquidGlass>Nested</LiquidGlass>
          <ModeProbe />
        </GlassProvider>
      </GlassProvider>,
    );
    expect(markup).toContain("--luma-opacity-base:0.5");
    expect(markup).toContain("--luma-border-opacity-base:0.2");
    expect(markup).toContain("--luma-thickness-base:3px");
    expect(markup).toContain("<span>canvas</span>");
  });

  it("uses the nearest provider and explicit component values", () => {
    const markup = renderToStaticMarkup(
      <GlassProvider defaults={{ opacity: 0.25 }}>
        <LiquidGlass opacity={0.9}>Local</LiquidGlass>
        <GlassProvider defaults={{ opacity: 0.7 }}>
          <LiquidGlass>Nested</LiquidGlass>
        </GlassProvider>
      </GlassProvider>,
    );
    expect(markup).toContain("--luma-opacity:0.9");
    expect(markup).toContain("--luma-opacity-base:0.9");
    expect(markup).toContain("--luma-opacity-base:0.7");
  });

  it("keeps provider values class-overridable, but explicit props inline", () => {
    const markup = renderToStaticMarkup(
      <GlassProvider defaults={{ opacity: 0.34, borderOpacity: 0.3 }}>
        <LiquidGlass className="custom-glass">Class</LiquidGlass>
        <LiquidGlass opacity={0.21} thickness={3} className="custom-glass">Props</LiquidGlass>
      </GlassProvider>,
    );
    expect(markup).toContain("--luma-opacity-base:0.34");
    expect(markup).toContain("--luma-opacity:0.21");
    expect(markup).toContain("--luma-thickness:3px");
  });

  it("supports consumer-defined class variants and CSS refraction overrides", () => {
    const consumerVariants = {
      subtle: "consumer-glass-subtle",
      hero: "consumer-glass-hero",
    } as const;
    const markup = renderToStaticMarkup(
      <GlassProvider defaults={{ opacity: 0.34, refraction: 23 }}>
        <LiquidGlass className={consumerVariants.subtle}>Subtle</LiquidGlass>
        <LiquidGlass
          className={consumerVariants.hero}
          style={{ "--luma-refraction": 38, "--luma-opacity": 0.16 } as CSSProperties}
        >
          Hero
        </LiquidGlass>
        <LiquidGlass refraction={7} className={consumerVariants.hero}>
          Explicit refraction
        </LiquidGlass>
      </GlassProvider>,
    );
    expect(markup).toContain('class="luma-glass consumer-glass-subtle"');
    expect(markup).toContain('class="luma-glass consumer-glass-hero"');
    expect(markup).toContain("--luma-refraction-base:23");
    expect(markup).toContain("--luma-refraction:38");
    expect(markup).toContain("--luma-refraction:7");
    expect(markup).toContain("--luma-opacity:0.16");
    expect(markup).not.toContain("data-variant=");
  });
});
