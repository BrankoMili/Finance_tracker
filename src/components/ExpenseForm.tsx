"use client";

import { useState } from "react";
import { Expense } from "@/types/expense";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { showToast } from "@/utils/showToast";
import { CategoryItem } from "@/types/categoryItem";
import { CURRENCIES } from "@/constants/currencies";
import { Button } from "./shared/Button";
import { InputTextNumberPass } from "./shared/InputTextNumberPass";
import { Select } from "./shared/Select";

interface Props {
  userCategories: CategoryItem[] | undefined;
}

export default function ExpenseForm({ userCategories }: Props) {
  const [expense, setExpense] = useState<Expense>({
    amount: 0,
    description: "",
    category: "other",
    currency: "EUR",
    date: new Date(),
    userId: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      showToast("error", "User not logged in!");
      return;
    }

    // Add document ("expense") to Firebase "expenses" collection
    try {
      await addDoc(collection(db, "expenses"), {
        ...expense,
        date: new Date(),
        userId: user.uid
      });

      // Clear form after successful submission
      setExpense({
        amount: 0,
        description: "",
        category: "other",
        currency: "EUR",
        date: new Date(),
        userId: ""
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
      className="bg-componentsBackground p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-full"
    >
      <h2 className="text-2xl font-bold text-textSecond mb-6 text-center">
        Add Expense
      </h2>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-textSecond mb-1">
          Amount
        </label>
        <InputTextNumberPass
          type="number"
          placeholder="0.00"
          value={expense.amount || ""}
          onChange={e =>
            setExpense({ ...expense, amount: Number(e.target.value) })
          }
          required
        />
      </div>

      {/* Currency Select */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-textSecond mb-1">
          Currency
        </label>

        <Select
          value={expense.currency}
          onChange={e =>
            setExpense({
              ...expense,
              currency: e.target.value as Expense["currency"]
            })
          }
        >
          {Object.entries(CURRENCIES).map(([code, name]) => (
            <option key={code} value={code}>
              {name} ({code})
            </option>
          ))}
        </Select>
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-textSecond mb-1">
          Description
        </label>
        <InputTextNumberPass
          type="text"
          placeholder="e.g., Groceries"
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

        <Select
          value={expense.category}
          onChange={e =>
            setExpense({
              ...expense,
              category: e.target.value as Expense["category"]
            })
          }
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
        </Select>
      </div>

      {/* Submit Button */}
      <Button
        text="Add"
        type="submit"
        buttonWidth="fullWidth"
        buttonSize="small"
      />
    </form>
  );
}
