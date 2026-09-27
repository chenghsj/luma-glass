/* Self-contained, build-free mirror of src/lib/webgl.ts for branch-based GitHub Pages. */
(() => {
  "use strict";
  const byId = (id) => document.getElementById(id);
  const scene = byId("scene");
  const glass = byId("glass");
  const canvas = byId("refraction");
  const cpuCanvas = byId("canvas-refraction");
  const modeSelect = byId("render-mode");
  const opacity = byId("opacity");
  const refraction = byId("refraction-slider");
  const thickness = byId("thickness");
  const status = byId("render-status");
  const compare = byId("compare");
  if (!scene || !glass || !canvas || !cpuCanvas || !modeSelect || !opacity || !refraction || !thickness) return;

  const vertexSource = [
    "attribute vec2 a_position;",
    "varying vec2 v_uv;",
    "void main() {",
    "  v_uv = vec2((a_position.x + 1.0) * 0.5, (1.0 - a_position.y) * 0.5);",
    "  gl_Position = vec4(a_position, 0.0, 1.0);",
    "}",
  ].join("\n");

  const fragmentSource = [
    "precision highp float;",
    "varying vec2 v_uv;",
    "uniform sampler2D u_image;",
    "uniform vec2 u_sceneSize;",
    "uniform vec2 u_displaySize;",
    "uniform vec2 u_crop;",
    "uniform vec2 u_origin;",
    "uniform vec2 u_glassSize;",
    "uniform float u_strength;",
    "uniform float u_thickness;",
    "void main() {",
    "  vec2 distanceToEdge = min(v_uv, 1.0 - v_uv) * u_glassSize;",
    "  float falloff = max(42.0, min(u_glassSize.x, u_glassSize.y) * 0.23) + u_thickness * 0.8;",
    "  vec2 influence = mix(vec2(0.07), vec2(1.0), exp(-distanceToEdge / falloff));",
    "  vec2 direction = v_uv * 2.0 - 1.0;",
    "  vec2 offset = direction * influence * (u_strength * 0.92);",
    "  vec2 point = clamp(u_origin + v_uv * u_glassSize + offset, vec2(0.0), u_sceneSize);",
    "  vec2 sourceUv = clamp((point + u_crop) / u_displaySize, vec2(0.0), vec2(1.0));",
    "  gl_FragColor = texture2D(u_image, sourceUv);",
    "}",
  ].join("\n");

  let renderer = null;
  let activeMode = "none";
  let webglRenderer = null;
  let canvasRenderer = null;
  let webglUnavailable = false;
  let pending = 0;
  let showOriginal = false;
  function syncCompare() {
    compare.setAttribute("aria-pressed", String(showOriginal));
    compare.textContent = showOriginal ? "Show refraction" : "Show original";
  }
  function setStatus(message) {
    status.lastChild.textContent = " " + message;
  }
  function updateControls() {
    glass.style.setProperty("--luma-opacity", opacity.value);
    glass.style.setProperty("--luma-thickness", thickness.value + "px");
    byId("opacity-value").textContent = Math.round(Number(opacity.value) * 100) + "%";
    byId("refraction-value").textContent = refraction.value + " / 60";
    byId("thickness-value").textContent = Number(thickness.value).toFixed(1) + " px";
  }
  function draw() {
    pending = 0;
    updateControls();
    if (renderer) {
      try {
        renderer.draw();
        const visible = !showOriginal && Number(refraction.value) > 0;
        canvas.style.opacity = visible && activeMode === "webgl" ? "1" : "0";
        cpuCanvas.style.opacity = visible && activeMode === "canvas" ? "1" : "0";
        setStatus(showOriginal ? "Original background · refraction paused"
          : activeMode === "webgl" ? "WebGL active · watch the contour lines"
          : modeSelect.value !== "canvas" && webglUnavailable
            ? "Canvas 2D active · WebGL unavailable"
            : "Canvas 2D active · WebGL not required");
      } catch (error) {
        console.warn("[luma-glass demo] Renderer failed:", error);
        canvas.style.opacity = "0";
        cpuCanvas.style.opacity = "0";
        renderer = null;
        compare.disabled = true;
        setStatus("Refraction unavailable · CSS glass only");
      }
    }
  }
  function schedule() {
    if (!pending) pending = window.requestAnimationFrame(draw);
  }
  for (const input of [opacity, thickness]) {
    input.addEventListener("input", schedule);
  }
  refraction.addEventListener("input", () => {
    showOriginal = false;
    syncCompare();
    schedule();
  });
  modeSelect.addEventListener("change", () => {
    chooseRenderer();
    schedule();
  });
  compare.addEventListener("click", () => {
    showOriginal = !showOriginal;
    syncCompare();
    schedule();
  });
  byId("reset").addEventListener("click", () => {
    opacity.value = ".4";
    refraction.value = "23";
    thickness.value = "1.8";
    showOriginal = false;
    syncCompare();
    schedule();
  });
  updateControls();
  syncCompare();

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Cannot create shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(log || "Shader compilation failed");
    }
    return shader;
  }

  function createRenderer(image) {
    const gl = canvas.getContext("webgl", {
      alpha: true, antialias: false, depth: false, premultipliedAlpha: false,
    });
    if (!gl) return null;

    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) throw new Error("Cannot create WebGL program");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
    }

    const buffer = gl.createBuffer();
    const texture = gl.createTexture();
    if (!buffer || !texture) throw new Error("Cannot allocate WebGL resources");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    if (gl.getError() !== gl.NO_ERROR) throw new Error("Could not upload background texture");

    const position = gl.getAttribLocation(program, "a_position");
    if (position < 0) throw new Error("Missing shader position attribute");
    function uniform(name) {
      const location = gl.getUniformLocation(program, name);
      if (location === null) throw new Error("Missing uniform " + name);
      return location;
    }
    const uniforms = {
      image: uniform("u_image"),
      sceneSize: uniform("u_sceneSize"),
      displaySize: uniform("u_displaySize"),
      crop: uniform("u_crop"),
      origin: uniform("u_origin"),
      glassSize: uniform("u_glassSize"),
      strength: uniform("u_strength"),
      thickness: uniform("u_thickness"),
    };

    return {
      draw() {
        const s = scene.getBoundingClientRect();
        const g = glass.getBoundingClientRect();
        if (s.width <= 0 || s.height <= 0 || g.width <= 0 || g.height <= 0) return;

        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.round(g.width * ratio));
        const height = Math.max(1, Math.round(g.height * ratio));
        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;
        const scale = Math.max(s.width / image.naturalWidth, s.height / image.naturalHeight);
        const displayWidth = image.naturalWidth * scale;
        const displayHeight = image.naturalHeight * scale;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uniforms.image, 0);
        gl.uniform2f(uniforms.sceneSize, s.width, s.height);
        gl.uniform2f(uniforms.displaySize, displayWidth, displayHeight);
        gl.uniform2f(uniforms.crop, (displayWidth - s.width) / 2, (displayHeight - s.height) / 2);
        gl.uniform2f(uniforms.origin, g.left - s.left, g.top - s.top);
        gl.uniform2f(uniforms.glassSize, g.width, g.height);
        gl.uniform1f(uniforms.strength, Number(refraction.value));
        gl.uniform1f(uniforms.thickness, Number(thickness.value));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        canvas.style.opacity = "1";
      },
    };
  }


  function createCanvasRenderer(image) {
    const ctx = cpuCanvas.getContext("2d");
    const source = document.createElement("canvas");
    const sourceCtx = source.getContext("2d", { willReadFrequently: true });
    if (!ctx || !sourceCtx) throw new Error("Canvas 2D is unavailable");
    let sourceWidth = 0, sourceHeight = 0, pixels = null, previous = "";
    return {
      draw() {
        const s = scene.getBoundingClientRect();
        const g = glass.getBoundingClientRect();
        const strength = Number(refraction.value);
        const edge = Number(thickness.value);
        if (!s.width || !s.height || !g.width || !g.height) return;
        if (strength <= 0) { cpuCanvas.style.opacity = "0"; return; }
        const sw = Math.max(1, Math.round(s.width)), sh = Math.max(1, Math.round(s.height));
        if (sw !== sourceWidth || sh !== sourceHeight) {
          source.width = sw;
          source.height = sh;
          const scale = Math.max(sw / image.naturalWidth, sh / image.naturalHeight);
          const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
          sourceCtx.clearRect(0, 0, sw, sh);
          sourceCtx.drawImage(image, (sw - w) / 2, (sh - h) / 2, w, h);
          pixels = sourceCtx.getImageData(0, 0, sw, sh).data;
          sourceWidth = sw; sourceHeight = sh; previous = "";
        }
        if (!pixels) return;
        const width = Math.max(1, Math.round(g.width));
        const height = Math.max(1, Math.round(g.height));
        const ox = g.left - s.left, oy = g.top - s.top;
        const key = [width, height, ox, oy, strength, edge, sw, sh].join(":");
        if (key === previous) return;
        previous = key;
        if (cpuCanvas.width !== width) cpuCanvas.width = width;
        if (cpuCanvas.height !== height) cpuCanvas.height = height;
        const result = ctx.createImageData(width, height), out = result.data;
        const falloff = Math.max(42, Math.min(g.width, g.height) * 0.23) + edge * 0.8;
        for (let y = 0; y < height; y++) {
          const v = (y + 0.5) / height;
          const fy = 0.07 + 0.93 * Math.exp(-Math.min(v, 1 - v) * g.height / falloff);
          const dy = (v * 2 - 1) * fy * strength * 0.92;
          for (let x = 0; x < width; x++) {
            const u = (x + 0.5) / width;
            const fx = 0.07 + 0.93 * Math.exp(-Math.min(u, 1 - u) * g.width / falloff);
            const dx = (u * 2 - 1) * fx * strength * 0.92;
            const sx = Math.min(sw - 1, Math.max(0, Math.round((ox + u * g.width + dx) * sw / s.width)));
            const sy = Math.min(sh - 1, Math.max(0, Math.round((oy + v * g.height + dy) * sh / s.height)));
            const from = (sy * sw + sx) * 4, to = (y * width + x) * 4;
            out[to] = pixels[from];
            out[to + 1] = pixels[from + 1];
            out[to + 2] = pixels[from + 2];
            out[to + 3] = pixels[from + 3];
          }
        }
        ctx.putImageData(result, 0, 0);
        cpuCanvas.style.opacity = "1";
      },
    };
  }

  function chooseRenderer() {
    renderer = null;
    activeMode = "none";
    canvas.style.opacity = "0";
    cpuCanvas.style.opacity = "0";
    if (!image.naturalWidth || !image.naturalHeight) return;
    // Selecting Canvas 2D never requests a WebGL context.
    if (modeSelect.value !== "canvas" && !webglUnavailable && !webglRenderer) {
      try {
        webglRenderer = createRenderer(image);
        if (!webglRenderer) webglUnavailable = true;
      } catch (error) {
        webglUnavailable = true;
        console.warn("[luma-glass demo] WebGL fallback:", error);
      }
    }
    if (modeSelect.value !== "canvas" && webglRenderer) {
      renderer = webglRenderer;
      activeMode = "webgl";
    } else {
      try {
        if (!canvasRenderer) canvasRenderer = createCanvasRenderer(image);
        renderer = canvasRenderer;
        activeMode = "canvas";
      } catch (error) {
        console.warn("[luma-glass demo] Canvas fallback unavailable:", error);
      }
    }
    compare.disabled = !renderer;
    if (!renderer) setStatus("Refraction unavailable · CSS glass only");
    else setStatus(activeMode === "webgl" ? "WebGL active · watch the contour lines"
      : webglUnavailable && modeSelect.value !== "canvas" ? "Canvas 2D active · WebGL unavailable"
      : "Canvas 2D active · WebGL not required");
  }

  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    chooseRenderer();
    schedule();
  };
  image.onerror = () => {
    compare.disabled = true;
    setStatus("Image unavailable · CSS glass only");
  };
  image.src = "./scene.svg?v=3";

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(schedule);
    observer.observe(scene);
    observer.observe(glass);
  }
  window.addEventListener("resize", schedule);
  window.addEventListener("scroll", schedule, true);
  schedule();
})();
