"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Currency } from "@/types/currency";
import { Expense } from "@/types/expense";

interface Props {
  userCurrency: Currency;
  expenses: Expense[] | undefined;
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

export default function Last7Days({
  userCurrency,
  expenses,
  expensesLoading,
  expensesError,
  exchangeRates,
  isExchangesLoading,
  errorExchanges
}: Props) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [amountPerDay, setAmountPerDay] = useState<SevenNumberArray>([
    0, 0, 0, 0, 0, 0, 0
  ]);

  // sum of all expenses last 7 days per day
  useEffect(() => {
    if (Object.keys(exchangeRates).length === 0) return;
    // if (isExchangesLoading || errorExchanges !== null) return; // Skini komentar za PRODUKCIJU
    if (expenses?.length === 0 || expensesLoading || expensesError !== null)
      return;

    console.log(expenses);

    const week = {
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      sat: 0,
      sun: 0
    };

    expenses?.forEach(expense => {
      if (expense.currency === userCurrency) {
        if (expense.date.getDay() === 1) {
          week.mon += expense.amount;
        }
        if (expense.date.getDay() === 2) {
          week.thu += expense.amount;
        }
        if (expense.date.getDay() === 3) {
          week.wed += expense.amount;
        }
        if (expense.date.getDay() === 4) {
          week.thu += expense.amount;
        }
        if (expense.date.getDay() === 5) {
          week.fri += expense.amount;
        }
        if (expense.date.getDay() === 6) {
          week.sat += expense.amount;
        }
        if (expense.date.getDay() === 0) {
          week.sun += expense.amount;
        }
      } else {
        if (expense.date.getDay() === 1) {
          week.mon += expense.amount / exchangeRates[expense.currency];
        }
        if (expense.date.getDay() === 2) {
          week.thu += expense.amount / exchangeRates[expense.currency];
        }
        if (expense.date.getDay() === 3) {
          week.wed += expense.amount / exchangeRates[expense.currency];
        }
        if (expense.date.getDay() === 4) {
          week.thu += expense.amount / exchangeRates[expense.currency];
        }
        if (expense.date.getDay() === 5) {
          week.fri += expense.amount / exchangeRates[expense.currency];
        }
        if (expense.date.getDay() === 6) {
          week.sat += expense.amount / exchangeRates[expense.currency];
        }
        if (expense.date.getDay() === 0) {
          week.sun += expense.amount / exchangeRates[expense.currency];
        }
      }
    });

    setAmountPerDay([
      parseFloat(week.mon.toFixed(2)),
      parseFloat(week.tue.toFixed(2)),
      parseFloat(week.wed.toFixed(2)),
      parseFloat(week.thu.toFixed(2)),
      parseFloat(week.fri.toFixed(2)),
      parseFloat(week.sat.toFixed(2)),
      parseFloat(week.sun.toFixed(2))
    ]);
  }, [
    expenses,
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
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
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
                // Dodajemo valutu u tooltip
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
  }, [userCurrency, amountPerDay]);

  return (
    <div className="bg-componentsBackground p-6 mt-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="font-bold text-textThird">Last 7 days</h3>
        <div className="bg-gray-300 h-0.5 mt-1"></div>
      </div>

      <div className="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
