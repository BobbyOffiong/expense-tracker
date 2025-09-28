"use client";

import { useState, useMemo, useEffect } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ animations
import BankSelector from "@/components/BankSelector";
import FileUploader from "@/components/FileUploader";
import TransactionList from "@/components/TransactionList";
import type { CategorizedTransaction, TransactionCategory } from "@/utils/categorizeTransactions";
import { categorizeTransactions } from "@/utils/categorizeTransactions";
import Summary from "@/components/Summary";
import CategoryChart from "@/components/CategoryChart";
import FinancialTrendsChart from "@/components/FinancialTrendsChart";
import BalanceChart from "@/components/BalanceChart";
import BudgetForm from "@/components/BudgetForm";
import BudgetProgress from "@/components/BudgetProgress";
import ExportImportControls from "@/components/ExportImportControls";
import AuthForm from "@/components/AuthForm";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<CategorizedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState<{ category: TransactionCategory | "All"; amount: number } | null>(null);

  const [activeTab, setActiveTab] = useState<"home" | "transactions" | "charts" | "budget">("home");

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (!error) setProfile(data);
      }
    };
    fetchProfile();
  }, [user, supabase]);

  const handleBankSelection = (bank: string) => {
    setSelectedBank(bank);
    setTransactions([]);
    setUploadedFile(null);
  };

  const parsePdf = async (file: File) => {
    if (!file) return;
    setIsLoading(true);
    setTransactions([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/parse-opay", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to parse PDF.");

      const mergedTransactions = [
        ...(data.walletTransactions || []).map((t: any) => ({ ...t, source: "wallet" })),
        ...(data.owealthTransactions || []).map((t: any) => ({ ...t, source: "owealth" })),
      ];

      setTransactions(categorizeTransactions(mergedTransactions));
    } catch (error) {
      console.error(error);
      alert("An error occurred during parsing. Please try again.");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    if (selectedBank === "OPay") parsePdf(file);
  };

  const handleBudgetSet = (category: TransactionCategory | "All", amount: number) => {
    setBudget({ category, amount });
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set(transactions.map((t) => t.category));
    return Array.from(uniqueCategories) as TransactionCategory[];
  }, [transactions]);

   if (!user) {
    return (
      <div className="flex justify-center items-center h-screen 
      bg-gradient-to-b from-green-50 to-white">
        <AnimatePresence mode="wait">
          {!showAuth ? (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <SplashScreen onContinue={() => setShowAuth(true)} />
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="p-6 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-3xl font-bold text-[#046A38] mb-2">
                  Xpen$eTraka
                </h1>
                <p className="text-base text-gray-700 mb-6">
                  Sign up or log in to continue
                </p>
                <AuthForm />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#e6ffe6]">
      {/* ✅ Sticky Top Header */}
      <header className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex justify-between items-center shadow-[0_2px_6px_rgba(4,255,56,0.25)]">
  <h1 className="text-xl font-bold text-[#046A38]">
    Xpen$eTraka
  </h1>
  <div className="flex items-center gap-3">
    <span className="hidden md:inline text-gray-800 text-sm">
      Hi, {profile?.full_name || user.email}
    </span>
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        setProfile(null);
      }}
      className="bg-red-500 text-white py-1 px-3 rounded-md shadow hover:bg-red-600 transition"
    >
      Sign out
    </button>
  </div>
</header>


      {/* ✅ Animated Tab Content */}
      <main className="flex-1 p-4 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <p className="text-lg font-semibold text-gray-800">
                  Welcome, {profile?.full_name || "User"}.
                </p>
                <p className="text-gray-700">Please select your bank and upload your bank statement.</p>
              </div>

              <div className="flex justify-center mb-6">
                <BankSelector onBankSelected={handleBankSelection} />
              </div>

              {selectedBank && (
                <div className="flex justify-center mb-6">
                  <FileUploader onFileUploaded={handleFileUpload} uploadedFile={uploadedFile} />
                </div>
              )}

              {isLoading ? (
                <div className="mt-8 p-4 text-center text-gray-500">Parsing statement...</div>
              ) : (
                <>
                  <Summary transactions={transactions} />
                  {/* ✅ Export/Import only in Home tab */}
                  <ExportImportControls
                    transactions={transactions}
                    onImport={setTransactions}
                    onLoad={setTransactions}
                  />
                </>
              )}
            </motion.div>
          )}

          {activeTab === "transactions" && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <TransactionList transactions={transactions} />
            </motion.div>
          )}

          {activeTab === "charts" && (
            <motion.div
              key="charts"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryChart transactions={transactions} />
              <BalanceChart transactions={transactions} />
              <FinancialTrendsChart transactions={transactions} />
            </motion.div>
          )}

          {activeTab === "budget" && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <BudgetForm onBudgetSet={handleBudgetSet} categories={categories} />
              <BudgetProgress transactions={transactions} budget={budget} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ✅ Sticky Bottom Nav */}
      <BottomNav onNavigate={(tab) => setActiveTab(tab as typeof activeTab)} />
    </div>
  );
}
