"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Currency } from "@/types/currency";
import { Expense } from "@/types/expense";
import { format } from "date-fns";

interface Props {
  userCurrency: Currency;
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
    // if (isExchangesLoading || errorExchanges !== null) return; // Skini komentar za PRODUKCIJU

    if (
      expensesSevenDays?.length === 0 ||
      expensesLoading ||
      expensesError !== null
    )
      return;

    // Upisivanje datuma od prethnodnih 7 dana u niz
    const datesLabels = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    for (let i = 0; i < 7; i++) {
      datesLabels.push(format(sevenDaysAgo, "dd-MM"));
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() + 1);
    }

    setDatesLabels(datesLabels as SevenStringArray);

    // Upisivanje troskova od prethnodnih 7 dana u niz
    const weekArr = [0, 0, 0, 0, 0, 0, 0];

    expensesSevenDays?.forEach(expense => {
      if (expense.currency === userCurrency) {
        if (today.getDate() - 7 === expense.date.getDate()) {
          weekArr[0] += expense.amount;
        }
        if (today.getDate() - 6 === expense.date.getDate()) {
          weekArr[1] += expense.amount;
        }
        if (today.getDate() - 5 === expense.date.getDate()) {
          weekArr[2] += expense.amount;
        }
        if (today.getDate() - 4 === expense.date.getDate()) {
          weekArr[3] += expense.amount;
        }
        if (today.getDate() - 3 === expense.date.getDate()) {
          weekArr[4] += expense.amount;
        }
        if (today.getDate() - 2 === expense.date.getDate()) {
          weekArr[5] += expense.amount;
        }
        if (today.getDate() - 1 === expense.date.getDate()) {
          weekArr[6] += expense.amount;
        }
      } else {
        if (today.getDate() - 7 === expense.date.getDate()) {
          weekArr[0] += expense.amount / exchangeRates[expense.currency];
        }
        if (today.getDate() - 6 === expense.date.getDate()) {
          weekArr[1] += expense.amount / exchangeRates[expense.currency];
        }
        if (today.getDate() - 5 === expense.date.getDate()) {
          weekArr[2] += expense.amount / exchangeRates[expense.currency];
        }
        if (today.getDate() - 4 === expense.date.getDate()) {
          weekArr[3] += expense.amount / exchangeRates[expense.currency];
        }
        if (today.getDate() - 3 === expense.date.getDate()) {
          weekArr[4] += expense.amount / exchangeRates[expense.currency];
        }
        if (today.getDate() - 2 === expense.date.getDate()) {
          weekArr[5] += expense.amount / exchangeRates[expense.currency];
        }
        if (today.getDate() - 1 === expense.date.getDate()) {
          weekArr[6] += expense.amount / exchangeRates[expense.currency];
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
  }, [userCurrency, amountPerDay]);

  return (
    <div className="relative bg-componentsBackground p-6 mt-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full flex flex-col h-">
      <div className="mb-4">
        <h3 className="font-bold text-textThird">Last 7 days</h3>
        <div className="bg-gray-300 h-0.5 mt-1"></div>
      </div>
      <div className="flex-1" style={{ height: "calc(100% - 2rem)" }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
