"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <main>{children}</main>;
  }

  if (pathname === "/signup") {
    return <main>{children}</main>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 ">
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>
        <main className="p-8 bg-background">{children}</main>
      </div>
    </div>
  );
}
