import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PriceHistoryEntry {
  date: string;
  price: string;
  event: string;
  link?: {
    text: string;
    url: string;
  };
}

interface PriceHistoryProps {
  entries: PriceHistoryEntry[];
}

const PriceHistory: React.FC<PriceHistoryProps> = ({ entries }) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-4">OTHER PRICES:</h2>

      <Tabs defaultValue="history">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="history" className="text-sm">
            Price History
          </TabsTrigger>
          <TabsTrigger value="rentals" className="text-sm">
            Recent Rentals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="pt-4">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr className="border-b">
                <th className="pb-2 font-medium">DATE</th>
                <th className="pb-2 font-medium">PRICE</th>
                <th className="pb-2 font-medium">EVENT</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">{entry.date}</td>
                  <td className="py-3">{entry.price}</td>
                  <td className="py-3">
                    {entry.link ? (
                      <span>
                        {entry.event.split(entry.link.text)[0]}
                        <a href={entry.link.url} className="text-rental-blue">
                          {entry.link.text}
                        </a>
                      </span>
                    ) : (
                      entry.event
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-4 text-sm text-rental-blue font-medium">
            SHOW MORE
          </button>
        </TabsContent>

        <TabsContent value="rentals">
          <div className="py-4 text-sm text-gray-600">
            No recent rental data available
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PriceHistory;
