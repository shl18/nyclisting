"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import PropertyBreadcrumb from "@/components/id/PropertyBreadCrumb";
import PropertyImageGallery from "@/components/id/PropertyImageGallery";
import PropertyFeatures from "@/components/id/PropertyFeature";
import PropertyAmenities from "@/components/id/PropertyAmenities";
import PropertyAgents from "@/components/id/PropertyAgents";
import PropertyTransit from "@/components/id/PropertyTransit";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/listings/Header";
import Image from "next/image";

const PropertyLocation = dynamic(
  () => import("@/components/id/PropertyLocation"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />
    ),
  }
);

interface PropertyData {
  id: string;
  address: string;
  location: {
    neighborhood: string;
    city: string;
  };
  price: number;
  forRent: boolean;
  noFees: boolean;
  features: {
    rooms: number;
    beds: number;
    bathrooms: number;
    hasWifi: boolean;
    pricePerSqFt: number;
    area: number;
  };
  images: {
    main: string;
    thumbnails: string[];
    all: string[];
  };
  amenities: Array<{
    title: string;
    items: string[];
  }>;
  priceHistory: Array<{
    date: string;
    price: string;
    event: string;
    link?: {
      text: string;
      url: string;
    };
  }>;
  description: string;
  agents: Array<{
    name: string;
    title: string;
    company: string;
    phone: string;
    image: string;
    website?: string;
  }>;
  mapImageUrl: string;
  latitude?: number;
  longitude?: number;
  source: "SPAREROOM" | "STREETEASY";
  duplicatePrices?: Array<{
    price: number;
    address: string;
    url: string;
  }>;
  listing_url?: string;
}

const PropertyListing: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/v0/listings/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch property data");
        }
        const data = await response.json();
        setPropertyData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPropertyData();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <div className="bg-gray-200 aspect-video rounded-lg"></div>
            </div>
            <div className="lg:col-span-5">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !propertyData) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="text-red-500">{error || "Property not found"}</div>
      </div>
    );
  }

  const zipMatch = propertyData.address.match(/\b\d{5}\b/);
  const zip = zipMatch ? zipMatch[0] : null;

  const breadcrumbItems = [
    { label: "Listings", href: "/listings" },
    {
      label: propertyData.location.city,
      href: `/listings/${propertyData.location.city.toLowerCase()}`,
    },
    {
      label: propertyData.location.neighborhood,
      href: `/listings/${propertyData.location.city.toLowerCase()}/${propertyData.location.neighborhood.toLowerCase()}`,
    },
    {
      label: zip
        ? `${propertyData.location.neighborhood} (${zip})`
        : propertyData.location.neighborhood,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-screen-1xl mx-auto px-4 pb-12 bg-[#f6f5ff]">
        <div className="ml-10 mr-10">
          <PropertyBreadcrumb items={breadcrumbItems} />
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 ml-1 mr-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <PropertyImageGallery
                images={propertyData.images.all}
                supabaseImages={propertyData.images.all.filter((url) =>
                  url.includes("supabase")
                )}
              />

              {propertyData.agents && propertyData.agents.length > 0 && (
                <div className="mt-6 flex gap-4">
                  {propertyData.source === "STREETEASY" ? (
                    <button
                      onClick={() => {
                        console.log(
                          "Request Tour button clicked, listing_url:",
                          propertyData.listing_url
                        );
                        if (propertyData.listing_url) {
                          router.push(propertyData.listing_url);
                        }
                      }}
                      className="bg-blue-800 text-white py-3 px-6 rounded-full font-medium flex-1 text-center "
                    >
                      Request Tour
                    </button>
                  ) : (
                    <a
                      href={propertyData.agents[0]?.website || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-800 text-white py-3 px-6 rounded-full font-medium flex-1 text-center"
                    >
                      Contact Agent
                    </a>
                  )}
                </div>
              )}

              <div className="mt-6">
                <h2 className="text-lg font-medium tracking-wide text-[#03002E]">
                  ABOUT
                </h2>
                <p className="text-gray-700 text-sm">
                  {propertyData.description}
                </p>
              </div>

              {/* Map and Transit sections - hidden on mobile, shown in desktop */}
              <div className="hidden lg:block">
                <PropertyLocation
                  address={propertyData.address}
                  latitude={propertyData.latitude || 40.7128}
                  longitude={propertyData.longitude || -74.006}
                />

                <div className="mt-6">
                  <PropertyTransit
                    latitude={propertyData.latitude || 40.7128}
                    longitude={propertyData.longitude || -74.006}
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5">
              <div className="inline-block border border-gray-300 px-3 py-1.5 rounded-md text-[11px] font-small text-indigo-600 uppercase relative -top-1">
                {propertyData.source === "SPAREROOM"
                  ? "ROOMSHARE"
                  : propertyData.source === "STREETEASY"
                  ? "RENTAL"
                  : propertyData.source}
              </div>
              <h1 className="font-sans text-gray-600 text-2xl ">
                {propertyData.address}
              </h1>

              <div className="flex items-center mb-1">
                <div className="bg-rental-blue text-white p-1 rounded-md mr-2">
                  <Image
                    src="/PRICE.svg"
                    height={23}
                    width={34}
                    alt="Price icon"
                  />{" "}
                </div>

                <span className="text-blue-800 text-xl font-medium font-sans">
                  ${propertyData.price.toLocaleString()}
                </span>
                <span className="ml-2 text-gray-400 font-sans font-small uppercase text-xs">
                  for rent
                </span>
                {propertyData.noFees && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    No Fees
                  </span>
                )}
              </div>
              <hr className="border-t border-[#E5E5E5] opacity-70" />
              <PropertyFeatures {...propertyData.features} />
              <hr className="border-t border-[#E5E5E5] opacity-70 mt-4" />
              <PropertyAmenities amenityGroups={propertyData.amenities} />
              <PropertyAgents agents={propertyData.agents} />

              {/* Similar Listings Section */}
              {propertyData.duplicatePrices &&
                propertyData.duplicatePrices.length > 0 && (
                  <>
                    <hr className="border-t border-[#E5E5E5] opacity-70 mt-4" />
                    <div className="mt-4">
                      <h2 className="text-lg font-medium tracking-wide text-[#03002E] mb-4">
                        Similar Listings
                      </h2>
                      <div
                        className={`space-y-3 ${
                          propertyData.duplicatePrices.length > 3
                            ? "max-h-[300px] overflow-y-auto pr-2"
                            : ""
                        }`}
                      >
                        {propertyData.duplicatePrices.map((listing, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => router.push(listing.url)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-gray-800 font-medium">
                                  {listing.address}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Click to view details
                                </p>
                              </div>
                              <div className="text-[#0000bf] font-semibold">
                                ${listing.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          </div>

          {/* Map and Transit sections - shown on mobile, hidden in desktop */}
          <div className="lg:hidden mt-6">
            <PropertyLocation
              address={propertyData.address}
              latitude={propertyData.latitude || 40.7128}
              longitude={propertyData.longitude || -74.006}
            />

            <div className="mt-6">
              <PropertyTransit
                latitude={propertyData.latitude || 40.7128}
                longitude={propertyData.longitude || -74.006}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyListing;
