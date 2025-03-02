"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged } from "firebase/auth";
import { AccountDeletionState } from "@/services/accountDeletionState"; // Adjust path as needed

export function TokenRefresher() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async user => {
      // Skip token refresh if account deletion is in progress
      if (AccountDeletionState.isDeletionInProgress()) {
        console.log("Account deletion in progress, skipping token refresh");
        return;
      }

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
      // Skip scheduled refresh if account deletion is in progress
      if (AccountDeletionState.isDeletionInProgress()) {
        console.log("Account deletion in progress, skipping scheduled refresh");
        return;
      }

      const currentUser = auth.currentUser;
      if (currentUser && !isRefreshing) {
        try {
          setIsRefreshing(true);
          await currentUser.getIdToken(true);
        } catch (error) {
          console.error("Error with scheduled token refresh:", error);
        } finally {
          setIsRefreshing(false);
        }
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [isRefreshing]);

  return null;
}
