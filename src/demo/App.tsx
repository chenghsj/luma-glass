import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { GlassProvider, GlassScene, LiquidGlass } from "../index";
import type { ActiveRenderer, RefractionMode } from "../index";

function OpticalStar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2.75v18.5M2.75 12h18.5M5.46 5.46l13.08 13.08M18.54 5.46 5.46 18.54" />
    </svg>
  );
}

export function App() {
  const [opacity, setOpacity] = useState(0.1);
  const [borderOpacity, setBorderOpacity] = useState(0.15);
  const [tone, setTone] = useState<"light" | "dark">("dark");
  const [refraction, setRefraction] = useState(23);
  const [showOriginal, setShowOriginal] = useState(false);
  const [thickness, setThickness] = useState(0.5);
  const [renderMode, setRenderMode] = useState<RefractionMode>("auto");
  const [activeRenderer, setActiveRenderer] = useState<ActiveRenderer>("none");
  const glassRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    left: number;
    top: number;
  } | null>(null);

  const onGlassPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    if (event.target instanceof Element &&
        event.target.closest("a, button, input, select, textarea, [data-no-drag]")) return;
    const glass = glassRef.current;
    const scene = glass?.parentElement;
    if (!glass || !scene) return;
    const sceneRect = scene.getBoundingClientRect();
    const glassRect = glass.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: glassRect.left - sceneRect.left,
      top: glassRect.top - sceneRect.top,
    };
    event.preventDefault();
    glass.setPointerCapture(event.pointerId);
    glass.classList.add("is-dragging");
  };

  const onGlassPointerMove = (event: PointerEvent) => {
    const drag = dragRef.current;
    const glass = glassRef.current;
    if (!drag || !glass || drag.pointerId !== event.pointerId) return;
    const scene = glass.parentElement;
    if (!scene) return;
    if (event.cancelable) event.preventDefault();
    const sceneRect = scene.getBoundingClientRect();
    const glassRect = glass.getBoundingClientRect();
    // The glass may extend beyond the scene, but always leave a grab area.
    const visibleX = Math.min(72, glassRect.width, sceneRect.width);
    const visibleY = Math.min(72, glassRect.height, sceneRect.height);
    const left = Math.max(visibleX - glassRect.width, Math.min(
      sceneRect.width - visibleX,
      drag.left + event.clientX - drag.startX,
    ));
    const top = Math.max(visibleY - glassRect.height, Math.min(
      sceneRect.height - visibleY,
      drag.top + event.clientY - drag.startY,
    ));
    glass.style.left = `${(left / sceneRect.width) * 100}%`;
    glass.style.top = `${(top / sceneRect.height) * 100}%`;
  };

  const onGlassPointerEnd = (event: PointerEvent | ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const glass = glassRef.current;
    glass?.classList.remove("is-dragging");
    if (glass?.hasPointerCapture(event.pointerId)) {
      glass.releasePointerCapture(event.pointerId);
    }
  };

  // Listen on window rather than relying on the moving card remaining under
  // the pointer. This also keeps vertical touch drags from scrolling the page.
  useEffect(() => {
    window.addEventListener("pointermove", onGlassPointerMove, { passive: false });
    window.addEventListener("pointerup", onGlassPointerEnd);
    window.addEventListener("pointercancel", onGlassPointerEnd);
    return () => {
      window.removeEventListener("pointermove", onGlassPointerMove);
      window.removeEventListener("pointerup", onGlassPointerEnd);
      window.removeEventListener("pointercancel", onGlassPointerEnd);
    };
  }, []);

  return (
    <div className="page">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Luma Glass home">
          <span className="brand-symbol" aria-hidden="true"><OpticalStar /></span>
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
          borderOpacity,
          tone,
          refraction: showOriginal ? 0 : refraction,
          thickness,
          radius: 40,
          renderMode,
        }}>
          <GlassScene image={`${import.meta.env.BASE_URL}scene.svg`} className="demo-stage">
            <LiquidGlass
              className="demo-glass"
              ref={glassRef}
              title="Drag to move the glass card"
              onPointerDown={onGlassPointerDown}
              onPointerUp={onGlassPointerEnd}
              onPointerCancel={onGlassPointerEnd}
              onLostPointerCapture={onGlassPointerEnd}
              onRendererChange={setActiveRenderer}
            >
            <div className="glass-inner">
              <div className="glass-eyebrow"><span className="glass-star" aria-hidden="true"><OpticalStar /></span> OPTICAL MATERIAL</div>
              <div className="glass-title">Liquid<br /><span>Glass.</span></div>
              <div className="glass-description">Light, depth and refraction.</div>
            </div>
            </LiquidGlass>
          </GlassScene>
        </GlassProvider>
        <p className="demo-drag-hint">Drag the glass to explore refraction.</p>

        <section className="controls" aria-label="Glass appearance controls">
          <div className="control">
            <div className="control-head">
              <label htmlFor="opacity">Surface opacity</label>
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
            <p className="control-hint">Compare the Lower Layer card border behind the glass.</p>
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
          <div className="control">
            <div className="control-head">
              <label htmlFor="border-opacity">Border opacity</label>
              <output htmlFor="border-opacity">{Math.round(borderOpacity * 100)}%</output>
            </div>
            <input
              id="border-opacity" type="range" min="0" max="1" step="0.01"
              value={borderOpacity} onChange={(event) => setBorderOpacity(Number(event.target.value))}
            />
            <div className="control-scale"><span>Subtle</span><span>Bright</span></div>
          </div>
          <div className="controls-bottom">
            <span className="status"><i /> {showOriginal ? "Original background · refraction paused" : activeRenderer === "canvas" ? "Canvas 2D active · no WebGL" : activeRenderer === "webgl" ? "WebGL active" : "Image refraction unavailable"}</span>
            <div className="control-actions">
              <label className="render-picker tone-picker" htmlFor="glass-tone">
                Glass tone
                <select id="glass-tone" value={tone} onChange={(event) => setTone(event.target.value as "light" | "dark")}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </label>
              <label className="render-picker" htmlFor="render-mode">
                Renderer
                <select id="render-mode" value={renderMode} onChange={(event) => setRenderMode(event.target.value as RefractionMode)}>
                  <option value="auto">Auto · WebGL → Canvas</option>
                  <option value="webgl">WebGL · Canvas fallback</option>
                  <option value="canvas">Canvas 2D · no WebGL</option>
                </select>
              </label>
              <button type="button" aria-pressed={showOriginal} onClick={() => setShowOriginal((value) => !value)}>
                {showOriginal ? "Show refraction" : "Show original"}
              </button>
              <button type="button" onClick={() => {
                setOpacity(0.1);
                setBorderOpacity(0.15);
                setTone("dark");
                setRefraction(23);
                setThickness(0.5);
                setRenderMode("auto");
                setShowOriginal(false);
                dragRef.current = null;
                glassRef.current?.classList.remove("is-dragging");
                glassRef.current?.style.removeProperty("left");
                glassRef.current?.style.removeProperty("top");
              }}>↺ &nbsp; Reset</button>
            </div>
          </div>
        </section>
        <p className="footnote">
          Refraction samples the scene image, not arbitrary DOM beneath it.
          Use a same-origin or CORS-enabled image in your own scene.
        </p>
      </main>
    </div>
  );
}
