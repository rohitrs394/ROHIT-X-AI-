import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Youtube, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "motion/react";

interface Step {
  step: string;
  description: string;
  is_risky: boolean;
}

interface SolutionStepsProps {
  solution: {
    problem_confirmation: string;
    steps: Step[];
    warning?: string;
    youtube_search_query?: string;
    final_advice: string;
  };
}

export default function SolutionSteps({ solution }: SolutionStepsProps) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  return (
    <div className="space-y-6">
      <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 rounded-2xl">
        <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
          ✅ {solution.problem_confirmation}
        </p>
      </div>

      <div className="space-y-4">
        {solution.steps.map((step, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="flex gap-4 p-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-2xl shadow-xl"
          >
            <div className="flex-shrink-0 w-8 h-8 premium-gradient text-white rounded-full flex items-center justify-center font-black text-sm shadow-lg shadow-primary-start/20">
              {idx + 1}
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                {step.step}
                {step.is_risky && <AlertTriangle size={14} className="text-red-500" />}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {solution.warning && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-2xl flex gap-3">
          <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-xs font-bold text-red-600 dark:text-red-400">
            ⚠️ Warning: {solution.warning}
          </p>
        </div>
      )}

      {solution.youtube_search_query && (
        <a
          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(solution.youtube_search_query)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
        >
          <Youtube size={20} />
          Watch Tutorial on YouTube
        </a>
      )}

      <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl space-y-3">
        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Final Advice</p>
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{solution.final_advice}</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-bold text-neutral-400">Kya yeh kaam kiya?</span>
        <div className="flex gap-2">
          <button
            onClick={() => setFeedback("up")}
            className={`p-2 rounded-xl transition-all ${feedback === "up" ? "bg-green-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-green-500"}`}
          >
            <ThumbsUp size={18} />
          </button>
          <button
            onClick={() => setFeedback("down")}
            className={`p-2 rounded-xl transition-all ${feedback === "down" ? "bg-red-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-red-500"}`}
          >
            <ThumbsDown size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
