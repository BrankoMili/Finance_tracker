"use client";

import { useState } from "react";
import { Expense } from "@/types/expense";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { auth } from "@/lib/firebase";

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
      toast.success("Successfully Added", {
        style: {
          border: "1px solid rgb(229 231 235)",
          padding: "16px",
          color: "black"
        },
        iconTheme: {
          primary: "green",
          secondary: "rgb(229 231 235)"
        }
      });
    } catch (error) {
      toast.error("Something went wrong!", {
        style: {
          border: "1px solid rgb(229 231 235)",
          padding: "16px",
          color: "black"
        },
        iconTheme: {
          primary: "red",
          secondary: "rgb(229 231 235)"
        }
      });
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 mt-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Add Expense
      </h2>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
