import React, { useState } from "react";
import { ChevronDown, X, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface MobileFilterMenuProps {
  open: boolean;
  onClose: () => void;
  filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    source?: string;
    noBrokerFee: boolean;
    listingType?: string;
    amenities?: string[];
  };
  setFilters: (filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    source?: string;
    noBrokerFee?: boolean;
    listingType?: string;
    amenities?: string[];
  }) => void;
  onApply: () => void;
}

const amenitiesGroups = [
  {
    group: "Unit",
    info: "Amenities inside the apartment unit.",
    items: [
      { value: "Furnished", label: "Furnished" },
      { value: "Living Room", label: "Living Room" },
      { value: "Balcony", label: "Balcony" },
      { value: "Wheelchair access", label: "Disabled Access" },
    ],
  },
  {
    group: "Building",
    info: "Amenities available in the building.",
    items: [
      { value: "Parking", label: "Parking" },
      { value: "Garage", label: "Garage" },
      { value: "Laundry in building", label: "Laundry" },
      { value: "Live-in super", label: "Live-in Super" },
      { value: "Package room", label: "Package Room" },
      { value: "Storage space", label: "Storage" },
      { value: "Locker/cage", label: "Locker/Cage" },
      { value: "Bike room", label: "Bike Room" },
    ],
  },
];

