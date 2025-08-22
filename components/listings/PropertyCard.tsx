"use client";

import { Property } from "@/app/types";
import { Bed, Bath, Square, Heart } from "lucide-react";
import { useState } from "react";
import { Wifi } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addRecentlyViewed } from "@/lib/recentlyViewed";
import { House } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function PropertyCard({
  property,
  isFavorite,
  onToggleFavorite,
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      await onToggleFavorite();
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    addRecentlyViewed(property);
    window.open(`/individuallisting/${property.id}`, "_blank");
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-48 md:h-56 object-cover"
        />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-gray-500 shadow-sm z-10">
          {property.source === "SPAREROOM"
            ? "ROOMSHARE"
            : property.source === "STREETEASY"
            ? "RENTAL"
            : property.source}
        </div>
        <button
          onClick={handleFavoriteClick}
          disabled={isLoading || loading}
          className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
            isFavorite
              ? "bg-red-500 text-white"
              : "bg-white/80 hover:bg-white text-gray-600"
          } ${isLoading || loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-current" : "stroke-current"
            }`}
          />
        </button>
      </div>

      <div className="p-3 md:p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg md:text-xl font-medium text-[#0000bf]">
            ${property.price.toLocaleString()}
          </h3>
          <span className="text-gray-500 text-xs md:text-sm">
            {property.listedTime}
          </span>
        </div>

        <div className="mb-2 md:mb-3">
          <p className="text-black font-medium text-sm md:text-base line-clamp-1">
            {property.address.split(",")[0]}
          </p>
          <p className="text-gray-600 text-xs md:text-sm line-clamp-1">
            {property.address.split(",").slice(1).join(",").trim()}
          </p>
        </div>

        <div className="flex items-center text-gray-500 mb-3 md:mb-4">
          <span className="flex items-center">
            <span className="w-1 h-1 rounded-full bg-gray-400 mx-1"></span>
          </span>
          <span className="text-xs md:text-sm line-clamp-1">
            {property.title}
          </span>
        </div>

        <div className="flex justify-between mt-2 text-xs md:text-sm">
          <div className="flex items-center text-gray-700">
            <House className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span>Area (sq ft)</span>
          </div>

          <div className="flex items-center text-gray-700">
            <Bed className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span>{property.beds}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <Bath className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span>{property.baths}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <Wifi className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span
              className={`text-xs md:text-sm ${
                property.hasWifi ? "text-green-600" : "text-gray-400"
              }`}
            >
              {property.hasWifi ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
