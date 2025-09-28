// components/ExportImportControls.tsx
"use client";

import React, { useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import type { CategorizedTransaction } from "@/utils/categorizeTransactions";

interface ExportImportControlsProps {
  transactions: CategorizedTransaction[];
  onImport: (data: CategorizedTransaction[]) => void;
  onLoad: (data: CategorizedTransaction[]) => void; // 👈 New prop to handle loading transactions from DB
}

export default function ExportImportControls({
  transactions,
  onImport,
  onLoad,
}: ExportImportControlsProps) {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Export to JSON
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import from JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          onImport(importedData);
          alert("✅ Transactions imported successfully!");
        } else {
          throw new Error("Invalid file format");
        }
      } catch (err) {
        alert("❌ Failed to import file. Please check the format.");
        console.error(err);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  // Save to Database
  const handleSaveToDb = async () => {
    if (!user) {
      alert("Please sign in to save transactions.");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.from("transactions").insert(
        transactions.map((t) => ({
          ...t,
          userId: user.id, // Link to the user ID
          // Ensure any monetary values are parsed as numbers before saving
          amount: parseFloat(String(t.amount)),
          balance: parseFloat(String(t.balance)),
        }))
      );

      if (error) {
        throw new Error(error.message);
      }

      alert(`✅ Saved ${transactions.length} transactions to the database`);
    } catch (err: any) {
      console.error(err);
      alert(`❌ Could not save transactions: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch from Database
  const handleFetchFromDb = async () => {
    if (!user) {
      alert("Please sign in to load transactions.");
      return;
    }

    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("userId", user.id);

      if (error) {
        throw new Error(error.message);
      }

      onLoad(data as CategorizedTransaction[]);
      alert(`✅ Loaded ${data.length} transactions from the database`);
    } catch (err: any) {
      console.error(err);
      alert(`❌ Could not load transactions: ${err.message}`);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center items-center mt-6">
      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={transactions.length === 0}
        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 disabled:bg-gray-300"
      >
        Export JSON
      </button>

      {/* Import Label and Input */}
      <label className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 cursor-pointer">
        Import JSON
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </label>

      {/* Save Button */}
      <button
        onClick={handleSaveToDb}
        disabled={transactions.length === 0 || !user || isSaving}
        className="px-4 py-2 bg-purple-500 text-white rounded-md shadow hover:bg-purple-600 disabled:bg-gray-300"
      >
        {isSaving ? "Saving..." : "Save to DB"}
      </button>

      {/* Load Button */}
      <button
        onClick={handleFetchFromDb}
        disabled={!user || isFetching}
        className="px-4 py-2 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 disabled:bg-gray-300"
      >
        {isFetching ? "Loading..." : "Load from DB"}
      </button>
    </div>
  );
}