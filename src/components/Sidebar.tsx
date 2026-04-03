import { motion } from "motion/react";
import { Plus, History, Trash2, X, MessageSquare, Trash, Sparkles } from "lucide-react";

interface Message {
  chat_id?: string;
  role: "user" | "model";
  content: string;
  timestamp?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onClearAll: () => void;
  history: Message[];
  onDeleteChat: (chatId: string) => void;
}

export default function Sidebar({ isOpen, onClose, onNewChat, onClearAll, history, onDeleteChat }: SidebarProps) {
  // Group history by date
  const groupedHistory = history.reduce((acc: any, msg) => {
    if (msg.role !== "user") return acc;
    const date = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : "Today";
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -320 }}
        className={`fixed top-0 left-0 h-full w-80 bg-white/80 dark:bg-[#0D0221]/90 backdrop-blur-3xl border-r border-white/10 dark:border-purple-500/10 z-50 flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.2)] transition-all duration-500 ease-in-out`}
      >
        {/* Sidebar Header */}
        <div className="p-8 flex items-center justify-between border-b border-white/10 dark:border-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 premium-button rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
              <Sparkles size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter neon-text">Rohit X AI</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2.5 hover:bg-neutral-100 dark:hover:bg-purple-900/30 rounded-xl dark:text-neutral-400 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-6">
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="premium-button w-full py-4 px-6 flex items-center justify-center gap-3 text-sm font-black tracking-widest uppercase shadow-[0_10px_30px_rgba(255,0,128,0.3)]"
          >
            <Plus size={20} className="animate-pulse" />
            New Session
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-6 space-y-8 py-6 custom-scrollbar">
          {Object.keys(groupedHistory).length === 0 ? (
            <div className="text-center py-12 opacity-30 dark:text-purple-400">
              <History size={48} className="mx-auto mb-4 animate-float" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Echoes Found</p>
            </div>
          ) : (
            Object.entries(groupedHistory).map(([date, msgs]: [string, any]) => (
              <div key={date} className="space-y-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-400 dark:text-purple-500/60 px-2">
                  {date === new Date().toLocaleDateString() ? "Recent Echoes" : date}
                </h3>
                {msgs.map((msg: Message, idx: number) => (
                  <div
                    key={msg.chat_id || idx}
                    className="group flex items-center gap-3 p-4 rounded-2xl hover:bg-white dark:hover:bg-purple-900/20 cursor-pointer transition-all border border-transparent hover:border-neutral-200 dark:hover:border-purple-500/30 shadow-sm hover:shadow-xl"
                  >
                    <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-purple-900/40 flex items-center justify-center text-neutral-400 dark:text-purple-400 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                      <MessageSquare size={14} />
                    </div>
                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 truncate flex-1 tracking-tight">
                      {msg.content}
                    </span>
                    {msg.chat_id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteChat(msg.chat_id!); }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:text-red-500 text-neutral-400 transition-all hover:scale-125"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-white/10 dark:border-purple-500/10">
          <button
            onClick={onClearAll}
            className="w-full py-4 px-6 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-red-500/20"
          >
            <Trash size={18} />
            Purge All Echoes
          </button>
        </div>
      </motion.aside>
    </>
  );
}
