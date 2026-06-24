import React, { useMemo } from "react";
import BaseListFilter from "./BaseListFilter";
import { State } from "country-state-city";

const COUNTRY_CODE = "IN";

const StateFilter = ({ value, onChange }) => {
  const states = useMemo(
    () =>
      State.getStatesOfCountry(COUNTRY_CODE).map((s) => ({
        label: s.name,
        value: s.isoCode,
      })),
    [],
  );

  const handleToggle = (opt) => {
    if (value === opt) onChange("");
    else onChange(opt);
  };

  return (
    <BaseListFilter
      options={states}
      selectedValues={value ? [value] : []}
      onChange={handleToggle}
      singleSelect
      placeholder="Search State"
    />
  );
};

export default StateFilter;
