"use client";

import { useEffect, useState } from "react";
import SkeletonLoader from "../SkeletonLoader";
import { useMonth } from "@/hooks/useMonth";
import { format } from "date-fns";
import { Currency } from "@/types/currency";
import { Expense } from "@/types/expense";

interface Props {
  userCurrency: Currency;
  expensesCurrentMonth: Expense[] | undefined;
  expensesLoading: boolean;
  expensesError: Error | null;
  exchangeRates: Record<string, number>;
  isExchangesLoading: boolean;
  errorExchanges: Error | null;
}

export default function ExpenseShortList({
  userCurrency,
  expensesCurrentMonth,
  expensesLoading,
  expensesError,
  exchangeRates,
  isExchangesLoading,
  errorExchanges
}: Props) {
  const [monthSpendingAmount, setMonthSpendingAmount] = useState<number>(0);
  const { monthName } = useMonth();

  // sum of all expenses for this month
  useEffect(() => {
    if (Object.keys(exchangeRates).length === 0) return;
    if (isExchangesLoading || errorExchanges !== null) return; // Skini komentar za PRODUKCIJU
    if (
      expensesCurrentMonth?.length === 0 ||
      expensesLoading ||
      expensesError !== null
    )
      return;

    let total = 0;
    expensesCurrentMonth?.forEach(expense => {
      if (expense.currency === userCurrency) {
        total += expense.amount;
      } else {
        total += expense.amount / exchangeRates[expense.currency];
      }
    });
    setMonthSpendingAmount(total);
  }, [
    expensesCurrentMonth,
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
      <div className="bg-componentsBackground p-6 rounded-xl shadow-lg max-w-md mx-auto">
        <p className="font-semibold text-textThird">
          Recent Expenses ({monthName})
        </p>
        <div className="bg-gray-300 h-0.5 mb-3"></div>
        <div className="text-red-500 text-center p-4">{errorMessage}</div>
      </div>
    );
  }

  return (
    <div className="bg-componentsBackground p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-full mx-auto">
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
          <div className="flex justify-between text-sm font-semibold text-textSecond pb-2 border-b border-gray-200 gap-5">
            <span className="w-1/4">Description</span>
            <span className="w-1/4">Category</span>
            <span className="w-1/4">Amount</span>
            <span className="w-1/4">Date</span>
          </div>

          {/* Expense List */}
          {(expensesCurrentMonth || []).slice(0, 5).map(expense => (
            <div
              key={expense.id}
              className="flex justify-between items-center text-sm pb-2 rounded px-2 gap-5"
            >
              <span className="w-1/4 overflow-hidden text-ellipsis pr-2 text-textMain">
                {expense.description}
              </span>
              <span className="w-1/4 overflow-hidden text-ellipsis pr-2 text-textMain">
                {expense.category}
              </span>
              <span className="w-1/4 overflow-hidden text-ellipsis pr-2 text-textMain">
                {expense.amount.toFixed(2)} {expense.currency}
              </span>
              <span className="w-1/4 overflow-hidden text-ellipsis pr-2 text-textMain">
                {expense.date ? format(expense.date, "dd-MM-yyyy") : "N/A"}
              </span>
            </div>
          ))}
        </div>
      )}
      {/* Monthly Summary */}
      <div className="pt-4 border-t border-gray-200 mt-auto">
        <p className="text-center text-textSecond">
          Monthly Total:{" "}
          <span className="font-semibold">
            {monthSpendingAmount.toFixed(2)} {userCurrency}
          </span>
        </p>
      </div>
    </div>
  );
}
