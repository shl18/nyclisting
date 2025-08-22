import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder: string;
  onSearch: (query: string) => void;
}

const SearchBar = ({ placeholder, onSearch }: SearchBarProps) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative w-full bg-[#f5f5fe] rounded-full px-3 sm:px-4 py-2 flex items-center"
    >
      <Search
        className="text-[#5f61e6] w-4 h-4 sm:w-5 sm:h-5 mr-2"
        strokeWidth={2}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className="bg-transparent placeholder-gray-500 text-xs sm:text-sm w-full focus:outline-none"
      />
    </form>
  );
};

export default SearchBar;
