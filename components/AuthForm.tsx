"use client";

import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

// You'll need to install a library for icons like react-icons or use raw SVG.
// For this example, I'll use raw SVG for simplicity.
const AuthForm = () => {
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        setMessage("Check your inbox to confirm your email!");
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setMessage("Magic link sent! Check your email.");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* 🚀 Updated Password Input with a Toggle Button */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded-md text-gray-900 pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              // Eye-slash icon (hide)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0112 5.25c4.76 0 9.288 2.336 12.155 5.925M3.98 8.223A7.5 7.5 0 001.268 15.75c1.233 1.233 2.65 2.275 4.218 3.197M3.98 8.223L1.268 15.75m4.218-4.965M18.129 11.287a4.5 4.5 0 11-6.364-6.364M12.001 12.001m-4.5 0a4.5 4.5 0 109 0 4.5 4.5 0 10-9 0"
                />
              </svg>
            ) : (
              // Eye icon (show)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.575 3.01 9.963 7.181a1.012 1.012 0 010 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.575-3.01-9.963-7.181z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#046A38] text-white py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <button
        onClick={handleMagicLink}
        disabled={loading || !email}
        className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        {loading ? "Sending..." : "Send Magic Link"}
      </button>

      <p className="mt-4 text-sm text-gray-600">
        {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-[#046A38] font-medium hover:underline"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </p>

      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}
    </div>
  );
};

export default AuthForm;