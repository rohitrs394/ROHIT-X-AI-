import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Edit2, Check, Award, Palette, Frame, LogOut, Calendar, Info, Sparkles, Heart, Star, Flame, Zap } from "lucide-react";
import ProfileUpgrade from "./ProfileUpgrade";
import ConfettiEffect from "./ConfettiEffect";
import Lottie from "lottie-react";

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Profile({ isOpen, onClose }: ProfileProps) {
  const { profile, updateProfileData, logout } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempBio, setTempBio] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (profile?.badge && profile.badge !== "Bronze") {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [profile?.badge]);

  if (!profile) return null;

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateProfileData({ displayName: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleSaveBio = () => {
    updateProfileData({ bio: tempBio.trim() });
    setIsEditingBio(false);
  };

  const colors = [
    "#f97316", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"
  ];

  const frames = [
    { id: "none", label: "None", icon: <X size={20} /> },
    { id: "hearts", label: "Hearts", icon: <Heart size={20} /> },
    { id: "stars", label: "Stars", icon: <Star size={20} /> },
    { id: "fire", label: "Fire", icon: <Flame size={20} /> },
    { id: "sparkles", label: "Sparkles", icon: <Zap size={20} /> }
  ];

  // Mock Lottie animation for Gold badge avatar
  const goldAvatarAnimation = {
    v: "5.5.7",
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Gold Ring",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Ring",
        sr: 1,
        ks: {
          o: { k: 100 },
          r: { a: 1, k: [{ t: 0, s: [0] }, { t: 60, s: [360] }] },
          p: { k: [50, 50] },
          a: { k: [0, 0] },
          s: { k: [100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                p: { k: [0, 0] },
                s: { k: [90, 90] },
                ix: 1
              },
              { ty: "st", c: { k: [1, 0.84, 0] }, o: { k: 100 }, w: { k: 4 }, ix: 2 }
            ]
          }
        ]
      }
    ]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800"
          >
            {/* Profile Header Background */}
            <div 
              className="h-32 w-full relative transition-colors duration-500"
              style={{ backgroundColor: profile.bgColor || "#f97316" }}
            >
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all z-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-8 pb-8 -mt-16 relative">
              {/* Avatar */}
              <div className="relative inline-block">
                <div className={`w-32 h-32 rounded-full bg-white dark:bg-neutral-800 border-4 border-white dark:border-neutral-900 shadow-2xl flex items-center justify-center text-6xl relative z-10 ${
                  profile.badge === "Gold" ? "ring-4 ring-yellow-400 ring-offset-4 dark:ring-offset-neutral-900" : 
                  profile.badge === "Silver" ? "ring-4 ring-slate-300 ring-offset-4 dark:ring-offset-neutral-900" : ""
                }`}>
                  {profile.photoURL || "👤"}
                  
                  {profile.badge === "Gold" && (
                    <div className="absolute inset-0 z-0 scale-125">
                      <Lottie animationData={goldAvatarAnimation} loop={true} />
                    </div>
                  )}
                  
                  {profile.frame && profile.frame !== "none" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-4xl animate-bounce z-20">
                      {profile.frame === "hearts" ? "❤️" : profile.frame === "stars" ? "⭐" : profile.frame === "fire" ? "🔥" : "✨"}
                    </div>
                  )}
                </div>
                
                <div className="absolute -bottom-2 -right-2 z-20">
                  <div className={`p-2 rounded-full shadow-lg border-2 border-white dark:border-neutral-900 ${
                    profile.badge === "Gold" ? "bg-yellow-500 text-white" :
                    profile.badge === "Silver" ? "bg-slate-400 text-white" : "bg-orange-600 text-white"
                  }`}>
                    <Award size={20} />
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSaveName()}
                          className="text-2xl font-black bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-orange-500 dark:text-white w-full"
                        />
                        <button onClick={handleSaveName} className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl">
                          <Check size={24} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black tracking-tight text-neutral-800 dark:text-neutral-100">{profile.displayName}</h2>
                        <button onClick={() => { setTempName(profile.displayName); setIsEditingName(true); }} className="p-2 text-neutral-400 hover:text-orange-500 transition-colors">
                          <Edit2 size={18} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar size={12} /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Sparkles size={12} /> {profile.chatCount} Chats</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1"><Info size={14} /> Bio</h3>
                    {!isEditingBio && (
                      <button onClick={() => { setTempBio(profile.bio || ""); setIsEditingBio(true); }} className="text-xs text-orange-500 font-bold">Edit</button>
                    )}
                  </div>
                  {isEditingBio ? (
                    <div className="space-y-2">
                      <textarea
                        autoFocus
                        value={tempBio}
                        onChange={(e) => setTempBio(e.target.value)}
                        placeholder="Apne baare mein likhein..."
                        className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white resize-none h-24"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setIsEditingBio(false)} className="px-4 py-2 text-sm font-bold text-neutral-500">Cancel</button>
                        <button onClick={handleSaveBio} className="px-4 py-2 text-sm font-bold bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20">Save</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                      {profile.bio || "No bio yet. Kuch apne baare mein batao!"}
                    </p>
                  )}
                </div>

                {/* Badge Progress */}
                <ProfileUpgrade chatCount={profile.chatCount} badge={profile.badge} />

                {/* Customization */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1"><Palette size={14} /> Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(c => (
                        <button
                          key={c}
                          onClick={() => updateProfileData({ bgColor: c })}
                          className={`w-6 h-6 rounded-full border-2 ${profile.bgColor === c ? "border-neutral-800 dark:border-white scale-110" : "border-transparent"}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-1"><Frame size={14} /> Frame</h3>
                    <div className="flex flex-wrap gap-2">
                      {frames.map(f => (
                        <button
                          key={f.id}
                          onClick={() => updateProfileData({ frame: f.id })}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${profile.frame === f.id ? "bg-orange-500 text-white scale-110 shadow-lg" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"}`}
                          title={f.label}
                        >
                          {f.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={() => { logout(); onClose(); }}
                  className="w-full py-4 px-6 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>
            <ConfettiEffect trigger={showConfetti} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
