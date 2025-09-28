"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CategorizedTransaction } from "@/utils/categorizeTransactions";

interface FinancialTrendsChartProps {
  transactions: CategorizedTransaction[];
}

export default function FinancialTrendsChart({
  transactions,
}: FinancialTrendsChartProps) {
  // 1. Prepare Data
  const dataMap = transactions.reduce((acc, t) => {
    const date = new Date(t.transDate).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    });

    if (!acc[date]) {
      acc[date] = { date, income: 0, expenses: 0 };
    }

    if (t.type === "credit") {
      acc[date].income += t.amount;
    } else if (t.type === "debit") {
      acc[date].expenses += Math.abs(t.amount);
    }

    return acc;
  }, {} as Record<string, { date: string; income: number; expenses: number }>);

  const chartData = Object.values(dataMap).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        Daily Financial Trends
      </h2>

      {/* Scrollable wrapper for mobile */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] h-80">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                tickFormatter={(value) =>
                  `₦${value.toLocaleString("en-NG", {
                    minimumFractionDigits: 0,
                  })}`
                }
              />
              <Tooltip
                formatter={(value, name) => [
                  `₦${(value as number).toLocaleString("en-NG")}`,
                  name === "income" ? "Income" : "Expenses",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="expenses" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Helper text for mobile users */}
      <p className="mt-2 text-center text-xs text-gray-500">
        Swipe left/right to explore the chart, or rotate your device for a
        better view.
      </p>
    </div>
  );
}
