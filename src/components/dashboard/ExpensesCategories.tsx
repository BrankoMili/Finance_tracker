"use client";

import { useEffect, useRef, useState } from "react";
import { Pie } from "react-chartjs-2";
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

export default function ExpensesCategories({
  userCurrency,
  expensesCurrentMonth,
  expensesLoading,
  expensesError,
  exchangeRates,
  isExchangesLoading,
  errorExchanges
}: Props) {
  useEffect(() => {
    if (Object.keys(exchangeRates).length === 0) return;
    // if (isExchangesLoading || errorExchanges !== null) return; // Skini komentar za PRODUKCIJU
    if (
      expensesCurrentMonth?.length === 0 ||
      expensesLoading ||
      expensesError !== null
    )
      return;

    console.log(expensesCurrentMonth);
  }, [
    expensesCurrentMonth,
    exchangeRates,
    userCurrency,
    isExchangesLoading,
    errorExchanges,
    expensesLoading,
    expensesError
  ]);

  const chartData = {
    labels: ["Food", "Housing", "Transport", "Other"],
    datasets: [
      {
        data: [300, 200, 400, 900],
        backgroundColor: [
          "#FF6384", // Roza za hranu
          "#36A2EB", // Plavo za stanovanje
          "#FFCE56", // Žuto za transport
          "#4BC0C0" // Tirkizno za ostalo
        ],
        hoverOffset: 4
      }
    ]
  };

  return (
    <div className="bg-componentsBackground p-6 mt-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="font-bold text-textThird">Spending Categories</h3>
        <div className="bg-gray-300 h-0.5 mt-1"></div>
      </div>
      <Pie data={chartData} />
    </div>
  );
}
