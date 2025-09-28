"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CategorizedTransaction } from "@/utils/categorizeTransactions";

interface BalanceChartProps {
  transactions: CategorizedTransaction[];
}

export default function BalanceChart({ transactions }: BalanceChartProps) {
  // 1. Prepare Data
  const sortedTransactions = [...transactions].sort(
    (a, b) =>
      new Date(a.transDate).getTime() - new Date(b.transDate).getTime()
  );

  let cumulativeBalance = 0;
  const chartData = sortedTransactions.map((t) => {
    cumulativeBalance += t.amount;
    return {
      date: new Date(t.transDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      }),
      balance: cumulativeBalance,
    };
  });

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        Account Balance Over Time
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
                formatter={(value) =>
                  `₦${(value as number).toLocaleString("en-NG")}`
                }
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#046A38"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Helper text for mobile users */}
      <p className="mt-2 text-center text-xs text-gray-500">
        Swipe left/right to explore the chart, or rotate your device for a
        wider view.
      </p>
    </div>
  );
}
