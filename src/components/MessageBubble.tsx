import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { User, Sparkles, Trash2, Volume2, Loader2 } from "lucide-react";
import { geminiService } from "../lib/gemini";
import { playPCMAudio } from "../lib/audioUtils";
import { useState } from "react";

interface Message {
  chat_id?: string;
  role: "user" | "model";
  content: string;
  timestamp?: string;
}

interface MessageBubbleProps {
  msg: Message;
  onDelete?: (chatId: string) => void;
}

export default function MessageBubble({ msg, onDelete }: MessageBubbleProps) {
  const isUser = msg.role === "user";
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const base64Audio = await geminiService.speak(msg.content);
      await playPCMAudio(base64Audio);
    } catch (error) {
      console.error("Failed to speak:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-lg ${
          isUser ? "premium-gradient text-white shadow-primary-start/20" : "bg-white dark:bg-neutral-800 text-orange-500 border border-neutral-200 dark:border-neutral-700"
        }`}>
          {isUser ? <User size={18} /> : <Sparkles size={18} />}
        </div>
        
        <div className="group relative">
          <div className={`p-4 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-[1.02] ${
            isUser 
              ? "horror-sweet-bubble text-white" 
              : "neon-card text-neutral-800 dark:text-neutral-100"
          }`}>
            <div className="prose prose-sm max-w-none dark:prose-invert font-medium">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
          
          {msg.chat_id && (
            <button
              onClick={() => onDelete?.(msg.chat_id!)}
              className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
            >
              <Trash2 size={12} />
            </button>
          )}
          
          <div className="flex items-center gap-2 mt-1.5 px-1">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
            </span>
            {!isUser && (
              <button
                onClick={handleSpeak}
                disabled={isSpeaking}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors disabled:opacity-50 text-neutral-400"
                title="Listen in Hindi"
              >
                {isSpeaking ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
