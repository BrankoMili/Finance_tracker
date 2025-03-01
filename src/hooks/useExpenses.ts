import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp
} from "firebase/firestore";
import { useMonth } from "./useMonth";
import { db, auth } from "@/lib/firebase";
import { Expense } from "@/types/expense";
import { Filters } from "@/types/filters";

const defaultFilters: Filters = {
  category: "",
  minAmount: 0,
  maxAmount: 0,
  startDate: null,
  endDate: null,
  currency: ""
};

export const useExpenses = (appliedFilters: Filters = defaultFilters) => {
  const { startTimestamp, endTimestamp } = useMonth();
  const [expensesLoading, setExpensesLoading] = useState<boolean>(true);
  const [expenses, setExpenses] = useState<Expense[]>();
  const [expensesCurrentMonth, setExpensesCurrentMonth] = useState<Expense[]>();
  const [expensesSevenDays, setExpensesSevenDays] = useState<Expense[]>();
  const [expensesError, setExpensesError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        const collectionRef = collection(db, "expenses");

        const queryConditions = [
          where("userId", "==", user.uid),
          orderBy("date", "desc")
        ];

        if (appliedFilters) {
          // Apply category filter
          if (appliedFilters.category) {
            queryConditions.push(
              where("category", "==", appliedFilters.category)
            );
          }

          // Apply currency filter
          if (appliedFilters.currency) {
            queryConditions.push(
              where("currency", "==", appliedFilters.currency)
            );
          }

          // Apply amount range filters
          if (appliedFilters.minAmount > 0) {
            queryConditions.push(
              where("amount", ">=", appliedFilters.minAmount)
            );
          }
          if (appliedFilters.maxAmount > 0) {
            queryConditions.push(
              where("amount", "<=", appliedFilters.maxAmount)
            );
          }

          // Apply date range filters
          if (appliedFilters.startDate) {
            const startDate = new Date(appliedFilters.startDate);
            startDate.setHours(0, 0, 0, 0);
            queryConditions.push(
              where("date", ">=", Timestamp.fromDate(startDate))
            );
          }
          if (appliedFilters.endDate) {
            const endDate = new Date(appliedFilters.endDate);
            endDate.setHours(23, 59, 59, 999);
            queryConditions.push(
              where("date", "<=", Timestamp.fromDate(endDate))
            );
          }
        }

        const expensesQuery = query(collectionRef, ...queryConditions);

        const expensesCurrentMonthQuery = query(
          collectionRef,
          where("date", ">=", startTimestamp),
          where("date", "<", endTimestamp),
          where("userId", "==", user.uid),
          orderBy("date", "desc") // Sort by last created documents
        );

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);
        const todayTimestamp = Timestamp.fromDate(today);

        const expenses7DaysQuery = query(
          collectionRef,
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
          where("date", ">=", sevenDaysAgoTimestamp),
          where("date", "<", todayTimestamp)
        );

        let expensesLoaded = false;
        let currentMonthLoaded = false;
        let sevenDaysLoaded = false;

        const checkLoading = () => {
          if (currentMonthLoaded && expensesLoaded && sevenDaysLoaded) {
            setExpensesLoading(false);
          }
        };

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

        // Expenses dokumenti jednog korisnika u toku prethodnih 7 dana
        const unsubscribeSevenDays = onSnapshot(
          expenses7DaysQuery,
          snapshot => {
            const newData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,

                date: data.date?.toDate() || new Date()
              } as Expense;
            });

            setExpensesSevenDays(newData);
            sevenDaysLoaded = true;
            checkLoading();
          },
          error => {
            console.error(error);
            setExpensesError(error);
            sevenDaysLoaded = true;
            checkLoading();
          }
        );

        // Clean up snapshot listener on component unmount
        return () => {
          unsubscribeExpenses();
          unsubscribeCurrentMonth();
          unsubscribeSevenDays();
        };
      } else {
        // Korisnik nije prijavljen
        console.error("User is not logged in");
        setExpensesLoading(false);
      }
    });

    // Clean up auth listener on component unmount
    return () => unsubscribeAuth();
  }, [appliedFilters]);

  return {
    expenses,
    expensesCurrentMonth,
    expensesSevenDays,
    expensesLoading,
    expensesError
  };
};
