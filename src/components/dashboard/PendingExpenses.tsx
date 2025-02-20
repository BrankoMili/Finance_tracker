"use client";

import SkeletonLoader from "../SkeletonLoader";
import { useState } from "react";
import { Currency } from "@/types/currency";

interface Props {
  userCurrency: Currency;
}

export default function PendingExpenses({ userCurrency }: Props) {
  const [pendindLoading, setPendndingLoading] = useState<boolean>(false);

  return (
    <div className="bg-componentsBackground p-6 mt-10 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md mx-auto">
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
          <div className="pt-4 mt-2 border-t border-gray-200">
            <p className="text-center text-textSecond">
              Monthly Total:{" "}
              <span className="font-semibold">100 {userCurrency}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
