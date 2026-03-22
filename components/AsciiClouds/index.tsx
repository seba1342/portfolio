import { useEffect, useRef } from "react";

// Settings from: https://caidan.dev/portfolio/ascii_clouds/?cs=17&wa=0.1&ws=0.86&ni=0&vi=0&vr=0&ba=0.5&ca=0.6&ts=0.5&h=0&sa=0&t1=0.4&t2=0.43&t3=0.51&t4=0.64&t5=0.88&sd=m5fax5
const CONFIG = {
  brightnessAdjust: 0.5,
  cellSize: 17,
  contrastAdjust: 0.6,
  hue: 0,
  noiseIntensity: 0,
  noiseSeed: "m5fax5",
  saturation: 0,
  threshold1: 0.4,
  threshold2: 0.43,
  threshold3: 0.51,
  threshold4: 0.64,
  threshold5: 0.88,
  timeSpeed: 0.5,
  vignetteIntensity: 0.0,
  vignetteRadius: 0.0,
  waveAmplitude: 0.1,
  waveSpeed: 0.86,
};

function hashSeed(seed: string): number {
  if (!seed) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 10000;
}

const vertexShaderSource = `#version 300 es
  in vec2 a_position;
  out vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const noiseFragmentShaderSource = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  out vec4 fragColor;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_waveAmplitude;
  uniform float u_waveSpeed;
  uniform float u_noiseIntensity;
  uniform float u_vignetteIntensity;
  uniform float u_vignetteRadius;
  uniform float u_brightnessAdjust;
  uniform float u_contrastAdjust;
  uniform float u_noiseSeed;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 4; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = length(v_uv - center);
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = v_uv;
    uv.x *= aspect;
    vec2 drift = u_time * (0.02 + 0.02 * u_waveSpeed) * vec2(0.3, 0.2);
    float warpTime = u_time * max(0.025, 0.04 * u_waveSpeed);
    vec2 q = vec2(
      fbm(vec3(uv + drift, warpTime + u_noiseSeed)),
      fbm(vec3(uv + drift + vec2(5.2, 1.3), warpTime * 0.9 + u_noiseSeed))
    );
    vec2 driftR = u_time * (0.016 + 0.016 * u_waveSpeed) * vec2(0.25, 0.15);
    vec2 r = vec2(
      fbm(vec3(uv + 4.0 * q + vec2(1.7, 9.2) + driftR, warpTime * 0.8 + u_noiseSeed)),
      fbm(vec3(uv + 4.0 * q + vec2(8.3, 2.8) + driftR, warpTime * 0.7 + u_noiseSeed))
    );
    float warpStrength = u_waveAmplitude * 1.5;
    vec2 warpedUV = uv + warpStrength * r + drift;
    float density = fbm(vec3(warpedUV * 4.0, warpTime * 0.5 + u_noiseSeed)) * 0.5 + 0.5;
    density += (snoise(vec3(uv * 50.0 + drift * 10.0, u_noiseSeed)) * 0.5 + 0.5) * u_noiseIntensity;
    float visible = smoothstep(0.35, 0.70, density);
    float edgeFade = 1.0 - smoothstep(u_vignetteRadius * 0.5, u_vignetteRadius, dist) * u_vignetteIntensity;
    visible *= edgeFade;
    visible = (visible + u_brightnessAdjust) * u_contrastAdjust;
    visible = clamp(visible, 0.0, 1.0);
    fragColor = vec4(vec3(visible), 1.0);
  }
`;

