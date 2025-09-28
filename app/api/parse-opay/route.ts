// app/api/parse-opay/route.ts
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";
import type { OpayTransaction } from "@/types/opay";
import { categorizeTransactions } from "@/utils/categorizeTransactions";

interface OpayHeaderData {
  accountName: string | null;
  accountNumber: string | null;
  currentBalance: string | null;
  totalCredit: string | null;
  totalDebit: string | null;
}

interface OpayStatement {
  header: OpayHeaderData;
  walletTransactions: OpayTransaction[];
  owealthTransactions: OpayTransaction[];
}

// --- Main API Route ---
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdf(buffer);
    const fullText = pdfData.text ?? "";

    console.log("=== RAW PDF TEXT START ===");
    console.log(fullText.slice(0, 2000)); // print first 2000 chars for readability
    console.log("=== RAW PDF TEXT END ===");

    const statement = parseOpayStatement(fullText);

    // Categorize both transaction sets
    const categorizedWallet = categorizeTransactions(
      statement.walletTransactions.map((t) => ({ ...t, source: "wallet" }))
    );

    const categorizedOwealth = categorizeTransactions(
      statement.owealthTransactions.map((t) => ({ ...t, source: "owealth" }))
    );

    return NextResponse.json({
      header: statement.header,
      walletTransactions: categorizedWallet,
      owealthTransactions: categorizedOwealth,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to process the request." },
      { status: 500 }
    );
  }
}

// --- Core Parser ---
function parseOpayStatement(text: string): OpayStatement {
  const statement: OpayStatement = {
    header: {
      accountName: null,
      accountNumber: null,
      currentBalance: null,
      totalCredit: null,
      totalDebit: null,
    },
    walletTransactions: [],
    owealthTransactions: [],
  };

  if (!text || text.trim().length === 0) return statement;

  // --- Header parsing ---
  const accountNameMatch = text.match(/Account Name[\s\S]+?([\s\S]+?)\n/);
  if (accountNameMatch) statement.header.accountName = accountNameMatch[1].trim();

  const accountNumberMatch = text.match(/Account Number\s*(\d{7,})/);
  if (accountNumberMatch) statement.header.accountNumber = accountNumberMatch[1].trim();

  const currentBalanceMatch = text.match(/Current Balance\s*₦?([\d,]+\.\d{2}|--)/);
  if (currentBalanceMatch) statement.header.currentBalance = currentBalanceMatch[1].trim();

  const totalCreditMatch = text.match(/Total Credit\s*₦?([\d,]+\.\d{2})/);
  if (totalCreditMatch) statement.header.totalCredit = totalCreditMatch[1].trim();

  const totalDebitMatch = text.match(/Total Debit\s*₦?([\d,]+\.\d{2})/);
  if (totalDebitMatch) statement.header.totalDebit = totalDebitMatch[1].trim();

  // --- Wallet Transactions ---
  statement.walletTransactions = extractTransactions(
    text,
    "Summary - Wallet Balance",
    "Summary - OWealth Balance"
  );

  // --- OWealth Transactions ---
  statement.owealthTransactions = extractTransactions(
    text,
    "Summary - OWealth Balance",
    /End Date|Date Printed/
  );

  return statement;
}

// -----------------------------
// extractTransactions
// -----------------------------
function extractTransactions(
  text: string,
  sectionStart: string,
  sectionEnd: string | RegExp
): OpayTransaction[] {
  const startIdx = text.indexOf(sectionStart);
  if (startIdx === -1) return [];

  let endIdx: number;
  if (typeof sectionEnd === "string") {
    endIdx = text.indexOf(sectionEnd, startIdx);
  } else {
    const match = text.slice(startIdx).match(sectionEnd);
    endIdx = match ? startIdx + match.index! : -1;
  }

  if (endIdx === -1) endIdx = text.length;

  const block = text.slice(startIdx, endIdx).trim();

  const isNewFormat = block.includes("Trans. Time");

  const chunkRegex = isNewFormat
    ? /(\d{4}\s[A-Z][a-z]{2}\s\d{2}\s\d{2}:\d{2}:\d{2})\s*(\d{2}\s[A-Z][a-z]{2}\s\d{4})([\s\S]*?)(?=\d{4}\s[A-Z][a-z]{2}\s\d{2}\s\d{2}:\d{2}:\d{2}|\d{2}\s[A-Z][a-z]{2}\s\d{4}|$)/g
    : /(\d{2}\s[A-Z][a-z]{2}\s\d{4})\s*(\d{2}\s[A-Z][a-z]{2}\s\d{4})([\s\S]*?)(?=\d{2}\s[A-Z][a-z]{2}\s\d{4}\s*\d{2}\s[A-Z][a-z]{2}\s\d{4}|$)/g;

  const transactions: OpayTransaction[] = [];

  console.log("=== Extracting block preview ===");
  console.log(block.slice(0, 700));

  let match;
  while ((match = chunkRegex.exec(block)) !== null) {
    const [, transDate, valueDate, rest] = match;
    const tx = parseTransactionChunk(transDate, valueDate, rest);
    if (tx) {
      console.log("Parsed transaction example:", {
        transDate: tx.transDate,
        valueDate: tx.valueDate,
        description: tx.description.slice(0, 60),
        debitCredit: tx.debitCredit,
        balance: tx.balance,
        channel: tx.channel,
      });
      transactions.push(tx);
    }
  }

  console.log("Extracted transactions count:", transactions.length);
  return transactions;
}

// -----------------------------
// parseTransactionChunk
// -----------------------------
function parseTransactionChunk(
  transDate: string,
  valueDate: string,
  rest: string
): OpayTransaction | null {
  const restNorm = rest.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();

  const amountRegex = /[+-]?\d{1,3}(?:,\d{3})*\.\d{2}/g;
  const amountMatches = Array.from(restNorm.matchAll(amountRegex));
  if (amountMatches.length === 0) return null;

  const debitCreditStr = amountMatches[0][0];
  const debitCreditIndex = amountMatches[0].index!;
  const balanceStr = amountMatches[1] ? amountMatches[1][0] : "";

  const description = restNorm.slice(0, debitCreditIndex).trim();

  let channel = "";
  if (balanceStr) {
    const balanceIndex = amountMatches[1]?.index ?? amountMatches[0].index!;
    const balanceEnd = balanceIndex + balanceStr.length;
    channel = restNorm.slice(balanceEnd).split(" ").slice(0, 3).join(" ").trim();
  }

  const amount = parseFloat(debitCreditStr.replace(/,/g, ""));
  const type: "credit" | "debit" = debitCreditStr.startsWith("-") ? "debit" : "credit";

  return {
    transDate: transDate.trim(),
    valueDate: valueDate.trim(),
    description,
    debitCredit: debitCreditStr,
    balance: balanceStr,
    channel,
    amount,
    type,
  };
}
