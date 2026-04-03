import { useState, useRef, useEffect } from "react";
import { X, Monitor, MonitorOff, Video, VideoOff, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MediaService } from "../lib/MediaService";

interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareWithAI: (imageData: string) => void;
}

export default function ScreenShareModal({ isOpen, onClose, onShareWithAI }: ScreenShareModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      stopSharing();
    }
  }, [isOpen]);

  const startSharing = async () => {
    try {
      setError(null);
      const newStream = await MediaService.getScreenStream();
      setStream(newStream);
      setIsSharing(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      newStream.getVideoTracks()[0].onended = () => stopSharing();
    } catch (err: any) {
      setError(err.message || "Screen share access denied or not available.");
      setIsSharing(false);
    }
  };

  const stopSharing = () => {
    MediaService.stopStream(stream);
    setStream(null);
    setIsSharing(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureAndShare = () => {
    if (videoRef.current) {
      const imageData = MediaService.captureScreenshot(videoRef.current);
      if (imageData) {
        onShareWithAI(imageData);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800"
      >
        <div className="p-6 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-orange-500">
            <Monitor size={24} />
            <h2 className="text-xl font-bold dark:text-white">Screen Sharing</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full dark:text-neutral-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
            {isSharing ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center space-y-2 opacity-40 dark:text-white">
                <MonitorOff size={48} className="mx-auto" />
                <p className="text-sm">Screen share is off</p>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center p-4 text-center">
                <p className="text-red-500 font-medium bg-white dark:bg-neutral-900 px-4 py-2 rounded-lg shadow-sm">{error}</p>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <button
                onClick={isSharing ? stopSharing : startSharing}
                className={`p-3 rounded-full shadow-lg transition-all ${
                  isSharing ? "bg-red-500 text-white" : "bg-green-500 text-white"
                }`}
              >
                {isSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={captureAndShare}
              disabled={!isSharing}
              className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Sparkles size={20} />
              Share with Rohit AI
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
