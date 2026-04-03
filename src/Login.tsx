import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { motion } from "motion/react";
import { LogIn, User, Sparkles, Mail, Lock, UserPlus } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, auth } from "./firebase";

export default function Login() {
  const { loginWithGoogle, loginAsGuest } = useAuth();
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Google login failed. Please try again.");
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) return setError("Email aur password dono chahiye.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailRegister = async () => {
    if (!email || !password) return setError("Email aur password dono chahiye.");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim()) {
      await loginAsGuest(guestName.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-pink-500/10 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg">
            <Sparkles size={40} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-neutral-800 dark:text-neutral-100">Rohit X AI</h1>
            <p className="text-neutral-500 dark:text-neutral-400">Namaste! Login karke baatein shuru karein.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-500 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-4 px-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl flex items-center justify-center gap-3 font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all shadow-sm active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl px-12 py-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl px-12 py-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleEmailLogin}
                  className="flex-1 py-3 bg-neutral-800 dark:bg-neutral-700 text-white rounded-xl font-bold hover:bg-neutral-700 transition-all active:scale-95"
                >
                  Login
                </button>
                <button
                  onClick={handleEmailRegister}
                  className="flex-1 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all active:scale-95"
                >
                  Register
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">GUEST</span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {!showGuestForm ? (
              <button
                onClick={() => setShowGuestForm(true)}
                className="w-full py-4 px-6 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all active:scale-95"
              >
                <User size={20} />
                Continue as Guest
              </button>
            ) : (
              <form onSubmit={handleGuestLogin} className="space-y-3">
                <input
                  autoFocus
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Apna naam likhein..."
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-neutral-800 dark:text-neutral-100"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGuestForm(false)}
                    className="flex-1 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-2 py-3 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20"
                  >
                    Start Chatting
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 text-center border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            By logging in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
