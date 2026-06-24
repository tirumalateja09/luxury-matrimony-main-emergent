import React from "react";
import BaseListFilter from "./BaseListFilter";

const DIET_OPTIONS = ["Veg", "Non-Veg", "Jain", "Vegan"];

const DietFilter = ({ value, onChange }) => {
  const handleToggle = (opt) => {
    if (value === opt) onChange("");
    else onChange(opt);
  };

  return (
    <BaseListFilter
      options={DIET_OPTIONS}
      selectedValues={value ? [value] : []}
      onChange={handleToggle}
      singleSelect
      placeholder="Search Diet"
    />
  );
};

export default DietFilter;
