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
  const [amountPerCategory, setAmountPerCategory] = useState<Number[]>();

  useEffect(() => {
    if (Object.keys(exchangeRates).length === 0) return;
    // if (isExchangesLoading || errorExchanges !== null) return; // Skini komentar za PRODUKCIJU

    if (
      expensesCurrentMonth?.length === 0 ||
      expensesLoading ||
      expensesError !== null ||
      userCategories?.length === 0
    ) {
      return;
    }

    const categories =
      userCategories?.map(item => {
        return item.name.toLowerCase();
      }) || [];
    const amountByCategory = Array(categories.length).fill(0);

    expensesCurrentMonth?.forEach(expense => {
      const amount =
        expense.currency === userCurrency
          ? expense.amount
          : expense.amount / exchangeRates[expense.currency];

      const index = categories.indexOf(expense.category);
      amountByCategory[index !== -1 ? index : categories.length - 1] += amount;
    });

    const amountByCategoryTwoDecimals = amountByCategory.map(value => {
      return parseFloat(value.toFixed(2));
    });
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

  const chartData = {
    labels: userCategories?.map(item => {
      return item.name;
    }),
    datasets: [
      {
        data: amountPerCategory,
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

  return (
    <div className="bg-componentsBackground p-6 mt-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="font-bold text-textThird">
          Spending by categories ({monthName}) in {userCurrency}
        </h3>
        <div className="bg-gray-300 h-0.5 mt-1"></div>
      </div>
      <Pie data={chartData} options={options} />
    </div>
  );
}
