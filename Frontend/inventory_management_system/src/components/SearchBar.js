import React from "react";

export default function SearchBar({ onSearch, placeholder = "Search..." }) {
  return (
    <form
      className="d-flex align-items-center ms-auto"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        className="form-control me-2"
        type="search"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
      />
    </form>
  );
}
