import React from "react";
import { Home, DoorOpen, Bath, Wifi, DollarSign, Maximize } from "lucide-react";

interface PropertyFeaturesProps {
  rooms: number;
  beds: number;
  bathrooms: number;
  hasWifi: boolean;
  pricePerSqFt: number;
  area: number;
}

// Updated style with smaller indigo background and deep blue icon color
const iconWrapperStyle =
  "w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 mb-1";

const labelStyle = "text-sm font-light text-gray-700 text-center";

const PropertyFeatures: React.FC<PropertyFeaturesProps> = ({
  rooms,
  beds,
  bathrooms,
  hasWifi,
  pricePerSqFt,
  area,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 mt-4 w-full max-w-2xl mx-auto ">
      {/* First row: 4 features */}
      <div className="flex flex-col items-center">
        <div className={iconWrapperStyle}>
          <Home className="h-5 w-5" />
        </div>
        <span className={labelStyle}>{rooms} Rooms</span>
      </div>
      <div className="flex flex-col items-center">
        <div className={iconWrapperStyle}>
          <DoorOpen className="h-5 w-5" />
        </div>
        <span className={labelStyle}>{beds} Beds</span>
      </div>
      <div className="flex flex-col items-center">
        <div className={iconWrapperStyle}>
          <Bath className="h-5 w-5" />
        </div>
        <span className={labelStyle}>{bathrooms} Bathrooms</span>
      </div>
      <div className="flex flex-col items-center">
        <div className={iconWrapperStyle}>
          <Wifi className="h-5 w-5" />
        </div>
        <span className={labelStyle}>{hasWifi ? "Yes" : "No"}</span>
      </div>
      {/* Second row: 2 features, offset to center */}
      {pricePerSqFt > 0 && (
        <div className="flex flex-col items-center col-span-1 md:col-start-1">
          <div className={iconWrapperStyle}>
            <DollarSign className="h-5 w-5" />
          </div>
          <span className={labelStyle}>${pricePerSqFt} per sq feet</span>
        </div>
      )}
      {area > 0 && (
        <div className="flex flex-col items-center col-span-1 md:col-start-2">
          <div className={iconWrapperStyle}>
            <Maximize className="h-5 w-5" />
          </div>
          <span className={labelStyle}>{area.toLocaleString()} sq ft</span>
        </div>
      )}
    </div>
  );
};

export default PropertyFeatures;
