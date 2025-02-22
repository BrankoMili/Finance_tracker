"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";

export function TokenRefresher() {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        const intervalId = setInterval(async () => {
          try {
            const newToken = await user.getIdToken(true);
            document.cookie = `session=${newToken}; path=/; Secure; SameSite=Strict; Max-Age=3600`;
          } catch (error) {
            console.error("Token refresh failed:", error);
          }
        }, 30 * 60 * 1000); // 30 minuta

        return () => clearInterval(intervalId);
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
