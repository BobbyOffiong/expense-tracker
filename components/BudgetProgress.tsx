"use client";

import React, { useMemo } from "react";
import type { CategorizedTransaction, TransactionCategory } from "@/utils/categorizeTransactions";

interface BudgetProgressProps {
  transactions: CategorizedTransaction[];
  budget: {
    category: TransactionCategory | "All";
    amount: number;
  } | null;
}

export default function BudgetProgress({ transactions, budget }: BudgetProgressProps) {
  if (!budget) {
    return null; // Don't render anything if no budget is set
  }

  // Calculate total expenses for the budgeted category
  const totalSpent = useMemo(() => {
    return transactions
      .filter((t) => {
        const isDebit = t.type === "debit";
        const isBudgetCategory = budget.category === "All" || t.category === budget.category;
        return isDebit && isBudgetCategory;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions, budget]);

  const percentageSpent = (totalSpent / budget.amount) * 100;
  const isOverBudget = totalSpent > budget.amount;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        {budget.category === "All" ? "All Expenses Budget" : `${budget.category} Budget`}
      </h2>
      <div className="text-center mb-4">
        <p className="text-gray-600 text-sm">Amount Spent</p>
        <p className={`text-2xl font-bold ${isOverBudget ? "text-red-600" : "text-gray-900"}`}>
          ₦{totalSpent.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </p>
        <p className="text-gray-600 text-sm mt-1">
          Budget: ₦{budget.amount.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? "bg-red-500" : "bg-green-500"}`}
          style={{ width: `${Math.min(100, percentageSpent)}%` }}
        ></div>
        {percentageSpent > 0 && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
            {Math.round(percentageSpent)}%
          </span>
        )}
      </div>

      {isOverBudget && (
        <p className="text-red-600 text-center mt-2 font-semibold text-sm">
          You are over budget by ₦{(totalSpent - budget.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}!
        </p>
      )}
    </div>
  );
}