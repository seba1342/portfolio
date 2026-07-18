import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ControlPanel from "./ControlPanel";
import { DEFAULTS } from "./controls";
import { getCloudRenderSize } from "./renderPolicy";

const vertexShaderSource = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Pass 1: volumetric clouds → framebuffer
// Inspired by the cloud shader developed by: https://www.shadertoy.com/view/XslGRr
const cloudsFragSource = `#version 300 es
precision highp float;

out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_noiseTex;
uniform float u_coverage;
uniform float u_cloudHeight;
uniform float u_camElevation;
uniform float u_camDistance;
uniform float u_sunAngle;
uniform float u_density;
uniform vec3 u_skyBase;
uniform vec3 u_skyGradient;
uniform vec3 u_sunGlow;
uniform vec3 u_sunGlare;
uniform vec3 u_cloudLight;
uniform vec3 u_cloudDark;

mat3 setCamera(in vec3 ro, in vec3 ta, float cr) {
    vec3 cw = normalize(ta - ro);
    vec3 cp = vec3(sin(cr), cos(cr), 0.0);
    vec3 cu = normalize(cross(cw, cp));
    vec3 cv = normalize(cross(cu, cw));
    return mat3(cu, cv, cw);
}

float noise(in vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    vec2 uv = (p.xy + vec2(37.0, 239.0) * p.z) + f.xy;
    vec2 rg = textureLod(u_noiseTex, (uv + 0.5) / 256.0, 0.0).yx;
    return mix(rg.x, rg.y, f.z) * 2.0 - 1.0;
}

float mapCloud(in vec3 p, int octaves) {
    vec3 q = p - vec3(0.0, 0.1, 1.0) * u_time;
    float a = 0.5;
    float f = a * noise(q); q *= 2.02; a *= 0.5;
    if (octaves >= 2) { f += a * noise(q); } q *= 2.03; a *= 0.5;
    if (octaves >= 3) { f += a * noise(q); } q *= 2.01; a *= 0.5;
    if (octaves >= 4) { f += a * noise(q); } q *= 2.02; a *= 0.5;
    if (octaves >= 5) { f += a * noise(q); }
    return clamp(1.5 - p.y + u_cloudHeight + u_coverage * f, 0.0, 1.0);
}

vec4 raymarch(in vec3 ro, in vec3 rd, in vec3 bgcol, in ivec2 px, in vec3 sd) {
    vec4 sum = vec4(0.0);
    float t = 0.05 * texelFetch(u_noiseTex, px & 255, 0).x;

    for (int i = 0; i < 40; i++) {
        vec3 pos = ro + t * rd;
        if (pos.y < -3.0 || pos.y > 2.0 || sum.a > 0.99) break;
        float den = mapCloud(pos, 5);
        if (den > 0.01) {
            float dif = clamp((den - mapCloud(pos + 0.3 * sd, 5)) / 0.6, 0.0, 1.0);
            vec3 lin = vec3(1.0, 0.6, 0.3) * dif + vec3(0.91, 0.98, 1.05);
            vec4 col = vec4(mix(u_cloudLight, u_cloudDark, den), den);
            col.xyz *= lin;
            col.xyz = mix(col.xyz, bgcol, 1.0 - exp(-0.003 * t * t));
            col.w *= u_density;
            col.rgb *= col.a;
            sum += col * (1.0 - sum.a);
        }
        t += max(0.06, 0.05 * t);
    }

    for (int i = 0; i < 40; i++) {
        vec3 pos = ro + t * rd;
        if (pos.y < -3.0 || pos.y > 2.0 || sum.a > 0.99) break;
        float den = mapCloud(pos, 4);
        if (den > 0.01) {
            float dif = clamp((den - mapCloud(pos + 0.3 * sd, 4)) / 0.6, 0.0, 1.0);
            vec3 lin = vec3(1.0, 0.6, 0.3) * dif + vec3(0.91, 0.98, 1.05);
            vec4 col = vec4(mix(u_cloudLight, u_cloudDark, den), den);
            col.xyz *= lin;
            col.xyz = mix(col.xyz, bgcol, 1.0 - exp(-0.003 * t * t));
            col.w *= u_density;
            col.rgb *= col.a;
            sum += col * (1.0 - sum.a);
        }
        t += max(0.06, 0.05 * t);
    }

    for (int i = 0; i < 30; i++) {
        vec3 pos = ro + t * rd;
        if (pos.y < -3.0 || pos.y > 2.0 || sum.a > 0.99) break;
        float den = mapCloud(pos, 3);
        if (den > 0.01) {
            float dif = clamp((den - mapCloud(pos + 0.3 * sd, 3)) / 0.6, 0.0, 1.0);
            vec3 lin = vec3(1.0, 0.6, 0.3) * dif + vec3(0.91, 0.98, 1.05);
            vec4 col = vec4(mix(u_cloudLight, u_cloudDark, den), den);
            col.xyz *= lin;
            col.xyz = mix(col.xyz, bgcol, 1.0 - exp(-0.003 * t * t));
            col.w *= u_density;
            col.rgb *= col.a;
            sum += col * (1.0 - sum.a);
        }
        t += max(0.06, 0.05 * t);
    }

    for (int i = 0; i < 30; i++) {
        vec3 pos = ro + t * rd;
        if (pos.y < -3.0 || pos.y > 2.0 || sum.a > 0.99) break;
        float den = mapCloud(pos, 2);
        if (den > 0.01) {
            float dif = clamp((den - mapCloud(pos + 0.3 * sd, 2)) / 0.6, 0.0, 1.0);
            vec3 lin = vec3(1.0, 0.6, 0.3) * dif + vec3(0.91, 0.98, 1.05);
            vec4 col = vec4(mix(u_cloudLight, u_cloudDark, den), den);
            col.xyz *= lin;
            col.xyz = mix(col.xyz, bgcol, 1.0 - exp(-0.003 * t * t));
            col.w *= u_density;
            col.rgb *= col.a;
            sum += col * (1.0 - sum.a);
        }
        t += max(0.06, 0.05 * t);
    }

    return clamp(sum, 0.0, 1.0);
}

vec4 render(in vec3 ro, in vec3 rd, in ivec2 px, in vec3 sd) {
    float sun = clamp(dot(sd, rd), 0.0, 1.0);
    vec3 col = u_skyBase - rd.y * 0.2 * u_skyGradient + 0.15 * 0.5;
    col += 0.2 * u_sunGlow * pow(sun, 8.0);
    vec4 res = raymarch(ro, rd, col, px, sd);
    col = col * (1.0 - res.w) + res.xyz;
    col += u_sunGlare * pow(sun, 3.0);
    return vec4(col, 1.0);
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 p = (2.0 * fragCoord - u_resolution.xy) / u_resolution.y;

    vec3 ro = u_camDistance * normalize(vec3(0.0, u_camElevation, 1.0)) - vec3(0.0, 0.1, 0.0);
    vec3 ta = vec3(0.0, -1.0, 0.0);
    mat3 ca = setCamera(ro, ta, 0.07 * cos(0.25 * u_time));
    vec3 rd = ca * normalize(vec3(p.xy, 1.5));

    vec3 sd = normalize(vec3(cos(u_sunAngle), 0.0, sin(u_sunAngle)));

    fragColor = render(ro, rd, ivec2(fragCoord - 0.5), sd);
    fragColor.rgb = min(fragColor.rgb, vec3(0.953, 0.839, 0.686));
}
`;

