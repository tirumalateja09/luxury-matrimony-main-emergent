import React, { useState } from "react";
import { Search, Check, Lock } from "lucide-react";

const BaseListFilter = ({
  options,
  selectedValues = [],
  onChange,
  placeholder = "Search...",
  hasSearch = true,
  isPremium = false,
  singleSelect = false,
}) => {
  const [search, setSearch] = useState("");
  const filtered = options.filter(o => o.label ? o.label.toLowerCase().includes(search.toLowerCase()) : o.toLowerCase().includes(search.toLowerCase()));

  const toggle = (val) => {
    if (singleSelect) {
      onChange(selectedValues.includes(val) ? "" : val);
      return;
    }
    if (selectedValues.includes(val)) onChange(selectedValues.filter(i => i !== val));
    else onChange([...selectedValues, val]);
  };

  return (
    <div className="flex flex-col h-full">
      {hasSearch && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input type="text" placeholder={placeholder} value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-lg text-sm focus:border-[#D4A03D] outline-none" />
        </div>
      )}
      <div className="space-y-3 pb-20 overflow-y-auto">
        {filtered.map((opt, idx) => {
          // Handle both simple strings and objects with {label, locked}
          const label = opt.label || opt;
          const value = opt.value || label;
          const locked = opt.locked || false;
          
          return (
            <label key={idx} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${locked ? 'opacity-70 bg-gray-50' : 'hover:bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${selectedValues.includes(value) ? "text-[#4A2C2A] font-bold" : "text-gray-600"}`}>{label}</span>
                {(locked || isPremium) && <Lock size={12} className="text-[#D4A03D]" />}
              </div>
              
              {!locked && (
                <>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedValues.includes(value) ? "bg-[#D4A03D] border-[#D4A03D]" : "border-gray-300"}`}>
                    {selectedValues.includes(value) && <Check size={12} className="text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={selectedValues.includes(value)} onChange={() => toggle(value)} />
                </>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};
export default BaseListFilter;
