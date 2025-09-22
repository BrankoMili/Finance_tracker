"use client";

import SkeletonLoader from "../SkeletonLoader";
import { useState, useEffect, useRef } from "react";
import { collection, addDoc } from "firebase/firestore";
import { showToast } from "@/utils/showToast";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { CURRENCIES } from "@/constants/currencies";
import { CategoryItem } from "@/types/categoryItem";
import { Expense } from "@/types/expense";
import { Button } from "../shared/Button";
import { InputTextNumberPass } from "../shared/InputTextNumberPass";
import { Select } from "../shared/Select";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DatePicker } from "../shared/DatePicker";
import { useOverlay } from "@/context/OverlayContext";

interface Props {
  userCurrency: string;
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
  const { toggleOverlay } = useOverlay();
  const formRef = useRef<HTMLFormElement>(null);

  const handleFormToggle = (isOpen: boolean) => {
    setShowSubscriptionForm(isOpen);
    toggleOverlay(isOpen);
  };

  const [subscription, setSubscription] = useState<Expense>({
    amount: 0,
    description: "",
    descriptionLowerCase: "",
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

    if (subscription.amount === 0) {
      showToast("error", "Amount field has the value 0");
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
        descriptionLowerCase: "",
        category: "other",
        currency: "EUR",
        date: new Date(),
        userId: ""
      });
      showToast("success", "Successfully Added");
      handleFormToggle(false);
    } catch (error) {
      showToast("error", "Something went wrong!");
      console.error(error);
    }
  };

  // sum of all expenses for this month
  useEffect(() => {
    if (Object.keys(exchangeRates).length === 0) return;
    if (isExchangesLoading || errorExchanges !== null) return;
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isDatePickerClick = (event.target as Element).closest(
        "#DatePicker_popover_id"
      );

      if (
        formRef.current &&
        !formRef.current.contains(event.target as Node) &&
        !isDatePickerClick
      ) {
        handleFormToggle(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check for errors
  const errorMessage = subscriptionsError?.message || errorExchanges?.message;
  if (errorMessage) {
    return (
      <div className="bg-componentsBackground p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-full">
        <div className="text-red-400 text-center p-4">{errorMessage}</div>
      </div>
    );
  }

  return (
    <div className="bg-componentsBackground p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-full">
      {showSubscriptionForm && (
        <form
          ref={formRef}
          onSubmit={handleForm}
          className="z-40 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto mt-8 w-11/12 max-w-md bg-componentsBackground p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <p
            className="absolute top-2 right-4 font-bold text-textSecond cursor-pointer hover:bg-border w-6 h-6 flex items-center justify-center rounded-xl"
            onClick={() => {
              handleFormToggle(false);
            }}
          >
            <XMarkIcon className="h-6 w-6" />
          </p>
          <h2 className="font-bold text-textSecond mb-6 text-center">
            Add new subscription
          </h2>
          {/* Amount Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-textSecond mb-1">
              Amount
            </label>
            <InputTextNumberPass
              type="number"
              placeholder="0.00"
              value={subscription.amount || ""}
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
                  setSubscription({
                    ...subscription,
                    amount: value === "" ? 0 : Number(value)
                  });
                }
              }}
              required
            />
          </div>

          {/* Currency Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-textSecond mb-1">
              Currency
            </label>
            <Select
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
              placeholder="e.g., Youtube Premium"
              value={subscription.description}
              onChange={e =>
                setSubscription({
                  ...subscription,
                  description: e.target.value.slice(0, 100) // Max number of characters 100
                })
              }
              required
            />
          </div>

          {/* Category Select */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-textSecond mb-1">
              Category
            </label>
            <Select
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
            </Select>
          </div>

          {/* Date Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-textSecond mb-1">
              Date - Monthly subscription
            </label>
            <DatePicker
              value={subscription.date}
              onChange={date => {
                setSubscription({
                  ...subscription,
                  date
                });
              }}
            />
          </div>
          <Button text="Add Subscription" type="submit" buttonSize="small" />
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
                <span className="w-1/4 overflow-hidden text-ellipsis pr-2 text-textMain">
                  {item.description}
                </span>
                <span className="w-1/4 overflow-hidden text-ellipsis pr-2 text-textMain">
                  {item.amount.toFixed(2)} {item.currency}
                </span>
                <span className="w-1/4 overflow-hidden text-ellipsis pr-2 text-textMain">
                  {item.date ? format(item.date, "dd-MM-yyyy") : "N/A"}
                </span>
              </div>
            );
          })}

          {/* Monthly Summary */}
          <div className="pt-4 mt-2 border-t border-gray-200 flex items-center justify-center">
            <p className="text-center text-textSecond text-sm mr-10">
              Monthly Total:{" "}
              <span className="font-semibold">
                {subscriptionAmount.toFixed(2)} {userCurrency}
              </span>
            </p>
            <Button
              onClick={() => handleFormToggle(!showSubscriptionForm)}
              text="New Subscription"
              buttonWidth="compact"
              buttonSize="small"
            />
          </div>
        </div>
      )}
    </div>
  );
}
