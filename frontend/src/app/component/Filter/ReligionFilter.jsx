import React from "react";
import BaseListFilter from "./BaseListFilter";
import { RELIGION_OPTIONS } from "@/lib/constants";

const ReligionFilter = ({ value, onChange }) => {
  const handleToggle = (opt) => {
    if (value === opt) onChange("");
    else onChange(opt);
  };

  return (
    <BaseListFilter
      options={RELIGION_OPTIONS}
      selectedValues={value ? [value] : []}
      onChange={handleToggle}
      singleSelect
      placeholder="Search Religion"
    />
  );
};
export default ReligionFilter;
