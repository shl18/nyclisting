import { ListingCard } from "@/components/ListingCard";
import { Listing } from "@/types/listing";

async function getListings(): Promise<Listing[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/v0/streeteasy/listing/all`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch listings");
  }

  return res.json();
}

export default async function StreetEasyPage() {
  const listings = await getListings();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            StreetEasy Listings
          </h1>
          <p className="text-lg text-gray-600">Find your perfect home in NYC</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {listings.map((listing) => (
            <div
              key={listing.url}
              className="transform transition-transform hover:scale-105"
            >
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
