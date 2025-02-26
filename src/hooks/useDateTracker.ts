import { useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
  Timestamp,
  addDoc,
  updateDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Expense } from "@/types/expense";
import { showToast } from "@/utils/showToast";

const useDateTracker = () => {
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (!user) {
        return;
      }

      const checkDateAndUpdateExpenses = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        try {
          const collectionRef = collection(db, "subscriptions");
          const sbuscribtionsQuery = query(
            collectionRef,
            where("userId", "==", user.uid),
            where("date", ">=", Timestamp.fromDate(today)),
            where("date", "<=", Timestamp.fromDate(endOfDay)),
            orderBy("date", "desc") // Sort by last created documents
          );
          const querySnapshot = await getDocs(sbuscribtionsQuery);

          const newDate = new Date();
          newDate.setMonth(newDate.getMonth() + 1); // date month later

          const expensesData: Expense[] = [];
          querySnapshot.forEach(doc => {
            updateDoc(doc.ref, {
              date: newDate
            });

            expensesData.push(doc.data() as Expense);
          });

          for (const data of expensesData) {
            try {
              await addDoc(collection(db, "expenses"), {
                ...data,
                date: new Date(),
                userId: user.uid
              });
              showToast("success", `${data.description} added to expenses`);
            } catch (error) {
              console.error("Error adding expense:", error);
            }
          }
        } catch (error) {
          console.error(error);
        }
      };

      const now = new Date();
      const timeUntilMidnight =
        new Date(now).setHours(24, 0, 0, 0) - now.getTime();

      const timeout = setTimeout(() => {
        checkDateAndUpdateExpenses();
        setInterval(checkDateAndUpdateExpenses, 24 * 60 * 60 * 1000); // Provera na 24h
      }, timeUntilMidnight);

      return () => clearTimeout(timeout);
    });

    return () => unsubscribeAuth();
  }, []);
};

export default useDateTracker;
