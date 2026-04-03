import React, { useState } from "react";
import { X, Smartphone, Search, Sparkles, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CommonIssuesGrid from "./CommonIssuesGrid";
import SolutionSteps from "./SolutionSteps";
import { mobileFixerService } from "../lib/mobileFixerService";

interface MobileFixerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileFixerModal({ isOpen, onClose }: MobileFixerModalProps) {
  const [problem, setProblem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetSolution = async (selectedProblem?: string) => {
    const finalProblem = selectedProblem || problem;
    if (!finalProblem.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await mobileFixerService.getSolution(finalProblem);
      setSolution(result);
    } catch (err) {
      setError("AI se solution nahi mil pa raha. Phir se try karo?");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setProblem("");
    setSolution(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 text-orange-500">
            {solution ? (
              <button onClick={reset} className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all">
                <ArrowLeft size={20} />
              </button>
            ) : (
              <Smartphone size={24} />
            )}
            <h2 className="text-xl font-black dark:text-white tracking-tight">Mobile Fixer</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full dark:text-neutral-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 space-y-4"
              >
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-neutral-500 animate-pulse">Rohit AI solution dhoond raha hai...</p>
              </motion.div>
            ) : solution ? (
              <motion.div
                key="solution"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SolutionSteps solution={solution} />
              </motion.div>
            ) : (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Common Issues</h3>
                  <CommonIssuesGrid onSelect={handleGetSolution} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Ya apni problem batao</h3>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                      type="text"
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleGetSolution()}
                      placeholder="E.g. Mera phone charge nahi ho raha..."
                      className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition-all"
                    />
                  </div>
                  <button
                    onClick={() => handleGetSolution()}
                    disabled={!problem.trim()}
                    className="premium-button w-full py-4 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={20} />
                    Get Solution
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-2xl text-center">
              <p className="text-xs font-bold text-red-500">{error}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
