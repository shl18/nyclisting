"use client";

import { useState, useEffect, useRef } from "react";
import Header from "./Header";
import SearchBar, { SearchFilters } from "./SearchBar";
import { Property } from "@/app/types";
import dynamic from "next/dynamic";
import PropertyList from "./PropertyList";
import L from "leaflet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import SortDropdown from "../profile/SortDropdown";
import { useRouter } from "next/navigation";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";
import { useAuth } from "@/lib/auth/AuthContext";

interface Listing {
  id: string;
  title: string;
  price: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  imageUrls: string[];
  listingUrl: string;
  city: string;
  source: "SPAREROOM" | "STREETEASY";
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  sqft?: number;
  createdAt: string;
  duplicatePrices?: Array<{
    price: number;
    address: string;
    url: string;
  }>;
  amenities?: string[];
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function PropertyExplorer() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [visibleProperties, setVisibleProperties] = useState<Property[]>([]);
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: "",
    noBrokerFee: false,
  });
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">(
    "newest"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const listingContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchListings();
    if (user) {
      fetchSavedListings();
    }
  }, [searchFilters, user, sortBy]);

  const fetchSavedListings = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/v0/saved-listings?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch saved listings");
      }
      const saved = await response.json();
      setFavorites(saved.map((item: any) => item.listingId));
    } catch (error) {
      console.error("Error fetching saved listings:", error);
    }
  };

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        limit: "1000", // Set a large limit to fetch all listings
        sort: sortBy,
      });

      if (searchFilters.search) {
        queryParams.append("search", searchFilters.search);
      }
      if (searchFilters.minPrice) {
        queryParams.append("minPrice", searchFilters.minPrice.toString());
      }
      if (searchFilters.maxPrice) {
        queryParams.append("maxPrice", searchFilters.maxPrice.toString());
      }
      if (searchFilters.bedrooms) {
        queryParams.append("bedrooms", searchFilters.bedrooms.toString());
      }
      if (searchFilters.bathrooms) {
        queryParams.append("bathrooms", searchFilters.bathrooms.toString());
      }
      if (searchFilters.source) {
        queryParams.append("source", searchFilters.source);
      }
      if (searchFilters.amenities && searchFilters.amenities.length > 0) {
        queryParams.append("amenities", searchFilters.amenities.join(","));
      }
      if (searchFilters.noBrokerFee) {
        queryParams.append("noBrokerFee", "true");
      }

      const response = await fetch(
        `/api/v0/listings?${queryParams.toString()}`
      );
      const data = await response.json();

      // Transform the listings data to match the Property type
      const transformedProperties = data.listings.map((listing: Listing) => ({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        address: listing.address,
        beds: listing.bedrooms,
        baths: listing.bathrooms,
        imageUrl: listing.imageUrls[0] || PLACEHOLDER_IMAGE_URL,
        neighborhood: listing.neighborhood || "Unknown",
        category: listing.source,
        hasWifi: false,
        listedTime: new Date(listing.createdAt).toLocaleDateString(),
        latitude: listing.latitude,
        longitude: listing.longitude,
        source: listing.source,
        duplicatePrices: listing.duplicatePrices,
        amenities: listing.amenities || [],
      }));

      setProperties(transformedProperties);
      setTotalProperties(data.total);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const response = await fetch("/api/v0/saved-listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          listingId: id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      const { saved } = await response.json();
      setFavorites((prev) =>
        saved ? [...prev, id] : prev.filter((item) => item !== id)
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const saveSearch = (searchQuery: string) => {
    if (!savedSearches.includes(searchQuery)) {
      setSavedSearches([...savedSearches, searchQuery]);
    }
  };

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as "newest" | "price_asc" | "price_desc");
  };

  // Handle map bounds changes
  const handleMapBoundsChange = (bounds: L.LatLngBounds) => {
    const filteredProperties = properties.filter((property) => {
      if (!property.latitude || !property.longitude) return false;
      return bounds.contains([property.latitude, property.longitude]);
    });
    setVisibleProperties(filteredProperties);
  };

  // Calculate paginated properties
  const paginatedProperties = (
    visibleProperties.length > 0 ? visibleProperties : properties
  ).slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(
    (visibleProperties.length > 0
      ? visibleProperties.length
      : properties.length) / pageSize
  );

  // Scroll to top on page change
  useEffect(() => {
    if (listingContainerRef.current) {
      listingContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [visibleProperties, properties]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="px-4 py-6 md:px-12 md:py-8 bg-[#f5f6fb]">
        <SearchBar onSaveSearch={saveSearch} onSearch={handleSearch} />
        <div className="mt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#121212]">
                New York, NYC{" "}
                <span className="text-[#0000bf]">properties for Rent</span>
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                ({totalProperties} found)
              </p>
            </div>
            <div className="hidden md:flex items-center mt-4 md:mt-0">
              <SortDropdown defaultValue={sortBy} onSort={setSortBy} />
            </div>
          </div>
        </div>

        {/* Mobile LIST/MAP toggle and Sort */}
        <div className="md:hidden flex items-center justify-between mt-4 mb-4">
          <div className="flex gap-2">
            <button
              className={`px-6 py-2 rounded-full font-bold border transition-colors text-sm ${
                mobileView === "list"
                  ? "bg-[#e6e8fa] text-[#0000bf] border-[#0000bf]"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              onClick={() => setMobileView("list")}
            >
              LIST
            </button>
            <button
              className={`px-6 py-2 rounded-full font-bold border transition-colors text-sm ${
                mobileView === "map"
                  ? "bg-[#e6e8fa] text-[#0000bf] border-[#0000bf]"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              onClick={() => setMobileView("map")}
            >
              MAP
            </button>
          </div>
          <div className="flex items-center">
            <SortDropdown defaultValue={sortBy} onSort={setSortBy} />
          </div>
        </div>

        <div className="bg-white shadow-md p-4 md:p-5 rounded-3xl">
          <div
            className={`flex flex-col lg:flex-row gap-6 mt-4 ${
              mobileView === "list" ? "md:flex-row" : ""
            }`}
          >
            {/* Mobile: MAP view, map above listing */}
            {mobileView === "map" && (
              <>
                <div className="block md:hidden w-full mb-4">
                  <MapView
                    properties={properties}
                    onBoundsChange={handleMapBoundsChange}
                  />
                </div>
                <div className="block md:hidden w-full">
                  <PropertyList
                    properties={
                      visibleProperties.length > 0
                        ? visibleProperties
                        : properties
                    }
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              </>
            )}
            {/* Desktop: keep map and listing side by side */}
            <>
              <div className="hidden md:block w-full lg:w-7/12 order-2 lg:order-1">
                <MapView
                  properties={properties}
                  onBoundsChange={handleMapBoundsChange}
                />
              </div>
              <div className="hidden md:block w-full lg:w-5/12 order-1 lg:order-2">
                <div ref={listingContainerRef}>
                  <PropertyList
                    properties={paginatedProperties}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              aria-disabled={currentPage === 1}
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage((p) =>
                                  Math.min(totalPages, p + 1)
                                )
                              }
                              aria-disabled={currentPage === totalPages}
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              </div>
            </>
            {/* Mobile: LIST view, only show listing */}
            {mobileView === "list" && (
              <div className="block md:hidden w-full">
                <div ref={listingContainerRef}>
                  <PropertyList
                    properties={paginatedProperties}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                              }
                              aria-disabled={currentPage === 1}
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage((p) =>
                                  Math.min(totalPages, p + 1)
                                )
                              }
                              aria-disabled={currentPage === totalPages}
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
