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
  onSuccess?: () => void; // Add onSuccess callback prop
}

export default function ExpenseForm({ userCategories, onSuccess }: Props) {
  const [expense, setExpense] = useState<Expense>({
    amount: 0,
    description: "",
    descriptionLowerCase: "",
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

    const updatedExpense = {
      ...expense,
      descriptionLowerCase: expense.description.toLowerCase(),
      date: new Date(),
      userId: user.uid
    };

    // Add document ("expense") to Firebase "expenses" collection
    try {
      await addDoc(collection(db, "expenses"), updatedExpense);

      // Clear form after successful submission
      setExpense({
        amount: 0,
        description: "",
        descriptionLowerCase: "",
        category: "other",
        currency: "EUR",
        date: new Date(),
        userId: ""
      });
      showToast("success", "Successfully Added");
      onSuccess?.();
    } catch (error) {
      showToast("error", "Something went wrong!");
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-componentsBackground p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-full"
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
          onKeyDown={e => {
            // Block +, -, e, E (exponent)
            if (["e", "E", "+", "-"].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={e => {
            const value = e.target.value;
            if (value === "" || /^(\d+\.?\d*|\.\d+)$/.test(value)) {
              // Allow empty string or decimal positive numbers
              setExpense({
                ...expense,
                amount: value === "" ? 0 : Number(value)
              });
            }
          }}
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
          // Max number of characters 100
          maxLength={100}
          placeholder="e.g., Groceries"
          value={expense.description}
          onChange={e =>
            setExpense({
              ...expense,
              description: e.target.value.slice(0, 100) // Max number of characters 100
            })
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
