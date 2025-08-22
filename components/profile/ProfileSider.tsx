import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Eye, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileSidebarProps {
  activeTab: "saved" | "recent";
  onTabChange: (tab: "saved" | "recent") => void;
  user: User;
}

const ProfileSidebar = ({
  activeTab,
  onTabChange,
  user,
}: ProfileSidebarProps) => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Start both operations concurrently
      const [signOutResult] = await Promise.all([
        supabase.auth.signOut(),
        // Pre-navigate to home page
        router.prefetch("/"),
      ]);

      if (signOutResult.error) throw signOutResult.error;

      // Navigate immediately after signout
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-full lg:w-72 bg-[#f5f5fe] px-4 py-6 lg:py-8">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-20 h-20 mb-4">
            <AvatarImage
              src={
                user.user_metadata?.avatar_url ||
                "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=120&h=120&q=80"
              }
              alt={user.user_metadata?.full_name || "User"}
            />
            <AvatarFallback>
              {user.user_metadata?.full_name?.[0] || user.email?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold text-[#2f2fcf]">
            {user.user_metadata?.full_name || ""}
          </h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs text-gray-400 font-semibold uppercase mb-3">
              Listings
            </h3>
            <nav className="space-y-2">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  activeTab === "saved" &&
                    "bg-[#2f2fcf] text-white hover:bg-[#2f2fcf] hover:text-white"
                )}
                onClick={() => onTabChange("saved")}
              >
                <Heart className="w-4 h-4" />
                <span>Saved Listings</span>
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  activeTab === "recent" &&
                    "bg-[#2f2fcf] text-white hover:bg-[#2f2fcf] hover:text-white"
                )}
                onClick={() => onTabChange("recent")}
              >
                <Eye className="w-4 h-4" />
                <span>Recently Viewed</span>
              </Button>
            </nav>
          </div>

          <div>
            <h3 className="text-xs text-gray-400 font-semibold uppercase mb-3">
              Actions
            </h3>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-500 hover:text-gray-700"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
