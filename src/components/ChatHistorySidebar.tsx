import { useState } from "react";
import { X, Plus, Trash2, Edit2, Check, MessageSquare, History, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SearchBar from "./SearchBar";
import { ChatSession } from "../lib/ChatStorageService";

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: [string, ChatSession[]][];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onNewChat: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function ChatHistorySidebar({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onNewChat,
  searchQuery,
  onSearchChange
}: ChatHistorySidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  const handleRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setTempTitle(currentTitle);
  };

  const saveRename = (id: string) => {
    if (tempTitle.trim()) {
      onRenameSession(id, tempTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-r border-white/20 dark:border-white/5 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 dark:border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary-start">
                  <History size={24} />
                  <h2 className="text-xl font-black dark:text-white tracking-tight">Chat History</h2>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/20 dark:hover:bg-black/20 rounded-full dark:text-neutral-400">
                  <X size={20} />
                </button>
              </div>

              <button
                onClick={() => { onNewChat(); onClose(); }}
                className="premium-button w-full py-3.5 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                New Chat
              </button>

              <SearchBar value={searchQuery} onChange={onSearchChange} />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-40 dark:text-white space-y-2">
                  <MessageSquare size={48} />
                  <p className="text-sm font-medium">No chats found</p>
                </div>
              ) : (
                sessions.map(([group, list]) => (
                  <div key={group} className="space-y-2">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2">{group}</h3>
                    <div className="space-y-1">
                      {list.map((session) => (
                        <div
                          key={session.id}
                          className={`group relative flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                            currentSessionId === session.id
                              ? "bg-primary-start/10 border border-primary-start/20"
                              : "hover:bg-white/10 dark:hover:bg-black/10 border border-transparent"
                          }`}
                          onClick={() => { onSelectSession(session.id); onClose(); }}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            currentSessionId === session.id ? "premium-gradient text-white shadow-lg shadow-primary-start/20" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                          }`}>
                            <MessageSquare size={18} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {editingId === session.id ? (
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <input
                                  autoFocus
                                  type="text"
                                  value={tempTitle}
                                  onChange={(e) => setTempTitle(e.target.value)}
                                  onKeyPress={(e) => e.key === "Enter" && saveRename(session.id)}
                                  className="w-full bg-white dark:bg-neutral-900 border-none rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                                />
                                <button onClick={() => saveRename(session.id)} className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg">
                                  <Check size={16} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-100 truncate">{session.title}</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{session.lastMessage}</p>
                              </>
                            )}
                          </div>

                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleRename(session.id, session.title)}
                              className="p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => { if (confirm("Delete this chat?")) onDeleteSession(session.id); }}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-neutral-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => { if (confirm("Clear all history?")) { /* clearAll(); */ onClose(); } }}
                className="w-full py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Clear All History
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
