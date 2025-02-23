"use client";

import SkeletonLoader from "../SkeletonLoader";
import { useState } from "react";
import { Currency } from "@/types/currency";
import { Subscription } from "@/types/subscription";

interface Props {
  userCurrency: Currency;
}

export default function PendingExpenses({ userCurrency }: Props) {
  const [pendindLoading, setPendndingLoading] = useState<boolean>(false);
  const [showSubscriptionForm, setShowSubscriptionForm] =
    useState<boolean>(false);

  const [subscription, setSubscription] = useState<Subscription>({
    amount: 0,
    description: "",
    currency: "EUR",
    date: new Date(),
    userId: ""
  });

  return (
    <div className="bg-componentsBackground p-6 mt-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full">
      {showSubscriptionForm && (
        <form className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto bg-componentsBackground p-6 mt-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={subscription.currency}
              onChange={e =>
                setSubscription({
                  ...subscription,
                  currency: e.target.value as Subscription["currency"]
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

      {pendindLoading ? (
        <SkeletonLoader />
      ) : (
        <div>
          <div className="flex justify-between items-center text-sm pb-2 rounded px-2">
            <span className="w-1/4 text-textMain ">Youtube premium</span>
            <span className="w-1/4 text-textMain">10$</span>
            <span className="w-1/4 text-textMain">05-02.2025</span>
          </div>
          <div className="flex justify-between items-center text-sm pb-2 rounded px-2">
            <span className="w-1/4 text-textMain ">ChatGPT</span>
            <span className="w-1/4 text-textMain">15$</span>
            <span className="w-1/4 text-textMain">20-02.2025</span>
          </div>

          {/* Monthly Summary */}
          <div className="pt-4 mt-2 border-t border-gray-200 flex items-center justify-center">
            <p className="text-center text-textSecond">
              Monthly Total:{" "}
              <span className="font-semibold">100 {userCurrency}</span>
            </p>
            <button
              onClick={() => setShowSubscriptionForm(!showSubscriptionForm)}
              className="ml-10 bg-secondary text-white py-1 px-3 rounded-lg hover:bg-thirdly focus:ring-2 focus:primary focus:ring-offset-2 transition-all"
            >
              New Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
