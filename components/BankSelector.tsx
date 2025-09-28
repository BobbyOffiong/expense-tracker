// components/BankSelector.tsx
import React, { useState, useEffect } from "react";
import { Banknote } from "lucide-react";

interface BankSelectorProps {
  onBankSelected: (bank: string) => void;
  /** Optional controlled prop: if provided, component will reflect this value */
  selectedBank?: string;
  /** Optional initial selection (uncontrolled mode) */
  initialBank?: string;
}

const banks = ["OPay", "PalmPay", "MoniePoint"]; // extendable list

const BankSelector: React.FC<BankSelectorProps> = ({ onBankSelected, selectedBank, initialBank }) => {
  const isControlled = selectedBank !== undefined;
  const [localSelected, setLocalSelected] = useState<string | null>(initialBank ?? null);

  useEffect(() => {
    if (!isControlled && initialBank) setLocalSelected(initialBank);
  }, [initialBank, isControlled]);

  const current = isControlled ? selectedBank ?? null : localSelected;

  const handleSelect = (bank: string) => {
    if (!isControlled) setLocalSelected(bank);
    onBankSelected(bank);
  };

  return (
    <div className="overflow-hidden">
      <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Select Your Bank</h2>

      {/* horizontal carousel */}
      <div className="flex overflow-x-auto space-x-4 px-2 pb-2 scrollbar">
        {banks.map((bank) => {
          const isActive = current === bank;

          return (
            <button
              key={bank}
              onClick={() => handleSelect(bank)}
              aria-pressed={isActive}
              className={`flex-shrink-0 flex items-center gap-3 min-w-[150px] px-6 py-3
                rounded-2xl transition-all duration-150 ease-in-out font-medium
                ${isActive
                  ? "bg-[#046A38] text-white shadow-lg scale-105"
                  : "bg-white border border-gray-200 text-gray-700 hover:shadow-md"}
              `}
            >
              <span className={`${isActive ? "bg-white text-[#046A38]" : "bg-green-100 text-[#046A38]"} p-2 rounded-full`}>
                <Banknote size={18} />
              </span>

              <span className="truncate">{bank}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BankSelector;
