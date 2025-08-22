export interface Listing {
  title: string;
  price: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  url: string;
  description?: string;
  sqft?: number;
  neighborhood?: string;
  city: string;
  source: "SPAREROOM" | "STREETEASY";
  latitude?: number;
  longitude?: number;
}
