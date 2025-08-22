"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { MailOpen } from "lucide-react";
import Image from "next/image";
import { ImageCarousel } from "@/components/ImageCarousel";
import { ImageCarouselMobile } from "@/components/ImageCarouselMobile";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Handle the access token from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Session error:", sessionError);
            router.push("/login");
            return;
          }

          // Get the updated session
          const {
            data: { session },
            error: getSessionError,
          } = await supabase.auth.getSession();

          if (getSessionError) {
            console.error("Error getting session:", getSessionError);
            router.push("/login");
            return;
          }

          if (session) {
            // Successfully authenticated, redirect to profile
            router.push("/profile");
          } else {
            // No session found, redirect to login
            router.push("/login");
          }
        } else {
          // No tokens in hash, check for existing session
          const {
            data: { session },
            error: getSessionError,
          } = await supabase.auth.getSession();

          if (getSessionError) {
            console.error("Error getting session:", getSessionError);
            router.push("/login");
            return;
          }

          if (session) {
            // Successfully authenticated, redirect to profile
            router.push("/profile");
          } else {
            // No session found, redirect to login
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Error in callback:", error);
        router.push("/login");
      }
    };

    handleCallback();
  }, [router, supabase.auth]);

  const handleOpenEmailApp = () => {
    window.location.href = "https://mail.google.com";
  };

  const handleResend = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: "", // This will be handled by Supabase based on the current user
      });

      if (error) {
        console.error("Error resending email:", error);
      }
    } catch (err) {
      console.error("Error in resend:", err);
    }
  };

  return (
    <>
      {/* Mobile UI */}
      <div className="block md:hidden min-h-screen relative">
        <ImageCarouselMobile />
        {/* Content Overlay */}
        <div className="absolute top-[38vh] left-0 w-full bg-white rounded-t-3xl shadow-lg p-6 pb-2 z-20 min-h-[62vh] flex flex-col">
          <div className="w-full max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <MailOpen className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Check your inbox
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              We've sent you an email with a confirmation link. Please check
              your inbox and click the link to verify your account.
            </p>

            <Button
              onClick={handleOpenEmailApp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg mb-6 transition-colors"
            >
              Open email app
            </Button>

            <p className="text-gray-600">
              Didn't get an email?{" "}
              <button
                onClick={handleResend}
                className="text-gray-900 underline hover:no-underline font-medium"
              >
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Desktop UI */}
      <div className="hidden md:flex min-h-screen">
        {/* Left section - NYC Image */}
        <div className="hidden md:flex md:w-1/2 relative bg-white">
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="w-full max-w-4xl h-[800px]">
              <ImageCarousel />
            </div>
          </div>
          <div className="relative z-10 p-8 flex flex-col h-full"></div>
        </div>

        <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <MailOpen className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Check your inbox
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              We've sent you an email with a confirmation link. Please check
              your inbox and click the link to verify your account.
            </p>

            <Button
              onClick={handleOpenEmailApp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg mb-6 transition-colors"
            >
              Open email app
            </Button>

            <p className="text-gray-600">
              Didn't get an email?{" "}
              <button
                onClick={handleResend}
                className="text-gray-900 underline hover:no-underline font-medium"
              >
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
