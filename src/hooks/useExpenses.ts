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
  const [expensesCurrentMonth, setExpensesCurrentMonth] = useState<Expense[]>();
  const [expenses, setExpenses] = useState<Expense[]>();
  const [expensesError, setExpensesError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        const collectionRef = collection(db, "expenses");

        const expensesCurrentMonthQuery = query(
          collectionRef,
          where("date", ">=", startTimestamp),
          where("date", "<", endTimestamp),
          where("userId", "==", user.uid),
          orderBy("date", "desc") // Sort by last created documents
        );

        const expensesQuery = query(
          collectionRef,
          where("userId", "==", user.uid),
          orderBy("date", "desc") // Sort by last created documents
        );

        let currentMonthLoaded = false;
        let expensesLoaded = false;

        const checkLoading = () => {
          if (currentMonthLoaded && expensesLoaded) {
            setExpensesLoading(false);
          }
        };

        // Expenses dokumenti jednog korisnika u toku trenutnog meseca
        const unsubscribeCurrentMonth = onSnapshot(
          expensesCurrentMonthQuery,
          snapshot => {
            const newData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,

                date: data.date?.toDate() || new Date()
              } as Expense;
            });

            setExpensesCurrentMonth(newData);
            currentMonthLoaded = true;
            checkLoading();
          },
          error => {
            console.error(error);
            setExpensesError(error);
            currentMonthLoaded = true;
            checkLoading();
          }
        );

        // Svi expenses dokumenti jednog korisnika
        const unsubscribeExpenses = onSnapshot(
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
            expensesLoaded = true;
            checkLoading();
          },
          error => {
            console.error(error);
            setExpensesError(error);
            expensesLoaded = true;
            checkLoading();
          }
        );

        // Clean up snapshot listener on component unmount
        return () => {
          unsubscribeCurrentMonth();
          unsubscribeExpenses();
        };
      } else {
        // Korisnik nije prijavljen
        console.error("User is not logged in");
        setExpensesLoading(false);
      }
    });

    // Clean up auth listener on component unmount
    return () => unsubscribeAuth();
  }, []);

  return { expensesCurrentMonth, expenses, expensesLoading, expensesError };
};
