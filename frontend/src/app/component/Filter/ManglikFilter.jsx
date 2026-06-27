import React from "react";
import BaseListFilter from "./BaseListFilter";

const MANGILIK_OPTIONS = ["Yes", "No", "Anshik"];

const ManglikFilter = ({ value, onChange }) => {
  const handleToggle = (opt) => {
    if (value === opt) onChange("");
    else onChange(opt);
  };

  return (
    <BaseListFilter
      options={MANGILIK_OPTIONS}
      selectedValues={value ? [value] : []}
      onChange={handleToggle}
      singleSelect
      placeholder="Search Manglik"
    />
  );
};

export default ManglikFilter;
