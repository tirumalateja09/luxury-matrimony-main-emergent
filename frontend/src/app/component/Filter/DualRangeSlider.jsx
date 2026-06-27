import React, { useEffect, useRef } from "react";

const DualRangeSlider = ({ min, max, value, onChange }) => {
  const [minVal, maxVal] = value;
  const range = useRef(null);

  const getPercent = (v) => ((v - min) / (max - min)) * 100;

  useEffect(() => {
    const minP = getPercent(minVal);
    const maxP = getPercent(maxVal);

    if (range.current) {
      range.current.style.left = `calc(${minP}% )`;
      range.current.style.width = `calc(${maxP - minP}% )`;
    }
  }, [minVal, maxVal, min, max]);

  return (
    <div className="w-full px-4 py-6 flex justify-center">
      <div className="relative w-full max-w-xl h-8">

        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-300 rounded-full -translate-y-1/2" />

        {/* Active Range */}
        <div
          ref={range}
          className="absolute top-1/2 h-1.5 bg-[#D4A03D] rounded-full -translate-y-1/2"
        />

        {/* Min */}
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), maxVal - 1);
            onChange([v, maxVal]);
          }}
          className="range-input z-20"
        />

        {/* Max */}
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), minVal + 1);
            onChange([minVal, v]);
          }}
          className="range-input z-30"
        />
      </div>

      <style jsx>{`
        .range-input {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          pointer-events: none;
          -webkit-appearance: none;
          background: transparent;
        }

        .range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: all;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #D4A03D;
          cursor: pointer;
          margin-top: -6px; /* PERFECT vertical center */
        }

        .range-input::-moz-range-thumb {
          pointer-events: all;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #D4A03D;
          cursor: pointer;
        }

        .range-input::-webkit-slider-runnable-track {
          height: 6px;
          background: transparent;
        }

        .range-input::-moz-range-track {
          height: 6px;
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default DualRangeSlider;
