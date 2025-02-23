"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Currency } from "@/types/currency";
import { CategoryItem } from "@/types/categoryItem";

export const useUserPreferences = () => {
  const [userCurrency, setUserCurrency] = useState<Currency>("EUR");
  const [userCategories, setUserCategories] = useState<
    CategoryItem[] | undefined
  >();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      doc => {
        try {
          if (doc.exists()) {
            const data = doc.data();
            setUserCategories(data.categories || []);
            setUserCurrency(data.currency || "EUR");
          }
        } catch (err) {
          console.error("Error processing document:", err);
          setUserCategories(undefined);
          setUserCurrency("EUR");
        }
      },
      err => {
        console.error("Snapshot error:", err);
        setUserCategories(undefined);
        setUserCurrency("EUR");
      }
    );

    return () => unsubscribe();
  }, []);

  return { userCurrency, userCategories };
};
