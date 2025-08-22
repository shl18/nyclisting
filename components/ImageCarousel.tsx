import Image from "next/image";
import { useState, useEffect } from "react";

const carouselImages = ["/cour-1.jpg", "/cour-2.jpg", "/cour-3.jpg"];

export const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl border-2 border-indigo-100 shadow-lg">
      {/* Progress indicators */}
      <div className="absolute top-4 left-4 right-4 z-20 flex space-x-2">
        {carouselImages.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-blue-600" : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Images */}
      {carouselImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={image}
            alt={`NYC Building ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      ))}

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
        <div className="flex items-center space-x-3"></div>

        <div className="max-w-md">
          <Image src="/LOGO_1.png" alt="logo" width={35} height={35} />

          <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
            Find NYC Rentals That Match Your Vibe
          </h1>
          <p className="text-white/90 text-base leading-relaxed">
            Browse thousands of updated listings from top platforms — all in one
            place & no endless tabs needed.
          </p>
        </div>
      </div>
    </div>
  );
};
