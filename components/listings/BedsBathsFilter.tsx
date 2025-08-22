import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BedDouble, Bath } from "lucide-react";

interface BedsBathsFilterProps {
  bedrooms: number;
  bathrooms: number;
  onChange: (bedrooms: number, bathrooms: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BedsBathsFilter({
  bedrooms,
  bathrooms,
  onChange,
  isOpen,
  onOpenChange,
}: BedsBathsFilterProps) {
  const [localBedrooms, setLocalBedrooms] = useState(bedrooms);
  const [localBathrooms, setLocalBathrooms] = useState(bathrooms);

  const handleDone = () => {
    onChange(localBedrooms, localBathrooms);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalBedrooms(0);
    setLocalBathrooms(0);
  };

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="bg-white rounded-full px-4 py-2 text-gray-700 focus:ring-2 focus:ring-[#0000bf]  w-full lg:w-[130px]"
        >
          <span className="text-gray-500 text-sm font-medium tracking-tight">
            Beds/Baths
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
      <PopoverContent className="w-80 p-6 rounded-2xl border border-[#bfc6f7] shadow-lg z-[99999]">
        <div className="text-[#0a0039] font-medium text-small mb-2">
          Enter the number of preferred
          <br />
          Beds/Baths:
        </div>
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <BedDouble className="text-[#bfc6f7] w-6 h-6" />
            <span className="text-gray-500 font-medium flex-1">Bedrooms</span>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-[#4b53e7] text-white w-8 h-8"
              onClick={() => setLocalBedrooms(Math.max(0, localBedrooms - 1))}
            >
              -
            </Button>
            <span className="bg-[#f7f8fd] border border-[#bfc6f7]  rounded-full px-2 py-1 text-[#bfc6f7] font-semibold w-12 text-center">
              {pad(localBedrooms)}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-[#4b53e7] text-white w-8 h-8"
              onClick={() => setLocalBedrooms(localBedrooms + 1)}
            >
              +
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Bath className="text-[#bfc6f7] w-6 h-6" />
            <span className="text-gray-500 font-medium flex-1">Bathrooms</span>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-[#4b53e7] text-white w-8 h-8"
              onClick={() => setLocalBathrooms(Math.max(0, localBathrooms - 1))}
            >
              -
            </Button>
            <span className="bg-[#f7f8fd] border border-[#bfc6f7] rounded-full px-2 py-1 text-[#bfc6f7] font-semibold w-12 text-center">
              {pad(localBathrooms)}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-[#4b53e7] text-white w-8 h-8"
              onClick={() => setLocalBathrooms(localBathrooms + 1)}
            >
              +
            </Button>
          </div>
        </div>
        <div className="flex justify-between">
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
