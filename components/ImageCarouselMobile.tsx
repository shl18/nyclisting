import { useState, useEffect } from "react";

const carouselImages = ["/cour-1.jpg", "/cour-2.jpg", "/cour-3.jpg"];

export const ImageCarouselMobile = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[50vh] sm:h-[55vh] md:h-[60vh] overflow-hidden rounded-none md:rounded-2xl border-0 md:border md:border-indigo-100 shadow-none md:shadow-md">
      {/* Progress indicators */}
      <div className="absolute top-3 left-4 right-4 z-20 flex space-x-2">
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
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}

      {/* Overlay content */}
      <div className="flex">
        <div className="absolute self-start top-52 inset-0 z-10 p-4 flex flex-col justify-end">
          <div className="flex items-center space-x-2 mb-4 ">
            <img src="/LOGO_1.png" alt="Logo" width={40} height={40} />
          </div>

          <div className="text-[#0D1B46]">
            <h1 className="text-xl sm:text-2xl font-semibold leading-snug mb-2">
              Find NYC Rentals That Match Your Vibe
            </h1>
            {/* <p className="text-sm sm:text-base text-white/90 leading-relaxed ">
              Browse thousands of updated listings from top platforms — all in
              one place, no endless tabs needed.
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
};
