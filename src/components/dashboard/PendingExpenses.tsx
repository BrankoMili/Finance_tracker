"use client";

import SkeletonLoader from "../SkeletonLoader";
import { useState, useEffect } from "react";
import { Currency } from "@/types/currency";
import { collection, addDoc } from "firebase/firestore";
import { showToast } from "@/utils/showToast";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { CURRENCIES } from "@/constants/currencies";
import { CategoryItem } from "@/types/categoryItem";
import { Expense } from "@/types/expense";

interface Props {
  userCurrency: Currency;
  subscriptionsError: Error | null;
  subscriptionsLoading: boolean;
  subscriptions: Expense[] | undefined;
  exchangeRates: Record<string, number>;
  errorExchanges: Error | null;
  isExchangesLoading: boolean;
  userCategories: CategoryItem[] | undefined;
}

export default function PendingExpenses({
  userCurrency,
  subscriptionsError,
  subscriptionsLoading,
  subscriptions,
  exchangeRates,
  errorExchanges,
  isExchangesLoading,
  userCategories
}: Props) {
  const [showSubscriptionForm, setShowSubscriptionForm] =
    useState<boolean>(false);

  const [subscription, setSubscription] = useState<Expense>({
    amount: 0,
    description: "",
    category: "other",
    currency: "EUR",
    date: new Date(),
    userId: ""
  });
  const [subscriptionAmount, setSubscriptionAmount] = useState<number>(0);

  const handleForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      showToast("error", "User not logged in!");
      return;
    }

    // Add document to Firebase "subscriptions" collection
    try {
      await addDoc(collection(db, "subscriptions"), {
        ...subscription,
        userId: user.uid
      });

      // Clear form after successful submission
      setSubscription({
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

  // sum of all expenses for this month
  useEffect(() => {
    if (Object.keys(exchangeRates).length === 0) return;
    if (isExchangesLoading || errorExchanges !== null) return; // Skini komentar za PRODUKCIJU
    if (
      subscriptions?.length === 0 ||
      subscriptionsLoading ||
      subscriptionsError !== null
    )
      return;

    let total = 0;
    subscriptions?.forEach(item => {
      if (item.currency === userCurrency) {
        total += item.amount;
      } else {
        total += item.amount / exchangeRates[item.currency];
      }
    });
    setSubscriptionAmount(total);
  }, [
    subscriptions,
    exchangeRates,
    userCurrency,
    subscriptionsLoading,
    subscriptionsError,
    errorExchanges
  ]);

  // Check for errors
  const errorMessage = subscriptionsError?.message || errorExchanges?.message;
  if (errorMessage) {
    return (
      <div className="bg-componentsBackground p-6 rounded-xl shadow-lg max-w-md mx-auto">
        <div className="text-red-400 text-center p-4">{errorMessage}</div>
      </div>
    );
  }

  return (
    <div className="bg-componentsBackground p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-full">
      {showSubscriptionForm && (
        <form
          onSubmit={handleForm}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto bg-componentsBackground p-6 mt-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <p
            className="absolute top-2 right-4 font-bold text-textSecond cursor-pointer text-lg hover:text-textMain"
            onClick={() => setShowSubscriptionForm(false)}
          >
            x
          </p>
          <h2 className="font-bold text-textSecond mb-6 text-center">
            Add new subscription
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
              value={subscription.amount || ""}
              onChange={e => {
                setSubscription({
                  ...subscription,
                  amount: Number(e.target.value)
                });
              }}
              required
            />
          </div>

          {/* Currency Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-textSecond mb-1">
              Currency
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all [&>option]:text-sm [&>option]:p-1"
              value={subscription.currency}
              onChange={e =>
                setSubscription({
                  ...subscription,
                  currency: e.target.value as Expense["currency"]
                })
              }
            >
              {Object.entries(CURRENCIES).map(([code, name]) => (
                <option key={code} value={code}>
                  {name} ({code})
                </option>
              ))}
            </select>
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-textSecond mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g., Youtube Premium"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={subscription.description}
              onChange={e =>
                setSubscription({
                  ...subscription,
                  description: e.target.value
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
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={subscription.category}
              onChange={e =>
                setSubscription({
                  ...subscription,
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
            </select>
          </div>

          {/* Date Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-textSecond mb-1">
              Date - Monthly subscription
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              onChange={e =>
                setSubscription({
                  ...subscription,
                  date: new Date(e.target.value)
                })
              }
              required
            />
          </div>

          <button
            type="submit"
            className="ml-10 bg-secondary text-white py-1 px-3 rounded-lg hover:bg-thirdly focus:ring-2 focus:primary focus:ring-offset-2 transition-all"
          >
            Add Subscription
          </button>
        </form>
      )}

      <div className="mb-4">
        <h3 className="font-bold text-textThird">
          Pending Subscriptions / Expenses
        </h3>
        <div className="bg-gray-300 h-0.5 mt-1"></div>
      </div>

      {subscriptionsLoading ? (
        <SkeletonLoader />
      ) : (
        <div>
          {subscriptions?.map(item => {
            return (
              <div
                className="flex justify-between items-center text-sm pb-2 rounded px-2"
                key={item.id}
              >
                <span className="w-1/4 text-textMain">{item.description}</span>
                <span className="w-1/4 text-textMain">
                  {item.amount.toFixed(2)} {item.currency}
                </span>
                <span className="w-1/4 text-textMain">
                  {item.date ? format(item.date, "dd-MM-yyyy") : "N/A"}
                </span>
              </div>
            );
          })}

          {/* Monthly Summary */}
          <div className="pt-4 mt-2 border-t border-gray-200 flex items-center justify-center">
            <p className="text-center text-textSecond text-sm">
              Monthly Total:{" "}
              <span className="font-semibold">
                {subscriptionAmount.toFixed(2)} {userCurrency}
              </span>
            </p>
            <button
              onClick={() => setShowSubscriptionForm(!showSubscriptionForm)}
              className="ml-10 bg-secondary text-white text-sm py-1 px-2 rounded-lg hover:bg-thirdly focus:ring-2 focus:primary focus:ring-offset-2 transition-all"
            >
              New Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
