"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Currency } from "@/types/currency";

export const useUserCurrency = () => {
  const [userCurrency, setUserCurrency] = useState<Currency>("EUR");
  useEffect(() => {
    const fetchUserCurrency = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserCurrency(userDocSnap.data().currency);
        }
      } catch (error) {
        console.error("Greška pri dobijanju valute:", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchUserCurrency();
    });

    return unsubscribe;
  }, []);

  return userCurrency;
};
