export interface StreetEasyListing {
  title: string;
  price: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  url: string;
  images: string[];
  address: string;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  city: string;
  imageUrl?: string; // For backward compatibility
}

export interface StreetEasyResponse {
  listings: StreetEasyListing[];
  total: number;
  page: number;
  pageSize: number;
}
