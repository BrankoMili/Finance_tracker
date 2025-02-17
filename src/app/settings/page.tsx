"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export default function Settings() {
  const [userCurrency, setUserCurrency] = useState("");

  const handleChangeCurrency = async (currencyValue: string) => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { currency: currencyValue });
      setUserCurrency(currencyValue);
    } catch (error) {
      console.error(error);
    }
  };

  // Pokrece se samo prvi put
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

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Settings</h1>
      <p className="mt-4 text-gray-600">Set up your profile</p>

      <p>Current currency for calculation: ${userCurrency}</p>

      <p>Change currency:</p>
      <select
        value={userCurrency}
        onChange={e => {
          handleChangeCurrency(e.target.value);
        }}
      >
        <option value="EUR">Euro (EUR)</option>
        <option value="USD">US Dolar (USD)</option>
        <option value="RSD">Serbian dinar (RSD)</option>
      </select>
    </div>
  );
}
