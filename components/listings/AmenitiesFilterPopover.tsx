import React, { useState, useEffect, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const icons: Record<string, React.ReactNode> = {
  Furnished: (
    <svg width="20" height="20" fill="none">
      <rect
        x="4"
        y="10"
        width="12"
        height="6"
        rx="2"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <rect
        x="7"
        y="6"
        width="6"
        height="4"
        rx="1"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="1"
      />
    </svg>
  ),
  Balcony: (
    <svg width="20" height="20" fill="none">
      <rect
        x="5"
        y="12"
        width="10"
        height="3"
        rx="1"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <rect
        x="7"
        y="7"
        width="6"
        height="5"
        rx="1"
        fill="#e6e8fa"
        stroke="#4b53e7"
        strokeWidth="1"
      />
    </svg>
  ),
  "Wheelchair access": (
    <svg width="20" height="20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="#4b53e7" strokeWidth="2" />
      <path d="M10 6v4l3 3" stroke="#bfc6f7" strokeWidth="2" />
      <circle cx="10" cy="6" r="1" fill="#bfc6f7" />
    </svg>
  ),
  "Living Room": (
    <svg width="20" height="20" fill="none">
      <rect
        x="5"
        y="10"
        width="10"
        height="5"
        rx="2"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <rect
        x="7"
        y="7"
        width="6"
        height="3"
        rx="1"
        fill="#e6e8fa"
        stroke="#4b53e7"
        strokeWidth="1"
      />
    </svg>
  ),
  Parking: (
    <svg width="20" height="20" fill="none">
      <rect
        x="4"
        y="10"
        width="12"
        height="5"
        rx="2"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <circle cx="7" cy="16" r="1" fill="#4b53e7" />
      <circle cx="13" cy="16" r="1" fill="#4b53e7" />
    </svg>
  ),
  Garage: (
    <svg width="20" height="20" fill="none">
      <rect
        x="4"
        y="10"
        width="12"
        height="5"
        rx="2"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <path d="M6 10v-3h8v3" stroke="#4b53e7" strokeWidth="2" />
    </svg>
  ),
  "Laundry in building": (
    <svg width="20" height="20" fill="none">
      <circle
        cx="7"
        cy="10"
        r="2"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <circle
        cx="13"
        cy="10"
        r="2"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <path d="M7 12v3M13 12v3" stroke="#4b53e7" strokeWidth="2" />
    </svg>
  ),
  "Live-in super": (
    <svg width="20" height="20" fill="none">
      <rect
        x="6"
        y="8"
        width="8"
        height="8"
        rx="1"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <circle cx="10" cy="6" r="2" fill="#4b53e7" />
    </svg>
  ),
  "Package room": (
    <svg width="20" height="20" fill="none">
      <rect
        x="5"
        y="8"
        width="10"
        height="8"
        rx="1"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <path d="M7 12h6M7 14h6" stroke="#4b53e7" strokeWidth="2" />
    </svg>
  ),
  "Storage space": (
    <svg width="20" height="20" fill="none">
      <rect
        x="5"
        y="8"
        width="10"
        height="8"
        rx="1"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <path d="M7 10h6M7 12h6M7 14h6" stroke="#4b53e7" strokeWidth="2" />
    </svg>
  ),
  "Locker/cage": (
    <svg width="20" height="20" fill="none">
      <rect
        x="5"
        y="8"
        width="10"
        height="8"
        rx="1"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <path d="M7 10h6M7 12h6" stroke="#4b53e7" strokeWidth="2" />
    </svg>
  ),
  "Bike room": (
    <svg width="20" height="20" fill="none">
      <rect
        x="5"
        y="8"
        width="10"
        height="8"
        rx="1"
        fill="#bfc6f7"
        stroke="#4b53e7"
        strokeWidth="2"
      />
      <circle cx="8" cy="12" r="1" fill="#4b53e7" />
      <circle cx="12" cy="12" r="1" fill="#4b53e7" />
    </svg>
  ),
};

const amenities = [
  { key: "Furnished", label: "Furnished" },
  { key: "Balcony", label: "Balcony" },
  { key: "Wheelchair access", label: "Disabled access" },
  { key: "Living Room", label: "Living Room" },
  { key: "Parking", label: "Parking" },
  { key: "Garage", label: "Garage" },
  { key: "Laundry in building", label: "Laundry" },
  { key: "Live-in super", label: "Live-in Super" },
  { key: "Package room", label: "Package Room" },
  { key: "Storage space", label: "Storage" },
  { key: "Locker/cage", label: "Locker/Cage" },
  { key: "Bike room", label: "Bike Room" },
];

interface AmenitiesFilterPopoverProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AmenitiesFilterPopover: React.FC<AmenitiesFilterPopoverProps> = ({
  selected,
  onChange,
  isOpen,
  onOpenChange,
}) => {
  const [localSelected, setLocalSelected] = useState<string[]>(selected);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalSelected(selected);
  }, [selected]);

  const handleToggle = useCallback((key: string) => {
    setLocalSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleReset = useCallback(() => {
    setLocalSelected([]);
    onChange([]);
  }, [onChange]);

  const handleDone = useCallback(() => {
    onChange(localSelected);
    onOpenChange(false);
  }, [localSelected, onChange, onOpenChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          setFocusedIndex((prev) =>
            prev < amenities.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowLeft":
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
        case " ":
          if (focusedIndex >= 0) {
            const key = amenities[focusedIndex].key;
            handleToggle(key);
          }
          break;
        case "Escape":
          onOpenChange(false);
          break;
      }
    },
    [focusedIndex, handleToggle, onOpenChange]
  );

  const selectedCount = localSelected.length;

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="bg-white rounded-full px-4 py-2 text-gray-700 focus:ring-2 focus:ring-[#0000bf]  w-full lg:w-[130px] relative"
        >
          <span className="text-gray-500 text-sm font-medium tracking-tight">
            Amenities
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
          {selectedCount > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-2 -right-2 bg-[#4b53e7] text-white text-xs"
            >
              {selectedCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-4 rounded-xl border border-[#bfc6f7] shadow-lg z-[99999]"
        onKeyDown={handleKeyDown}
      >
        {/* Amenities Section */}
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-[#00008b] mb-2">
            Amenities
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {amenities.map((a, index) => (
              <button
                key={a.key}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#4b53e7] hover:border-[#4b53e7] ${
                  localSelected.includes(a.key)
                    ? "border-[#4b53e7] bg-[#e6e8fa]"
                    : "border-[#bfc6f7] bg-white"
                } ${focusedIndex === index ? "ring-2 ring-[#4b53e7]" : ""}`}
                onClick={() => handleToggle(a.key)}
                onFocus={() => setFocusedIndex(index)}
                type="button"
                tabIndex={0}
                aria-pressed={localSelected.includes(a.key)}
              >
                <span className="mb-1">{icons[a.key]}</span>
                <span className="text-[10px] text-[#151371] font-medium text-center leading-tight break-words max-w-[60px]">
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-2 mt-2">
          <Button
            variant="outline"
            className="rounded-full border-[#bfc6f7] text-[#00008b] px-3 py-1 text-xs font-semibold"
            onClick={handleReset}
            disabled={selectedCount === 0}
          >
            Reset
          </Button>
          <Button
            className="rounded-full bg-[#00008b] text-white px-3 py-1 text-xs font-semibold"
            onClick={handleDone}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AmenitiesFilterPopover;
