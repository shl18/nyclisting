"use client";

import { useEffect, useState } from "react";
import { Property } from "@/app/types";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Create a custom marker icon using a div
const createCustomIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${isSelected ? "#0000bf" : "#ff0000"};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface MapProps {
  properties: Property[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}

// Component to handle map bounds updates
function MapBoundsUpdater({
  properties,
  onBoundsChange,
}: {
  properties: Property[];
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}) {
  const map = useMap();
  const [initialBoundsSet, setInitialBoundsSet] = useState(false);

  useEffect(() => {
    if (!initialBoundsSet) {
      const validProperties = properties.filter(
        (p) => p.latitude != null && p.longitude != null
      );

      if (validProperties.length > 0) {
        const bounds = L.latLngBounds(
          validProperties.map((p) => [p.latitude!, p.longitude!])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      } else {
        // If no valid coordinates, center on NYC
        map.setView([40.7128, -74.006], 11);
      }
      setInitialBoundsSet(true);
    }
  }, [properties, map, initialBoundsSet]);

  // Separate effect for bounds change tracking
  useEffect(() => {
    const handleMoveEnd = () => {
      if (onBoundsChange) {
        onBoundsChange(map.getBounds());
      }
    };

    map.on("moveend", handleMoveEnd);
    map.on("zoomend", handleMoveEnd);

    return () => {
      map.off("moveend", handleMoveEnd);
      map.off("zoomend", handleMoveEnd);
    };
  }, [map, onBoundsChange]);

  return null;
}

export default function Map({
  properties,
  selectedProperty,
  setSelectedProperty,
  onBoundsChange,
}: MapProps) {
  return (
    <>
      <MapContainer
        center={[40.7128, -74.006]}
        zoom={11}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[
              property.latitude || 40.7128,
              property.longitude || -74.006,
            ]}
            icon={createCustomIcon(selectedProperty?.id === property.id)}
            eventHandlers={{
              click: () => setSelectedProperty(property),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px] max-w-[280px]">
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="w-full h-24 md:h-32 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-base md:text-lg text-[#0000bf]">
                  ${property.price.toLocaleString()}
                </h3>
                <p className="text-xs md:text-sm font-medium">
                  {property.address}
                </p>
                <p className="text-xs md:text-sm text-gray-600 mb-2">
                  {property.beds} beds, {property.baths} baths
                </p>
                <a
                  href={`/individuallisting/${property.id}`}
                  className="text-xs md:text-sm text-[#0000bf] hover:underline block"
                >
                  View Details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapBoundsUpdater
          properties={properties}
          onBoundsChange={onBoundsChange}
        />
      </MapContainer>

      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-3 md:p-4 rounded-lg shadow-lg">
          <div className="flex items-start gap-3 md:gap-4">
            <img
              src={selectedProperty.imageUrl}
              alt={selectedProperty.title}
              className="w-16 h-16 md:w-24 md:h-24 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold text-base md:text-lg">
                ${selectedProperty.price.toLocaleString()}
              </h3>
              <p className="text-xs md:text-sm">{selectedProperty.address}</p>
              <p className="text-xs md:text-sm text-gray-600">
                {selectedProperty.beds} beds, {selectedProperty.baths} baths
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
