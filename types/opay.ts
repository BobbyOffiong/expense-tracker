// types/opay.ts
export interface OpayTransaction {
  transDate: string;
  valueDate: string;
  description: string;
  debitCredit: string;
  balance: string;
  channel: string;
  amount: number;
  type: "credit" | "debit";
  // ❌ remove `source` from here
}
