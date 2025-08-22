import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { useState } from "react";

interface PriceRangeFilterProps {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  isOpen,
  onOpenChange,
}: PriceRangeFilterProps) {
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [error, setError] = useState("");

  let displayText = "Price";
  if (minPrice && maxPrice) {
    displayText = `$${minPrice} - $${maxPrice}`;
  } else if (minPrice) {
    displayText = `From $${minPrice}`;
  } else if (maxPrice) {
    displayText = `Up to $${maxPrice}`;
  }

  const handleDone = () => {
    // Validate min is less than max if both are set
    if (
      localMinPrice &&
      localMaxPrice &&
      Number(localMinPrice) > Number(localMaxPrice)
    ) {
      setError("Min price must be less than max price");
      return;
    }
    setError("");
    onMinPriceChange(localMinPrice);
    onMaxPriceChange(localMaxPrice);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setError("");
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="bg-white  rounded-full px-4 py-2 text-gray-700 focus:ring-2 focus:ring-[#0000bf]  w-full lg:w-[130px]"
        >
          <span className="text-gray-500 text-sm font-medium tracking-tight">
            {displayText}
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
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-white p-6 w-auto flex flex-col items-center justify-center z-[99999] rounded-2xl border border-[#bfc6f7] shadow-lg">
        {" "}
        <div className="flex items-center gap-2 mb-4">
          <Input
            type="number"
            min={0}
            placeholder="Min Price"
            value={localMinPrice}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || Number(val) >= 0) {
                setLocalMinPrice(val);
                setError("");
              }
            }}
            className="rounded-full border border-[#bfc6f7] bg-[#f7f8fd] text-gray-700 text-center font-medium px-6 py-3 focus:ring-2 focus:ring-[#0000bf] focus:border-[#0000bf] w-32 shadow-none outline-none"
            style={{ boxShadow: "none" }}
          />
          <span className="font-meidum text-gray-500 text-lg">to</span>
          <Input
            type="number"
            min={0}
            placeholder="Max Price"
            value={localMaxPrice}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || Number(val) >= 0) {
                setLocalMaxPrice(val);
                setError("");
              }
            }}
            className="rounded-full border border-[#bfc6f7] bg-[#f7f8fd] text-gray-700 text-center font-medium px-6 py-3 focus:ring-2 focus:ring-[#0000bf] focus:border-[#0000bf] w-32 shadow-none outline-none"
            style={{ boxShadow: "none" }}
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            className="rounded-full border-[#bfc6f7] text-[#00008b] px-6"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            className="rounded-full bg-[#00008b] text-white px-6"
            onClick={handleDone}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
