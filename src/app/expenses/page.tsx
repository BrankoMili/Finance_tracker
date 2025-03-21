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
import SkeletonLoader from "@/components/SkeletonLoader";
import ExpenseForm from "@/components/ExpenseForm";
import { Fragment } from "react";
import { showToast } from "@/utils/showToast";
import { CURRENCIES } from "@/constants/currencies";
import { Filters } from "@/types/filters";
import { Button } from "@/components/shared/Button";
import { InputTextNumberPass } from "@/components/shared/InputTextNumberPass";
import { Select } from "@/components/shared/Select";
import { DatePicker } from "@/components/shared/DatePicker";
import ErrorComponent from "@/components/ErrorComponent";

export default function Expenses() {
  const [sortCategories, setSortCategories] = useState("descending");
  const { userCurrency, userCategories } = useUserPreferences();
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    category: "",
    minAmount: 0,
    maxAmount: 0,
    startDate: null,
    endDate: null,
    currency: ""
  });
  const [filters, setFilters] = useState<Filters>({
    category: "",
    minAmount: 0,
    maxAmount: 0,
    startDate: null,
    endDate: null,
    currency: ""
  });
  const { expenses, expensesLoading, expensesError } =
    useExpenses(appliedFilters);
  const { exchangeRates, isExchangesLoading, errorExchanges } =
    useExchangeRates(userCurrency);
  const [showFilters, setShowFilters] = useState(false);

  const [spendingAmount, setSpendingAmount] = useState<number>(0);
  const [expenseFormOpen, setExpenseFormOpen] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<boolean>(false);
  const [editItem, setEditItem] = useState<Expense | undefined>(undefined);

  const deleteItem = async (itemId: string) => {
    try {
      const expenseRef = doc(db, "expenses", itemId);
      await deleteDoc(expenseRef);
      showToast("success", "successfully deleted");
    } catch (error) {
      console.error("Error deleting expense: ", error);
      showToast("error", "Error deleting expense");
    }
  };

  const handleChangeItem = async () => {
    if (!editItem || !editItem.id) {
      return;
    }

    try {
      const expenseRef = doc(db, "expenses", editItem.id);

      await updateDoc(expenseRef, {
        description: editItem.description,
        category: editItem.category,
        amount: editItem.amount,
        currency: editItem.currency,
        date: editItem.date
      });

      showToast("success", "Successfully modified");
      setEditForm(false);
      setEditItem(undefined);
    } catch (error) {
      console.error(error);
      showToast("error", "Error updating");
    }
  };

  // sum of all expenses for this month
  useEffect(() => {
    if (Object.keys(exchangeRates).length === 0) return;
    if (isExchangesLoading || errorExchanges !== null) return;
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
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: "",
      minAmount: 0,
      maxAmount: 0,
      startDate: null,
      endDate: null,
      currency: ""
    };

    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  // Handle errors first
  if (expensesError || errorExchanges) {
    const error = expensesError || errorExchanges || new Error("Unknown error");
    return <ErrorComponent error={error} />;
  }

  return (
    <div className="bg-componentsBackground p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
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
              className="h-10 pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-black placeholder-textThird w-full"
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

      {/* EDIT Form */}
      {editForm && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto p-6 mt-8 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
          <XMarkIcon
            className="absolute right-3 top-2 h-6 w-6 text-textThird cursor-pointer hover:bg-[rgb(233,233,233)] w-6 h-6 flex items-center justify-center rounded-xl"
            onClick={() => setEditForm(false)}
          />
          {editItem !== undefined && (
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                {/* Description */}
                <label className="text-sm font-medium w-24">Description:</label>

                <InputTextNumberPass
                  textSize="small"
                  type="text"
                  onChange={e =>
                    setEditItem(prevState => ({
                      ...prevState!,
                      description: e.target.value
                    }))
                  }
                  value={editItem.description}
                />

                {/* Category */}
                <label className="text-sm font-medium w-24">Category:</label>

                <InputTextNumberPass
                  textSize="small"
                  type="text"
                  onChange={e =>
                    setEditItem(prevState => ({
                      ...prevState!,
                      category: e.target.value
                    }))
                  }
                  value={editItem.category}
                />

                {/* Amount */}
                <label className="text-sm font-medium w-24">Amount:</label>
                <InputTextNumberPass
                  textSize="small"
                  type="number"
                  step="0.01"
                  onChange={e =>
                    setEditItem(prevState => ({
                      ...prevState!,
                      amount: parseFloat(e.target.value)
                    }))
                  }
                  value={editItem.amount}
                />

                {/* Currency */}
                <label className="text-sm font-medium w-24">Currency:</label>
                <Select
                  textSize="small"
                  value={editItem.currency}
                  onChange={e =>
                    setEditItem(prevState => ({
                      ...prevState!,
                      currency: e.target.value as string
                    }))
                  }
                >
                  {Object.entries(CURRENCIES).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name} ({code})
                    </option>
                  ))}
                </Select>

                {/* Date */}
                <label className="text-sm font-medium w-24">Date:</label>
                <DatePicker
                  value={editItem.date}
                  onChange={date => {
                    setEditItem(prevState => ({
                      ...prevState!,
                      date
                    }));
                  }}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  onClick={() => setEditForm(false)}
                  text="Cancel"
                  buttonWidth="compact"
                  buttonSize="small"
                  buttonColor="gray"
                />

                <Button
                  text="Save Changes"
                  onClick={handleChangeItem}
                  buttonWidth="compact"
                  buttonSize="small"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-textMain">Filters</h4>
            <XMarkIcon
              className="text-textThird cursor-pointer hover:bg-[rgb(233,233,233)] w-6 h-6 flex items-center justify-center rounded-xl"
              onClick={() => setShowFilters(!showFilters)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-textSecond mb-1">
                Category
              </label>
              <Select
                textSize="small"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
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
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-textSecond mb-1">
                Min Amount
              </label>
              <InputTextNumberPass
                textSize="small"
                type="number"
                name="minAmount"
                value={filters.minAmount || ""}
                onChange={handleFilterChange}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textSecond mb-1">
                Max Amount
              </label>
              <InputTextNumberPass
                textSize="small"
                type="number"
                name="maxAmount"
                value={filters.maxAmount || ""}
                onChange={handleFilterChange}
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textSecond mb-1">
                Start Date
              </label>
              <DatePicker
                value={filters.startDate}
                onChange={date => {
                  setFilters(filters => ({
                    ...filters,
                    startDate: date ? date : null
                  }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textSecond mb-1">
                End Date
              </label>
              <DatePicker
                value={filters.endDate}
                onChange={date => {
                  setFilters(filters => ({
                    ...filters,
                    endDate: date ? date : null
                  }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-textSecond mb-1">
                Currency
              </label>
              <Select
                textSize="small"
                name="currency"
                value={filters.currency}
                onChange={handleFilterChange}
              >
                <option value="">All Currencies</option>
                {Object.entries(CURRENCIES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name} ({code})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              text="Clear"
              onClick={clearFilters}
              buttonColor="gray"
              buttonSize="small"
              buttonWidth="compact"
            />

            <Button
              text="Apply Filters"
              onClick={applyFilters}
              buttonSize="small"
              buttonWidth="compact"
            />
          </div>
        </div>
      )}

      {/* DESKTOP / TABLET VIEW */}
      <div className="hidden sm:flex justify-between sm:text-sm text-xs font-semibold text-textSecond pb-3 border-b border-gray-200 gap-5 mt-8">
        <span className="w-1/5 overflow-hidden text-ellipsis pr-2 text-textMain">
          Description
        </span>
        <span className="w-1/5 overflow-hidden text-ellipsis pr-2 text-textMain">
          Category
        </span>
        <span className="w-1/5 overflow-hidden text-ellipsis pr-2 text-textMain">
          Amount
        </span>
        <span
          className="w-1/5 overflow-hidden text-ellipsis pr-2 text-textMain cursor-pointer"
          onClick={() => {
            if (sortCategories === "ascending") {
              setSortCategories("descending");
            } else {
              setSortCategories("ascending");
            }
          }}
        >
          Date <span>{sortCategories === "ascending" ? " ↑" : " ↓"}</span>
        </span>
        <span className="w-1/5 overflow-hidden text-ellipsis pr-2 text-textMain">
          Actions
        </span>
      </div>

      {expensesLoading ? (
        <SkeletonLoader />
      ) : (
        expenses?.map(item => (
          <Fragment key={item.id}>
            {/* DESKTOP / TABLET VIEW */}
            <div
              key={`desktop-${item.id}`}
              className="hidden sm:flex justify-between text-sm font-semibold text-textSecond pb-3 border-b border-gray-200 gap-5 mt-8"
            >
              <span className="w-1/5 overflow-hidden text-ellipsis pr-2 text-textMain">
                {item.description}
              </span>
              <span className="w-1/5 overflow-hidden text-ellipsis pr-2 text-textMain">
                {item.category}
              </span>
              <span className="w-1/5 overflow-hidden text-ellipsis pr-2 text-textMain">
                {item.amount.toFixed(2)} {item.currency}
              </span>
              <span className="w-1/5 overflow-hidden text-ellipsis pr-2 text-textMain">
                {item.date ? format(item.date, "dd-MM-yyyy") : "N/A"}
              </span>
              <span className="w-1/5 flex items-center">
                <PencilIcon
                  onClick={() => {
                    setEditForm(!editForm);
                    setEditItem(item);
                  }}
                  className="h-5 w-5 text-primary mr-4 cursor-pointer"
                />
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

            {/* MOBILE VIEW */}
            <div
              key={`mobile-${item.id}`}
              className="sm:hidden p-3 border-b border-border mt-4 bg-background rounded-lg shadow-sm"
            >
              <div className="mb-2">
                <span className="font-semibold text-textMain">
                  Description:{" "}
                </span>
                <span className="text-textMain break-words">
                  {item.description}
                </span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-textMain">Category: </span>
                <span className="text-textMain">{item.category}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-textMain">Amount: </span>
                <span className="text-textMain">
                  {item.amount.toFixed(2)} {item.currency}
                </span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-textMain">Date: </span>
                <span className="text-textMain">
                  {item.date ? format(item.date, "dd-MM-yyyy") : "N/A"}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <PencilIcon
                  onClick={() => {
                    setEditForm(!editForm);
                    setEditItem(item);
                  }}
                  className="h-5 w-5 text-primary cursor-pointer"
                />
                <TrashIcon
                  onClick={() => {
                    if (item.id) {
                      deleteItem(item.id);
                    }
                  }}
                  className="h-5 w-5 text-red-500 cursor-pointer"
                />
              </div>
            </div>
          </Fragment>
        ))
      )}

      {/* Total sum */}
      {/* DESKTOP / TABLET VIEW */}
      <div className="hidden bg-background p-3 sm:flex justify-between text-sm font-semibold text-textMain pb-3 border-gray-200 gap-5 mt-8">
        <span className="w-1/5 font-bold">Total:</span>
        <span className="w-1/5"></span>
        <span className="w-1/5">
          {spendingAmount.toFixed(2)} {userCurrency}
        </span>
        <span className="w-1/5"></span>
        <span className="w-1/5"></span>
      </div>

      {/* MOBILE VIEW */}
      <div className="sm:hidden bg-background p-3 rounded-lg shadow-sm mt-4">
        <span className="font-bold text-textMain">Total: </span>
        <span className="text-textMain">
          {spendingAmount.toFixed(2)} {userCurrency}
        </span>
      </div>

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto max-h-[80vh] overflow-y-auto mt-8 w-11/12 max-w-md ">
        {expenseFormOpen && (
          <div className="relative">
            <ExpenseForm userCategories={userCategories} />
            <XMarkIcon
              className="absolute right-3 top-2 h-6 w-6 text-textThird cursor-pointer hover:bg-border w-6 h-6 flex items-center justify-center rounded-xl"
              onClick={() => setExpenseFormOpen(!expenseFormOpen)}
            />
          </div>
        )}
      </div>
      <div className="justify-end flex mt-4">
        <Button
          text="Add New"
          onClick={() => setExpenseFormOpen(!expenseFormOpen)}
          buttonWidth="compact"
        />
      </div>
    </div>
  );
}
