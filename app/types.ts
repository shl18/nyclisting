export interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  beds: number;
  baths: number;
  imageUrl: string;
  neighborhood: string;
  category: string;
  hasWifi: boolean;
  listedTime: string;
  latitude?: number;
  longitude?: number;
  source?: "SPAREROOM" | "STREETEASY";
}
