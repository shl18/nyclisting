"use client";

import React, { useState, useEffect } from "react";
import { Map, Home } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyLocationProps {
  address: string;
  latitude: number;
  longitude: number;
}

const PropertyLocation: React.FC<PropertyLocationProps> = ({
  address,
  latitude,
  longitude,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate coordinates
    if (!latitude || !longitude) {
      setError("Invalid location coordinates");
      setIsLoading(false);
      return;
    }

    // Validate address
    if (!address) {
      setError("Address is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [latitude, longitude, address]);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-700 mt-4">
          <Map className="h-5 w-5 text-indigo-400" />
          <h2 className="text-xl font-medium">Location</h2>
        </div>
        <div className="h-[300px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">{error}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Home className="h-4 w-4" />
          <p>{address || "Address not available"}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-700 mt-4">
          <Map className="h-5 w-5 text-indigo-400" />
          <h2 className="text-xl font-medium">Location</h2>
        </div>
        <div className="h-[300px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Loading map...</p>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Home className="h-4 w-4" />
          <p>{address}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 mt-4">
        <Map className="h-5 w-5 text-indigo-400" />
        <h2 className="text-xl font-medium">Location</h2>
      </div>

      <div className="h-[300px] rounded-lg overflow-hidden">
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[latitude, longitude]}
            icon={L.divIcon({
              className: "custom-marker",
              html: `
                <div style="
                  background-color: #0000bf;
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })}
          >
            <Popup>
              <div className="p-2">
                <strong>{address}</strong>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* <div className="flex items-center gap-2 text-gray-600">
        <Home className="h-4 w-4" />
        <p>{address}</p>
      </div> */}
    </div>
  );
};

export default PropertyLocation;
