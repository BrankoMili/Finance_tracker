"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";
import { Theme } from "@/types/theme";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const validThemes: Theme[] = ["light", "dark"];
    if (savedTheme && validThemes.includes(savedTheme as Theme)) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  if (pathname === "/login") {
    return <main>{children}</main>;
  }

  if (pathname === "/signup") {
    return <main>{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10">
          <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <main className="flex-1 p-4 sm:p-8 mt-16 md:mt-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
