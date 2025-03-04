"use client";

import { useEffect, useState, useRef } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged } from "firebase/auth";
import { AccountDeletionState } from "@/services/accountDeletionState";

export function TokenRefresher() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(isRefreshing);

  // Update ref when isRefreshing changes
  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async user => {
      if (AccountDeletionState.isDeletionInProgress()) {
        console.log("Account deletion in progress, skipping token refresh");
        return;
      }

      if (user) {
        try {
          setIsRefreshing(true);
          // Get current token without forcing refresh
          const newToken = await user.getIdToken();
          document.cookie = `session=${newToken}; path=/; Secure; SameSite=Strict; Max-Age=3600`;
          console.log("Token refreshed:", new Date().toLocaleTimeString());
        } catch (error) {
          console.error("Error refreshing token:", error);
        } finally {
          setIsRefreshing(false);
        }
      } else {
        // Clear cookie if no user
        document.cookie =
          "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    });

    // Scheduled token refresh every 30 minutes
    const intervalId = setInterval(async () => {
      if (AccountDeletionState.isDeletionInProgress()) {
        console.log("Skipping scheduled refresh during account deletion");
        return;
      }

      const currentUser = auth.currentUser;
      if (currentUser && !isRefreshingRef.current) {
        try {
          setIsRefreshing(true);
          // Force refresh to ensure token is updated
          await currentUser.getIdToken(true);
        } catch (error) {
          console.error("Error in scheduled refresh:", error);
        } finally {
          setIsRefreshing(false);
        }
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Cleanup on unmount
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []); // Empty array ensures effect runs once

  return null;
}
