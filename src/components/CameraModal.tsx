import { useState, useRef, useEffect } from "react";
import { X, Camera, RefreshCcw, Video, VideoOff, Image as ImageIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MediaService } from "../lib/MediaService";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShareWithAI: (imageData: string) => void;
}

export default function CameraModal({ isOpen, onClose, onShareWithAI }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, isCameraOn, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      const newStream = await MediaService.getCameraStream(facingMode);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      setError("Camera access denied or not available.");
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    MediaService.stopStream(stream);
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => setIsCameraOn(!isCameraOn);
  const switchCamera = () => setFacingMode(facingMode === "user" ? "environment" : "user");

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
            <Camera size={24} />
            <h2 className="text-xl font-bold dark:text-white">Camera Preview</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full dark:text-neutral-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
            {isCameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center space-y-2 opacity-40 dark:text-white">
                <VideoOff size={48} className="mx-auto" />
                <p className="text-sm">Camera is off</p>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center p-4 text-center">
                <p className="text-red-500 font-medium bg-white dark:bg-neutral-900 px-4 py-2 rounded-lg shadow-sm">{error}</p>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full shadow-lg transition-all ${
                  isCameraOn ? "bg-red-500 text-white" : "bg-green-500 text-white"
                }`}
              >
                {isCameraOn ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
              {isCameraOn && (
                <button
                  onClick={switchCamera}
                  className="p-3 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-full shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <RefreshCcw size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={captureAndShare}
              disabled={!isCameraOn}
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
