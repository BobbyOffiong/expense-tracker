"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onContinue: () => void;
}

export default function SplashScreen({ onContinue }: SplashScreenProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Capture the install prompt event
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Trigger install or open modal
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("User install choice:", outcome);
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="flex flex-col justify-between items-center h-screen 
    bg-gradient-to-b from-green-50 to-white px-4 overflow-hidden">
      {/* Center content */}
      <div className="flex flex-col justify-center items-center 
      text-center flex-grow">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-5xl font-extrabold text-[#046A38] mb-4"
        >
          Xpen$eTraka
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-700 font-medium"
        >
          Take charge of your finances.
        </motion.p>

        {/* Continue button */}
        <motion.button
          onClick={onContinue}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-6 bg-[#046A38] text-white px-6 py-3 rounded-lg shadow-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Continue
        </motion.button>
      </div>

      {/* Bottom section (download + credits) */}
      <div className="w-full">
        {/* Download Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex justify-center"
        >
          <button
            onClick={handleInstall}
            className="bg-[#046A38] text-white px-6 py-3 rounded-lg shadow-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Download Web App
          </button>
        </motion.div>

        {/* Bottom credits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-4 text-center text-sm text-gray-600"
        >
          <p>
            Brought to you by{" "}
            <span className="font-semibold text-gray-800">
              Engr. Bobby & Nna Chidinma Jemimah
            </span>
          </p>
          <Link
            href="https://vercel.com/bobby-offiong-s-projects"
            target="_blank"
            className="text-[#046A38] font-medium hover:underline"
          >
            View my projects
          </Link>
          <p className="mt-2 text-xs text-gray-500 mb-2">
            © {new Date().getFullYear()} Xpen$eTraka. All rights reserved.
          </p>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 max-w-sm text-center"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                Installation Unavailable
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                ⚡ The app can’t be installed right now.
                <br />
                • If already installed, check your apps list.
                <br />
                • If you don’t see the install option, try Chrome or Edge.
                <br />
                • Still stuck? Clear this site’s data and try again.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="mt-2 bg-[#046A38] text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
