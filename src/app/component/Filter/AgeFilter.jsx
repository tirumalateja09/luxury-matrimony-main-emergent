import React from "react";
import DualRangeSlider from "./DualRangeSlider";

const AgeFilter = ({ value, onChange }) => {
  const MIN = 21, MAX = 70;
  const current = value || [MIN, MAX];

  return (
    <div className="px-6 mt-4">
      <div className="flex justify-between mb-8">
        <Badge label="From" value={`${current[0]} Yrs`} />
        <Badge label="To" value={`${current[1]} Yrs`} />
      </div>
      <DualRangeSlider min={MIN} max={MAX} value={current} onChange={onChange} />
      <p className="text-center text-xs text-gray-400 mt-6">Select age range</p>
    </div>
  );
};

const Badge = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">{label}</span>
    <div className="bg-[#FFFBF7] border border-[#E8DCC6] text-[#4A2C2A] font-bold py-2 px-4 rounded-lg min-w-[90px] text-center">{value}</div>
  </div>
);

export default AgeFilter;
