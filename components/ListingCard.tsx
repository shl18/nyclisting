import Image from "next/image";
import { Listing } from "@/types/listing";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = `["https://photos.zillowstatic.com/fp/${listing.imageUrl}-p_e.webp"]`;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="relative h-56 w-full">
        <Image
          src={listing.imageUrl}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {listing.title}
        </h3>
        <p className="text-2xl font-bold text-blue-600 mb-3">{listing.price}</p>
        <p className="text-gray-600 mb-4 line-clamp-1">{listing.address}</p>
        <div className="flex gap-6 text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <span className="font-medium">{listing.bedrooms}</span>
            <span className="text-sm">beds</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{listing.bathrooms}</span>
            <span className="text-sm">baths</span>
          </div>
        </div>
        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-block w-full text-center bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          View Details
        </a>
      </div>
    </div>
  );
}
