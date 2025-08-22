"use client";
import Breadcrumb from "@/components/profile/BreadCrumb";
import Pagination from "@/components/profile/Pagination";
import ProfileSidebar from "@/components/profile/ProfileSider";
import PropertyCard from "@/components/profile/PropertyCard";
import SearchBar from "@/components/profile/SearchBar";
import SortDropdown from "@/components/profile/SortDropdown";
import Navbar from "@/components/listings/Header";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import { Property } from "@/app/types";

interface SavedListing {
  id: string;
  listingId: string;
  savedAt: string;
  listing: {
    id: string;
    title: string;
    price: number;
    address: string;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    imageUrls: string[];
    supabaseImageUrls?: string[];
    city: string;
    neighborhood?: string;
  };
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">(
    "newest"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"saved" | "recent">("saved");
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const fetchSavedListings = async (userId: string) => {
    try {
      console.log("Fetching saved listings for user:", userId);
      const response = await fetch(`/api/v0/saved-listings?userId=${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch saved listings:", errorData);
        throw new Error(errorData.error || "Failed to fetch saved listings");
      }

      const saved = await response.json();
      console.log("Saved listings fetched:", saved.length);

      if (saved.length === 0) {
        console.log("No saved listings found");
        setSavedListings([]);
        return;
      }

      // Fetch full listing details for each saved listing in parallel
      console.log("Fetching full listing details in parallel...");
      const listingsWithDetails = await Promise.all(
        saved.map(async (savedListing: SavedListing) => {
          try {
            console.log(
              "Fetching details for listing:",
              savedListing.listingId
            );
            const { data: listing, error: listingError } = await supabase
              .from("listings")
              .select(
                `
                id,
                title,
                price,
                address,
                bedrooms,
                bathrooms,
                sqft,
                image_urls,
                city,
                neighborhood,
                source,
                created_at
              `
              )
              .eq("id", savedListing.listingId)
              .single();

            if (listingError) {
              console.error("Error fetching listing details:", listingError);
              return null;
            }

            if (!listing) {
              console.log("No listing found for ID:", savedListing.listingId);
              return null;
            }

            // Debug logging for raw database response
            console.log("Raw database response:", listing);

            // Ensure we have arrays for image URLs
            const imageUrls = Array.isArray(listing.image_urls)
              ? listing.image_urls
              : [];

            // Debug logging for image URLs
            console.log("Processed image URLs:", {
              listingId: listing.id,
              imageUrls,
              hasImageUrls: imageUrls.length > 0,
              firstImageUrl: imageUrls[0],
            });

            // Get the first valid image URL from either array
            const validImageUrl = [
              ...(savedListing.listing.supabaseImageUrls || []),
              ...imageUrls,
            ].find((url) => {
              if (!url) return false;
              try {
                new URL(url);
                return true;
              } catch {
                return false;
              }
            });

            console.log("Selected image URL:", validImageUrl);

            return {
              ...savedListing,
              listing: {
                ...listing,
                // Use the valid image URL if found, otherwise null
                imageUrls: validImageUrl ? [validImageUrl] : [],
                supabaseImageUrls: savedListing.listing.supabaseImageUrls || [],
              },
            };
          } catch (err) {
            console.error(
              "Error processing listing:",
              savedListing.listingId,
              err
            );
            return null;
          }
        })
      );

      const filteredListings = listingsWithDetails.filter(Boolean);
      console.log(
        "All listing details fetched successfully. Total listings:",
        filteredListings.length
      );
      setSavedListings(filteredListings);
    } catch (err) {
      console.error("Error in fetchSavedListings:", err);
      setError("Failed to load saved listings");
      toast({
        title: "Error",
        variant: "destructive",
        children: "Failed to load saved listings. Please try again.",
      });
      throw err;
    }
  };

  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        if (!mounted) return;
        console.log("Starting to fetch user session...");
        setIsLoading(true);

        // Wait for initial session
        let retries = 0;
        const maxRetries = 5;
        let session = null;

        while (retries < maxRetries) {
          console.log(
            `Attempting to get session (attempt ${
              retries + 1
            }/${maxRetries})...`
          );
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();
          if (currentSession) {
            console.log("Session found:", currentSession.user.id);
            session = currentSession;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
          retries++;
        }

        if (!session?.user) {
          console.log("No session found after retries");
          if (mounted) {
            router.push("/login");
            return;
          }
          return;
        }

        if (mounted) {
          console.log("Setting user and fetching saved listings...");
          setUser(session.user);
          try {
            await fetchSavedListings(session.user.id);
            // Load recently viewed listings
            const recentViews = getRecentlyViewed();
            setRecentlyViewed(recentViews);
          } catch (err) {
            console.error("Error fetching saved listings:", err);
          } finally {
            if (mounted) {
              console.log("Setting loading to false after fetch attempt");
              setIsLoading(false);
            }
          }
        }
      } catch (err) {
        console.error("Error in getUser:", err);
        if (mounted) {
          router.push("/login");
          return;
        }
      }
    };

    getUser();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in, updating state...");
        setUser(session.user);
        try {
          await fetchSavedListings(session.user.id);
          // Load recently viewed listings
          const recentViews = getRecentlyViewed();
          setRecentlyViewed(recentViews);
        } catch (err) {
          console.error("Error fetching saved listings after sign in:", err);
        } finally {
          if (mounted) {
            console.log("Setting loading to false after sign in fetch");
            setIsLoading(false);
          }
        }
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out, redirecting to login...");
        router.push("/login");
      }
    });

    return () => {
      console.log("Cleaning up profile page...");
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  const breadcrumbItems = [
    { label: "User Profile", href: "/profile" },
    { label: activeTab === "saved" ? "Saved Listings" : "Recently Viewed" },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (value: "newest" | "price_asc" | "price_desc") => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getFilteredAndSortedListings = () => {
    const listings = activeTab === "saved" ? savedListings : recentlyViewed;

    // Filter by search query
    const filtered = listings.filter((item) => {
      if (activeTab === "saved") {
        const savedListing = item as SavedListing;
        const searchLower = searchQuery.toLowerCase();
        return (
          savedListing.listing.title.toLowerCase().includes(searchLower) ||
          savedListing.listing.address.toLowerCase().includes(searchLower) ||
          savedListing.listing.neighborhood
            ?.toLowerCase()
            .includes(searchLower) ||
          false
        );
      } else {
        const property = item as Property;
        const searchLower = searchQuery.toLowerCase();
        return (
          property.title.toLowerCase().includes(searchLower) ||
          property.address.toLowerCase().includes(searchLower) ||
          property.neighborhood?.toLowerCase().includes(searchLower) ||
          false
        );
      }
    });

    // Sort the filtered results
    return filtered.sort((a, b) => {
      if (activeTab === "saved") {
        const savedListingA = a as SavedListing;
        const savedListingB = b as SavedListing;

        switch (sortBy) {
          case "price_asc":
            return savedListingA.listing.price - savedListingB.listing.price;
          case "price_desc":
            return savedListingB.listing.price - savedListingA.listing.price;
          case "newest":
          default:
            return (
              new Date(savedListingB.savedAt).getTime() -
              new Date(savedListingA.savedAt).getTime()
            );
        }
      } else {
        const propertyA = a as Property;
        const propertyB = b as Property;

        switch (sortBy) {
          case "price_asc":
            return propertyA.price - propertyB.price;
          case "price_desc":
            return propertyB.price - propertyA.price;
          case "newest":
          default:
            return (
              new Date(propertyB.listedTime).getTime() -
              new Date(propertyA.listedTime).getTime()
            );
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Don't show anything while redirecting
  }

  return (
    <>
      <Navbar profileMode={true} />
      <div className="min-h-screen bg-[#f7f7fb]">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar - Full width on mobile, fixed width on desktop */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <ProfileSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              user={user}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 px-4 lg:px-8 py-4">
            {/* <Breadcrumb items={breadcrumbItems} /> */}

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 lg:p-6 mt-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <SearchBar
                  placeholder="Search via - City, state, zipcode"
                  onSearch={handleSearch}
                />
                <SortDropdown defaultValue={sortBy} onSort={handleSort} />
              </div>

              {/* Property Listings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {getFilteredAndSortedListings()
                  .slice((currentPage - 1) * 9, currentPage * 9)
                  .map((item) => {
                    if (activeTab === "saved") {
                      const savedListing = item as SavedListing;
                      return (
                        <div
                          key={savedListing.id}
                          className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col"
                        >
                          <PropertyCard
                            imageUrl={savedListing.listing.imageUrls[0] || ""}
                            price={`$${savedListing.listing.price.toLocaleString()}`}
                            street={savedListing.listing.title}
                            address={savedListing.listing.address}
                            beds={savedListing.listing.bedrooms || 0}
                            baths={savedListing.listing.bathrooms || 0}
                            area={`${
                              savedListing.listing.sqft?.toLocaleString() || 0
                            } sq ft`}
                            hasParking={true}
                            timeAgo={new Date(
                              savedListing.savedAt
                            ).toLocaleDateString()}
                            category={
                              savedListing.listing.neighborhood || "Unknown"
                            }
                            liked={true}
                            listingId={savedListing.listing.id}
                          />
                        </div>
                      );
                    } else {
                      const property = item as Property;
                      return (
                        <div
                          key={property.id}
                          className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col"
                        >
                          <PropertyCard
                            imageUrl={property.imageUrl}
                            price={`$${property.price.toLocaleString()}`}
                            street={property.title}
                            address={property.address}
                            beds={property.beds}
                            baths={property.baths}
                            area="0 sq ft"
                            hasParking={true}
                            timeAgo={property.listedTime}
                            category={property.neighborhood || "Unknown"}
                            liked={false}
                            listingId={property.id}
                          />
                        </div>
                      );
                    }
                  })}
              </div>

              {/* Pagination */}
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(
                    getFilteredAndSortedListings().length / 9
                  )}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
