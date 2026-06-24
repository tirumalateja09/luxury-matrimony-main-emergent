import React from "react";
import BaseListFilter from "./BaseListFilter";
import { allTongues } from "@/lib/constants";

const MotherTongueFilter = ({ value, onChange }) => {
  const handleToggle = (opt) => {
    if (value === opt) onChange("");
    else onChange(opt);
  };

  return (
    <BaseListFilter
      options={allTongues}
      selectedValues={value ? [value] : []}
      onChange={handleToggle}
      singleSelect
      placeholder="Search Mother Tongue"
    />
  );
};

export default MotherTongueFilter;
