"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Expense } from "@/types/expense";
import { format, subDays, isSameDay } from "date-fns";
import SkeletonLoader from "../SkeletonLoader";

interface Props {
  userCurrency: string;
  expensesSevenDays: Expense[] | undefined;
  expensesLoading: boolean;
  expensesError: Error | null;
  exchangeRates: Record<string, number>;
  isExchangesLoading: boolean;
  errorExchanges: Error | null;
}

type SevenNumberArray = [
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

type SevenStringArray = [
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

export default function Last7Days({
  userCurrency,
  expensesSevenDays,
  expensesLoading,
  expensesError,
  exchangeRates,
  isExchangesLoading,
  errorExchanges
}: Props) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [amountPerDay, setAmountPerDay] = useState<
    SevenNumberArray | undefined
  >();
  const [datesLabels, setDatesLabels] = useState<
    SevenStringArray | undefined
  >();

  // sum of all expenses last 7 days per day
  useEffect(() => {
    if (Object.keys(exchangeRates).length === 0) return;
    if (isExchangesLoading || errorExchanges !== null) return;

    if (
      expensesSevenDays?.length === 0 ||
      expensesLoading ||
      expensesError !== null
    )
      return;

    const datesLabels: string[] = [];
    const dateObjects: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      dateObjects.push(date);
      datesLabels.push(format(date, "dd-MM"));
    }

    setDatesLabels(datesLabels as SevenStringArray);

    const weekArr = [0, 0, 0, 0, 0, 0, 0];

    expensesSevenDays?.forEach(expense => {
      if (!expense.date) return; // Skip if date is null or undefined

      const expenseDate = new Date(expense.date);
      expenseDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        if (isSameDay(dateObjects[i], expenseDate)) {
          if (expense.currency === userCurrency) {
            weekArr[i] += expense.amount;
          } else {
            weekArr[i] += expense.amount / exchangeRates[expense.currency];
          }
          break;
        }
      }
    });

    const weekArrTwoDecimals = weekArr.map(value => {
      return parseFloat(value.toFixed(2));
    });
    setAmountPerDay(weekArrTwoDecimals as SevenNumberArray);
  }, [
    expensesSevenDays,
    exchangeRates,
    userCurrency,
    isExchangesLoading,
    errorExchanges,
    expensesLoading,
    expensesError
  ]);

  useEffect(() => {
    Chart.register(...registerables);

    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (!ctx) return;

      const myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: datesLabels,
          datasets: [
            {
              label: "Expense",
              data: amountPerDay,
              backgroundColor: [
                "rgba(255, 99, 132, 0.7)",
                "rgba(255, 159, 64, 0.7)",
                "rgba(255, 205, 86, 0.7)",
                "rgba(75, 192, 192, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(153, 102, 255, 0.7)",
                "rgba(201, 203, 207, 0.7)"
              ],
              borderColor: [
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(201, 203, 207)"
              ],
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: `Amount (${userCurrency})`,
                color: "#6B7280"
              },
              grid: {
                color: "rgba(180, 180, 180, 0.61)"
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                // Dodaje se valuta
                label: function (context) {
                  return context.parsed.y + " " + userCurrency;
                }
              }
            }
          }
        }
      });

      return () => myChart.destroy();
    }
  }, [userCurrency, amountPerDay, datesLabels]);

  const error = expensesError || errorExchanges;
  const isLoading = expensesLoading || isExchangesLoading;
  const hasData = amountPerDay && datesLabels;

  return (
    <div className="bg-componentsBackground p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-full">
      <div className="mb-4">
        <h3 className="font-bold text-textThird">Last 7 days</h3>
        <div className="bg-gray-300 h-0.5 mt-1"></div>
      </div>

      <div className="flex-1 min-h-[300px] flex items-center justify-center">
        {error ? (
          // Error state
          <div className="text-red-500 text-center p-4 bg-red-100 rounded-lg">
            <p>Failed to load data</p>
            <p className="text-sm text-red-600 mt-2">{error.message}</p>
          </div>
        ) : isLoading ? (
          // Loading state
          <div className="text-blue-500">
            <SkeletonLoader />
          </div>
        ) : !hasData ? (
          // No data state
          <div className="text-textMain text-center">
            <div className="text-2xl mb-2">📭</div>
            <p>No expenses data available</p>
            <p className="text-sm">for the last 7 days</p>
          </div>
        ) : (
          // Chart
          <div
            className="w-full h-full"
            style={{ height: "calc(100% - 2rem)" }}
          >
            <canvas ref={chartRef}></canvas>
          </div>
        )}
      </div>
    </div>
  );
}
