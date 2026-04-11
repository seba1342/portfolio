export interface Controls {
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

export const DEFAULTS: Controls = {
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

export type SkyPreset = {
  cloudDark: string;
  cloudLight: string;
  label: string;
  skyBase: string;
  skyGradient: string;
  sunAngle: number;
  sunGlare: string;
  sunGlow: string;
};

export const SKY_PRESETS: SkyPreset[] = [
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
