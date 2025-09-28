"use client";

import React, { useState } from "react";
import type { TransactionCategory } from "@/utils/categorizeTransactions";

interface BudgetFormProps {
  onBudgetSet: (category: TransactionCategory | "All", amount: number) => void;
  categories: TransactionCategory[];
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onBudgetSet, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | "All">("All");
  const [budgetAmount, setBudgetAmount] = useState<number | ''>('');

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory && budgetAmount) {
      onBudgetSet(selectedCategory, Number(budgetAmount));
      setBudgetAmount('');
      setSelectedCategory("All");
    }
  };

  return (
    <div className="mt-2 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Set a Budget
      </h2>
      <form onSubmit={handleBudgetSubmit} className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as TransactionCategory | "All")}
          className="p-2 border border-gray-300 rounded-md shadow-sm 
          text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Expenses</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Enter budget amount (₦)"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value === '' ? '' : Number(e.target.value))}
          className="p-2 border border-gray-300 rounded-md shadow-sm 
          text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-[#046A38] text-white py-2 px-4 rounded-md shadow-md hover:bg-green-700 transition-colors"
        >
          Set Budget
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;