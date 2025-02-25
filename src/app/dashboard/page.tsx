"use client";

import ExpenseForm from "@/components/ExpenseForm";
import ExpenseShortList from "@/components/dashboard/ExpenseShortList";
import PendingExpenses from "@/components/dashboard/PendingExpenses";
import Last7Days from "@/components/dashboard/Last7Days";
import ExpensesCategories from "@/components/dashboard/ExpensesCategories";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useExpenses } from "@/hooks/useExpenses";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import { useSubscriptions } from "@/hooks/useSubscriptions";

export default function Home() {
  const { userCurrency, userCategories } = useUserPreferences(); // Valuta i kategorije koje koristi korisnik
  const {
    expensesCurrentMonth,
    expensesSevenDays,
    expensesLoading,
    expensesError
  } = useExpenses();
  const { exchangeRates, isExchangesLoading, errorExchanges } =
    useExchangeRates(userCurrency);
  const { subscriptionsError, subscriptionsLoading, subscriptions } =
    useSubscriptions();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5 sm:space-y-8">
        <ExpenseForm userCategories={userCategories} />
        <ExpenseShortList
          userCurrency={userCurrency}
          expensesCurrentMonth={expensesCurrentMonth}
          expensesLoading={expensesLoading}
          expensesError={expensesError}
          exchangeRates={exchangeRates}
          isExchangesLoading={isExchangesLoading}
          errorExchanges={errorExchanges}
        />
      </div>

      {/* Drugi red */}
      <div className="space-y-8">
        <Last7Days
          userCurrency={userCurrency}
          expensesSevenDays={expensesSevenDays}
          expensesLoading={expensesLoading}
          expensesError={expensesError}
          exchangeRates={exchangeRates}
          isExchangesLoading={isExchangesLoading}
          errorExchanges={errorExchanges}
        />
        <ExpensesCategories
          userCurrency={userCurrency}
          expensesCurrentMonth={expensesCurrentMonth}
          expensesLoading={expensesLoading}
          expensesError={expensesError}
          exchangeRates={exchangeRates}
          isExchangesLoading={isExchangesLoading}
          errorExchanges={errorExchanges}
          userCategories={userCategories}
        />
        <PendingExpenses
          userCurrency={userCurrency}
          subscriptionsError={subscriptionsError}
          subscriptionsLoading={subscriptionsLoading}
          subscriptions={subscriptions}
          exchangeRates={exchangeRates}
          isExchangesLoading={isExchangesLoading}
          errorExchanges={errorExchanges}
        />
        <a
          href="https://www.exchangerate-api.com"
          className="text-textThird text-[12px]"
        >
          Rates By Exchange Rate API
        </a>
      </div>
    </div>
  );
}
