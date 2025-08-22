export interface Property {
  id: string;
  address: string;
  neighborhood: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  hasWifi: boolean;
  imageUrl: string;
  category: string;
  listedTime: string;
  latitude: number;
  longitude: number;
  title: string;
  duplicatePrices?: Array<{
    price: number;
    address: string;
    url: string;
  }>;
}

export interface SearchFilters {
  location: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  noBrokerFee: boolean;
  listingType?: string;
  amenities?: string[];
}