// Pass 2: sample framebuffer, convert to ASCII glyphs with color controls
// Inspired by the shader developed by: https://caidan.dev/portfolio/ascii_clouds
const glyphFragSource = `#version 300 es
precision highp float;

out vec4 fragColor;

uniform sampler2D u_sceneTex;
uniform vec2 u_resolution;
uniform vec2 u_sceneResolution;
uniform float u_cellSize;
uniform float u_saturation;
uniform float u_contrast;
uniform float u_brightness;
uniform vec3 u_bgColor;
uniform vec3 u_glyphColor;
uniform float u_colorMix;

float drawDot(vec2 uv) {
    return smoothstep(0.2, 0.15, length(uv - vec2(0.5)));
}

float drawDash(vec2 uv) {
    float h = smoothstep(0.35, 0.4, uv.y) * smoothstep(0.65, 0.6, uv.y);
    float w = smoothstep(0.15, 0.2, uv.x) * smoothstep(0.85, 0.8, uv.x);
    return h * w;
}

float drawPlus(vec2 uv) {
    float horiz = smoothstep(0.35, 0.4, uv.y) * smoothstep(0.65, 0.6, uv.y) *
                  smoothstep(0.1, 0.15, uv.x) * smoothstep(0.9, 0.85, uv.x);
    float vert = smoothstep(0.35, 0.4, uv.x) * smoothstep(0.65, 0.6, uv.x) *
                 smoothstep(0.1, 0.15, uv.y) * smoothstep(0.9, 0.85, uv.y);
    return max(horiz, vert);
}

float drawO(vec2 uv) {
    float dist = length(uv - vec2(0.5));
    return smoothstep(0.4, 0.35, dist) * smoothstep(0.2, 0.25, dist);
}

float drawX(vec2 uv) {
    vec2 c = uv - 0.5;
    float d1 = abs(c.x - c.y);
    float d2 = abs(c.x + c.y);
    float line1 = smoothstep(0.15, 0.1, d1);
    float line2 = smoothstep(0.15, 0.1, d2);
    float bounds = smoothstep(0.45, 0.4, abs(c.x)) * smoothstep(0.45, 0.4, abs(c.y));
    return max(line1, line2) * bounds;
}

float getGlyph(float brightness, vec2 localUV) {
    if (brightness < 0.15) return 0.0;
    else if (brightness < 0.30) return drawDot(localUV);
    else if (brightness < 0.45) return drawDash(localUV);
    else if (brightness < 0.60) return drawPlus(localUV);
    else if (brightness < 0.75) return drawO(localUV);
    else return drawX(localUV);
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord / u_resolution;

    vec2 cellCount = u_resolution / u_cellSize;
    vec2 cellCoord = floor(uv * cellCount);
    vec2 cellUV = (cellCoord + 0.5) / u_sceneResolution;

    vec3 sceneColor = texture(u_sceneTex, cellUV).rgb;

    sceneColor += u_brightness;
    sceneColor = (sceneColor - 0.5) * u_contrast + 0.5;

    float gray = dot(sceneColor, vec3(0.299, 0.587, 0.114));
    sceneColor = mix(vec3(gray), sceneColor, u_saturation);
    sceneColor = clamp(sceneColor, 0.0, 1.0);

    float brightness = dot(sceneColor, vec3(0.299, 0.587, 0.114));

    vec2 localUV = fract(uv * cellCount);
    float glyphValue = getGlyph(brightness, localUV);

    vec3 tintedColor = mix(u_glyphColor, sceneColor, u_colorMix);
    vec3 finalColor = mix(u_bgColor, tintedColor, glyphValue);
    finalColor = min(finalColor, vec3(0.953, 0.839, 0.686));

    fragColor = vec4(finalColor, 1.0);
}
`;

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Shader compilation error: " + info);
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertSource: string,
  fragSource: string,
): WebGLProgram {
  const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertSource);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Program link error: " + gl.getProgramInfoLog(program));
  }
  return program;
}

function createNoiseTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    data[i * 4] = Math.floor(Math.random() * 256);
    data[i * 4 + 1] = Math.floor(Math.random() * 256);
    data[i * 4 + 2] = Math.floor(Math.random() * 256);
    data[i * 4 + 3] = 255;
  }
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    size,
    size,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    data,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  return texture;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

type ParsedControls = {
  bgColorRgb: [number, number, number];
  cloudDarkRgb: [number, number, number];
  cloudLightRgb: [number, number, number];
  glyphColorRgb: [number, number, number];
  skyBaseRgb: [number, number, number];
  skyGradientRgb: [number, number, number];
  sunGlareRgb: [number, number, number];
  sunGlowRgb: [number, number, number];
} & typeof DEFAULTS;

function parseControls(controls: typeof DEFAULTS): ParsedControls {
  return {
    ...controls,
    bgColorRgb: hexToRgb(controls.bgColor),
    cloudDarkRgb: hexToRgb(controls.cloudDark),
    cloudLightRgb: hexToRgb(controls.cloudLight),
    glyphColorRgb: hexToRgb(controls.glyphColor),
    skyBaseRgb: hexToRgb(controls.skyBase),
    skyGradientRgb: hexToRgb(controls.skyGradient),
    sunGlareRgb: hexToRgb(controls.sunGlare),
    sunGlowRgb: hexToRgb(controls.sunGlow),
  };
}

