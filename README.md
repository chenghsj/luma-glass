# Luma Glass

**[Live Demo](https://chenghsj.github.io/luma-glass/)** · [Usage](#usage) · [Browser support](#browser-support) · [Tailwind & CVA](#tailwind--cva)

A React + TypeScript liquid-glass component that refracts the live DOM behind it: text, images, buttons, and other React components. No special image container is required.

> Prototype: the package is not published to npm yet.

## Get started

Run the playground locally:

```bash
git clone https://github.com/chenghsj/luma-glass.git
cd luma-glass
npm install
npm run dev
```

To use the package in another React project before its npm release, run `npm run build && npm pack` in this repo, then install the generated `.tgz` file in your project.

## Usage

Import the stylesheet and position `LiquidGlass` over ordinary React content:

```tsx
import { LiquidGlass } from "@chenghsj/luma-glass";
import "@chenghsj/luma-glass/style.css";

export function Example() {
  return (
    <div style={{ position: "relative", minHeight: 440 }}>
      <div style={{ padding: 48 }}>
        <h2>Real React content behind the glass</h2>
        <button type="button">An ordinary DOM button</button>
      </div>

      <LiquidGlass
        tone="dark"
        style={{ position: "absolute", top: 40, left: 40, width: 320, padding: 24 }}
      >
        <h2>Liquid Glass</h2>
        <p>The backdrop bends near the optical edge.</p>
      </LiquidGlass>
    </div>
  );
}
```

No `GlassScene`, background-image prop, DOM clone, or screenshot is needed.

## Appearance

| Prop | Default | Description |
| --- | --- | --- |
| `opacity` | `0.1` | Surface opacity (0–1) |
| `borderOpacity` | `0.15` | Optical edge opacity (0–1) |
| `refraction` | `23` | Edge displacement (0–60 CSS px) |
| `thickness` | `0.5` | Optical edge thickness (0.5–6 CSS px) |
| `radius` | `28` | Optical corner radius (CSS px) |
| `tone` | `"light"` | `"light"` or `"dark"` |
| `className` / `style` | — | Layout and custom appearance |
| `onSupportChange` | — | Reports whether DOM backdrop refraction is expected to work |

Set shared appearance defaults with `GlassProvider`. Explicit component props override provider defaults:

```tsx
import { GlassProvider, LiquidGlass } from "@chenghsj/luma-glass";

<GlassProvider defaults={{ tone: "dark", opacity: 0.1, radius: 32 }}>
  <LiquidGlass>Shared appearance</LiquidGlass>
  <LiquidGlass refraction={40}>Custom refraction</LiquidGlass>
</GlassProvider>
```

## Browser support

As of September 2026, Luma Glass generates a displacement texture with Canvas and uses SVG `feDisplacementMap` through CSS `backdrop-filter` to refract the browser's composited backdrop. Canvas does **not** sample or screenshot the DOM.

| Browser engine | DOM refraction | Glass surface and border |
| --- | --- | --- |
| Chromium (Chrome, Edge, Brave) | Supported when SVG backdrop filters are enabled | Supported |
| WebKit (Safari and iOS browsers) | Not currently supported | Supported |
| Gecko (Firefox) | Not currently supported | Supported |

The demo shows **supported / not supported**. Detection uses the browser engine and `CSS.supports`; it is a conservative capability estimate, not a pixel-level rendering test. Some browsers accept `backdrop-filter: url(#filter)` but do not render the SVG graph. There is no legacy image, WebGL, or screenshot-based refraction fallback. On unsupported browsers the glass surface remains visible without displacement.

References: [WebKit SVG backdrop-filter issue](https://bugs.webkit.org/show_bug.cgi?id=245510) · [Mozilla feature request](https://connect.mozilla.org/t5/ideas/support-svg-filters-in-backdrop-filter-for-advanced-glass/idi-p/98458)

## Tailwind & CVA

Luma Glass does not bundle Tailwind, CVA, or predefined variants. Consumers own their variants and pass their classes through `className`. The library's stylesheet uses `@layer components` so Tailwind v4 utilities can override it.

For example, in an app with `class-variance-authority`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { LiquidGlass, type LiquidGlassProps } from "@chenghsj/luma-glass";

const styles = cva("w-80 p-6", {
  variants: {
    variant: {
      subtle: "[--luma-opacity:0.06] [--luma-refraction:12]",
      strong: "[--luma-opacity:0.16] [--luma-refraction:38]",
    },
  },
  defaultVariants: { variant: "subtle" },
});

type Props = LiquidGlassProps & VariantProps<typeof styles>;

function GlassCard({ variant, className, ...props }: Props) {
  return <LiquidGlass {...props} className={[styles({ variant }), className].filter(Boolean).join(" ")} />;
}
```

Optical variables: `--luma-opacity`, `--luma-border-opacity`, `--luma-refraction`, `--luma-thickness`, and `--luma-radius`. Explicit props take precedence over class-defined values. Use `radius` or `--luma-radius` to synchronize CSS corners and optical displacement; a `rounded-*` class alone is not sufficient.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

To update GitHub Pages, run `npm run build:pages` and commit the generated `docs/` directory.

## License

MIT.
