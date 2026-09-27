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
    expect(markup).toContain("--luma-opacity:0.1");
    expect(markup).toContain("--luma-border-opacity:0.15");
    expect(markup).toContain('data-tone="light"');
    expect(markup).toContain("--luma-thickness:0.5px");
    expect(markup).toContain("--luma-radius:28px");
  });

  it("applies shared settings to every glass and allows a local override", () => {
    const markup = renderToStaticMarkup(
      <GlassProvider defaults={{ opacity: 0.64, borderOpacity: 0.3, tone: "dark", thickness: 2.4, radius: 36 }}>
        <LiquidGlass>First</LiquidGlass>
        <LiquidGlass thickness={1} borderOpacity={0.8}>Second</LiquidGlass>
      </GlassProvider>,
    );
    expect(markup.match(/--luma-opacity:0\.64/g)).toHaveLength(2);
    expect(markup).toContain("--luma-border-opacity:0.3");
    expect(markup).toContain("--luma-border-opacity:0.8");
    expect(markup.match(/data-tone="dark"/g)).toHaveLength(2);
    expect(markup).toContain("--luma-thickness:2.4px");
    expect(markup).toContain("--luma-thickness:1px");
    expect(markup.match(/--luma-radius:36px/g)).toHaveLength(2);
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
    expect(markup).toContain("--luma-opacity:0.5");
    expect(markup).toContain("--luma-border-opacity:0.2");
    expect(markup).toContain("--luma-thickness:3px");
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
    expect(markup).toContain("--luma-opacity:0.7");
  });
});
