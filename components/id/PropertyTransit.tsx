import React from "react";
import { FaSubway } from "react-icons/fa";
import { getNearbyStations, MTA_LINE_COLORS } from "@/lib/mta";

interface PropertyTransitProps {
  latitude: number;
  longitude: number;
}

const PropertyTransit: React.FC<PropertyTransitProps> = ({
  latitude,
  longitude,
}) => {
  const stations = getNearbyStations(latitude, longitude);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium">Nearby Subway Stations</h2>
      {stations && stations.length > 0 ? (
        <div className="space-y-4">
          {stations.map((station, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="mt-1">
                <FaSubway className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{station.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {station.lines.map((line) => {
                    const colors = MTA_LINE_COLORS[line] || {
                      bg: "#6D6E71",
                      text: "#FFFFFF",
                    };
                    return (
                      <span
                        key={line}
                        className="px-2 py-1 text-sm font-medium rounded-full"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {line}
                      </span>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {station.distance?.toFixed(1)} miles away
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No nearby subway stations found.</p>
      )}
    </div>
  );
};

export default PropertyTransit;
