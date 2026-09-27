import { getCoverLayout } from "./optics";

const vertexShader = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = vec2((a_position.x + 1.0) * 0.5, (1.0 - a_position.y) * 0.5);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/*
 * The rasterized image is uploaded without UNPACK_FLIP_Y_WEBGL.
 * Texture v=0 therefore addresses the image's original top row.
 */
const fragmentShader = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_sceneSize;
uniform vec2 u_displaySize;
uniform vec2 u_crop;
uniform vec2 u_origin;
uniform vec2 u_glassSize;
uniform float u_strength;
uniform float u_thickness;

void main() {
  // A curved lens samples a broad strip, not just a few edge pixels.
  // Keep a small center contribution; the direction stays continuous at center.
  vec2 distanceToEdge = min(v_uv, 1.0 - v_uv) * u_glassSize;
  float falloff = max(42.0, min(u_glassSize.x, u_glassSize.y) * 0.23)
    + u_thickness * 0.8;
  vec2 influence = mix(vec2(0.07), vec2(1.0), exp(-distanceToEdge / falloff));
  vec2 direction = v_uv * 2.0 - 1.0;
  vec2 offset = direction * influence * (u_strength * 0.92);
  vec2 point = clamp(
    u_origin + v_uv * u_glassSize + offset,
    vec2(0.0), u_sceneSize
  );
  vec2 sourceUv = clamp((point + u_crop) / u_displaySize, vec2(0.0), vec2(1.0));
  // Refract a lens band, not the whole image. The original SVG stays visible
  // at the center, so raster texture sampling cannot soften its text.
  float edgeDistance = min(distanceToEdge.x, distanceToEdge.y);
  float bandEnd = min(105.0, 62.0 + u_strength * 0.48 + u_thickness * 2.0);
  float edgeFade = clamp((edgeDistance - 10.0) / (bandEnd - 10.0), 0.0, 1.0);
  float edgeOpacity = 1.0 - edgeFade * edgeFade * (3.0 - 2.0 * edgeFade);
  // At strength 1, reveal only ~7% of the displaced image at the rim.
  float strengthFade = clamp(u_strength / 6.0, 0.0, 1.0);
  float strengthOpacity = strengthFade * strengthFade * (3.0 - 2.0 * strengthFade);
  vec4 sampled = texture2D(u_image, sourceUv);
  gl_FragColor = vec4(sampled.rgb, sampled.a * edgeOpacity * strengthOpacity);
}
`;

export interface RefractionFrame {
  scene: DOMRect;
  glass: DOMRect;
  strength: number;
  thickness: number;
}

export interface RefractionRenderer {
  draw(frame: RefractionFrame): void;
  dispose(): void;
}

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to allocate shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

/**
 * Draws a second, optically displaced copy of GlassScene's image.
 * The glass shape, edge and DOM children remain normal React/CSS elements.
 */
export function createRefractionRenderer(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
): RefractionRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: false,
  });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to allocate WebGL program.");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "Unable to link WebGL.");
  }

  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  if (!buffer || !texture) throw new Error("Unable to allocate WebGL buffers.");

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error("Background image has no intrinsic dimensions.");
  }

  // SVG rasterization at 300x150 (a possible viewBox-only default) blurs
  // the entire scene when its pixels are later magnified inside the glass.
  // Render the SVG at its covered on-screen size and device pixel ratio.
  const sourceUrl = (image.currentSrc || image.src).toLowerCase();
  const isVector = sourceUrl.includes(".svg") ||
    sourceUrl.startsWith("data:image/svg+xml");
  const bitmap = document.createElement("canvas");
  const bitmapContext = bitmap.getContext("2d");
  if (!bitmapContext) throw new Error("Cannot rasterize background image.");
  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  const maxByTexture = maxTextureSize /
    Math.max(image.naturalWidth, image.naturalHeight);
  const maxByPixels = Math.sqrt(
    8_000_000 / (image.naturalWidth * image.naturalHeight),
  );
  let textureWidth = 0;
  let textureHeight = 0;

  function uploadTexture(displayWidth: number, displayHeight: number, pixelRatio: number) {
    const requestedScale = isVector
      ? Math.max(
          1,
          Math.ceil(
            Math.max(
              displayWidth / image.naturalWidth,
              displayHeight / image.naturalHeight,
            ) * pixelRatio * 2,
          ) / 2,
        )
      : 1;
    const scale = Math.min(requestedScale, 3, maxByTexture, maxByPixels);
    const width = Math.max(1, Math.floor(image.naturalWidth * scale));
    const height = Math.max(1, Math.floor(image.naturalHeight * scale));
    if (width === textureWidth && height === textureHeight) return;

    bitmap.width = width;
    bitmap.height = height;
    bitmapContext.clearRect(0, 0, width, height);
    bitmapContext.drawImage(image, 0, 0, width, height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
    const textureError = gl.getError();
    if (textureError !== gl.NO_ERROR) {
      throw new Error(
        "Canvas-backed background texture upload failed (WebGL error 0x" +
          textureError.toString(16) + ").",
      );
    }
    textureWidth = width;
    textureHeight = height;
  }

  const position = gl.getAttribLocation(program, "a_position");
  if (position < 0) throw new Error("Missing WebGL position attribute.");

  const uniform = (name: string) => {
    const location = gl.getUniformLocation(program, name);
    if (location === null) throw new Error("Missing WebGL uniform: " + name);
    return location;
  };
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
    draw({ scene, glass, strength, thickness }) {
      if (!glass.width || !glass.height || !scene.width || !scene.height) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(glass.width * pixelRatio));
      const height = Math.max(1, Math.round(glass.height * pixelRatio));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const cover = getCoverLayout(
        scene.width,
        scene.height,
        image.naturalWidth,
        image.naturalHeight,
      );
      uploadTexture(cover.displayWidth, cover.displayHeight, pixelRatio);

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniforms.image, 0);
      gl.uniform2f(uniforms.sceneSize, scene.width, scene.height);
      gl.uniform2f(uniforms.displaySize, cover.displayWidth, cover.displayHeight);
      gl.uniform2f(uniforms.crop, cover.cropX, cover.cropY);
      gl.uniform2f(
        uniforms.origin,
        glass.left - scene.left,
        glass.top - scene.top,
      );
      gl.uniform2f(uniforms.glassSize, glass.width, glass.height);
      gl.uniform1f(uniforms.strength, strength);
      gl.uniform1f(uniforms.thickness, thickness);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      canvas.style.opacity = strength > 0 ? "1" : "0";
    },
    dispose() {
      canvas.style.opacity = "0";
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    },
  };
}
