import { useState, useEffect, useRef } from "react";
import { Menu, Moon, Sun, Sparkles, Smile, History, Plus, Trash2, Trash, X, MessageSquare, Heart, User, Mic, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Sidebar from "./components/Sidebar";
import MessageBubble from "./components/MessageBubble";
import ChatInput from "./components/ChatInput";
import ProfileSection from "./components/ProfileSection";
import CameraModal from "./components/CameraModal";
import ScreenShareModal from "./components/ScreenShareModal";
import Profile from "./components/Profile";
import Login from "./Login";
import MobileFixerModal from "./components/MobileFixerModal";
import LoadingSpinner from "./components/LoadingSpinner";
import LiveVoiceModal from "./components/LiveVoiceModal";
import { useAuth } from "./AuthContext";
import { db, Timestamp, doc, setDoc, collection } from "./firebase";
import { useChatHistory } from "./hooks/useChatHistory";
import ChatHistorySidebar from "./components/ChatHistorySidebar";
import ExportButton from "./components/ExportButton";
import { geminiService } from "./lib/gemini";

interface Message {
  chat_id?: string;
  role: "user" | "model";
  content: string;
  timestamp?: string;
}

export default function App() {
  const { user, profile, loading, isAuthReady, updateProfileData } = useAuth();
  const {
    sessions,
    groupedSessions,
    messages,
    currentSessionId,
    setCurrentSessionId,
    saveMessage,
    deleteSession,
    renameSession,
    clearAll,
    searchQuery,
    setSearchQuery
  } = useChatHistory();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isScreenShareModalOpen, setIsScreenShareModalOpen] = useState(false);
  const [isMobileFixerOpen, setIsMobileFixerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Subah ka kya plan hai? ☀️";
    if (hour < 17) return "Dopehar kaisi ja rahi hai? 🌤️";
    if (hour < 20) return "Shaam ka kya scene hai? 🌆";
    return "Raat ko kya chal raha hai? 🌙";
  };

  // Initialize Dark Mode
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("rohit_dark_mode") === "true";
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) document.documentElement.classList.add("dark");
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("rohit_dark_mode", newMode.toString());
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSend = async (userMessage: string, imageData?: string) => {
    if (isLoading || !profile) return;

    setIsLoading(true);

    // Save user message
    const userMsg = { 
      role: "user" as const, 
      content: userMessage || "[Image Shared]", 
      timestamp: user ? Timestamp.now() : new Date().toISOString() 
    };
    await saveMessage(userMsg);

    try {
      // Get last 10 messages for context
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const aiReply = await geminiService.chat(userMessage, history, imageData);
      
      if (aiReply) {
        // Save AI reply
        const aiMsg = { 
          role: "model" as const, 
          content: aiReply, 
          timestamp: user ? Timestamp.now() : new Date().toISOString() 
        };
        await saveMessage(aiMsg);

        // Update chat count and badge
        const newCount = profile.chatCount + 1;
        let newBadge = profile.badge;
        if (newCount >= 1000) newBadge = "Gold";
        else if (newCount >= 500) newBadge = "Silver";
        
        updateProfileData({ chatCount: newCount, badge: newBadge });
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      // Show error message in chat
      const errorMsg = {
        role: "model" as const,
        content: `Oops! Kuch gadbad ho gayi. 🙄\n\nError: ${error.message || "Unknown error"}\n\nCheck karo ki API Key sahi hai ya nahi. Agar Netlify pe ho, toh environment variables set karo.`,
        timestamp: user ? Timestamp.now() : new Date().toISOString()
      };
      await saveMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareImageWithAI = (imageData: string) => {
    handleSend("", imageData);
  };

  const clearAllHistory = async () => {
    if (!confirm("Kya aap sach mein saari chat history delete karna chahte hain?")) return;
    await clearAll();
    setIsSidebarOpen(false);
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setIsSidebarOpen(false);
  };

  const [showDebug, setShowDebug] = useState(false);

  const keyStats = (geminiService as any).getStats ? (geminiService as any).getStats() : [];

  if (loading || !isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return <Login />;
  }

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 overflow-hidden ${isDarkMode ? "bg-[#0D0221] text-neutral-100" : "bg-[#FDFCF0] text-neutral-900"}`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-pink-500/15 blur-[150px] animate-horror-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-600/15 blur-[150px] animate-horror-pulse delay-1000" />
        <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] animate-horror-pulse delay-2000" />
        <div className="absolute top-[60%] right-[20%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] animate-horror-pulse delay-3000" />
        <div className="absolute top-[10%] left-[20%] w-[25%] h-[25%] bg-cyan-500/5 blur-[80px] animate-horror-pulse delay-1500" />
        {/* Right side highlight line */}
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-[#FF0080] via-[#7928CA] to-[#FF0080] opacity-60 shadow-[0_0_30px_rgba(255,0,128,0.7)] z-50" />
        {isDarkMode && (
          <>
            <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-white rounded-full animate-ping opacity-20" />
            <div className="absolute top-[60%] right-[15%] w-1 h-1 bg-white rounded-full animate-ping opacity-10 delay-700" />
            <div className="absolute bottom-[30%] left-[20%] w-1 h-1 bg-white rounded-full animate-ping opacity-15 delay-1500" />
          </>
        )}
      </div>

      {/* Sidebar */}
      <ChatHistorySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={groupedSessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onNewChat={() => setCurrentSessionId(null)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-pink-500/5 pointer-events-none" />

        {/* Header */}
        <header className="bg-white/10 dark:bg-black/30 backdrop-blur-3xl border-b border-white/10 dark:border-purple-500/10 px-4 sm:px-8 py-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_15px_50px_rgba(0,0,0,0.15)]">
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-3.5 hover:bg-white/20 dark:hover:bg-purple-500/20 rounded-2xl transition-all text-neutral-600 dark:text-neutral-400 hover:scale-110 active:scale-95"
            >
              <Menu size={26} />
            </button>
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 premium-button rounded-[1.2rem] flex items-center justify-center text-white shadow-[0_0_40px_rgba(255,0,128,0.4)] animate-glow">
                <Sparkles size={32} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter neon-text leading-none">Rohit X AI</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="w-2.5 h-2.5 bg-[#00F5FF] rounded-full animate-pulse shadow-[0_0_15px_#00F5FF]"></span>
                  <p className="text-[9px] sm:text-[11px] text-neutral-500 dark:text-purple-400 uppercase tracking-[0.3em] font-black leading-none">
                    Neural Active
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDebug(true)}
              className="p-3 hover:bg-neutral-100 dark:hover:bg-purple-900/30 rounded-2xl transition-all text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:scale-110"
              title="API Status"
            >
              <Settings size={22} />
            </button>
            <button
              onClick={() => setIsLiveVoiceOpen(true)}
              className="p-3 hover:bg-neutral-100 dark:hover:bg-purple-900/30 rounded-2xl transition-all text-neutral-600 dark:text-neutral-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:scale-110"
              title="Live Voice Chat"
            >
              <Mic size={22} />
            </button>
            <div className="h-8 w-px bg-neutral-200 dark:bg-purple-500/20 mx-1" />
            <button
              onClick={toggleDarkMode}
              className="p-3 hover:bg-neutral-100 dark:hover:bg-purple-900/30 rounded-2xl transition-all text-neutral-600 dark:text-neutral-400 hover:text-pink-500 dark:hover:text-pink-400 hover:scale-110"
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <div className="h-8 w-px bg-neutral-200 dark:bg-purple-500/20 mx-1" />
            <div onClick={() => setIsProfileOpen(true)} className="cursor-pointer hover:scale-110 transition-transform">
              <ProfileSection userId={profile.uid} />
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-5xl mx-auto w-full space-y-2 relative scroll-smooth custom-scrollbar">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-full text-center space-y-8 py-12 px-4">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 premium-button rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_50px_rgba(255,0,128,0.4)] animate-float"
              >
                <Sparkles size={48} />
              </motion.div>

              {/* Greeting */}
              <div className="space-y-5">
                <p className="text-neutral-500 dark:text-purple-400 font-black tracking-[0.4em] uppercase text-[11px] sm:text-[14px] animate-pulse">
                  {getGreeting()}
                </p>
                <h2 className="text-6xl sm:text-8xl font-black tracking-tighter neon-text">
                  Namaste, Dost!
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto text-base sm:text-lg font-bold leading-relaxed">
                  Main hoon Rohit — tera AI dost! Kuch bhi pooch, koi bhi mode chuno. 🎯
                </p>
              </div>

              {/* Modes Grid */}
              <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                {[
                  { icon: "📖", title: "Kahani Mode", sub: "Story sunao", prompt: "Ek mast suspense kahani sunao" },
                  { icon: "🌙", title: "Sad Mode", sub: "Emotional support", prompt: "Main bahut sad feel kar raha hoon, thoda comfort karo" },
                  { icon: "😂", title: "Comedy Mode", sub: "Hasao mujhe", prompt: "Ek mast funny joke sunao" },
                  { icon: "💖", title: "Shayari Mode", sub: "Romantic baatein", prompt: "Mujhe ek romantic shayari sunao" }
                ].map((mode) => (
                  <button
                    key={mode.title}
                    onClick={() => handleSend(mode.prompt)}
                    className="neon-card flex flex-col items-center justify-center p-6 group"
                  >
                    <span className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-500">{mode.icon}</span>
                    <span className="font-black text-xs uppercase tracking-widest text-neutral-800 dark:text-neutral-100">{mode.title}</span>
                    <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400 mt-1">{mode.sub}</span>
                  </button>
                ))}
              </div>

              {/* Quick Start */}
              <div className="w-full max-w-md space-y-4">
                <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 tracking-[0.2em] uppercase">Quick Start Karo</p>
                <div className="space-y-3">
                  {[
                    { icon: "💖", text: "Mujhe ek romantic shayari sunao" },
                    { icon: "😂", text: "Koi funny joke batao bhai" },
                    { icon: "📖", text: "Ek suspense kahani sunao" },
                    { icon: "🔥", text: "Mujhe motivate karo aaj" },
                    { icon: "🌙", text: "Main bahut sad feel kar raha/rahi hoon" },
                    { icon: "🤖", text: "Apne aap ke baare mein batao" }
                  ].map((item) => (
                    <button
                      key={item.text}
                      onClick={() => handleSend(item.text)}
                      className="w-full p-4 flex items-center gap-3 bg-white/40 dark:bg-neutral-800/40 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-2xl hover:bg-white dark:hover:bg-neutral-800 transition-all text-sm font-bold text-neutral-700 dark:text-neutral-200 text-left group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap justify-center gap-3 w-full max-w-md pt-4">
                <button
                  onClick={() => setIsMobileFixerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-bold hover:bg-blue-500 hover:text-white transition-all"
                >
                  <span className="text-sm">📱</span> Mobile Fixer
                </button>
                <button
                  onClick={() => setIsLiveVoiceOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-xl text-xs font-bold hover:bg-purple-500 hover:text-white transition-all"
                >
                  <span className="text-sm">🎙️</span> Live Voice
                </button>
                <button
                  onClick={() => setIsCameraModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl text-xs font-bold hover:bg-green-500 hover:text-white transition-all"
                >
                  <span className="text-sm">📷</span> Camera AI
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                msg={msg}
              />
            ))}
          </div>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-start mb-6"
            >
              <div className="flex gap-3">
                <div className="w-9 h-9 premium-gradient rounded-full flex items-center justify-center text-white animate-pulse shadow-md">
                  <Sparkles size={18} />
                </div>
                <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-white/20 dark:border-white/5 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5 items-center">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </main>

        {/* Input Area */}
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          isDarkMode={isDarkMode}
          onOpenCamera={() => setIsCameraModalOpen(true)}
          onOpenScreenShare={() => setIsScreenShareModalOpen(true)}
          onOpenMobileFixer={() => setIsMobileFixerOpen(true)}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDebug && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-neutral-900 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  API Key Status
                </h2>
                <button onClick={() => setShowDebug(false)} className="text-neutral-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {keyStats.map((stat: any) => (
                  <div key={stat.index} className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-400">Key #{stat.index} ({stat.key})</span>
                      <span className={`text-sm font-medium ${
                        stat.status === "Active" ? "text-green-500" : stat.status === "Cooldown" ? "text-yellow-500" : "text-red-500"
                      }`}>
                        {stat.status} {stat.status === "Cooldown" ? `(${stat.cooldownRemaining}s)` : ""}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500">Fails: {stat.failCount}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-xs text-cyan-600 dark:text-cyan-400 leading-relaxed">
                  <strong>Tip:</strong> Agar sare keys "Blocked" ya "Cooldown" mein hain, toh apni personal API Key Netlify/Cloud Run settings mein <strong>VITE_GEMINI_API_KEY</strong> ke naam se add karein.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onShareWithAI={handleShareImageWithAI}
      />
      <ScreenShareModal
        isOpen={isScreenShareModalOpen}
        onClose={() => setIsScreenShareModalOpen(false)}
        onShareWithAI={handleShareImageWithAI}
      />
      <MobileFixerModal
        isOpen={isMobileFixerOpen}
        onClose={() => setIsMobileFixerOpen(false)}
      />
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
      />
      <Profile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
