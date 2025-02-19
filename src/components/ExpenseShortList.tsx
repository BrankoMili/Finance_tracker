"use client";

import { useEffect, useState } from "react";
import SkeletonLoader from "./SkeletonLoader";
import { useMonth } from "@/hooks/useMonth";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useExpenses } from "@/hooks/useExpenses";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export default function ExpenseShortList() {
  const [monthSpendingAmount, setMonthSpendingAmount] = useState(0);
  const { expenses, expensesLoading, expensesError } = useExpenses();
  const { monthName } = useMonth();
  const [userCurrency, setUserCurrency] = useState("EUR");
  const { exchangeRates, isExchangesLoading, errorExchanges } =
    useExchangeRates(userCurrency);

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

  // sum of all expenses for this month
  useEffect(() => {
    if (Object.keys(exchangeRates).length === 0) return;
    // if (isExchangesLoading || errorExchanges !== null) return;   // Skini komentar za PRODUKCIJU
    if (expenses?.length === 0 || expensesLoading || expensesError !== null)
      return;

    let total = 0;
    expenses?.forEach(expense => {
      if (expense.currency === userCurrency) {
        total += expense.amount;
      } else {
        total += expense.amount / exchangeRates[expense.currency];
      }
    });
    setMonthSpendingAmount(total);
  }, [
    expenses,
    exchangeRates,
    userCurrency,
    isExchangesLoading,
    errorExchanges
  ]);

  // Check for errors
  const errorMessage = expensesError?.message || errorExchanges?.message;
  if (errorMessage) {
    return (
      <div className="bg-componentsBackground p-6 mt-10 rounded-xl shadow-lg max-w-md mx-auto">
        <p className="font-semibold text-textThird">
          Recent Expenses ({monthName})
        </p>
        <div className="bg-gray-300 h-0.5 mb-3"></div>
        <div className="text-red-500 text-center p-4">{errorMessage}</div>
      </div>
    );
  }

  return (
    <div className="bg-componentsBackground p-6 mt-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md mx-auto">
      <p className="font-bold text-textThird">Recent Expenses ({monthName})</p>
      <div className="bg-gray-300 h-0.5 mb-3"></div>
      {expensesLoading ? (
        <SkeletonLoader />
      ) : (
        <div>
          <main className="flex justify-between">
            <div>
              <p className="font-semibold text-textSecond">Description</p>
              <ul>
                {(expenses || []).slice(0, 5).map(expense => {
                  return <li key={expense.id}>{expense.description}</li>;
                })}
              </ul>
            </div>

            <div>
              <p className="font-semibold text-textSecond">Category</p>
              <ul>
                {(expenses || []).slice(0, 5).map(expense => {
                  return <li key={expense.id}>{expense.category}</li>;
                })}
              </ul>
            </div>

            <div>
              <p className="font-semibold text-textSecond">Amount</p>
              <ul>
                {(expenses || []).slice(0, 5).map(expense => {
                  return (
                    <li key={expense.id}>
                      {`${expense.amount} ${expense.currency}`}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="font-semibold text-textSecond">Date Added</p>
              <ul>
                {(expenses || []).slice(0, 5).map(expense => {
                  return (
                    <li key={expense.id}>
                      {expense.date
                        ?.toDate()
                        ?.toISOString()
                        ?.substring(0, 10) || "Invalid Date"}
                    </li>
                  );
                })}
              </ul>
            </div>
          </main>

          {/* Monthly spending */}
          <div>
            <p className="text-textSecond">
              This Month Spent:{" "}
              <span className="font-semibold">
                {monthSpendingAmount.toFixed(2)} {userCurrency}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
