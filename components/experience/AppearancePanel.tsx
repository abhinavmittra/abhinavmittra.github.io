"use client";
import { useState } from "react";
import type { Atmosphere } from "./types";
import type { DeskLook } from "./preferences";
import { coldBrew } from "@/content/cold-brew";
export interface AppearanceProps {
  atmosphere: Atmosphere;
  setAtmosphere: (value: Atmosphere) => void;
  motion: boolean;
  setMotion: (value: boolean) => void;
  look: DeskLook;
  onLook: (patch: Partial<DeskLook>) => void;
  onResetLook: () => void;
  onReplay: () => void;
}
export function AppearancePanel({
  atmosphere,
  setAtmosphere,
  motion,
  setMotion,
  look,
  onLook,
  onResetLook,
  onReplay,
}: AppearanceProps) {
  const [status, setStatus] = useState("");
  function save() {
    try {
      const key = "systems-desk-experience-v3";
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      localStorage.setItem(
        key,
        JSON.stringify({ ...saved, atmosphere, motion, look }),
      );
      setStatus("Saved in this browser.");
    } catch {
      setStatus(
        "This browser cannot save settings. You can export a copy below.",
      );
    }
  }
  function exportLook() {
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              name: "Abhinav Systems Desk",
              version: 3,
              atmosphere,
              motion,
              look,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "abhinav-desk-settings.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="appearance-controls">
      <fieldset>
        <legend>Atmosphere</legend>
        <div className="setting-options">
          {(["daylight", "studio", "dusk"] as const).map((value) => (
            <button
              className="action capitalize"
              aria-pressed={atmosphere === value}
              key={value}
              onClick={() => setAtmosphere(value)}
            >
              {value}
              <span aria-hidden="true">{atmosphere === value ? "✓" : ""}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Accent colour</legend>
        <div className="accent-options">
          {(["olive", "sand", "periwinkle"] as const).map((name) => (
            <button
              key={name}
              className="accent-choice capitalize"
              aria-pressed={look.accent === coldBrew.palette[name]}
              onClick={() => onLook({ accent: coldBrew.palette[name] })}
            >
              <i
                style={{ background: coldBrew.palette[name] }}
                aria-hidden="true"
              />
              {name}
              <span aria-hidden="true">
                {look.accent === coldBrew.palette[name] ? "✓" : ""}
              </span>
            </button>
          ))}
        </div>
        <label className="custom-accent">
          Pick your own
          <input
            type="color"
            aria-label="Custom accent colour"
            value={look.accent}
            onChange={(event) => onLook({ accent: event.target.value })}
          />
          <output>{look.accent.toUpperCase()}</output>
        </label>
      </fieldset>
      {(
        [
          { key: "light", label: "Studio light", min: 50, max: 160 },
          { key: "speed", label: "Animation speed", min: 20, max: 200 },
          { key: "separation", label: "Layer separation", min: 0, max: 100 },
        ] as const
      ).map(({ key, label, min, max }) => (
        <label className="setting-range" key={key} htmlFor={`desk-${key}`}>
          <span>
            {label}
            <output>
              {key === "speed"
                ? `${(look[key] / 100).toFixed(1)}×`
                : `${look[key]}%`}
            </output>
          </span>
          <input
            id={`desk-${key}`}
            type="range"
            min={min}
            max={max}
            value={look[key]}
            onChange={(event) => onLook({ [key]: Number(event.target.value) })}
          />
        </label>
      ))}
      <fieldset>
        <legend>Camera angle</legend>
        <div className="setting-options">
          {(
            [
              { value: "isometric", label: "Isometric" },
              { value: "overhead", label: "Overhead" },
              { value: "low", label: "Low angle" },
            ] as const
          ).map(({ value, label }) => (
            <button
              className="action"
              key={value}
              aria-pressed={look.angle === value}
              onClick={() => onLook({ angle: value })}
            >
              {label}
              <span aria-hidden="true">{look.angle === value ? "✓" : ""}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <label className="setting-switch">
        <span>
          Reduced motion<small>Keep interactions, soften movement.</small>
        </span>
        <input
          type="checkbox"
          checked={look.gentle}
          onChange={(event) => onLook({ gentle: event.target.checked })}
        />
      </label>
      <label className="setting-switch">
        Pause animation
        <input
          type="checkbox"
          checked={!motion}
          onChange={(event) => setMotion(!event.target.checked)}
        />
      </label>
      <button
        className="action"
        disabled={!motion || look.gentle}
        onClick={onReplay}
      >
        Replay arrival
      </button>
      <div className="settings-actions">
        <button className="action" onClick={save}>
          Save this look
        </button>
        <button className="action" onClick={exportLook}>
          Export settings ↗
        </button>
        <button
          className="text-link"
          onClick={() => {
            onResetLook();
            setStatus("Daylight defaults restored.");
          }}
        >
          Restore defaults
        </button>
      </div>
      <p className="muted" role="status">
        {status ||
          "Changes stay in this browser. Export settings to keep a copy."}
      </p>
    </div>
  );
}
