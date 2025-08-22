import { Property } from "../../app/types";
import { LatLngBounds } from "leaflet";

export interface MapProps {
  properties: Property[];
  selectedProperty: Property | null;
  setSelectedProperty: (property: Property | null) => void;
  onBoundsChange?: (bounds: LatLngBounds) => void;
}

declare const Map: React.FC<MapProps>;
export default Map;
