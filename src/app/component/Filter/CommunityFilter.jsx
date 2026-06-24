import React from "react";
import BaseListFilter from "./BaseListFilter";
import { allCommunities } from "@/lib/constants";

const CommunityFilter = ({ value, onChange }) => {
  const handleToggle = (opt) => {
    if (value === opt) onChange("");
    else onChange(opt);
  };

  return (
    <BaseListFilter
      options={allCommunities}
      selectedValues={value ? [value] : []}
      onChange={handleToggle}
      singleSelect
      placeholder="Search Community"
    />
  );
};

export default CommunityFilter;
