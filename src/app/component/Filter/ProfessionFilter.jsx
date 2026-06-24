import React from "react";
import BaseListFilter from "./BaseListFilter";
import { PROFESSION_OPTIONS } from "@/lib/constants";

const ProfessionFilter = ({ value, onChange }) => {
  const handleToggle = (opt) => {
    if (value === opt) onChange("");
    else onChange(opt);
  };

  return (
    <BaseListFilter
      options={PROFESSION_OPTIONS}
      selectedValues={value ? [value] : []}
      onChange={handleToggle}
      singleSelect
      placeholder="Search Profession"
    />
  );
};

export default ProfessionFilter;
