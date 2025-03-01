"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged } from "firebase/auth";

export function TokenRefresher() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async user => {
      if (user) {
        try {
          setIsRefreshing(true);

          const newToken = await user.getIdToken(true);

          document.cookie = `session=${newToken}; path=/; Secure; SameSite=Strict; Max-Age=3600`;
          console.log("Token refreshed:", new Date().toLocaleTimeString());
        } catch (error) {
          console.error("Error with token refresh:", error);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        document.cookie =
          "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    });

    const intervalId = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser && !isRefreshing) {
        try {
          setIsRefreshing(true);
          await currentUser.getIdToken(true);
        } catch (error) {
          console.error("Error with token refresh:", error);
          setIsRefreshing(false);
        }
      }
    }, 30 * 60 * 1000); // 30 minuta

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [isRefreshing]);

  return null;
}
