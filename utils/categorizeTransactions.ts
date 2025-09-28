import type { OpayTransaction } from "@/types/opay";

export type TransactionCategory =
  | "Income"
  | "Bills & Utilities"
  | "Betting"
  | "Shopping"
  | "Transfers"
  | "Airtime/Data"
  | "Others";

export interface CategorizedTransaction extends OpayTransaction {
  category: TransactionCategory;
  source: "wallet" | "owealth";
}

export function categorizeTransaction(
  tx: OpayTransaction & { source: "wallet" | "owealth" }
): CategorizedTransaction {
  const desc = tx.description.toLowerCase();

  // ✅ Rule 1: All credits are income
  if (tx.type === "credit") {
    return { ...tx, category: "Income" };
  }

  // ✅ Rule 2: Categorize debits based on description
  if (desc.includes("airtime") || desc.includes("mobile data")) {
    return { ...tx, category: "Airtime/Data" };
  }

  if (desc.includes("betting") || desc.includes("bet9ja") || desc.includes("nairabet")) {
    return { ...tx, category: "Betting" };
  }

  if (desc.includes("shopping") || desc.includes("jumia") || desc.includes("supermarket")) {
    return { ...tx, category: "Shopping" };
  }

  if (desc.includes("transfer to") || desc.includes("sent to")) {
    return { ...tx, category: "Transfers" };
  }

  if (desc.includes("tv") || desc.includes("electricity") || desc.includes("bill")) {
    return { ...tx, category: "Bills & Utilities" };
  }

  // Default fallback
  return { ...tx, category: "Others" };
}

export function categorizeTransactions(
  transactions: (OpayTransaction & { source: "wallet" | "owealth" })[]
): CategorizedTransaction[] {
  console.log("Categorizing transactions count:", transactions.length);
  return transactions.map(categorizeTransaction);
}
