/* Self-contained, build-free mirror of src/lib/webgl.ts for branch-based GitHub Pages. */
(() => {
  "use strict";
  const byId = (id) => document.getElementById(id);
  const scene = byId("scene");
  const glass = byId("glass");
  const canvas = byId("refraction");
  const opacity = byId("opacity");
  const refraction = byId("refraction-slider");
  const thickness = byId("thickness");
  const status = byId("render-status");
  const compare = byId("compare");
  if (!scene || !glass || !canvas || !opacity || !refraction || !thickness) return;

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
      renderer.draw();
      canvas.style.opacity = showOriginal || Number(refraction.value) === 0 ? "0" : "1";
      setStatus(showOriginal ? "Original background · refraction paused" : "WebGL active · watch the contour lines");
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

  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    try {
      renderer = createRenderer(image);
      compare.disabled = !renderer;
      if (!renderer) setStatus("WebGL unavailable · CSS glass fallback");
      else setStatus("WebGL active · watch the contour lines");
    } catch (error) {
      renderer = null;
      compare.disabled = true;
      console.warn("[luma-glass demo] WebGL fallback:", error);
      setStatus("WebGL unavailable · CSS glass fallback");
    }
    schedule();
  };
  image.onerror = () => {
    compare.disabled = true;
    setStatus("Image unavailable · CSS glass fallback");
  };
  image.src = "./scene.svg?v=2";

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(schedule);
    observer.observe(scene);
    observer.observe(glass);
  }
  window.addEventListener("resize", schedule);
  window.addEventListener("scroll", schedule, true);
  schedule();
})();
