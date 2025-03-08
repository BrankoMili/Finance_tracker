import type { Metadata } from "next";
import "../styles/globals.css";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import { ToastProvider } from "@/components/ToastProvider";
import AuthGuard from "@/components/AuthGuard";
import LayoutWrapper from "./LayoutWrapper";
import { TokenRefresher } from "@/components/TokenRefresher";
import { OverlayProvider } from "@/context/OverlayContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Personal Finance Tracker"
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <AuthGuard>
          <ToastProvider />
          <TokenRefresher />
          <OverlayProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </OverlayProvider>
        </AuthGuard>
      </body>
    </html>
  );
}
