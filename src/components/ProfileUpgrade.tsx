import React from "react";
import { motion } from "motion/react";
import { Award, Sparkles, TrendingUp } from "lucide-react";
import Lottie from "lottie-react";

interface ProfileUpgradeProps {
  chatCount: number;
  badge: "Bronze" | "Silver" | "Gold";
}

export default function ProfileUpgrade({ chatCount, badge }: ProfileUpgradeProps) {
  const targetChats = badge === "Bronze" ? 500 : badge === "Silver" ? 1000 : 1000;
  const progress = Math.min((chatCount / targetChats) * 100, 100);
  const nextBadge = badge === "Bronze" ? "Silver" : badge === "Silver" ? "Gold" : "Max Level";

  // Mock Lottie animation for Gold badge
  const goldAnimation = {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Gold Sparkle",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Star",
        sr: 1,
        ks: {
          o: { a: 1, k: [{ t: 0, s: [0] }, { t: 30, s: [100] }, { t: 60, s: [0] }] },
          r: { a: 1, k: [{ t: 0, s: [0] }, { t: 60, s: [360] }] },
          p: { k: [50, 50] },
          a: { k: [0, 0] },
          s: { a: 1, k: [{ t: 0, s: [0, 0] }, { t: 30, s: [100, 100] }, { t: 60, s: [0, 0] }] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "sr",
                sy: 1,
                p: { k: [0, 0] },
                r: { k: 0 },
                pt: { k: 5 },
                ir: { k: 10 },
                is: { k: 0 },
                or: { k: 25 },
                os: { k: 0 },
                ix: 1
              },
              { ty: "fl", c: { k: [1, 0.84, 0] }, o: { k: 100 }, ix: 2 }
            ]
          }
        ]
      }
    ]
  };

  return (
    <div className="space-y-4 p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-inner">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl shadow-lg ${
            badge === "Gold" ? "bg-yellow-500 text-white animate-bounce" :
            badge === "Silver" ? "bg-slate-400 text-white" : "bg-orange-600 text-white"
          }`}>
            <Award size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Current Status</p>
            <h3 className="text-lg font-black text-neutral-800 dark:text-neutral-100">{badge} Member</h3>
          </div>
        </div>
        
        {badge === "Gold" && (
          <div className="w-12 h-12">
            <Lottie animationData={goldAnimation} loop={true} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <TrendingUp size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Next: {nextBadge}</span>
          </div>
          <span className="text-xs font-black text-orange-500">{chatCount} / {targetChats}</span>
        </div>
        
        <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                badge === "Gold" ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600" :
                badge === "Silver" ? "bg-gradient-to-r from-slate-300 to-slate-500" :
                "premium-gradient"
              }`}
            />
        </div>
        
        {badge !== "Gold" && (
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium italic">
            {targetChats - chatCount} more chats to unlock {nextBadge} status!
          </p>
        )}
      </div>
    </div>
  );
}
