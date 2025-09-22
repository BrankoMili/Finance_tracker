import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Expense } from "@/types/expense";

export const useSubscriptions = () => {
  const [subscriptionsLoading, setSubscriptionsLoading] =
    useState<boolean>(true);
  const [subscriptionsError, setSubscriptionsError] = useState<Error | null>(
    null
  );
  const [subscriptions, setSubscriptions] = useState<Expense[]>();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        const collectionRef = collection(db, "subscriptions");

        const subscriptionQuery = query(
          collectionRef,
          where("userId", "==", user.uid),
          orderBy("date", "asc") // Sort by last created documents
        );

        setSubscriptionsLoading(true);

        const unsubscribeSubscribtions = onSnapshot(
          subscriptionQuery,
          snapshot => {
            const newData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,

                date: data.date?.toDate() || new Date()
              } as Expense;
            });

            setSubscriptions(newData);
            setSubscriptionsLoading(false);
          },
          error => {
            console.error(error);
            setSubscriptionsError(error);
            setSubscriptionsLoading(false);
          }
        );

        // Clean up snapshot listener on component unmount
        return () => {
          unsubscribeSubscribtions();
        };
      } else {
        // Korisnik nije prijavljen
        console.error("User is not logged in");
        setSubscriptionsLoading(false);
      }
    });

    // Clean up auth listener on component unmount
    return () => unsubscribeAuth();
  }, []);

  return {
    subscriptionsError,
    subscriptionsLoading,
    subscriptions
  };
};