const glyphFragmentShaderSource = `#version 300 es
  precision highp float;
  in vec2 v_uv;
  out vec4 fragColor;

  uniform sampler2D u_noiseTexture;
  uniform vec2 u_resolution;
  uniform float u_cellSize;
  uniform float u_hue;
  uniform float u_saturation;
  uniform float u_threshold1;
  uniform float u_threshold2;
  uniform float u_threshold3;
  uniform float u_threshold4;
  uniform float u_threshold5;

  vec3 hsl2rgb(float h, float s, float l) {
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float hp = h / 60.0;
    float x = c * (1.0 - abs(mod(hp, 2.0) - 1.0));
    vec3 rgb;
    if (hp < 1.0) rgb = vec3(c, x, 0.0);
    else if (hp < 2.0) rgb = vec3(x, c, 0.0);
    else if (hp < 3.0) rgb = vec3(0.0, c, x);
    else if (hp < 4.0) rgb = vec3(0.0, x, c);
    else if (hp < 5.0) rgb = vec3(x, 0.0, c);
    else rgb = vec3(c, 0.0, x);
    float m = l - c * 0.5;
    return rgb + m;
  }

  float drawDot(vec2 uv) {
    float dist = length(uv - vec2(0.5));
    return smoothstep(0.2, 0.15, dist);
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
    if (brightness < u_threshold1) return 0.0;
    else if (brightness < u_threshold2) return drawDot(localUV);
    else if (brightness < u_threshold3) return drawDash(localUV);
    else if (brightness < u_threshold4) return drawPlus(localUV);
    else if (brightness < u_threshold5) return drawO(localUV);
    else return drawX(localUV);
  }

  void main() {
    vec2 cellCount = u_resolution / u_cellSize;
    vec2 cellCoord = floor(v_uv * cellCount);
    vec2 cellUV = (cellCoord + 0.5) / cellCount;
    float brightness = texture(u_noiseTexture, cellUV).r;
    vec2 localUV = fract(v_uv * cellCount);
    float glyphValue = getGlyph(brightness, localUV);
    vec3 glyphColor = vec3(0.204, 0.067, 0.035);
    float alpha = glyphValue * brightness;
    vec3 finalColor = glyphColor * alpha;
    fragColor = vec4(finalColor, alpha);
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

export default function AsciiClouds({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const noiseProgram = createProgram(
      gl,
      vertexShaderSource,
      noiseFragmentShaderSource,
    );
    const glyphProgram = createProgram(
      gl,
      vertexShaderSource,
      glyphFragmentShaderSource,
    );

    const noiseUniforms = {
      brightnessAdjust: gl.getUniformLocation(
        noiseProgram,
        "u_brightnessAdjust",
      ),
      contrastAdjust: gl.getUniformLocation(noiseProgram, "u_contrastAdjust"),
      noiseIntensity: gl.getUniformLocation(noiseProgram, "u_noiseIntensity"),
      noiseSeed: gl.getUniformLocation(noiseProgram, "u_noiseSeed"),
      resolution: gl.getUniformLocation(noiseProgram, "u_resolution"),
      time: gl.getUniformLocation(noiseProgram, "u_time"),
      vignetteIntensity: gl.getUniformLocation(
        noiseProgram,
        "u_vignetteIntensity",
      ),
      vignetteRadius: gl.getUniformLocation(noiseProgram, "u_vignetteRadius"),
      waveAmplitude: gl.getUniformLocation(noiseProgram, "u_waveAmplitude"),
      waveSpeed: gl.getUniformLocation(noiseProgram, "u_waveSpeed"),
    };

    const glyphUniforms = {
      cellSize: gl.getUniformLocation(glyphProgram, "u_cellSize"),
      hue: gl.getUniformLocation(glyphProgram, "u_hue"),
      noiseTexture: gl.getUniformLocation(glyphProgram, "u_noiseTexture"),
      resolution: gl.getUniformLocation(glyphProgram, "u_resolution"),
      saturation: gl.getUniformLocation(glyphProgram, "u_saturation"),
      threshold1: gl.getUniformLocation(glyphProgram, "u_threshold1"),
      threshold2: gl.getUniformLocation(glyphProgram, "u_threshold2"),
      threshold3: gl.getUniformLocation(glyphProgram, "u_threshold3"),
      threshold4: gl.getUniformLocation(glyphProgram, "u_threshold4"),
      threshold5: gl.getUniformLocation(glyphProgram, "u_threshold5"),
    };

    // Full-screen quad
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const quadVAO = gl.createVertexArray();
    gl.bindVertexArray(quadVAO);
    const positionLoc = gl.getAttribLocation(noiseProgram, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Framebuffer for noise pass
    let framebuffer: WebGLFramebuffer | null = null;
    let noiseTexture: WebGLTexture | null = null;

    function createFramebuffer(width: number, height: number) {
      if (framebuffer) gl!.deleteFramebuffer(framebuffer);
      if (noiseTexture) gl!.deleteTexture(noiseTexture);

      noiseTexture = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, noiseTexture);
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

      framebuffer = gl!.createFramebuffer();
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, framebuffer);
      gl!.framebufferTexture2D(
        gl!.FRAMEBUFFER,
        gl!.COLOR_ATTACHMENT0,
        gl!.TEXTURE_2D,
        noiseTexture,
        0,
      );
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    }

    function resize() {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const rect = canvas!.getBoundingClientRect();
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width;
        canvas!.height = height;
        createFramebuffer(width, height);
      }
    }

    resize();

    const seedValue = hashSeed(CONFIG.noiseSeed);
    let time = 0;
    let lastTime = 0;
    let animationFrameId: number;

    function render(currentTime: number) {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      time += deltaTime * CONFIG.timeSpeed;

      resize();

      const width = canvas!.width;
      const height = canvas!.height;

      // Pass 1: noise → framebuffer
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, framebuffer);
      gl!.viewport(0, 0, width, height);
      gl!.useProgram(noiseProgram);
      gl!.uniform1f(noiseUniforms.time, time);
      gl!.uniform2f(noiseUniforms.resolution, width, height);
      gl!.uniform1f(noiseUniforms.waveAmplitude, CONFIG.waveAmplitude);
      gl!.uniform1f(noiseUniforms.waveSpeed, CONFIG.waveSpeed);
      gl!.uniform1f(noiseUniforms.noiseIntensity, CONFIG.noiseIntensity);
      gl!.uniform1f(noiseUniforms.vignetteIntensity, CONFIG.vignetteIntensity);
      gl!.uniform1f(noiseUniforms.vignetteRadius, CONFIG.vignetteRadius);
      gl!.uniform1f(noiseUniforms.brightnessAdjust, CONFIG.brightnessAdjust);
      gl!.uniform1f(noiseUniforms.contrastAdjust, CONFIG.contrastAdjust);
      gl!.uniform1f(noiseUniforms.noiseSeed, seedValue);
      gl!.bindVertexArray(quadVAO);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

      // Pass 2: glyphs → screen
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, width, height);
      gl!.useProgram(glyphProgram);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, noiseTexture);
      gl!.uniform1i(glyphUniforms.noiseTexture, 0);
      gl!.uniform2f(glyphUniforms.resolution, width, height);
      gl!.uniform1f(
        glyphUniforms.cellSize,
        CONFIG.cellSize * (window.devicePixelRatio || 1),
      );
      gl!.uniform1f(glyphUniforms.hue, CONFIG.hue);
      gl!.uniform1f(glyphUniforms.saturation, CONFIG.saturation);
      gl!.uniform1f(glyphUniforms.threshold1, CONFIG.threshold1);
      gl!.uniform1f(glyphUniforms.threshold2, CONFIG.threshold2);
      gl!.uniform1f(glyphUniforms.threshold3, CONFIG.threshold3);
      gl!.uniform1f(glyphUniforms.threshold4, CONFIG.threshold4);
      gl!.uniform1f(glyphUniforms.threshold5, CONFIG.threshold5);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      gl.deleteProgram(noiseProgram);
      gl.deleteProgram(glyphProgram);
      gl.deleteBuffer(quadBuffer);
      gl.deleteVertexArray(quadVAO);
      if (framebuffer) gl.deleteFramebuffer(framebuffer);
      if (noiseTexture) gl.deleteTexture(noiseTexture);
    };
  }, []);

  return (
    <canvas
      className={className}
      ref={canvasRef}
      style={{ display: "block", height: "100%", width: "100%" }}
    />
  );
}
