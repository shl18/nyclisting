"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import PriceRangeFilter from "./PriceRangeFilter";
import BedsBathsFilter from "./BedsBathsFilter";
import MobileFilterMenu from "./MobileFilterMenu";
import AmenitiesFilterPopover from "./AmenitiesFilterPopover";
import ListingTypeFilter from "./ListingTypeFilter";

interface SearchBarProps {
  onSaveSearch: (query: string) => void;
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  search: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  source?: "SPAREROOM" | "STREETEASY";
  noBrokerFee: boolean;
  listingType?: "roomshare" | "rental";
  amenities?: string[];
}

export default function SearchBar({ onSaveSearch, onSearch }: SearchBarProps) {
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(0);
  const [source, setSource] = useState<"SPAREROOM" | "STREETEASY" | "">("");
  const [noBrokerFee, setNoBrokerFee] = useState(false);
  const [listingType, setListingType] = useState<"roomshare" | "rental" | "">(
    ""
  );
  const [amenities, setAmenities] = useState<string[]>([]);

  // Only one popover open at a time
  const [openPopover, setOpenPopover] = useState<
    null | "price" | "bedsBaths" | "amenities" | "listingType"
  >(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = () => {
    const filters: SearchFilters = {
      search,
      noBrokerFee,
      bedrooms,
      bathrooms,
      amenities: amenities.length > 0 ? amenities : undefined,
    };

    if (priceMin) filters.minPrice = parseInt(priceMin);
    if (priceMax) filters.maxPrice = parseInt(priceMax);
    if (source) filters.source = source as "SPAREROOM" | "STREETEASY";
    if (listingType) {
      filters.listingType = listingType as "roomshare" | "rental";
      // Map listing type to source
      if (listingType === "roomshare") {
        filters.source = "SPAREROOM";
      } else if (listingType === "rental") {
        filters.source = "STREETEASY";
      }
    }

    onSearch(filters);
  };

  const handleSaveSearch = () => {
    const query = `${search} - Price: $${priceMin || "0"}-${
      priceMax || "Any"
    } ${noBrokerFee ? "- No Broker Fee" : ""} ${
      listingType ? `- ${listingType}` : ""
    }`;
    onSaveSearch(query);
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-[100vw] overflow-hidden">
      {/* Mobile: search bar row */}
      <div className="flex md:hidden items-center bg-[#e6e8fa] rounded-full px-2 sm:px-3 py-2 sm:py-2.5 gap-1.5 sm:gap-2 w-full">
        <input
          type="text"
          placeholder="Search for - City, state, zipcode"
          className="flex-1 min-w-0 bg-transparent outline-none border-none text-gray-700 placeholder:text-gray-500 text-sm sm:text-base px-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div className="relative flex items-center flex-shrink-0">
          <button
            className="flex items-center justify-center rounded-full bg-white p-1.5 sm:p-2 shadow-md"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open filters"
          >
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-[#0000bf]" />
          </button>
          <MobileFilterMenu
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            filters={{
              search,
              minPrice: priceMin ? parseInt(priceMin) : undefined,
              maxPrice: priceMax ? parseInt(priceMax) : undefined,
              bedrooms,
              bathrooms,
              source: source || undefined,
              noBrokerFee,
              listingType: listingType || undefined,
              amenities: amenities.length > 0 ? amenities : undefined,
            }}
            setFilters={({
              minPrice,
              maxPrice,
              bedrooms,
              bathrooms,
              source,
              noBrokerFee,
              listingType,
              amenities,
            }: {
              minPrice?: number;
              maxPrice?: number;
              bedrooms?: number;
              bathrooms?: number;
              source?: string;
              noBrokerFee?: boolean;
              listingType?: string;
              amenities?: string[];
            }) => {
              setPriceMin(minPrice ? String(minPrice) : "");
              setPriceMax(maxPrice ? String(maxPrice) : "");
              setBedrooms(bedrooms || 0);
              setBathrooms(bathrooms || 0);
              setSource((source || "") as "" | "SPAREROOM" | "STREETEASY");
              setNoBrokerFee(!!noBrokerFee);
              setListingType(
                (listingType || "") as "" | "roomshare" | "rental"
              );
              setAmenities(amenities || []);
            }}
            onApply={handleSearch}
          />
        </div>
        <button
          onClick={handleSearch}
          className="flex items-center justify-center bg-[#0000bf] text-white font-bold rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base flex-shrink-0"
        >
          Search
        </button>
      </div>
      {/* Desktop: original search bar and filters */}
      <div className="hidden md:flex flex-col lg:flex-row items-center bg-[#f5f6fb] rounded-full px-4 py-3 gap-3 w-full">
        <div className="flex items-center flex-1 max-w-md bg-[#e6e8fa] rounded-full px-4 py-3  w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-white rounded-full px-26 py-2  w-full lg:w-auto mr-6">
            <input
              type="text"
              placeholder="Search for - City, state"
              className="bg-transparent outline-none border-none flex-1 text-gray-700 placeholder:text-gray-500 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Search
            className="text-[#5f61e6] w-4 h-4 sm:w-5 sm:h-5 mr-2"
            onClick={handleSearch}
          />
        </div>

        <div className="flex items-center gap-2 bg-[#e6e8fa] rounded-full px-4 py-2 w-full">
          <div className="flex px-5 py-1 gap-2">
            <PriceRangeFilter
              minPrice={priceMin}
              maxPrice={priceMax}
              onMinPriceChange={setPriceMin}
              onMaxPriceChange={setPriceMax}
              isOpen={openPopover === "price"}
              onOpenChange={(open) => setOpenPopover(open ? "price" : null)}
            />
            <BedsBathsFilter
              bedrooms={bedrooms}
              bathrooms={bathrooms}
              onChange={(b, ba) => {
                setBedrooms(b);
                setBathrooms(ba);
              }}
              isOpen={openPopover === "bedsBaths"}
              onOpenChange={(open) => setOpenPopover(open ? "bedsBaths" : null)}
            />
            <AmenitiesFilterPopover
              selected={amenities}
              onChange={setAmenities}
              isOpen={openPopover === "amenities"}
              onOpenChange={(open) => setOpenPopover(open ? "amenities" : null)}
            />
            <ListingTypeFilter
              options={[
                { label: "Roomshare", value: "roomshare" },
                { label: "Rental", value: "rental" },
              ]}
              selected={listingType ? [listingType] : []}
              onChange={(selected) => {
                const allowed: ("roomshare" | "rental" | "")[] = [
                  "roomshare",
                  "rental",
                  "",
                ];
                const value = selected[0];
                setListingType(
                  allowed.includes(value as any) ? (value as any) : ""
                );
              }}
              isOpen={openPopover === "listingType"}
              onOpenChange={(open) =>
                setOpenPopover(open ? "listingType" : null)
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="noBrokerFee"
              checked={noBrokerFee}
              onCheckedChange={(checked) => setNoBrokerFee(checked as boolean)}
              className="border-gray-300 bg-white"
            />
            <label
              htmlFor="noBrokerFee"
              className="text-sm text-gray-700 cursor-pointer"
            >
              No Fees
            </label>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="bg-[#0000bf] text-white rounded-full px-6 py-4 ml-4 hover:bg-[#00008b] transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
}
