"use client";

import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { OrDivider } from "@/components/ui/or-divider";
import { SocialLoginButtons } from "@/components/socail-login-button";
import { ImageCarousel } from "@/components/ImageCarousel";
import { ImageCarouselMobile } from "@/components/ImageCarouselMobile";

export default function LoginPage() {
  return (
    <>
      {/* Mobile UI */}
      <div className="block md:hidden min-h-screen relative">
        <ImageCarouselMobile />
        {/* Login Form Overlay */}
        <div className="absolute top-[35vh] sm:top-[40vh] left-0 w-full bg-white rounded-t-3xl shadow-lg p-6 pb-2 z-20 min-h-[65vh] sm:min-h-[60vh] flex flex-col border-t border-gray-100">
          <div className="w-full max-w-md mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1">
                Log in <span className="text-blue-800">to NYC Listings</span>
              </h2>
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-800 hover:text-blue-900 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
            <LoginForm />
            <OrDivider />
            <SocialLoginButtons />
          </div>
        </div>
      </div>

      {/* Desktop UI */}
      <div className="hidden md:flex min-h-screen">
        {/* Left section - NYC Image */}
        <div className="hidden md:flex md:w-1/2 relative bg-white">
          <div className="absolute inset-0 bg-white flex items-center justify-center ">
            <div className="w-full max-w-4xl h-[800px]">
              <ImageCarousel />
            </div>
          </div>
          <div className="relative z-10 p-8 flex flex-col h-full"></div>
        </div>

        {/* Right section - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1">
                Log in <span className="text-blue-800">to NYC Listings</span>
              </h2>
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-800 hover:text-blue-900 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
            <LoginForm />
            <OrDivider />
            <SocialLoginButtons />
          </div>
        </div>
      </div>
    </>
  );
}
