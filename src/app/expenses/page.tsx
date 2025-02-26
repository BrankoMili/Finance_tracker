"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { format } from "date-fns";
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useExpenses } from "@/hooks/useExpenses";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { Expense } from "@/types/expense";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CategoryItem } from "@/types/categoryItem";
import SkeletonLoader from "@/components/SkeletonLoader";
import ExpenseForm from "@/components/ExpenseForm";

export default function Expenses() {
  const [sortCategories, setSortCategories] = useState("descending");
  const { userCurrency, userCategories } = useUserPreferences();
  const { expenses, expensesLoading, expensesError } = useExpenses();
  const { exchangeRates, isExchangesLoading, errorExchanges } =
    useExchangeRates(userCurrency);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: ""
  });
  const [spendingAmount, setSpendingAmount] = useState<number>(0);
  const [expenseFormOpen, setExpenseFormOpen] = useState<boolean>(false);

  const deleteItem = async (itemId: string) => {
    try {
      const expenseRef = doc(db, "expenses", itemId);
      await deleteDoc(expenseRef);
    } catch (error) {
      console.error("Error deleting expense: ", error);
    }
  };

  // sum of all expenses for this month
  useEffect(() => {
    if (Object.keys(exchangeRates).length === 0) return;
    if (isExchangesLoading || errorExchanges !== null) return; // Skini komentar za PRODUKCIJU
    if (expensesLoading || expensesError !== null) return;

    let total = 0;
    expenses?.forEach(expense => {
      if (expense.currency === userCurrency) {
        total += expense.amount;
      } else {
        total += expense.amount / exchangeRates[expense.currency];
      }
    });
    setSpendingAmount(total);
  }, [
    expenses,
    exchangeRates,
    userCurrency,
    isExchangesLoading,
    errorExchanges,
    expensesLoading,
    expensesError
  ]);

  const handleFilterChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = () => {
    console.log("Applying filters:", filters);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: ""
    });
  };

  return (
    <div className="bg-componentsBackground p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-textMain">
          List of expenses
        </h3>
        {/* search bar */}
        <div className="flex items-center">
          <div className="relative flex-1 max-w-48">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <MagnifyingGlassIcon className="h-5 w-5 text-textThird" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="text-black h-10 pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-textMain placeholder-textThird w-full"
            />
          </div>

          <div
            className={`ml-3 border p-2 rounded-lg cursor-pointer ${
              showFilters ? "bg-primary text-white" : ""
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon
              className={`h-5 w-5 ${
                showFilters ? "text-white" : "text-textMain hover:text-primary"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-textMain">Filters</h4>
            <XMarkIcon
              className="h-5 w-5 text-textThird cursor-pointer hover:text-textMain"
              onClick={() => setShowFilters(!showFilters)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-textSecond mb-1">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {userCategories?.map(category => {
                  return (
                    <option
                      key={category.id}
                      value={category.name.toLocaleLowerCase()}
                    >
                      {category.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-textSecond mb-1">
                Min Amount
              </label>
              <input
                type="number"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textSecond mb-1">
                Max Amount
              </label>
              <input
                type="number"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                placeholder="1000"
                className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textSecond mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textSecond mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-textSecond hover:text-textMain focus:outline-none"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between text-sm font-semibold text-textSecond pb-3 border-b border-gray-200 gap-5 mt-8">
        <span className="w-1/5">Description</span>
        <span className="w-1/5">Category</span>
        <span className="w-1/5">Amount</span>
        <span
          className="w-1/5 cursor-pointer"
          onClick={() => {
            sortCategories === "ascending"
              ? setSortCategories("descending")
              : setSortCategories("ascending");
          }}
        >
          Date <span>{sortCategories === "ascending" ? " ↑" : " ↓"}</span>
        </span>
        <span className="w-1/5">Actions</span>
      </div>
      {expensesLoading ? (
        <SkeletonLoader />
      ) : (
        expenses?.map(item => {
          return (
            <div
              key={item.id}
              className="flex justify-between text-sm font-semibold text-textSecond pb-3 border-b border-gray-200 gap-5 mt-8"
            >
              <span className="w-1/5">{item.description}</span>
              <span className="w-1/5">{item.category}</span>
              <span className="w-1/5">
                {item.amount.toFixed(2)} {item.currency}
              </span>
              <span className="w-1/5">
                {item.date ? format(item.date, "dd-MM-yyyy") : "N/A"}
              </span>
              <span className="w-1/5 flex items-center">
                <PencilIcon className="h-5 w-5 text-primary mr-4 cursor-pointer" />
                <TrashIcon
                  onClick={() => {
                    if (item.id) {
                      deleteItem(item.id);
                    }
                  }}
                  className="h-5 w-5 text-red-500 cursor-pointer"
                />
              </span>
            </div>
          );
        })
      )}

      <div className="flex justify-between text-sm font-semibold text-textMain pb-3 border-gray-200 gap-5 mt-8">
        <span className="w-1/5 font-bold">Total:</span>
        <span className="w-1/5"></span>
        <span className="w-1/5">
          {spendingAmount.toFixed(2)} {userCurrency}
        </span>
        <span className="w-1/5"></span>
        <span className="w-1/5"></span>
      </div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto">
        {expenseFormOpen && (
          <div className="relative">
            <ExpenseForm userCategories={userCategories} />
            <span
              onClick={() => setExpenseFormOpen(!expenseFormOpen)}
              className="absolute top-1 right-2 text-xl text-textSecond cursor-pointer hover:text-textMain"
            >
              x
            </span>
          </div>
        )}
      </div>
      <div className="justify-end flex">
        <button
          onClick={() => setExpenseFormOpen(!expenseFormOpen)}
          className="bg-secondary text-white py-2 px-4 rounded-lg hover:bg-thirdly focus:ring-2 focus:primary focus:ring-offset-2 transition-all"
        >
          Add New
        </button>
      </div>
    </div>
  );
}
