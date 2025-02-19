"use client";

import { useEffect, useState } from "react";
import SkeletonLoader from "./SkeletonLoader";
import { useMonth } from "@/hooks/useMonth";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useExpenses } from "@/hooks/useExpenses";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { format } from "date-fns";

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
    // if (isExchangesLoading || errorExchanges !== null) return; // Skini komentar za PRODUKCIJU
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
    errorExchanges,
    expensesLoading,
    expensesError
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
      <div className="mb-4">
        <h3 className="font-bold text-textThird">
          Recent Expenses ({monthName})
        </h3>
        <div className="bg-gray-300 h-0.5 mt-1"></div>
      </div>

      {expensesLoading ? (
        <SkeletonLoader />
      ) : errorMessage ? (
        <div className="text-red-500 text-center p-4">{errorMessage}</div>
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between text-sm font-semibold text-textSecond pb-2 border-b border-gray-200">
            <span className="w-1/4">Description</span>
            <span className="w-1/4">Category</span>
            <span className="w-1/4">Amount</span>
            <span className="w-1/4">Date</span>
          </div>

          {/* Expense List */}
          {(expenses || []).slice(0, 5).map(expense => (
            <div
              key={expense.id}
              className="flex justify-between items-center text-sm pb-2 hover:bg-gray-50 rounded px-2"
            >
              <span className="w-1/4 truncate">{expense.description}</span>
              <span className="w-1/4 capitalize">{expense.category}</span>
              <span className="w-1/4">
                {expense.amount} {expense.currency}
              </span>
              <span className="w-1/4">
                {expense.date ? format(expense.date, "dd-MM-yyyy") : "N/A"}
              </span>
            </div>
          ))}

          {/* Monthly Summary */}
          <div className="pt-4 mt-2 border-t border-gray-200">
            <p className="text-center text-textSecond">
              Monthly Total:{" "}
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
