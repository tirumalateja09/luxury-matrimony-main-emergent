import React, { useMemo } from "react";
import BaseListFilter from "./BaseListFilter";
import { City } from "country-state-city";

const COUNTRY_CODE = "IN";

const CityFilter = ({ value, onChange, stateValue }) => {
  const cities = useMemo(() => {
    if (!stateValue) return [];
    return City.getCitiesOfState(COUNTRY_CODE, stateValue).map((c) => c.name);
  }, [stateValue]);

  if (!stateValue) {
    return (
      <div className="text-sm text-gray-500">
        Select a state first to see city options.
      </div>
    );
  }

  const handleToggle = (opt) => {
    if (value === opt) onChange("");
    else onChange(opt);
  };

  return (
    <BaseListFilter
      options={cities}
      selectedValues={value ? [value] : []}
      onChange={handleToggle}
      singleSelect
      placeholder="Search City"
    />
  );
};

export default CityFilter;
