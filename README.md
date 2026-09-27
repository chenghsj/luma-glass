# Luma Glass

A small React + TypeScript library for fixed-shape optical glass. Adjust the milky surface, real image refraction, and asymmetric edge thickness without blurring the outside of the element.

**Status:** first working prototype. `GlassScene` image backgrounds can be refracted with WebGL or CPU Canvas 2D. CSS handles the fixed silhouette and optical edge. Arbitrary DOM behind the glass is not sampled. The package is not published to npm yet.

## GitHub Pages React demo (without custom Actions)

The public demo at **https://chenghsj.github.io/luma-glass/** uses the actual
`src/demo/App.tsx`, `GlassProvider`, `GlassScene` and `LiquidGlass`.
The checked-in `docs/app.js` is precompiled from those same TypeScript/TSX
sources. React 18.3.1 and ReactDOM are served locally from `docs/vendor/`;
visitors no longer download Babel, fetch individual TSX files or rely on a CDN.
The old duplicate `docs/demo.js` renderer has been removed.

To publish future changes, run `npm install` followed by
`npm run build:pages` **on your own computer**, then commit the generated
`docs/`. Vite bundles the production React demo, its runtime and CSS for
GitHub Pages, with the `/luma-glass/` base path. This is the recommended
deployment and does not consume custom GitHub Actions minutes.

If you need to regenerate the current checked-in standalone preview instead,
run `npm run build:pages:standalone` (also available as `npm run sync:pages`).
It uses your installed TypeScript compiler to precompile the same React
components and copies the sample SVG and CSS; the local React UMD bundles are
copied from `node_modules` when available. **No browser-side compilation**
occurs with either build command. React and ReactDOM are MIT-licensed; see
`docs/vendor/REACT_LICENSE.txt`.

Under **Settings → Pages**, keep Source set to **Deploy from a branch**, using
`main` / `/docs`. GitHub may run its own Pages publishing workflow; no
custom build workflow is enabled here. Always rebuild and commit `docs/`
after modifying library or demo source.

## Run the playground

```bash
npm install
npm run dev
```

Open the local Vite URL printed in your terminal. The playground includes live sliders for surface opacity, border opacity, refraction, and edge thickness, plus a dark/light glass preview. To check the package:

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
        opacity: 0.1,
        borderOpacity: 0.42,
        tone: "light",
        refraction: 23,
        thickness: 0.5,
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
        opacity={0.1}
        borderOpacity={0.42}
        tone="light"
        refraction={23}
        thickness={0.5}
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
| `opacity` | number | `0.1` | 0–1, glass surface |
| `borderOpacity` | number | `0.42` | 0–1, optical rim and highlights (independent of surface) |
| `tone` | `"light" \| "dark"` | `"light"` | Controls surface tint; does not change the glass silhouette |
| `refraction` | number | `23` | 0–60 CSS-pixel displacement |
| `thickness` | number | `0.5` | 0.5–6 CSS pixels |
| `radius` | number | `28` | CSS pixels |
| `renderMode` | `"auto" \| "canvas" \| "webgl"` | `"auto"` | Canvas disables WebGL; other modes fall back to Canvas 2D if unavailable |
| `onRendererChange` | `(mode: "none" \| "canvas" \| "webgl") => void` | — | Reports active engine |

Refraction is concentrated in a narrow band at the optical edge. Canvas 2D and WebGL use matching rounded-rectangle edge normals; the center is not displaced. The border opacity controls the shell, contact line, and highlight together. The demo previews dark glass, while the library defaults to light for existing users.

The thickness value controls an asymmetric inner shell (top/left narrower, bottom/right slightly thicker), not an equally thick CSS border. The outside silhouette remains fixed. A WebGL context is requested only when selected. Canvas mode uses CPU image sampling and does not initialize WebGL.

### Known limits

- Image refraction only in this first version; dynamic video, arbitrary HTML and multiple parallax layers are not captured into the shader.
- CSS `background-size: cover` and centered position are used to match the image inside the shader. Custom background positions or CSS transforms need additional mapping support.
- WebGL creates a context per refracting glass. Canvas avoids WebGL but still has CPU costs for large or animated surfaces.
- If both WebGL and Canvas image sampling fail, the CSS surface and optical edge remain without refraction. Browser GPU and CORS restrictions still apply.

## License

MIT.
