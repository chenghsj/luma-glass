# Luma Glass

A small React + TypeScript library for fixed-shape optical glass. Adjust the milky surface, real image refraction, and asymmetric edge thickness without blurring the outside of the element.

**Status:** first working prototype. `GlassScene` image backgrounds can be refracted with WebGL or CPU Canvas 2D. CSS handles the fixed silhouette and optical edge. Arbitrary DOM behind the glass is not sampled. The package is not published to npm yet.

## GitHub Pages React demo (without custom Actions)

The public demo at **https://chenghsj.github.io/luma-glass/** now uses the
**real** `src/demo/App.tsx`, `GlassProvider`, `GlassScene` and
`LiquidGlass`. The old, manually duplicated `docs/demo.js` renderer was
removed. Both Canvas 2D and WebGL use the same library source as local Vite.

There are two ways to prepare `docs/` on your own computer; neither runs a
custom GitHub Actions workflow:

- **Recommended for production:** run `npm install`, then
  `npm run build:pages`. Vite bundles the actual React demo, React runtime and
  library into `docs/`, with `/luma-glass/` asset paths and `.nojekyll`.
  Commit the generated `docs/` directory. This is the fastest runtime and
  does not require an external compiler/CDN in visitors' browsers.
- **Dependency-free source preview:** run `npm run sync:pages` to copy the
  actual source files, CSS and background into `docs/source/` and `docs/`.
  The checked-in `docs/index.html` compiles the exact mirrored React source
  in the visitor's browser using a pinned Babel CDN script and React 18 ESM
  modules. This preview is functional without npm or GitHub Actions but has
  CDN requirements and a slower first visit. Use the Vite production build
  above when you have your project's npm dependencies available.

Under **Settings → Pages**, leave Source as **Deploy from a branch** and use
`main` / `/docs`. GitHub may run its own Pages publishing workflow; no
custom build workflow is enabled here.

Because `docs/` is committed output, changes to `src/` must be followed
by one of the commands above before publishing. This prevents the public
preview and the actual React component implementations from diverging.

## Run the playground

```bash
npm install
npm run dev
```

Open the local Vite URL printed in your terminal. The playground includes live sliders for opacity, refraction and edge thickness. To check the package:

```bash
npm run typecheck
npm test
npm run build
```

## Global defaults with GlassProvider

Wrap a subtree once to give all of its `LiquidGlass` components the same
appearance and renderer. Every field is optional, and explicit component props
take priority over the provider. Without a provider, the existing built-in
defaults still apply.

```tsx
import { GlassProvider, GlassScene, LiquidGlass } from "@chenghsj/luma-glass";
import "@chenghsj/luma-glass/style.css";

export function Example() {
  return (
    <GlassProvider
      defaults={{
        opacity: 0.4,
        refraction: 23,
        thickness: 1.8,
        radius: 28,
        renderMode: "canvas",
      }}
    >
      <GlassScene image="/background.jpg" style={{ minHeight: 480 }}>
        <LiquidGlass>Inherits every global default</LiquidGlass>
        <LiquidGlass refraction={40}>
          Inherits the other defaults; overrides only refraction
        </LiquidGlass>
      </GlassScene>
    </GlassProvider>
  );
}
```

You can nest providers for individual sections. A nested provider overrides only
the fields it defines; other fields inherit from the parent. Changes to provider
defaults propagate to its descendants, including the selected renderer.
`onRendererChange` stays per component because each glass has its own renderer.
For image refraction, glasses still need to live inside a `GlassScene` with a
same-origin or CORS-enabled image.

## Use in React

After publishing the package (or installing it from your local checkout):

```tsx
import { GlassScene, LiquidGlass } from "@chenghsj/luma-glass";
import "@chenghsj/luma-glass/style.css";

export function Hero() {
  return (
    <GlassScene
      image="/hero-background.jpg"
      style={{ position: "relative", minHeight: 460 }}
    >
      <LiquidGlass
        opacity={0.4}
        refraction={23}
        thickness={1.8}
        radius={32}
        renderMode="canvas"
        style={{ position: "absolute", inset: "15% auto auto 10%", padding: 28 }}
      >
        <h1>Liquid Glass</h1>
        <p>The background is optically refracted; this text stays sharp.</p>
      </LiquidGlass>
    </GlassScene>
  );
}
```

`LiquidGlass` also works **without** `GlassScene`, with only the CSS surface and edge. In that case, `refraction` has no effect: arbitrary DOM behind the element cannot be sampled. The image must be same-origin or CORS-enabled for both WebGL texture upload and Canvas pixel readback. When WebGL is unavailable, Canvas 2D provides real image refraction instead of a cosmetic CSS-only fallback.

| Prop | Type | Default | Range |
| --- | --- | --- | --- |
| `opacity` | number | `0.4` | 0–1 |
| `refraction` | number | `23` | 0–60 CSS-pixel displacement |
| `thickness` | number | `1.8` | 0.5–6 CSS pixels |
| `radius` | number | `28` | CSS pixels |
| `renderMode` | `"auto" \| "canvas" \| "webgl"` | `"auto"` | Canvas disables WebGL; other modes fall back to Canvas 2D if unavailable |
| `onRendererChange` | `(mode: "none" \| "canvas" \| "webgl") => void` | — | Reports active engine |

The thickness value controls an asymmetric inner shell (top/left narrower, bottom/right slightly thicker), not an equally thick CSS border. The outside silhouette remains fixed. A WebGL context is requested only when selected. Canvas mode uses CPU image sampling and does not initialize WebGL.

### Known limits

- Image refraction only in this first version; dynamic video, arbitrary HTML and multiple parallax layers are not captured into the shader.
- CSS `background-size: cover` and centered position are used to match the image inside the shader. Custom background positions or CSS transforms need additional mapping support.
- WebGL creates a context per refracting glass. Canvas avoids WebGL but still has CPU costs for large or animated surfaces.
- If both WebGL and Canvas image sampling fail, the CSS surface and optical edge remain without refraction. Browser GPU and CORS restrictions still apply.

## License

MIT.
