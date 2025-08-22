import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortValue = "newest" | "price_asc" | "price_desc";

interface SortDropdownProps {
  defaultValue: SortValue;
  onSort: (value: SortValue) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  defaultValue,
  onSort,
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 w-auto">
      <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
        Sort:
      </span>
      <Select defaultValue={defaultValue} onValueChange={onSort}>
        <SelectTrigger className="w-[110px] sm:w-[130px] border-1 border-indigo-300 focus:ring-0 text-xs sm:text-sm h-8 sm:h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          position="popper"
          sideOffset={4}
          className="z-[9999] w-[110px] sm:w-[130px]"
        >
          <SelectItem value="newest" className="text-xs sm:text-sm">
            Newest
          </SelectItem>
          <SelectItem value="price_asc" className="text-xs sm:text-sm">
            Price: Low to High
          </SelectItem>
          <SelectItem value="price_desc" className="text-xs sm:text-sm">
            Price: High to Low
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortDropdown;