function AccordionSection({
  title,
  open,
  onClick,
  children,
}: {
  title: string;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#e6e8fa]">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left text-base font-medium text-gray-800 focus:outline-none"
        onClick={onClick}
        type="button"
      >
        {title}
        <ChevronDown
          className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function MobileFilterMenu({
  open,
  onClose,
  filters,
  setFilters,
  onApply,
}: MobileFilterMenuProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-[9999] mt-[160px] mx-auto w-[calc(100%-32px)] max-w-[200px] bg-white rounded-xl shadow-xl border border-[#ecebfc] mr-4">
      <div className="flex flex-col overflow-hidden max-h-[calc(100vh-100px)] ">
        <div className="flex items-center justify-between p-3 sm:p-4 bg-[#ecebfc] rounded-t-xl border-b border-[#ecebfc]">
          <h2 className="text-base sm:text-lg font-bold text-[#151371]">
            Filters
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-0 pb-1 divide-y divide-[#ecebfc]">
          <AccordionSection
            title="Price"
            open={openSection === "price"}
            onClick={() =>
              setOpenSection(openSection === "price" ? null : "price")
            }
          >
            <div className="flex flex-col gap-1 px-3 sm:px-4 pt-1 pb-3">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Min Price
              </label>
              <input
                type="number"
                min={0}
                placeholder="Min"
                className="w-full border border-[#bfc6f7] rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#bfc6f7]"
                value={filters.minPrice ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    minPrice: value ? Number(value) : undefined,
                  });
                }}
              />
              <label className="text-xs sm:text-sm font-medium text-gray-700 mt-2">
                Max Price
              </label>
              <input
                type="number"
                min={0}
                placeholder="Max"
                className="w-full border border-[#bfc6f7] rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#bfc6f7]"
                value={filters.maxPrice ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    maxPrice: value ? Number(value) : undefined,
                  });
                }}
              />
            </div>
          </AccordionSection>
          <AccordionSection
            title="Beds/Baths"
            open={openSection === "beds"}
            onClick={() =>
              setOpenSection(openSection === "beds" ? null : "beds")
            }
          >
            <div className="flex flex-col gap-1 px-3 pt-1 pb-3">
              <label className="text-xs font-medium text-gray-700">
                Bedrooms
              </label>
              <input
                type="number"
                min={0}
                max={10}
                placeholder="Any"
                className="w-full border border-[#bfc6f7] rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-[#bfc6f7]"
                value={filters.bedrooms ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    bedrooms: value ? Number(value) : undefined,
                  });
                }}
              />
              <label className="text-xs font-medium text-gray-700 mt-2">
                Bathrooms
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                placeholder="Any"
                className="w-full border border-[#bfc6f7] rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-[#bfc6f7]"
                value={filters.bathrooms ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    bathrooms: value ? Number(value) : undefined,
                  });
                }}
              />
            </div>
          </AccordionSection>
          <AccordionSection
            title="Listing Type"
            open={openSection === "listingType"}
            onClick={() =>
              setOpenSection(
                openSection === "listingType" ? null : "listingType"
              )
            }
          >
            <div className="px-3 pt-1 pb-3">
              <div className="text-xs text-gray-500 font-medium mb-3">
                Select multiple types:
              </div>
              <div className="space-y-3">
                {[
                  { value: "roomshare", label: "Roomshare" },
                  { value: "rental", label: "Rental" },
                ].map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <span
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        filters.listingType === type.value
                          ? "border-[#4b53e7] bg-[#e6e8fa]"
                          : "border-[#bfc6f7] bg-white"
                      }`}
                    >
                      {filters.listingType === type.value && (
                        <span className="block w-3 h-3 rounded bg-[#4b53e7]" />
                      )}
                    </span>
                    <input
                      type="checkbox"
                      checked={filters.listingType === type.value}
                      onChange={() =>
                        setFilters({
                          ...filters,
                          listingType:
                            filters.listingType === type.value
                              ? ""
                              : type.value,
                        })
                      }
                      className="hidden"
                    />
                    <span className="text-gray-700 text-sm font-medium">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </AccordionSection>
          <AccordionSection
            title="Amenities"
            open={openSection === "amenities"}
            onClick={() =>
              setOpenSection(openSection === "amenities" ? null : "amenities")
            }
          >
            <div className="flex flex-col gap-2 px-3 pt-1 pb-3">
              {amenitiesGroups.map((group) => (
                <div key={group.group} className="mb-2">
                  <div className="flex items-center mb-1">
                    <span className="text-xs font-semibold text-[#151371] mr-1">
                      {group.group}
                    </span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-[#bfc6f7] cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        {group.info}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    {group.items.map((a) => (
                      <label
                        key={a.value}
                        className="flex items-center gap-1 py-1 text-[#151371] text-xs font-medium"
                      >
                        <Checkbox
                          checked={
                            Array.isArray(filters.amenities) &&
                            filters.amenities.includes(a.value)
                          }
                          onCheckedChange={(checked) => {
                            const currentAmenities = Array.isArray(
                              filters.amenities
                            )
                              ? [...filters.amenities]
                              : [];
                            if (checked) {
                              if (!currentAmenities.includes(a.value)) {
                                currentAmenities.push(a.value);
                              }
                            } else {
                              const index = currentAmenities.indexOf(a.value);
                              if (index > -1) {
                                currentAmenities.splice(index, 1);
                              }
                            }
                            setFilters({
                              ...filters,
                              amenities: currentAmenities,
                            });
                          }}
                          className="border-[#bfc6f7] data-[state=checked]:bg-[#bfc6f7] data-[state=checked]:border-[#bfc6f7] h-4 w-4"
                        />
                        <span>{a.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>
          <div className="px-3 py-2 bg-white">
            <div className="flex items-center gap-2">
              <Checkbox
                id="noBrokerFeeMobile"
                checked={filters.noBrokerFee}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, noBrokerFee: checked as boolean })
                }
                className="border-[#bfc6f7] data-[state=checked]:bg-[#bfc6f7] data-[state=checked]:border-[#bfc6f7] h-4 w-4"
              />
              <label
                htmlFor="noBrokerFeeMobile"
                className="text-gray-700 text-xs font-medium"
              >
                No Broker Fee
              </label>
            </div>
          </div>
        </div>
        <div className="p-3 bg-[#ecebfc] rounded-b-xl">
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="w-full bg-[#0000bf] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#00008b] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileFilterMenu;
