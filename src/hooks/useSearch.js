// hooks/useSearch.js

import { useState, useMemo } from "react";

const useSearch = (data, searchFields) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      searchFields.some((field) =>
        item[field]
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
  };
};

export default useSearch;   // 🔥 THIS WAS MISSING