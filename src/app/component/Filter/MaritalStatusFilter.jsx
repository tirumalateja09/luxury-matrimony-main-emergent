import React from "react";
import BaseListFilter from "./BaseListFilter";

const STATUS_OPTIONS = [
  "Never Married",
  "Awaiting Divorce",
  "Divorced",
  "Widowed",
  "Annulled",
];

const MaritalStatusFilter = ({ value, onChange }) => {
  const handleToggle = (opt) => {
    if (value === opt) onChange("");
    else onChange(opt);
  };

  return (
    <BaseListFilter
      options={STATUS_OPTIONS}
      selectedValues={value ? [value] : []}
      onChange={handleToggle}
      singleSelect
      placeholder="Search Status"
    />
  );
};
export default MaritalStatusFilter;
