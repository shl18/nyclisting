"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageCarousel } from "@/components/ImageCarousel";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ImageCarouselMobile } from "@/components/ImageCarouselMobile";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const handleResetPassword = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/create-new-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Reset email sent",
        description: "Check your email for the password reset link.",
      });

      // Redirect to callback page to show success message
      router.push("/callback");
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile UI */}
      <div className="block md:hidden min-h-screen relative">
        <ImageCarouselMobile />
        {/* Form Overlay */}
        <div className="absolute top-[38vh] left-0 w-full bg-white rounded-t-3xl shadow-lg p-6 pb-2 z-20 min-h-[62vh] flex flex-col">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Forgot Password?
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Enter the email linked to your account and we'll send you a reset
              link.
            </p>

            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
            )}

            <Button
              onClick={handleResetPassword}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 rounded-lg mb-4 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-gray-300 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-lg transition-colors"
              >
                Back to Log in
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop UI */}
      <div className="hidden md:flex min-h-screen">
        <div className="hidden md:flex md:w-1/2 relative bg-white">
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="w-full max-w-4xl h-[800px]">
              <ImageCarousel />
            </div>
          </div>
          <div className="relative z-10 p-8 flex flex-col h-full"></div>
        </div>

        {/* Right side - Forgot Password form */}
        <div className="flex-1 bg-white flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Forgot Password?
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Enter the email linked to your account and we'll send you a reset
              link.
            </p>

            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
            )}

            <Button
              onClick={handleResetPassword}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 rounded-lg mb-4 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-gray-300 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-lg transition-colors"
              >
                Back to Log in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
