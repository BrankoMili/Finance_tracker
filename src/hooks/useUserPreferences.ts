"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Currency } from "@/types/currency";
import { CategoryItem } from "@/types/categoryItem";

export const useUserPreferences = () => {
  const [userCurrency, setUserCurrency] = useState<Currency>("EUR");
  const [userCategories, setUserCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        setUserCategories([]);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const unsubscribeFirestore = onSnapshot(
        userDocRef,
        doc => {
          try {
            if (doc.exists()) {
              const data = doc.data();

              setUserCategories(data.categories || []);
              setUserCurrency(data.currency || "EUR");
            }
          } catch (err) {
            console.error(err);
            setUserCategories([]);
            setUserCurrency("EUR");
          }
        },
        err => {
          console.error("Snapshot error:", err);
          setUserCategories([]);
          setUserCurrency("EUR");
        }
      );

      return () => unsubscribeFirestore();
    });

    return () => unsubscribeAuth();
  }, []);

  return { userCurrency, userCategories };
};
