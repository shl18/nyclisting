"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";

export default function GoogleCallbackClient() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Check for code in URL search params
        const searchParams = new URLSearchParams(window.location.search);
        let code = searchParams.get("code");

        // If no code in search params, check hash fragment
        if (!code) {
          const hash = window.location.hash.substring(1);
          const hashParams = new URLSearchParams(hash);
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error("Session error:", sessionError);
              router.push("/login?error=google_auth_failed");
              return;
            }

            // Get the updated session
            const {
              data: { session },
              error: getSessionError,
            } = await supabase.auth.getSession();

            if (getSessionError) {
              console.error("Error getting session:", getSessionError);
              router.push("/login?error=session_error");
              return;
            }

            if (session) {
              router.push("/profile");
              return;
            }
          }
        } else {
          // Exchange the code for a session
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Error exchanging code for session:", error);
            router.push("/login?error=google_auth_failed");
            return;
          }

          // Get the updated session
          const {
            data: { session },
            error: getSessionError,
          } = await supabase.auth.getSession();

          if (getSessionError) {
            console.error("Error getting session:", getSessionError);
            router.push("/login?error=session_error");
            return;
          }

          if (session) {
            router.push("/profile");
            return;
          }
        }

        // If we get here, no valid session was established
        router.push("/login?error=no_session");
      } catch (error) {
        console.error("Error in Google callback:", error);
        router.push("/login?error=callback_error");
      }
    };

    handleGoogleCallback();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">
          Completing Google Sign In...
        </h2>
        <p className="text-gray-600 mt-2">
          Please wait while we complete your authentication
        </p>
      </div>
    </div>
  );
}
