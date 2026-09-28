# Luma Glass

**[Live Demo](https://chenghsj.github.io/luma-glass/)** · [Usage](#usage) · [Browser support](#browser-support)

A React + TypeScript glass component that refracts the live DOM behind it—including text, images, and other React components. No background image or scene wrapper is required.

> Prototype: not yet published to npm.

## Quick start

Run the project locally:

```bash
git clone https://github.com/chenghsj/luma-glass.git
cd luma-glass
npm install
npm run dev
```

To use Luma Glass in another project before its npm release, run `npm run build && npm pack` in this repository, then install the generated `.tgz` file in your React project.

## Usage

```tsx
import { LiquidGlass } from "@chenghsj/luma-glass";
import "@chenghsj/luma-glass/style.css";

export function Example() {
  return (
    <div style={{ position: "relative", minHeight: 320 }}>
      <div>
        <h2>Content behind the glass</h2>
        <button>Ordinary React content</button>
      </div>

      <LiquidGlass
        tone="dark"
        style={{ position: "absolute", top: 32, left: 32, width: 280, padding: 24 }}
      >
        <h2>Liquid Glass</h2>
      </LiquidGlass>
    </div>
  );
}
```

Use `GlassProvider` to share appearance defaults; explicit `LiquidGlass` props override them:

```tsx
import { GlassProvider, LiquidGlass } from "@chenghsj/luma-glass";

<GlassProvider defaults={{ tone: "dark", opacity: 0.1, radius: 32 }}>
  <LiquidGlass>Shared appearance</LiquidGlass>
  <LiquidGlass refraction={40}>Custom refraction</LiquidGlass>
</GlassProvider>
```

## Props

| Prop | Default | Description |
| --- | --- | --- |
| `opacity` | `0.1` | Surface opacity (0–1) |
| `borderOpacity` | `0.15` | Optical edge opacity (0–1) |
| `refraction` | `23` | Edge displacement (0–60 CSS px) |
| `thickness` | `0.5` | Edge thickness (0.5–6 CSS px) |
| `radius` | `28` | Corner radius (CSS px) |
| `tone` | `"light"` | `"light"` or `"dark"` |
| `onSupportChange` | — | Reports estimated DOM-refraction support |

`LiquidGlass` also accepts standard div props such as `className` and `style`.

## Tailwind & custom variants

The library has no built-in variants or Tailwind/CVA dependency. Define your own styles with `className`, CSS variables, or CVA:

```tsx
import { cva } from "class-variance-authority";

const glassClass = cva("w-80 p-6", {
  variants: {
    appearance: {
      subtle: "[--luma-opacity:0.06]",
      strong: "[--luma-opacity:0.16] [--luma-refraction:38]",
    },
  },
});

<LiquidGlass className={glassClass({ appearance: "strong" })}>
  Custom glass
</LiquidGlass>
```

Optical variables: `--luma-opacity`, `--luma-border-opacity`, `--luma-refraction`, `--luma-thickness`, and `--luma-radius`. Use `radius` or `--luma-radius` instead of only `rounded-*` so the visual corners and refraction stay aligned. Explicit component props take priority over class-defined optical values.

## Browser support

| Browser | DOM refraction | Glass appearance |
| --- | --- | --- |
| Chromium-based browsers with SVG backdrop filters | Supported | Supported |
| Safari and iOS browsers | Not supported | Supported |
| Firefox | Not supported | Supported |

The Demo reports estimated support; this is not a pixel-level rendering test. Displacement maps are generated in a shared Web Worker when available, with main-thread generation as a fallback. Unsupported browsers show the glass surface and border without refraction.

## Development

```bash
npm test
npm run typecheck
npm run build
```

For GitHub Pages, run `npm run build:pages` and commit the generated `docs/` directory.

## License

MIT.
