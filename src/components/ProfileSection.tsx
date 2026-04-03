import { useState, useEffect } from "react";
import { User, Edit2, Check, Award } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProfileSectionProps {
  userId: string;
}

export default function ProfileSection({ userId }: ProfileSectionProps) {
  const [username, setUsername] = useState("User");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("rohit_username");
    if (savedName) setUsername(savedName);
  }, []);

  const handleSave = () => {
    if (tempName.trim()) {
      setUsername(tempName.trim());
      localStorage.setItem("rohit_username", tempName.trim());
    }
    setIsEditing(false);
  };

  const getBadge = () => {
    // Static logic for badge based on userId length or something
    const score = userId.length % 3;
    if (score === 0) return { label: "Gold", color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" };
    if (score === 1) return { label: "Silver", color: "text-slate-400 bg-slate-50 dark:bg-slate-900/20" };
    return { label: "Bronze", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" };
  };

  const badge = getBadge();

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-1"
              >
                <input
                  autoFocus
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSave()}
                  className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-orange-500 dark:text-white w-24"
                />
                <button onClick={handleSave} className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md">
                  <Check size={14} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="viewing"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{username}</span>
                <button
                  onClick={() => { setTempName(username); setIsEditing(true); }}
                  className="p-1 text-neutral-400 hover:text-orange-500 transition-colors"
                >
                  <Edit2 size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
          <Award size={10} />
          {badge.label}
        </div>
      </div>
      
      <div className="w-10 h-10 rounded-full premium-gradient flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-neutral-800 shadow-primary-start/20">
        <User size={20} />
      </div>
    </div>
  );
}
