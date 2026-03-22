import React, { useEffect, useRef, useState } from "react";
import { type Controls, DEFAULTS, SKY_PRESETS } from "./controls";

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
      { key: "camElevation", label: "Elevation", max: 1.5, min: -0.5, step: 0.05 },
      { key: "camDistance", label: "Distance", max: 8.0, min: 1.0, step: 0.1 },
      { key: "sunAngle", label: "Sun Angle", max: 3.14, min: -3.14, step: 0.05 },
    ],
    title: "Camera & Light",
  },
  {
    items: [
      { decimals: 0, key: "cellSize", label: "Cell Size", max: 32.0, min: 4.0, step: 1.0 },
    ],
    title: "ASCII",
  },
  {
    items: [
      { key: "brightness", label: "Brightness", max: 0.5, min: -0.5, step: 0.01 },
      { key: "contrast", label: "Contrast", max: 3.0, min: 0.1, step: 0.05 },
      { key: "saturation", label: "Saturation", max: 2.0, min: 0.0, step: 0.05 },
      { key: "colorMix", label: "Color Mix", max: 1.0, min: 0.0, step: 0.05 },
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

export default function ControlPanel({
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

  useEffect(() => {
    if (pos.x === -1) {
      setPos({ x: window.innerWidth - 310 - 12, y: 12 });
    }
  }, [pos.x]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      setPos({
        x: dragRef.current.originX + (e.clientX - dragRef.current.startX),
        y: dragRef.current.originY + (e.clientY - dragRef.current.startY),
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

          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
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
