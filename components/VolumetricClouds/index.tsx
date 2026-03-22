import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const vertexShaderSource = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Pass 1: volumetric clouds → framebuffer
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
const glyphFragSource = `#version 300 es
precision highp float;

out vec4 fragColor;

uniform sampler2D u_sceneTex;
uniform vec2 u_resolution;
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
    vec2 cellUV = (cellCoord + 0.5) / cellCount;

    vec3 sceneColor = texture(u_sceneTex, cellUV).rgb;

    // Brightness
    sceneColor += u_brightness;

    // Contrast (around 0.5 midpoint)
    sceneColor = (sceneColor - 0.5) * u_contrast + 0.5;

    // Saturation
    float gray = dot(sceneColor, vec3(0.299, 0.587, 0.114));
    sceneColor = mix(vec3(gray), sceneColor, u_saturation);

    sceneColor = clamp(sceneColor, 0.0, 1.0);

    float brightness = dot(sceneColor, vec3(0.299, 0.587, 0.114));

    vec2 localUV = fract(uv * cellCount);
    float glyphValue = getGlyph(brightness, localUV);

    // Mix between scene color tint and flat glyph color
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

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) =>
    Math.round(Math.max(0, Math.min(1, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

interface Controls {
  asciiEnabled: boolean;
  bgColor: string;
  brightness: number;
  camDistance: number;
  camElevation: number;
  cellSize: number;
  cloudDark: string;
  cloudHeight: number;
  cloudLight: string;
  colorMix: number;
  contrast: number;
  coverage: number;
  density: number;
  glyphColor: string;
  saturation: number;
  skyBase: string;
  skyGradient: string;
  sunAngle: number;
  sunGlare: string;
  sunGlow: string;
  timeSpeed: number;
}

const DEFAULTS: Controls = {
  asciiEnabled: true,
  bgColor: "#f4d6b0",
  brightness: 0,
  camDistance: 5,
  camElevation: 0.2,
  cellSize: 8,
  cloudDark: "#f4d6b0",
  cloudHeight: -1.9,
  cloudLight: "#341109",
  colorMix: 1,
  contrast: 1,
  coverage: 2.5,
  density: 0.8,
  glyphColor: "#341109",
  saturation: 1,
  skyBase: "#f4d6b0",
  skyGradient: "#341109",
  sunAngle: 0.61,
  sunGlare: "#f4d6b0",
  sunGlow: "#f4d6b0",
  timeSpeed: 0.4,
};

type SkyPreset = {
  cloudDark: string;
  cloudLight: string;
  label: string;
  skyBase: string;
  skyGradient: string;
  sunAngle: number;
  sunGlare: string;
  sunGlow: string;
};

const SKY_PRESETS: SkyPreset[] = [
  {
    cloudDark: "#404b59",
    cloudLight: "#fff2cc",
    label: "Day",
    skyBase: "#99b5bf",
    skyGradient: "#e680f2",
    sunAngle: -0.785,
    sunGlare: "#33140a",
    sunGlow: "#ff991a",
  },
  {
    cloudDark: "#2a1a2e",
    cloudLight: "#ff9966",
    label: "Sunset",
    skyBase: "#cc6633",
    skyGradient: "#331a33",
    sunAngle: -0.2,
    sunGlare: "#ff6633",
    sunGlow: "#ff4400",
  },
  {
    cloudDark: "#1a1a33",
    cloudLight: "#ffccaa",
    label: "Sunrise",
    skyBase: "#6b5a7a",
    skyGradient: "#4d3366",
    sunAngle: -2.8,
    sunGlare: "#cc6644",
    sunGlow: "#ff8844",
  },
];

type SliderDef = {
  decimals?: number;
  key: keyof Controls;
  label: string;
  max: number;
  min: number;
  step: number;
};

type ColorDef = {
  key: keyof Controls;
  label: string;
};

type SectionDef = {
  items: (ColorDef | SliderDef)[];
  title: string;
};

const SECTIONS: SectionDef[] = [
  {
    items: [
      { key: "coverage", label: "Coverage", max: 3.0, min: 0.5, step: 0.05 },
      { key: "cloudHeight", label: "Height", max: 0.0, min: -4.0, step: 0.1 },
      { key: "density", label: "Density", max: 1.0, min: 0.1, step: 0.05 },
      { key: "timeSpeed", label: "Speed", max: 3.0, min: 0.0, step: 0.1 },
    ],
    title: "Clouds",
  },
  {
    items: [
      {
        key: "camElevation",
        label: "Elevation",
        max: 1.5,
        min: -0.5,
        step: 0.05,
      },
      {
        key: "camDistance",
        label: "Distance",
        max: 8.0,
        min: 1.0,
        step: 0.1,
      },
      {
        key: "sunAngle",
        label: "Sun Angle",
        max: 3.14,
        min: -3.14,
        step: 0.05,
      },
    ],
    title: "Camera & Light",
  },
  {
    items: [
      {
        decimals: 0,
        key: "cellSize",
        label: "Cell Size",
        max: 32.0,
        min: 4.0,
        step: 1.0,
      },
    ],
    title: "ASCII",
  },
  {
    items: [
      {
        key: "brightness",
        label: "Brightness",
        max: 0.5,
        min: -0.5,
        step: 0.01,
      },
      { key: "contrast", label: "Contrast", max: 3.0, min: 0.1, step: 0.05 },
      {
        key: "saturation",
        label: "Saturation",
        max: 2.0,
        min: 0.0,
        step: 0.05,
      },
      {
        key: "colorMix",
        label: "Color Mix",
        max: 1.0,
        min: 0.0,
        step: 0.05,
      },
      { key: "bgColor", label: "Background" },
      { key: "glyphColor", label: "Glyph Color" },
    ],
    title: "Color",
  },
  {
    items: [
      { key: "skyBase", label: "Sky Base" },
      { key: "skyGradient", label: "Sky Gradient" },
      { key: "sunGlow", label: "Sun Glow" },
      { key: "sunGlare", label: "Sun Glare" },
      { key: "cloudLight", label: "Cloud Light" },
      { key: "cloudDark", label: "Cloud Dark" },
    ],
    title: "Sky",
  },
];

function isSlider(item: ColorDef | SliderDef): item is SliderDef {
  return "min" in item;
}

const panelBaseStyle: React.CSSProperties = {
  background: "rgba(0,0,0,0.75)",
  borderRadius: 8,
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  fontFamily: "monospace",
  fontSize: 11,
  gap: 4,
  maxHeight: "calc(100vh - 24px)",
  overflowY: "auto",
  padding: 12,
  position: "fixed",
  width: 310,
  zIndex: 9999,
};

const sectionTitleStyle: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.2)",
  fontSize: 10,
  letterSpacing: 1,
  marginTop: 6,
  opacity: 0.6,
  paddingBottom: 2,
  textTransform: "uppercase",
};

const btnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.15)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: 4,
  color: "#fff",
  cursor: "pointer",
  fontSize: 11,
  padding: "4px 8px",
};

function ControlPanel({
  controls,
  onChange,
}: {
  controls: Controls;
  onChange: (c: Controls) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [pos, setPos] = useState({ x: -1, y: 12 });
  const dragRef = useRef<{
    originX: number;
    originY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Initialize position to top-right on mount
  useEffect(() => {
    if (pos.x === -1) {
      setPos({ x: window.innerWidth - 310 - 12, y: 12 });
    }
  }, [pos.x]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPos({
        x: dragRef.current.originX + dx,
        y: dragRef.current.originY + dy,
      });
    };
    const onMouseUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const onDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      originX: pos.x,
      originY: pos.y,
      startX: e.clientX,
      startY: e.clientY,
    };
  };

  const copySettings = () => {
    const settings = JSON.stringify(controls, null, 2);
    navigator.clipboard.writeText(settings).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      ref={panelRef}
      style={{
        ...panelBaseStyle,
        left: pos.x,
        top: pos.y,
        width: collapsed ? "auto" : 310,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 8,
          userSelect: "none",
        }}
      >
        <div
          onMouseDown={onDragStart}
          style={{
            cursor: "grab",
            flex: 1,
            fontSize: 10,
            letterSpacing: 1,
            opacity: 0.5,
            textTransform: "uppercase",
          }}
        >
          ⠿ {collapsed ? "Dev" : "drag to move"}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            ...btnStyle,
            fontSize: 10,
            lineHeight: 1,
            padding: "2px 6px",
          }}
          type="button"
        >
          {collapsed ? "+" : "−"}
        </button>
      </div>
      {!collapsed && (
        <>
          <label style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <input
              checked={controls.asciiEnabled}
              onChange={(e) =>
                onChange({ ...controls, asciiEnabled: e.target.checked })
              }
              type="checkbox"
            />
            <span>ASCII Mode</span>
          </label>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <div style={sectionTitleStyle}>{section.title}</div>
              {section.title === "Sky" && (
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {SKY_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() =>
                        onChange({
                          ...controls,
                          cloudDark: preset.cloudDark,
                          cloudLight: preset.cloudLight,
                          skyBase: preset.skyBase,
                          skyGradient: preset.skyGradient,
                          sunAngle: preset.sunAngle,
                          sunGlare: preset.sunGlare,
                          sunGlow: preset.sunGlow,
                        })
                      }
                      style={btnStyle}
                      type="button"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
              {section.items.map((item) => {
                if (isSlider(item)) {
                  const decimals = item.decimals ?? 2;
                  return (
                    <label
                      key={item.key}
                      style={{
                        alignItems: "center",
                        display: "flex",
                        gap: 8,
                        marginTop: 4,
                      }}
                    >
                      <span style={{ width: 80 }}>{item.label}</span>
                      <input
                        max={item.max}
                        min={item.min}
                        onChange={(e) =>
                          onChange({
                            ...controls,
                            [item.key]: parseFloat(e.target.value),
                          })
                        }
                        step={item.step}
                        style={{ flex: 1 }}
                        type="range"
                        value={controls[item.key] as number}
                      />
                      <span style={{ textAlign: "right", width: 40 }}>
                        {(controls[item.key] as number).toFixed(decimals)}
                      </span>
                    </label>
                  );
                }
                return (
                  <label
                    key={item.key}
                    style={{
                      alignItems: "center",
                      display: "flex",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <span style={{ width: 80 }}>{item.label}</span>
                    <input
                      onChange={(e) =>
                        onChange({ ...controls, [item.key]: e.target.value })
                      }
                      style={{
                        background: "none",
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: 4,
                        cursor: "pointer",
                        height: 24,
                        padding: 0,
                        width: 32,
                      }}
                      type="color"
                      value={controls[item.key] as string}
                    />
                    <span style={{ opacity: 0.6 }}>
                      {controls[item.key] as string}
                    </span>
                  </label>
                );
              })}
            </div>
          ))}

          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 8,
            }}
          >
            <button
              onClick={() => onChange({ ...DEFAULTS })}
              style={btnStyle}
              type="button"
            >
              Reset
            </button>
            <button onClick={copySettings} style={btnStyle} type="button">
              {copied ? "Copied!" : "Copy Settings"}
            </button>
            <button
              onClick={() => setShowPaste(!showPaste)}
              style={btnStyle}
              type="button"
            >
              Paste
            </button>
          </div>
          {showPaste && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                marginTop: 4,
              }}
            >
              <textarea
                onChange={(e) => setPasteValue(e.target.value)}
                placeholder="Paste JSON settings here..."
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 4,
                  color: "#fff",
                  fontFamily: "monospace",
                  fontSize: 10,
                  minHeight: 60,
                  padding: 6,
                  resize: "vertical",
                }}
                value={pasteValue}
              />
              {pasteError && (
                <span style={{ color: "#ff6666", fontSize: 10 }}>
                  {pasteError}
                </span>
              )}
              <button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(pasteValue);
                    onChange({ ...controls, ...parsed });
                    setPasteError("");
                    setShowPaste(false);
                    setPasteValue("");
                  } catch {
                    setPasteError("Invalid JSON");
                  }
                }}
                style={btnStyle}
                type="button"
              >
                Apply
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function VolumetricClouds({
  className,
  scrollProgress = 0,
}: {
  className?: string;
  scrollProgress?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<Controls>({ ...DEFAULTS });
  const scrollRef = useRef(scrollProgress);
  const [controls, setControls] = useState<Controls>({ ...DEFAULTS });

  scrollRef.current = scrollProgress;

  controlsRef.current = controls;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    // Pass 1: volumetric clouds
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

    // Pass 2: ASCII glyph post-process
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
      sceneTex: gl.getUniformLocation(glyphProgram, "u_sceneTex"),
    };

    // Shared quad
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

    // Framebuffer for pass 1 output
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

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      const width = Math.floor(rect.width * dpr);
      const height = Math.floor(rect.height * dpr);
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width;
        canvas!.height = height;
      }
    }

    resize();

    let time = 0;
    let lastTime = 0;
    let animationFrameId: number;

    function render(currentTime: number) {
      const c = controlsRef.current;
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      time += deltaTime * c.timeSpeed;

      resize();

      const w = canvas!.width;
      const h = canvas!.height;

      gl!.bindVertexArray(quadVAO);

      if (c.asciiEnabled) {
        ensureFBO(w, h);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      } else {
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      }

      gl!.viewport(0, 0, w, h);
      gl!.useProgram(cloudsProgram);
      gl!.uniform1f(cloudsU.time, time);
      gl!.uniform2f(cloudsU.resolution, w, h);
      gl!.uniform1f(cloudsU.coverage, c.coverage);
      const sp = scrollRef.current;
      gl!.uniform1f(cloudsU.cloudHeight, c.cloudHeight + sp * 0.5);
      const scrollCamElevation = 0.2 + sp * 0.2;
      gl!.uniform1f(cloudsU.camElevation, scrollCamElevation);
      const scrollCamDistance = 5.0 - sp * 3.0;
      gl!.uniform1f(cloudsU.camDistance, scrollCamDistance);
      gl!.uniform1f(cloudsU.sunAngle, c.sunAngle);
      gl!.uniform1f(cloudsU.density, c.density);
      const skyB = hexToRgb(c.skyBase);
      const skyG = hexToRgb(c.skyGradient);
      const sunGl = hexToRgb(c.sunGlow);
      const sunGr = hexToRgb(c.sunGlare);
      const clL = hexToRgb(c.cloudLight);
      const clD = hexToRgb(c.cloudDark);
      gl!.uniform3f(cloudsU.skyBase, skyB[0], skyB[1], skyB[2]);
      gl!.uniform3f(cloudsU.skyGradient, skyG[0], skyG[1], skyG[2]);
      gl!.uniform3f(cloudsU.sunGlow, sunGl[0], sunGl[1], sunGl[2]);
      gl!.uniform3f(cloudsU.sunGlare, sunGr[0], sunGr[1], sunGr[2]);
      gl!.uniform3f(cloudsU.cloudLight, clL[0], clL[1], clL[2]);
      gl!.uniform3f(cloudsU.cloudDark, clD[0], clD[1], clD[2]);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, noiseTex);
      gl!.uniform1i(cloudsU.noiseTex, 0);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);

      if (c.asciiEnabled) {
        const bg = hexToRgb(c.bgColor);
        const fg = hexToRgb(c.glyphColor);

        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
        gl!.viewport(0, 0, w, h);
        gl!.useProgram(glyphProgram);
        gl!.activeTexture(gl!.TEXTURE0);
        gl!.bindTexture(gl!.TEXTURE_2D, sceneTex);
        gl!.uniform1i(glyphU.sceneTex, 0);
        gl!.uniform2f(glyphU.resolution, w, h);
        gl!.uniform1f(
          glyphU.cellSize,
          c.cellSize * (window.devicePixelRatio || 1),
        );
        gl!.uniform1f(glyphU.saturation, c.saturation);
        gl!.uniform1f(glyphU.contrast, c.contrast);
        gl!.uniform1f(glyphU.brightness, c.brightness);
        gl!.uniform3f(glyphU.bgColor, bg[0], bg[1], bg[2]);
        gl!.uniform3f(glyphU.glyphColor, fg[0], fg[1], fg[2]);
        gl!.uniform1f(glyphU.colorMix, c.colorMix);
        gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      }

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
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
          opacity: scrollProgress < 0.9 ? 1 : 1 - (scrollProgress - 0.9) / 0.1,
          width: "100%",
        }}
      />
      {typeof document !== "undefined" &&
        createPortal(
          <ControlPanel controls={controls} onChange={setControls} />,
          document.body,
        )}
    </div>
  );
}
