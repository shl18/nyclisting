"use client";

import PropertyCard from "./PropertyCard";

import { Property } from "@/app/types";

interface PropertyListProps {
  properties: Property[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export default function PropertyList({
  properties,
  favorites,
  onToggleFavorite,
}: PropertyListProps) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isFavorite={favorites.includes(property.id)}
            onToggleFavorite={() => onToggleFavorite(property.id)}
          />
        ))}
      </div>
    </div>
  );
}
