import React, { useState } from "react";
import Image from "next/image";
import { Heart, MapPin, Square, Home, Bed, Bath } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

interface PropertyCardProps {
  imageUrl: string | null;
  price: string;
  address: string;
  street: string;
  beds: number;
  baths: number;
  area: string;
  hasParking: boolean;
  timeAgo: string;
  category: string;
  liked?: boolean;
  listingId?: string;
  source?: "SPAREROOM" | "STREETEASY";
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  imageUrl,
  price,
  address,
  street,
  beds,
  baths,
  area,
  hasParking,
  timeAgo,
  category,
  liked = false,
  listingId,
  source = "SPAREROOM",
}) => {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  // Function to validate image URL
  const getValidImageUrl = (url: string | null): string => {
    if (!url) return PLACEHOLDER_IMAGE_URL;
    try {
      new URL(url);
      return url;
    } catch {
      return PLACEHOLDER_IMAGE_URL;
    }
  };

  const validImageUrl = getValidImageUrl(imageUrl);

  const handleCardClick = () => {
    if (listingId) {
      router.push(`/individuallisting/${listingId}`);
    }
  };

  return (
    <div
      className="property-card bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="property-image relative h-40 sm:h-48 bg-gray-100">
        {!imageError ? (
          <Image
            src={validImageUrl}
            alt={address}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            onError={() => setImageError(true)}
            priority={false}
            unoptimized={validImageUrl.startsWith("data:")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Home className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-gray-500 shadow-sm z-10">
          {category}
        </div>

        {/* Heart icon */}
        <button
          className={cn(
            "absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm z-10",
            "hover:bg-gray-100 transition-colors"
          )}
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when clicking the heart
          }}
        >
          <Heart
            className={cn(
              "w-4 h-4 sm:w-5 sm:h-5",
              liked ? "fill-[#231FD1] text-[#231FD1]" : "text-[#231FD1]"
            )}
          />
        </button>

        {/* Time badge */}
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded text-gray-500 shadow-sm z-10">
          {timeAgo}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3
              className="text-lg sm:text-xl font-bold mb-1"
              style={{ color: "#231FD1" }}
            >
              {price}
            </h3>
            <p className="text-gray-700 text-sm mb-1 line-clamp-1">{street}</p>
            <div className="flex items-center text-gray-500 text-xs sm:text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="line-clamp-1">{address}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center text-gray-600">
            <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="text-xs sm:text-sm">{area}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-xs sm:text-sm font-medium mr-1">
                {beds}
              </span>
              <Bed className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            </div>

            <div className="flex items-center">
              <span className="text-xs sm:text-sm font-medium mr-1">
                {baths}
              </span>
              <Bath className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            </div>

            {hasParking && (
              <div className="flex items-center">
                <span className="text-xs sm:text-sm">Yes</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
