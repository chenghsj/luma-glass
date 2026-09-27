# Luma Glass

**[Live Demo](https://chenghsj.github.io/luma-glass/)** · [Usage](#usage) · [Tailwind & CVA](#tailwind--cva)

A React + TypeScript liquid-glass component with adjustable surface, optical edges, and image refraction. Works with CSS, Tailwind, and consumer-defined variants.

> Prototype: the package is not published to npm yet.

## Get started

Run the playground locally:

```bash
git clone https://github.com/chenghsj/luma-glass.git
cd luma-glass
npm install
npm run dev
```

To use the package in another React project before its npm release, build and pack it locally:

```bash
# In the luma-glass repository
npm run build
npm pack

# In your React project
npm install /path/to/chenghsj-luma-glass-0.1.0.tgz
```

## Usage

Import the stylesheet and render a `LiquidGlass` inside a `GlassScene` to refract its image:

```tsx
import { GlassScene, LiquidGlass } from "@chenghsj/luma-glass";
import "@chenghsj/luma-glass/style.css";

export function Example() {
  return (
    <GlassScene image="/background.jpg" style={{ minHeight: 440 }}>
      <LiquidGlass
        className="my-glass"
        tone="dark"
        style={{ width: 320, padding: 24 }}
      >
        <h2>Liquid Glass</h2>
        <p>Drag, position, or style this card in your app.</p>
      </LiquidGlass>
    </GlassScene>
  );
}
```

Without `GlassScene`, `LiquidGlass` still renders its CSS surface and border, but cannot refract the background.

## Appearance

| Prop | Default | Description |
| --- | --- | --- |
| `opacity` | `0.1` | Surface opacity (0–1) |
| `borderOpacity` | `0.15` | Optical edge opacity (0–1) |
| `refraction` | `23` | Image displacement (0–60 CSS px) |
| `thickness` | `0.5` | Optical edge thickness (0.5–6 CSS px) |
| `radius` | `28` | Glass corner radius (CSS px) |
| `tone` | `"light"` | `"light"` or `"dark"` |
| `renderMode` | `"auto"` | `"auto"`, `"canvas"`, or `"webgl"` |
| `className` / `style` | — | Layout and custom appearance |
| `onRendererChange` | — | Reports `"none"`, `"canvas"`, or `"webgl"` |

Set shared defaults with `GlassProvider`. Explicit component props override provider defaults:

```tsx
import { GlassProvider, LiquidGlass } from "@chenghsj/luma-glass";

<GlassProvider defaults={{ tone: "dark", opacity: 0.1, borderOpacity: 0.15 }}>
  <LiquidGlass>Shared appearance</LiquidGlass>
  <LiquidGlass refraction={40}>Custom refraction</LiquidGlass>
</GlassProvider>
```

## Tailwind & CVA

Luma Glass does **not** bundle Tailwind, CVA, or built-in variants. Define your own variants in your app and pass their classes through `className`.

For example, install `class-variance-authority` in a Tailwind project and create a wrapper:

```bash
npm install class-variance-authority
```

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { LiquidGlass, type LiquidGlassProps } from "@chenghsj/luma-glass";

const glassVariants = cva("w-80 p-6", {
  variants: {
    variant: {
      subtle: "[--luma-opacity:0.06] [--luma-border-opacity:0.08] [--luma-refraction:12]",
      strong: "[--luma-opacity:0.16] [--luma-border-opacity:0.25] [--luma-refraction:38]",
    },
  },
  defaultVariants: { variant: "subtle" },
});

type GlassCardProps = LiquidGlassProps & VariantProps<typeof glassVariants>;

function GlassCard({ variant, className, ...props }: GlassCardProps) {
  return (
    <LiquidGlass
      {...props}
      className={[glassVariants({ variant }), className].filter(Boolean).join(" ")}
    />
  );
}

// Variant names and values belong to your app:
<GlassCard variant="strong" opacity={0.1}>Custom glass</GlassCard>
```

The library's CSS uses `@layer components` so Tailwind v4 utilities can override it. The optical CSS variables are `--luma-opacity`, `--luma-border-opacity`, `--luma-refraction`, `--luma-thickness`, and `--luma-radius`. Explicit component props take priority over the corresponding class-defined variables; an explicit `style` value follows normal inline-style precedence.

Use `radius` or `--luma-radius` when changing corners so the refraction matches the glass shape; a `rounded-*` class alone does not update the optical radius.

## Notes

- Image refraction samples the `GlassScene` image, **not arbitrary DOM** behind the glass. Use a same-origin or CORS-enabled image.
- `auto` prefers WebGL and falls back to Canvas 2D. `canvas` does not create a WebGL context. If image sampling fails, the CSS surface and edge still render.
- Large or numerous refracting surfaces can increase rendering cost.

## Development

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

To update the GitHub Pages demo, run `npm run build:pages` and commit the generated `docs/` directory.

## License

MIT.
