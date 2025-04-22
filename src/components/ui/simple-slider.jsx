import React from "react";

export default function SimpleSlider({ min = 1, max = 5, step = 0.1, value, onChange, className }) {
  return (
    <div className={`w-full ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
        style={{
          WebkitAppearance: 'none',
          appearance: 'none'
        }}
      />
    </div>
  );
}