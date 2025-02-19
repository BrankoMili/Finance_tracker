import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where
} from "firebase/firestore";
import { useMonth } from "./useMonth";
import { db, auth } from "@/lib/firebase";
import { Expense } from "@/types/expense";

export const useExpenses = () => {
  const { startTimestamp, endTimestamp } = useMonth();
  const [expensesLoading, setExpensesLoading] = useState<boolean>(true);
  const [expenses, setExpenses] = useState<Expense[]>();
  const [expensesError, setExpensesError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        const collectionRef = collection(db, "expenses");

        const expensesQuery = query(
          collectionRef,
          where("date", ">=", startTimestamp),
          where("date", "<", endTimestamp),
          where("userId", "==", user.uid),
          orderBy("date", "desc") // Sort by last created documents
        );

        const unsubscribeSnapshot = onSnapshot(
          expensesQuery,
          snapshot => {
            const newData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,

                date: data.date?.toDate() || new Date()
              } as Expense;
            });
            setExpenses(newData);
            setExpensesLoading(false);
          },
          error => {
            console.error(error);
            setExpensesLoading(false);
            setExpensesError(error);
          }
        );

        // Clean up snapshot listener on component unmount
        return () => unsubscribeSnapshot();
      } else {
        // Korisnik nije prijavljen
        console.error("User is not logged in");
        setExpensesLoading(false);
      }
    });

    // Clean up auth listener on component unmount
    return () => unsubscribeAuth();
  }, []);

  return { expenses, expensesLoading, expensesError };
};
