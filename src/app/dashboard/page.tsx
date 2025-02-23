"use client";

import ExpenseForm from "@/components/ExpenseForm";
import ExpenseShortList from "@/components/dashboard/ExpenseShortList";
import PendingExpenses from "@/components/dashboard/PendingExpenses";
import Last7Days from "@/components/dashboard/Last7Days";
import ExpensesCategories from "@/components/dashboard/ExpensesCategories";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useExpenses } from "@/hooks/useExpenses";
import { useExchangeRates } from "@/hooks/useExchangeRates";

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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
      <PendingExpenses userCurrency={userCurrency} />

      <div className="lg:col-span-1"></div>
    </div>
  );
}
