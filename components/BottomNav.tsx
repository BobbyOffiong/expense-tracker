// components/BottomNav.tsx
"use client";

import { useState } from "react";
import { Home, List, PieChart, Wallet } from "lucide-react";

interface BottomNavProps {
  onNavigate: (view: string) => void;
}

export default function BottomNav({ onNavigate }: BottomNavProps) {
  const [active, setActive] = useState("home");

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "transactions", label: "Transactions", icon: List },
    { id: "charts", label: "Charts", icon: PieChart },
    { id: "budget", label: "Budget", icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <ul className="flex justify-around items-center h-14">
        {navItems.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              onClick={() => {
                setActive(id);
                onNavigate(id);
              }}
              className={`flex flex-col items-center text-xs transition-colors ${
                active === id ? "text-[#046A38]" : "text-gray-500"
              }`}
            >
              <Icon
                size={20}
                className={`mb-1 ${
                  active === id ? "text-[#046A38]" : "text-gray-400"
                }`}
              />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
