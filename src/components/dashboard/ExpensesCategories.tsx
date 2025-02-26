"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { TooltipItem } from "chart.js"; // Import za tipove
import { Currency } from "@/types/currency";
import { Expense } from "@/types/expense";
import { CategoryItem } from "@/types/categoryItem";
import { useMonth } from "@/hooks/useMonth";

interface Props {
  userCurrency: Currency;
  expensesCurrentMonth: Expense[] | undefined;
  expensesLoading: boolean;
  expensesError: Error | null;
  exchangeRates: Record<string, number>;
  isExchangesLoading: boolean;
  errorExchanges: Error | null;
  userCategories: CategoryItem[] | undefined;
}

export default function ExpensesCategories({
  userCurrency,
  expensesCurrentMonth,
  expensesLoading,
  expensesError,
  exchangeRates,
  isExchangesLoading,
  errorExchanges,
  userCategories
}: Props) {
  const { monthName } = useMonth();
  const [amountPerCategory, setAmountPerCategory] = useState<number[]>([]);

  useEffect(() => {
    if (
      expensesLoading ||
      expensesError !== null ||
      !userCategories ||
      userCategories.length === 0
    ) {
      return;
    }

    if (isExchangesLoading || errorExchanges !== null) return; // Skini komentar za PRODUKCIJU

    const categories = userCategories.map(item => item.name.toLowerCase());
    const amountByCategory = Array(categories.length).fill(0);

    expensesCurrentMonth?.forEach(expense => {
      const amount =
        expense.currency === userCurrency
          ? expense.amount
          : expense.amount / exchangeRates[expense.currency];

      const index = categories.indexOf(expense.category);
      amountByCategory[index !== -1 ? index : categories.length - 1] += amount;
    });

    const amountByCategoryTwoDecimals = amountByCategory.map(value =>
      Number(value.toFixed(2))
    );
    setAmountPerCategory(amountByCategoryTwoDecimals);
  }, [
    expensesCurrentMonth,
    exchangeRates,
    userCurrency,
    isExchangesLoading,
    errorExchanges,
    expensesLoading,
    expensesError,
    userCategories
  ]);

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"pie">) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.raw !== null) {
              // Promijenjeno sa context.parsed na context.raw
              label += `${context.raw} ${userCurrency}`;
            }
            return label;
          }
        }
      }
    }
  };

  // Create filtered data array
  const filteredData =
    userCategories
      ?.map((category, index) => ({
        name: category.name,
        amount: amountPerCategory?.[index] || 0
      }))
      .filter(item => item.amount.valueOf() > 0) || [];

  const chartData = {
    labels: filteredData.map(item => item.name),
    datasets: [
      {
        data: filteredData.map(item => item.amount),
        backgroundColor: [
          "#FF6384",
          "#FF9F40",
          "#FFCD56",
          "#4BC0C0",
          "#36A2EB",
          "#9966FF",
          "#C9CBCF",
          "#50C878",
          "#FF69B4",
          "#800080"
        ],
        hoverOffset: 4
      }
    ]
  };

  if (userCategories?.length === 0) {
    return (
      <div className="bg-componentsBackground p-6 rounded-xl">
        <h3 className="text-textThird">
          No categories found. Add categories to track expenses.
        </h3>
      </div>
    );
  }

  return (
    <div className="bg-componentsBackground p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-full">
      <div className="mb-4">
        <h3
          className="font-bold text-textThird"
          onClick={() => console.log(amountPerCategory)}
        >
          Spending by categories ({monthName}) in {userCurrency}
        </h3>
        <div className="bg-gray-300 h-0.5 mt-1"></div>
      </div>
      <div className="h-[calc(100%-2rem)] flex justify-center">
        <Pie data={chartData} options={options} className="max-w-80 max-h-80" />
      </div>
    </div>
  );
}
