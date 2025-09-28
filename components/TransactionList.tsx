"use client";

import React, { useState, useMemo } from "react";
import type { CategorizedTransaction, TransactionCategory } from "@/utils/categorizeTransactions";
import { Search } from "lucide-react";

interface TransactionListProps {
  transactions: CategorizedTransaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "credit" | "debit">("all");
  const [selectedCategory, setSelectedCategory] = useState<"all" | TransactionCategory>("all");

  const categories = useMemo(() => {
    const uniqueCategories = new Set(transactions.map((t) => t.category));
    return ["all", ...Array.from(uniqueCategories)] as ("all" | TransactionCategory)[];
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="mt-8 p-4 bg-gray-50 text-center text-gray-500 rounded-md">
        No transactions found in the current dataset.
      </div>
    );
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || t.type === selectedType;
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="mt-2">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Transactions</h2>

      {/* Search and Filter Controls */}
<div className="flex flex-col md:flex-row gap-4 mb-4">

{/* Search Input with Icon */}
<div className="relative flex-grow">
  <Search
    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
    size={18}
  />
  <input
    type="text"
    placeholder="Search transactions..."
    className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-white rounded-md shadow-sm 
    text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#046A38]"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>


  <select
    value={selectedType}
    onChange={(e) => setSelectedType(e.target.value as "all" | "credit" | "debit")}
    className="p-2 border border-gray-200 bg-white rounded-md shadow-sm 
    text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#046A38]"
  >
    <option value="all">All Types</option>
    <option value="credit">Credit</option>
    <option value="debit">Debit</option>
  </select>

  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value as "all" | TransactionCategory)}
    className="p-2 border border-gray-200 bg-white rounded-md shadow-sm 
    text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#046A38]"
  >
    {categories.map((category) => (
      <option key={category} value={category}>
        {category === "all" ? "All Categories" : category}
      </option>
    ))}
  </select>
</div>

      {/* ✅ Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {filteredTransactions.slice(0, visibleCount).map((t, i) => (
          <div key={i} className="p-4 bg-white rounded-lg shadow-md border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t.transDate}</span>
              <span className="px-2 py-1 text-xs rounded-full font-medium bg-gray-200 text-gray-700">
                {t.source === "wallet" ? "Wallet" : "OWealth"}
              </span>
            </div>
            <p className="text-gray-800 font-medium mt-1">{t.description}</p>
            <div className="flex justify-between items-center mt-2">
              <span className={`font-semibold ${t.type === "debit" ? "text-red-600" : "text-green-600"}`}>
                ₦{Math.abs(t.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-500">{t.type}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <p><strong>Category:</strong> {t.category}</p>
              <p><strong>Balance:</strong> ₦{t.balance}</p>
              <p><strong>Channel:</strong> {t.channel}</p>
            </div>
          </div>
        ))}

        {visibleCount < filteredTransactions.length && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700"
          >
            Load More
          </button>
        )}
      </div>

      {/* ✅ Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100">
              <th className="py-2 px-4 text-left text-gray-600">Trans. Date</th>
              <th className="py-2 px-4 text-left text-gray-600">Value Date</th>
              <th className="py-2 px-4 text-left text-gray-600">Description</th>
              <th className="py-2 px-4 text-left text-gray-600">Category</th>
              <th className="py-2 px-4 text-right text-gray-600">Amount</th>
              <th className="py-2 px-4 text-right text-gray-600">Balance</th>
              <th className="py-2 px-4 text-left text-gray-600">Channel</th>
              <th className="py-2 px-4 text-left text-gray-600">Source</th>
              <th className="py-2 px-4 text-left text-gray-600">Type</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t, i) => (
              <tr
                key={i}
                className={`border-b text-black border-gray-100 ${
                  i % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="py-2 px-4 whitespace-nowrap">{t.transDate}</td>
                <td className="py-2 px-4 whitespace-nowrap">{t.valueDate}</td>
                <td className="py-2 px-4">{t.description}</td>
                <td className="py-2 px-4 capitalize">{t.category}</td>
                <td
                  className={`py-2 px-4 text-right ${
                    t.type === "debit" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ₦{Math.abs(t.amount).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-2 px-4 text-right">{t.balance}</td>
                <td className="py-2 px-4">{t.channel}</td>
                <td className="py-2 px-4 font-medium">{t.source === "wallet" ? "Wallet" : "OWealth"}</td>
                <td className="py-2 px-4 capitalize">{t.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
