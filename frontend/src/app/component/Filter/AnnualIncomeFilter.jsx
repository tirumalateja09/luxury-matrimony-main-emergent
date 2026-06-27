import React from "react";
import BaseListFilter from "./BaseListFilter";
import { INCOME_SLABS } from "@/lib/constants";

const AnnualIncomeFilter = ({ value, onChange }) => {
  const handleToggle = (opt) => {
    if (value === opt) onChange("");
    else onChange(opt);
  };

  return (
    <BaseListFilter
      options={INCOME_SLABS}
      selectedValues={value ? [value] : []}
      onChange={handleToggle}
      singleSelect
      placeholder="Search Income"
    />
  );
};

export default AnnualIncomeFilter;
