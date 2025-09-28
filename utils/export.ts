// utils/export.ts
import type { CategorizedTransaction } from "@/utils/categorizeTransactions";

function downloadFile(content: string, filename: string, mime = "text/csv") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function transactionsToCSV(transactions: CategorizedTransaction[]) {
  const header = [
    "transDate",
    "valueDate",
    "description",
    "debitCredit",
    "amount",
    "balance",
    "channel",
    "transactionReference",
    "type",
    "category",
  ];

  const escape = (v: unknown) => {
    if (v === undefined || v === null) return '""';
    const s = String(v).replace(/"/g, '""'); // double quotes for CSV
    return `"${s}"`;
  };

  const rows = transactions.map((t) =>
    header.map((h) => escape((t as any)[h] ?? "")).join(",")
  );

  return [header.join(","), ...rows].join("\n");
}

export function downloadCSV(transactions: CategorizedTransaction[]) {
  const csv = transactionsToCSV(transactions);
  const name = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(csv, name, "text/csv");
}

export function downloadJSON(transactions: CategorizedTransaction[]) {
  const json = JSON.stringify(transactions, null, 2);
  const name = `transactions-${new Date().toISOString().slice(0, 10)}.json`;
  downloadFile(json, name, "application/json");
}
