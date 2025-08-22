import React, { useState } from "react";
import Image from "next/image";

interface PropertyImageGalleryProps {
  images: string[];
  supabaseImages?: string[];
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
  images,
  supabaseImages = [],
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Sanitize image URLs to ensure they have the correct protocol
  const sanitizeImageUrl = (url: string): string => {
    if (!url) return "";
    // Remove any duplicate protocol
    return url.replace(/^https?:https?:/, "https://");
  };

  // Combine and deduplicate image URLs, prioritizing Supabase URLs
  const allImages = [...new Set([...supabaseImages, ...images])].map(
    sanitizeImageUrl
  );

  if (allImages.length === 0) {
    return (
      <div className="relative w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  const handleImageClick = (index: number) => {
    // Only show loader and update state if clicking a different image
    if (index !== currentImageIndex) {
      setIsLoading(true);
      setCurrentImageIndex(index);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <Image
          src={allImages[currentImageIndex]}
          alt="Property image"
          fill
          className={`object-contain transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          priority={currentImageIndex === 0}
          quality={75}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onLoadingComplete={() => setIsLoading(false)}
          loading={currentImageIndex === 0 ? "eager" : "lazy"}
        />
      </div>

      {allImages.length > 1 && (
        <div className="mt-4 flex gap-2 sm:gap-4 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                index === currentImageIndex
                  ? "border-rental-blue"
                  : "border-transparent"
              } focus:outline-none focus:ring-2 focus:ring-rental-blue focus:ring-offset-2`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                quality={50}
                sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyImageGallery;
