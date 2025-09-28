"use client";

import React from "react";
import { motion } from "framer-motion";
import type { CategorizedTransaction } from "@/utils/categorizeTransactions";

interface SummaryProps {
  transactions: CategorizedTransaction[];
}

const Summary: React.FC<SummaryProps> = ({ transactions }) => {
  if (transactions.length === 0) return null;

  const totalIncome = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  // ✅ Per-source breakdown
  const walletBalance =
    transactions
      .filter((t) => t.source === "wallet")
      .reduce((sum, t) => (t.type === "credit" ? sum + t.amount : sum - t.amount), 0);

  const owealthBalance =
    transactions
      .filter((t) => t.source === "owealth")
      .reduce((sum, t) => (t.type === "credit" ? sum + t.amount : sum - t.amount), 0);

  const cards = [
    {
      title: "Total Income",
      value: `₦${totalIncome.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
      color: "text-green-800",
      bg: "bg-green-300",
    },
    {
      title: "Total Expenses",
      value: `₦${totalExpenses.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Net Balance",
      value: `₦${netBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
      color: netBalance >= 0 ? "text-green-700" : "text-red-700",
      bg: "bg-blue-100",
    },
    {
      title: "Wallet Balance",
      value: `₦${walletBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
      color: walletBalance >= 0 ? "text-green-700" : "text-red-700",
      bg: "bg-indigo-200",
    },
    {
      title: "OWealth Balance",
      value: `₦${owealthBalance.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
      color: owealthBalance >= 0 ? "text-green-700" : "text-red-700",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 my-6">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
          className={`p-6 rounded-xl shadow-md text-center ${card.bg}`}
        >
          <p className="text-sm text-gray-600">{card.title}</p>
          <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default Summary;