export default function VolumetricClouds({
  className,
  fadeProgress = 0,
  scrollProgress = 0,
}: {
  className?: string;
  fadeProgress?: number;
  scrollProgress?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<ParsedControls>(parseControls(DEFAULTS));
  const scrollRef = useRef(scrollProgress);
  const fadeRef = useRef(fadeProgress);
  const [controls, setControls] = useState({ ...DEFAULTS });

  scrollRef.current = scrollProgress;
  fadeRef.current = fadeProgress;
  controlsRef.current = parseControls(controls);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    const cloudsProgram = createProgram(
      gl,
      vertexShaderSource,
      cloudsFragSource,
    );
    const cloudsU = {
      camDistance: gl.getUniformLocation(cloudsProgram, "u_camDistance"),
      camElevation: gl.getUniformLocation(cloudsProgram, "u_camElevation"),
      cloudDark: gl.getUniformLocation(cloudsProgram, "u_cloudDark"),
      cloudHeight: gl.getUniformLocation(cloudsProgram, "u_cloudHeight"),
      cloudLight: gl.getUniformLocation(cloudsProgram, "u_cloudLight"),
      coverage: gl.getUniformLocation(cloudsProgram, "u_coverage"),
      density: gl.getUniformLocation(cloudsProgram, "u_density"),
      noiseTex: gl.getUniformLocation(cloudsProgram, "u_noiseTex"),
      resolution: gl.getUniformLocation(cloudsProgram, "u_resolution"),
      skyBase: gl.getUniformLocation(cloudsProgram, "u_skyBase"),
      skyGradient: gl.getUniformLocation(cloudsProgram, "u_skyGradient"),
      sunAngle: gl.getUniformLocation(cloudsProgram, "u_sunAngle"),
      sunGlare: gl.getUniformLocation(cloudsProgram, "u_sunGlare"),
      sunGlow: gl.getUniformLocation(cloudsProgram, "u_sunGlow"),
      time: gl.getUniformLocation(cloudsProgram, "u_time"),
    };

    const glyphProgram = createProgram(gl, vertexShaderSource, glyphFragSource);
    const glyphU = {
      bgColor: gl.getUniformLocation(glyphProgram, "u_bgColor"),
      brightness: gl.getUniformLocation(glyphProgram, "u_brightness"),
      cellSize: gl.getUniformLocation(glyphProgram, "u_cellSize"),
      colorMix: gl.getUniformLocation(glyphProgram, "u_colorMix"),
      contrast: gl.getUniformLocation(glyphProgram, "u_contrast"),
      glyphColor: gl.getUniformLocation(glyphProgram, "u_glyphColor"),
      resolution: gl.getUniformLocation(glyphProgram, "u_resolution"),
      saturation: gl.getUniformLocation(glyphProgram, "u_saturation"),
      sceneResolution: gl.getUniformLocation(
        glyphProgram,
        "u_sceneResolution",
      ),
      sceneTex: gl.getUniformLocation(glyphProgram, "u_sceneTex"),
    };

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const quadVAO = gl.createVertexArray();
    gl.bindVertexArray(quadVAO);
    const posLoc = gl.getAttribLocation(cloudsProgram, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const noiseTex = createNoiseTexture(gl);

    let fbo: WebGLFramebuffer | null = null;
    let sceneTex: WebGLTexture | null = null;
    let fboWidth = 0;
    let fboHeight = 0;

    function ensureFBO(width: number, height: number) {
      if (fboWidth === width && fboHeight === height) return;
      if (fbo) gl!.deleteFramebuffer(fbo);
      if (sceneTex) gl!.deleteTexture(sceneTex);

      sceneTex = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, sceneTex);
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        gl!.RGBA,
        width,
        height,
        0,
        gl!.RGBA,
        gl!.UNSIGNED_BYTE,
        null,
      );
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);

      fbo = gl!.createFramebuffer();
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(
        gl!.FRAMEBUFFER,
        gl!.COLOR_ATTACHMENT0,
        gl!.TEXTURE_2D,
        sceneTex,
        0,
      );
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);

      fboWidth = width;
      fboHeight = height;
    }

    function updateCanvasSize(rect?: DOMRectReadOnly) {
      const dpr = window.devicePixelRatio || 1;
      const bounds = rect ?? canvas!.getBoundingClientRect();
      const width = Math.floor(bounds.width * dpr);
      const height = Math.floor(bounds.height * dpr);
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width;
        canvas!.height = height;
      }
    }

    updateCanvasSize();
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateCanvasSize(entry.contentRect);
    });
    resizeObserver.observe(canvas);

    let time = 0;
    let lastTime = 0;
    let animationFrameId: number;

    function render(currentTime: number) {
      animationFrameId = requestAnimationFrame(render);

      if (fadeRef.current >= 1) {
        lastTime = currentTime;
        return;
      }

      const c = controlsRef.current;
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      time += deltaTime * c.timeSpeed;

      const w = canvas!.width;
      const h = canvas!.height;
      if (w === 0 || h === 0) return;
      const sp = scrollRef.current;
      const pixelRatio = window.devicePixelRatio || 1;
      const cloudRenderSize = getCloudRenderSize({
        asciiEnabled: c.asciiEnabled,
        canvasHeight: h,
        canvasWidth: w,
        cellSize: c.cellSize,
        pixelRatio,
      });

      gl!.bindVertexArray(quadVAO);

      if (c.asciiEnabled) {
        ensureFBO(
          cloudRenderSize.framebufferWidth,
          cloudRenderSize.framebufferHeight,
        );
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      } else {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      }

      // Pass 1: volumetric clouds
      gl!.viewport(
        0,
        0,
        cloudRenderSize.framebufferWidth,
        cloudRenderSize.framebufferHeight,
      );
      gl!.useProgram(cloudsProgram);
      gl!.uniform1f(cloudsU.time, time);
      gl!.uniform2f(
        cloudsU.resolution,
        cloudRenderSize.resolutionWidth,
        cloudRenderSize.resolutionHeight,
      );
      gl!.uniform1f(cloudsU.coverage, c.coverage);
      gl!.uniform1f(cloudsU.cloudHeight, c.cloudHeight + sp * 0.5);
      gl!.uniform1f(cloudsU.camElevation, c.camElevation + sp * 0.2);
      gl!.uniform1f(cloudsU.camDistance, c.camDistance - sp * 2.0);
      gl!.uniform1f(cloudsU.sunAngle, c.sunAngle);
      gl!.uniform1f(cloudsU.density, c.density);

      gl!.uniform3f(
        cloudsU.skyBase,
        c.skyBaseRgb[0],
        c.skyBaseRgb[1],
        c.skyBaseRgb[2],
      );
      gl!.uniform3f(
        cloudsU.skyGradient,
        c.skyGradientRgb[0],
        c.skyGradientRgb[1],
        c.skyGradientRgb[2],
      );
      gl!.uniform3f(
        cloudsU.sunGlow,
        c.sunGlowRgb[0],
        c.sunGlowRgb[1],
        c.sunGlowRgb[2],
      );
      gl!.uniform3f(
        cloudsU.sunGlare,
        c.sunGlareRgb[0],
        c.sunGlareRgb[1],
        c.sunGlareRgb[2],
      );
      gl!.uniform3f(
        cloudsU.cloudLight,
        c.cloudLightRgb[0],
        c.cloudLightRgb[1],
        c.cloudLightRgb[2],
      );
      gl!.uniform3f(
        cloudsU.cloudDark,
        c.cloudDarkRgb[0],
        c.cloudDarkRgb[1],
        c.cloudDarkRgb[2],
      );

      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, noiseTex);
      gl!.uniform1i(cloudsU.noiseTex, 0);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

      // Pass 2: ASCII glyph post-process
      if (c.asciiEnabled) {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
        gl!.viewport(0, 0, w, h);
        gl!.useProgram(glyphProgram);
        gl!.activeTexture(gl!.TEXTURE0);
        gl!.bindTexture(gl!.TEXTURE_2D, sceneTex);
        gl!.uniform1i(glyphU.sceneTex, 0);
        gl!.uniform2f(glyphU.resolution, w, h);
        gl!.uniform2f(
          glyphU.sceneResolution,
          cloudRenderSize.framebufferWidth,
          cloudRenderSize.framebufferHeight,
        );
        gl!.uniform1f(glyphU.cellSize, c.cellSize * pixelRatio);
        gl!.uniform1f(glyphU.saturation, c.saturation);
        gl!.uniform1f(glyphU.contrast, c.contrast);
        gl!.uniform1f(glyphU.brightness, c.brightness);
        gl!.uniform3f(
          glyphU.bgColor,
          c.bgColorRgb[0],
          c.bgColorRgb[1],
          c.bgColorRgb[2],
        );
        gl!.uniform3f(
          glyphU.glyphColor,
          c.glyphColorRgb[0],
          c.glyphColorRgb[1],
          c.glyphColorRgb[2],
        );
        gl!.uniform1f(glyphU.colorMix, c.colorMix);
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      }
    }

    animationFrameId = requestAnimationFrame(render);

    const onResize = () => updateCanvasSize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      gl.deleteProgram(cloudsProgram);
      gl.deleteProgram(glyphProgram);
      gl.deleteBuffer(quadBuffer);
      gl.deleteVertexArray(quadVAO);
      gl.deleteTexture(noiseTex);
      if (fbo) gl.deleteFramebuffer(fbo);
      if (sceneTex) gl.deleteTexture(sceneTex);
    };
  }, []);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          height: "100%",
          opacity: 1 - fadeProgress,
          width: "100%",
        }}
      />
      {process.env.NODE_ENV === "development" &&
        typeof document !== "undefined" &&
        createPortal(
          <ControlPanel controls={controls} onChange={setControls} />,
          document.body,
        )}
    </div>
  );
}
