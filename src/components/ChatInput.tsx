import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X, Smartphone } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { motion, AnimatePresence } from "motion/react";
import MediaControls from "./MediaControls";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isDarkMode: boolean;
  onOpenCamera: () => void;
  onOpenScreenShare: () => void;
  onOpenMobileFixer: () => void;
}

export default function ChatInput({ onSend, isLoading, isDarkMode, onOpenCamera, onOpenScreenShare, onOpenMobileFixer }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiData: any) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  return (
    <footer className="bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-t border-white/20 dark:border-purple-500/20 p-4 md:p-8 sticky bottom-0 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
      <div className="max-w-4xl mx-auto relative">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              ref={emojiPickerRef}
              className="absolute bottom-full mb-6 right-0 z-50 shadow-2xl rounded-3xl overflow-hidden border border-white/20 dark:border-purple-500/30"
            >
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                width={320}
                height={400}
                skinTonesDisabled
                searchDisabled
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4 items-end">
          <div className="relative flex-1 neon-card !rounded-3xl overflow-hidden">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Rohit se kuch pucho..."
              className="w-full bg-transparent border-none px-8 py-5 pr-32 focus:ring-0 outline-none transition-all text-neutral-800 dark:text-neutral-100 resize-none max-h-48 font-bold placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <div className="absolute right-6 bottom-5 flex gap-4 text-neutral-400 dark:text-neutral-500">
              <button
                onClick={onOpenMobileFixer}
                className="hover:text-cyan-500 transition-all p-1 hover:scale-125"
                title="Mobile Fixer"
              >
                <Smartphone size={22} />
              </button>
              <MediaControls onOpenCamera={onOpenCamera} onOpenScreenShare={onOpenScreenShare} />
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="hover:text-pink-500 transition-all p-1 hover:scale-125"
              >
                <Smile size={22} />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-2xl flex-shrink-0 ${
              input.trim() && !isLoading 
                ? "premium-button" 
                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
            }`}
          >
            <Send size={28} className={input.trim() && !isLoading ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>
    </footer>
  );
}
