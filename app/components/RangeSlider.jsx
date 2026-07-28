"use client";

export default function RangeSlider({ min, max, step = 1, valueMin, valueMax, onChange }) {
  function handleMinChange(e) {
    const v = Math.min(Number(e.target.value), valueMax - step);
    onChange(v, valueMax);
  }

  function handleMaxChange(e) {
    const v = Math.max(Number(e.target.value), valueMin + step);
    onChange(valueMin, v);
  }

  const THUMB = 20;
  const minPct = (valueMin - min) / (max - min);
  const maxPct = (valueMax - min) / (max - min);
  // Native range thumbs travel within [thumb/2, trackWidth - thumb/2], not [0, trackWidth],
  // so the fill needs the same inset correction to line up with the actual thumb centers.
  const fillLeft = `calc((100% - ${THUMB}px) * ${minPct} + ${THUMB / 2}px)`;
  const fillRight = `calc((100% - ${THUMB}px) * ${1 - maxPct} + ${THUMB / 2}px)`;

  return (
    <div className="range-slider">
      <div className="range-slider-track">
        <div
          className="range-slider-fill"
          style={{ left: fillLeft, right: fillRight }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={handleMinChange}
        aria-label="Minimum"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={handleMaxChange}
        aria-label="Maximum"
      />
    </div>
  );
}
