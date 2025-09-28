"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CategorizedTransaction } from "@/utils/categorizeTransactions";

const GRADIENTS = [
  { id: "g1", start: "#0088FE", end: "#66B3FF" },
  { id: "g2", start: "#00C49F", end: "#80E5CC" },
  { id: "g3", start: "#FFBB28", end: "#FFD466" },
  { id: "g4", start: "#FF8042", end: "#FF9A6B" },
  { id: "g5", start: "#A020F0", end: "#BF66FF" },
  { id: "g6", start: "#FF4444", end: "#FF8080" },
];

const SWATCH_COLORS = GRADIENTS.map(
  (g) => `linear-gradient(135deg, ${g.start}, ${g.end})`
);

interface CategoryChartProps {
  transactions: CategorizedTransaction[];
}

const formatCurrency = (v: number) =>
  `₦${Math.abs(v).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const { name, value, percent } = payload[0];
  return (
    <div className="bg-white p-2 rounded-md shadow-md text-sm">
      <div className="font-semibold text-gray-800">{name}</div>
      <div className="text-green-600 font-bold mt-1">
        {formatCurrency(value)}
      </div>
      <div className="text-xs text-gray-500 mt-0.5">
        {(percent * 100).toFixed(1)}%
      </div>
    </div>
  );
}

export default function CategoryChart({ transactions }: CategoryChartProps) {
  if (!transactions || transactions.length === 0) return null;

  // Build totals
  const totalsAll = new Map<string, number>();
  const totalsExpenses = new Map<string, number>();

  transactions.forEach((t) => {
    const amountAbs = Math.abs(t.amount || 0);
    // All transactions aggregate absolute amounts
    totalsAll.set(t.category, (totalsAll.get(t.category) || 0) + amountAbs);

    // Expenses only: use type === 'debit'
    if (t.type === "debit") {
      totalsExpenses.set(
        t.category,
        (totalsExpenses.get(t.category) || 0) + amountAbs
      );
    }
  });

  const allData = Array.from(totalsAll.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const expensesData = Array.from(totalsExpenses.entries()).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  // total sums for percent calculations
  const totalAll = allData.reduce((s, d) => s + d.value, 0);
  const totalExpenses = expensesData.reduce((s, d) => s + d.value, 0);

  // Top spending category (largest expense)
  const topExpense =
    expensesData.length > 0
      ? expensesData.reduce(
          (max, cur) => (cur.value > max.value ? cur : max),
          expensesData[0]
        )
      : null;

  // Top category overall
  const topCategory =
    allData.length > 0
      ? allData.reduce(
          (max, cur) => (cur.value > max.value ? cur : max),
          allData[0]
        )
      : null;

  // custom legend renderer (pill list)
  const LegendPills = ({
    data,
  }: {
    data: { name: string; value: number }[];
  }) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center text-sm text-gray-500">No data</div>
      );
    }
    return (
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {data.map((d, i) => (
          <div
            key={d.name}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-100 shadow-sm text-xs"
            style={{ minWidth: 110 }}
          >
            <span
              className="w-3 h-3 rounded-sm"
              style={{
                background: SWATCH_COLORS[i % SWATCH_COLORS.length],
              }}
            />
            <div className="text-xs text-gray-700 font-medium truncate">
              {d.name}
            </div>
            <div className="ml-2 text-xs text-gray-500">
              {formatCurrency(d.value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // responsive heights: smaller on mobile
  const chartHeightMobile = 220;
  const chartHeightDesktop = 300;

  return (
    <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* All Transactions */}
      <div className="bg-white rounded-xl shadow-md p-3">
        <h3 className="text-md font-semibold text-gray-700 text-center mb-2">
          All Transactions by Category
        </h3>

        <div
          style={{ width: "100%", height: chartHeightMobile }}
          className="md:h-[280px]"
        >
          <ResponsiveContainer>
            <PieChart>
              <defs>
                {GRADIENTS.map((g, i) => (
                  <linearGradient
                    id={g.id}
                    key={g.id}
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={g.start} stopOpacity={1} />
                    <stop
                      offset="100%"
                      stopColor={g.end}
                      stopOpacity={1}
                    />
                  </linearGradient>
                ))}
              </defs>

              <Pie
                data={allData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="42%"
                outerRadius="72%"
                paddingAngle={2}
                labelLine={false}
                label={({
                  percent,
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                }: any) =>
                  // small labels only if slice >= 5%
                  percent > 0.05
                    ? (() => {
                        const radius =
                          innerRadius +
                          (outerRadius - innerRadius) * 0.6;
                        const x =
                          cx +
                          radius *
                            Math.cos(-midAngle * (Math.PI / 180));
                        const y =
                          cy +
                          radius *
                            Math.sin(-midAngle * (Math.PI / 180));
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#fff"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={11}
                            fontWeight={700}
                            style={{
                              textShadow:
                                "0 1px 2px rgba(0,0,0,0.25)",
                            }}
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      })()
                    : null
                }
              >
                {allData.map((_, i) => (
                  <Cell
                    key={`cell-all-${i}`}
                    fill={`url(#${GRADIENTS[i % GRADIENTS.length].id})`}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <LegendPills data={allData.slice(0, 8)} />

        {/* Top Category Summary */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg shadow-sm text-center">
          <div className="text-sm text-gray-600">Top Category</div>
          <div className="mt-1 text-lg font-bold text-blue-700">
            {topCategory
              ? `${topCategory.name} – ${formatCurrency(
                  topCategory.value
                )}`
              : "N/A"}
          </div>
          {topCategory && (
            <div className="text-xs text-gray-500 mt-1">
              {totalAll > 0
                ? `${(
                    (topCategory.value / totalAll) *
                    100
                  ).toFixed(1)}% of all transactions`
                : ""}
            </div>
          )}
        </div>
      </div>

      {/* Expenses Only */}
      <div className="bg-white rounded-xl shadow-md p-3">
        <h3 className="text-md font-semibold text-gray-700 text-center mb-2">
          Expenses Only by Category
        </h3>

        <div
          style={{ width: "100%", height: chartHeightMobile }}
          className="md:h-[280px]"
        >
          <ResponsiveContainer>
            <PieChart>
              <defs>
                {GRADIENTS.map((g, i) => (
                  <linearGradient
                    id={`${g.id}-e`}
                    key={`${g.id}-e`}
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={g.start} stopOpacity={1} />
                    <stop
                      offset="100%"
                      stopColor={g.end}
                      stopOpacity={1}
                    />
                  </linearGradient>
                ))}
              </defs>

              <Pie
                data={expensesData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="42%"
                outerRadius="72%"
                paddingAngle={2}
                labelLine={false}
                label={({
                  percent,
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                }: any) =>
                  percent > 0.07
                    ? (() => {
                        const radius =
                          innerRadius +
                          (outerRadius - innerRadius) * 0.6;
                        const x =
                          cx +
                          radius *
                            Math.cos(-midAngle * (Math.PI / 180));
                        const y =
                          cy +
                          radius *
                            Math.sin(-midAngle * (Math.PI / 180));
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#fff"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={11}
                            fontWeight={700}
                            style={{
                              textShadow:
                                "0 1px 2px rgba(0,0,0,0.25)",
                            }}
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      })()
                    : null
                }
              >
                {expensesData.map((_, i) => (
                  <Cell
                    key={`cell-exp-${i}`}
                    fill={`url(#${
                      GRADIENTS[i % GRADIENTS.length].id
                    }-e)`}
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <LegendPills data={expensesData.slice(0, 8)} />

        {/* Top Spending Summary */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg shadow-sm text-center">
          <div className="text-sm text-gray-600">
            Top Spending Category
          </div>
          <div className="mt-1 text-lg font-bold text-yellow-700">
            {topExpense
              ? `${topExpense.name} – ${formatCurrency(
                  topExpense.value
                )}`
              : "N/A"}
          </div>
          {topExpense && (
            <div className="text-xs text-gray-500 mt-1">
              {totalExpenses > 0
                ? `${(
                    (topExpense.value / totalExpenses) *
                    100
                  ).toFixed(1)}% of expenses`
                : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
