import React from "react";

interface AmenityGroupProps {
  title: string;
  items: string[];
}

const AmenityGroup: React.FC<AmenityGroupProps> = ({ title, items }) => {
  if (items.length === 0) return null;

  // Format amenity text to be more readable
  const formatAmenity = (amenity: string) => {
    return amenity
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();
  };

  return (
    <div className="rounded-xl bg-[#f6f5ff] px-3 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm sm:text-base font-semibold text-[#151371]">
          {title}
        </h3>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="text-xs sm:text-sm text-[#151371] bg-white border border-[#e0e0f0] px-2 py-0.5 sm:py-1 rounded-md"
          >
            {formatAmenity(item)}
          </span>
        ))}
      </div>
    </div>
  );
};

interface PropertyAmenitiesProps {
  amenityGroups: {
    title: string;
    items: string[];
  }[];
}

const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({
  amenityGroups,
}) => {
  // Filter out empty groups
  const nonEmptyGroups = amenityGroups.filter(
    (group) => group.items.length > 0
  );

  if (nonEmptyGroups.length === 0) return null;

  return (
    <div className="mt-4 sm:mt-6">
      <h2 className="text-base sm:text-lg font-medium text-[#151371] mb-3 sm:mb-4">
        AMENITIES
      </h2>
      <div className="space-y-2 sm:space-y-3">
        {nonEmptyGroups.map((group, index) => (
          <AmenityGroup key={index} title={group.title} items={group.items} />
        ))}
      </div>
    </div>
  );
};

export default PropertyAmenities;
