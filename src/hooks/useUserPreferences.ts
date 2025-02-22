"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Currency } from "@/types/currency";
import { CategoryItem } from "@/types/categoryItem";

export const useUserPreferences = () => {
  const [userCurrency, setUserCurrency] = useState<Currency>("EUR");
  const [userCategories, setUserCategories] = useState<
    CategoryItem[] | undefined
  >();

  useEffect(() => {
    const fetchUserPreferences = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserCurrency(userDocSnap.data().currency);
          setUserCategories(userDocSnap.data().categories);
        }
      } catch (error) {
        console.error("Greška pri dobijanju korisnickih podataka:", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchUserPreferences();
    });

    return unsubscribe;
  }, []);

  return { userCurrency, userCategories };
};
