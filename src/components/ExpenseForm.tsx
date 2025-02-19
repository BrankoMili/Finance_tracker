"use client";

import { useState } from "react";
import { Expense } from "@/types/expense";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { showToast } from "@/utils/showToast";

export default function ExpenseForm() {
  const [expense, setExpense] = useState<Expense>({
    amount: 0,
    description: "",
    category: "other",
    currency: "EUR",
    date: new Date(),
    userId: auth.currentUser?.uid
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      console.error("User is not logged in");
      return;
    }

    // Add document ("expense") to Firebase "expenses" collection
    try {
      await addDoc(collection(db, "expenses"), expense);

      // Clear form after successful submission
      setExpense({
        amount: 0,
        description: "",
        category: "other",
        currency: "EUR",
        date: new Date(),
        userId: auth.currentUser?.uid
      });
      showToast("success", "Successfully Added");
    } catch (error) {
      showToast("error", "Something went wrong!");
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-componentsBackground p-6 mt-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-textSecond mb-6 text-center">
        Add Expense
      </h2>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-textSecond mb-1">
          Amount
        </label>
        <input
          type="number"
          placeholder="0.00"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={expense.amount || ""}
          onChange={e =>
            setExpense({ ...expense, amount: Number(e.target.value) })
          }
          required
        />
      </div>

      {/* Currency Select */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-textSecond mb-1">
          Currency
        </label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={expense.currency}
          onChange={e =>
            setExpense({
              ...expense,
              currency: e.target.value as Expense["currency"]
            })
          }
        >
          <option value="EUR">Euro (EUR)</option>
          <option value="RSD">Serbian Dinar (RSD)</option>
          <option value="USD">US Dolar (USD)</option>
        </select>
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-textSecond mb-1">
          Description
        </label>
        <input
          type="text"
          placeholder="e.g., Groceries"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={expense.description}
          onChange={e =>
            setExpense({ ...expense, description: e.target.value })
          }
          required
        />
      </div>

      {/* Category Select */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-textSecond mb-1">
          Category
        </label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={expense.category}
          onChange={e =>
            setExpense({
              ...expense,
              category: e.target.value as Expense["category"]
            })
          }
        >
          <option value="food">Food</option>
          <option value="housing">Housing</option>
          <option value="transport">Transport</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-secondary text-white py-2 px-4 rounded-lg hover:bg-thirdly focus:ring-2 focus:primary focus:ring-offset-2 transition-all"
      >
        Add
      </button>
    </form>
  );
}
