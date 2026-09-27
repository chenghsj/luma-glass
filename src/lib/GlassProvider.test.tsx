import { describe, expect, it } from "vitest";
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
    expect(markup).toContain('data-variant="default"');
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

  it("allows a local variant to override provider opacity without changing shape", () => {
    const markup = renderToStaticMarkup(
      <GlassProvider defaults={{ variant: "subtle", opacity: 0.33, tone: "dark", thickness: 2 }}>
        <LiquidGlass>Provider</LiquidGlass>
        <LiquidGlass variant="pronounced" borderOpacity={0.9} className="custom-card">
          Local
        </LiquidGlass>
      </GlassProvider>,
    );
    expect(markup).toContain('data-variant="subtle"');
    expect(markup).toContain("--luma-opacity-base:0.33");
    expect(markup).toContain("--luma-border-opacity-base:0.08");
    expect(markup).toContain('data-variant="pronounced"');
    expect(markup).toContain('class="luma-glass custom-card"');
    expect(markup).toContain("--luma-opacity-base:0.16");
    expect(markup).toContain("--luma-border-opacity:0.9");
    expect(markup.match(/--luma-thickness-base:2px/g)).toHaveLength(2);
  });

  it("a nested variant changes only optical values, preserving shape and renderer", () => {
    const markup = renderToStaticMarkup(
      <GlassProvider defaults={{ opacity: 0.44, radius: 35, renderMode: "canvas" }}>
        <GlassProvider defaults={{ variant: "subtle", borderOpacity: 0.4 }}>
          <LiquidGlass>Nested</LiquidGlass>
          <ModeProbe />
        </GlassProvider>
      </GlassProvider>,
    );
    expect(markup).toContain("--luma-opacity-base:0.06");
    expect(markup).toContain("--luma-border-opacity-base:0.4");
    expect(markup).toContain("--luma-radius-base:35px");
    expect(markup).toContain("<span>canvas</span>");
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
});
