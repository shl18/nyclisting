import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface ListingTypeFilterProps {
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ListingTypeFilter({
  options,
  selected,
  onChange,
  isOpen,
  onOpenChange,
}: ListingTypeFilterProps) {
  const [localSelected, setLocalSelected] = useState<string[]>(selected);

  const handleSelect = (value: string) => {
    setLocalSelected([value]);
  };

  const handleReset = () => setLocalSelected([]);
  const handleDone = () => {
    onChange(localSelected);
    onOpenChange(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="bg-white rounded-full px-4 py-2 text-gray-700 focus:ring-2 focus:ring-[#0000bf] w-full lg:w-auto"
        >
          <span className="text-gray-500 text-sm font-medium tracking-tight">
            Listing Type
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>{" "}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-4 rounded-xl border border-[#bfc6f7] shadow-lg z-[99999]">
        <div className="flex items-center mb-2">
          <span className="text-[#00008b] font-bold text-lg flex-1">
            Listing Type
          </span>
          <Info className="text-[#bfc6f7] w-4 h-4" />
        </div>
        <div className="text-gray-500 font-medium mb-2 text-xs">
          Select a type:
        </div>
        <div className="space-y-3 mb-4">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <span
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  localSelected.includes(opt.value)
                    ? "border-[#4b53e7] bg-[#e6e8fa]"
                    : "border-[#bfc6f7] bg-white"
                }`}
              >
                {localSelected.includes(opt.value) && (
                  <span className="block w-3.5 h-3.5 rounded-full bg-[#4b53e7]" />
                )}
              </span>
              <input
                type="radio"
                name="listingType"
                checked={localSelected.includes(opt.value)}
                onChange={() => handleSelect(opt.value)}
                className="hidden"
              />
              <span className="text-gray-500 text-base font-medium">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
        <div className="flex justify-between">
          <Button
            variant="outline"
            className="rounded-full border-[#bfc6f7] text-[#00008b] px-4 py-1 text-sm"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            className="rounded-full bg-[#00008b] text-white px-4 py-1 text-sm"
            onClick={handleDone}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
