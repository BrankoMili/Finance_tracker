"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";
import { Theme } from "@/types/theme";
import { useOverlay } from "@/context/OverlayContext";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const { showOverlay, toggleOverlay } = useOverlay();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/login" || pathname === "/signup") {
      document.documentElement.setAttribute("data-theme", "light");
      return;
    }

    const savedTheme = localStorage.getItem("theme");
    const validThemes: Theme[] = ["light", "dark"];
    if (savedTheme && validThemes.includes(savedTheme as Theme)) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, [pathname]);

  if (pathname === "/login") {
    return <main>{children}</main>;
  }

  if (pathname === "/signup") {
    return <main>{children}</main>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {showOverlay && (
        <div
          className="absolute inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => toggleOverlay(!showOverlay)}
        ></div>
      )}
      <div>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10">
          <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <main
          className={`${
            showOverlay ? "overflow-hidden" : ""
          } flex-1 p-4 sm:p-8 overflow-auto`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
