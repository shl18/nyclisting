"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

import Image from "next/image";

interface NavbarProps {
  profileMode?: boolean;
}

export default function Navbar({ profileMode = false }: NavbarProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <header className="flex items-center justify-between w-full px-6 py-4 bg-white border-b">
      <div className="flex items-center">
        {profileMode ? (
          <div onClick={handleLogoClick} className="cursor-pointer">
            <Image src="/LOGO_1.png" alt="logo" width={50} height={50} />
          </div>
        ) : (
          <Link href={user ? "/" : "/"} onClick={handleLogoClick}>
            <div className="ml-2">
              <Image src="/LOGO_1.png" alt="logo" width={50} height={50} />
            </div>
          </Link>
        )}

        <span className="text-xl font-bold text-blue-900 ml-4 ">
          NYC Listings
        </span>
      </div>

      <div className="flex items-center gap-2">
        {profileMode ? (
          <button
            className="flex items-center gap-1 text-[#7c83c5] hover:text-[#0000bf] text-base font-small focus:outline-none"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/profile"
                className="text-[#7c83c5] hover:text-[#0000bf] text-base font-small"
              >
                My Profile
              </Link>
            ) : (
              <Link
                href="/signup"
                className="text-[#7c83c5] hover:text-[#0000bf] text-base font-small"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
