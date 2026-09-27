import { useState } from "react";
import { GlassProvider, GlassScene, LiquidGlass } from "../index";
import type { ActiveRenderer, RefractionMode } from "../index";

export function App() {
  const [opacity, setOpacity] = useState(0.4);
  const [refraction, setRefraction] = useState(23);
  const [showOriginal, setShowOriginal] = useState(false);
  const [thickness, setThickness] = useState(1.8);
  const [renderMode, setRenderMode] = useState<RefractionMode>("canvas");
  const [activeRenderer, setActiveRenderer] = useState<ActiveRenderer>("none");

  return (
    <div className="page">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Luma Glass home">
          <span className="brand-symbol">✳</span>
          <span>LUMA GLASS</span>
        </a>
        <a
          className="github-link"
          href="https://github.com/chenghsj/luma-glass"
          target="_blank"
          rel="noreferrer"
        >
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main className="main">
        <div className="heading">
          <span className="eyebrow">OPEN SOURCE · REACT + TYPESCRIPT</span>
          <h1>Light becomes an interface.</h1>
          <p>
            A crisp, fixed glass silhouette with adjustable refraction,
            translucency, and optical edge thickness.
          </p>
        </div>

        <GlassProvider defaults={{
          opacity,
          refraction: showOriginal ? 0 : refraction,
          thickness,
          radius: 40,
          renderMode,
        }}>
          <GlassScene image={`${import.meta.env.BASE_URL}scene.svg`} className="demo-stage">
            <LiquidGlass
              className="demo-glass"
              onRendererChange={setActiveRenderer}
            >
            <div className="glass-inner">
              <div className="glass-eyebrow"><span className="glass-star">✳</span> OPTICAL MATERIAL</div>
              <div className="glass-title">Liquid<br /><span>Glass.</span></div>
              <div className="glass-description">Light, depth and refraction.</div>
              <div className="glass-pill">LIVE REFRACTION <span aria-hidden="true">↗</span></div>
            </div>
            </LiquidGlass>
            <LiquidGlass className="demo-shared-chip">
              <span>SHARED DEFAULTS</span>
            </LiquidGlass>
            <div className="scene-label">FIXED SHAPE <span>·</span> NO OUTER BLUR</div>
          </GlassScene>
        </GlassProvider>

        <section className="controls" aria-label="Glass appearance controls">
          <div className="control">
            <div className="control-head">
              <label htmlFor="opacity">Glass opacity</label>
              <output htmlFor="opacity">{Math.round(opacity * 100)}%</output>
            </div>
            <input
              id="opacity" type="range" min="0" max="0.75" step="0.01"
              value={opacity} onChange={(event) => setOpacity(Number(event.target.value))}
            />
            <div className="control-scale"><span>Clear</span><span>Milky</span></div>
          </div>
          <div className="control">
            <div className="control-head">
              <label htmlFor="refraction">Refraction</label>
              <output htmlFor="refraction">{refraction} / 60</output>
            </div>
            <input
              id="refraction" type="range" min="0" max="60" step="1"
              value={refraction} onChange={(event) => {
                setRefraction(Number(event.target.value));
                setShowOriginal(false);
              }}
            />
            <div className="control-scale"><span>None</span><span>Strong</span></div>
            <p className="control-hint">Watch the thin contour lines at the right of the glass.</p>
          </div>
          <div className="control">
            <div className="control-head">
              <label htmlFor="thickness">Optical edge thickness</label>
              <output htmlFor="thickness">{thickness.toFixed(1)} px</output>
            </div>
            <input
              id="thickness" type="range" min="0.5" max="6" step="0.1"
              value={thickness} onChange={(event) => setThickness(Number(event.target.value))}
            />
            <div className="control-scale"><span>Thin</span><span>Thick</span></div>
          </div>
          <div className="controls-bottom">
            <span className="status"><i /> {showOriginal ? "Original background · refraction paused" : activeRenderer === "canvas" ? "Canvas 2D active · no WebGL" : activeRenderer === "webgl" ? "WebGL active" : "Image refraction unavailable"}</span>
            <div className="control-actions">
              <label className="render-picker" htmlFor="render-mode">
                Renderer
                <select id="render-mode" value={renderMode} onChange={(event) => setRenderMode(event.target.value as RefractionMode)}>
                  <option value="canvas">Canvas 2D · no WebGL</option>
                  <option value="auto">Auto · WebGL → Canvas</option>
                  <option value="webgl">WebGL · Canvas fallback</option>
                </select>
              </label>
              <button type="button" aria-pressed={showOriginal} onClick={() => setShowOriginal((value) => !value)}>
                {showOriginal ? "Show refraction" : "Show original"}
              </button>
              <button type="button" onClick={() => {
                setOpacity(0.4);
                setRefraction(23);
                setThickness(1.8);
                setShowOriginal(false);
              }}>↺ &nbsp; Reset</button>
            </div>
          </div>
        </section>
        <p className="footnote">
          The sample background is an SVG image. Refraction applies to this image,
          not arbitrary DOM elements. Use a same-origin or CORS-enabled image in your own scene.
        </p>
      </main>
    </div>
  );
}
