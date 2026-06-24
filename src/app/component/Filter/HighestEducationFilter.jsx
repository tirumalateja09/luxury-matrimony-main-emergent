import React from "react";
import BaseListFilter from "./BaseListFilter";

const EDUCATION_OPTIONS = [
  "Doctorate",
  "Post graduate/Master's",
  "Graduate/Bachelor's",
  "Diploma/Certifications",
  "Class XII",
  "Class X or below",
];

const HighestEducationFilter = ({ value, onChange }) => {
  const handleToggle = (opt) => {
    if (value === opt) onChange("");
    else onChange(opt);
  };

  return (
    <BaseListFilter
      options={EDUCATION_OPTIONS}
      selectedValues={value ? [value] : []}
      onChange={handleToggle}
      singleSelect
      placeholder="Search Education"
    />
  );
};

export default HighestEducationFilter;
