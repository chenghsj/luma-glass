# Luma Glass

A small React + TypeScript library for fixed-shape optical glass. Adjust the milky surface, real image refraction, and asymmetric edge thickness without blurring the outside of the element.

**Status:** first working prototype. `GlassScene` image backgrounds can be refracted with WebGL or CPU Canvas 2D. CSS handles the fixed silhouette and optical edge. Arbitrary DOM behind the glass is not sampled. The package is not published to npm yet.

## GitHub Pages demo (without custom Actions)

The build-free, static Pages demo lives in [docs/](./docs/) and has the three live controls. Once Pages is enabled, its expected URL is **https://chenghsj.github.io/luma-glass/**.

**Publish it in the GitHub UI:**

1. Open **Settings → Pages** for this repository.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Select **main** and **/docs**, then click **Save**.

The docs folder contains prebuilt HTML, CSS, JavaScript, the background image and an empty \`.nojekyll\` file. It can be hosted directly without Vite, npm install or a custom build workflow. Automatic CI is turned off; the CI workflow is available with manual dispatch when your minutes are available again. The former custom Pages workflow was removed.

GitHub may still report its internal Pages deployment workflow when publishing from a branch. \`.nojekyll\` bypasses its Jekyll build, but account-level billing limits or Pages eligibility can still prevent publishing. This repository was private at the time of this change. GitHub Free requires a public repository for Pages; GitHub Pro or supported organizational plans can publish Pages from private repositories. A published site may be publicly viewable even if its source repo is private.

The static demo defaults to Canvas 2D without WebGL and has an original/refracted comparison plus a selectable renderer. Its high-contrast contour lines near the right side of the glass make the displacement easier to inspect. Refraction zero hides the shader canvas, showing the original image. If you change the library's UI or shader, update \`docs/\` as well. The optional \`npm run build:demo\` still creates a separate Vite build in \`dist-demo/\` for local verification, but publishing \`docs/\` does not require it.

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
        renderMode="canvas" // Never initializes WebGL
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
