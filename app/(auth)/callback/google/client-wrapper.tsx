"use client";

import dynamic from "next/dynamic";

const GoogleCallbackClient = dynamic(() => import("./client"), { ssr: false });

export default function ClientWrapper() {
  return <GoogleCallbackClient />;
}
