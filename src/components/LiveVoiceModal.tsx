import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, X, Volume2, VolumeX } from "lucide-react";
import { geminiService } from "../lib/gemini";

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveVoiceModal({ isOpen, onClose }: LiveVoiceModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [transcript, setTranscript] = useState("");
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      startLiveSession();
    } else {
      stopLiveSession();
    }
    return () => stopLiveSession();
  }, [isOpen]);

  const startLiveSession = async () => {
    setIsConnecting(true);
    setStatus("Connecting to Rohit...");
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const session = await geminiService.connectLive({
        onopen: () => {
          setIsConnecting(false);
          setStatus("Rohit is listening...");
          startMic();
        },
        onmessage: async (message: any) => {
          if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
            playOutputAudio(base64Audio);
          }
          if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
            setTranscript(prev => prev + message.serverContent.modelTurn.parts[0].text);
          }
          if (message.serverContent?.interrupted) {
            nextStartTimeRef.current = 0;
            setTranscript("");
          }
        },
        onerror: (err: any) => {
          console.error("Live Session Error:", err);
          setStatus("Connection error. Reconnecting...");
        },
        onclose: () => {
          setStatus("Disconnected");
        }
      });
      
      sessionRef.current = session;
    } catch (error) {
      console.error("Failed to start live session:", error);
      setStatus("Failed to connect");
    }
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = audioContextRef.current!.createMediaStreamSource(stream);
      const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (isMuted || !sessionRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64Data, mimeType: "audio/pcm;rate=16000" }
        });
      };
      
      source.connect(processor);
      processor.connect(audioContextRef.current!.destination);
      processorRef.current = processor;
    } catch (error) {
      console.error("Mic Error:", error);
      setStatus("Microphone access denied");
    }
  };

  const playOutputAudio = (base64Data: string) => {
    if (!audioContextRef.current) return;
    
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const int16Data = new Int16Array(bytes.buffer);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768.0;
    }
    
    // Live API output is 24000Hz
    const sampleRate = 24000;
    const buffer = audioContextRef.current.createBuffer(1, float32Data.length, sampleRate);
    buffer.getChannelData(0).set(float32Data);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    const currentTime = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime + 0.05; // Small buffer
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
    
    source.onended = () => {
      if (audioContextRef.current && audioContextRef.current.currentTime >= nextStartTimeRef.current - 0.1) {
        setIsSpeaking(false);
      }
    };
    
    setIsSpeaking(true);
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md glass-card p-8 relative overflow-hidden"
          >
            {/* Background Animation */}
            <div className="absolute inset-0 -z-10 opacity-20">
              <div className={`absolute inset-0 bg-gradient-to-br from-primary-start to-primary-end animate-pulse ${isSpeaking ? 'scale-150' : 'scale-100'} transition-transform duration-1000`} />
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="flex flex-col items-center text-center gap-8">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full premium-gradient flex items-center justify-center shadow-2xl ${isSpeaking ? 'animate-bounce' : ''}`}>
                  {isMuted ? <MicOff className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
                </div>
                
                {/* Voice Waves */}
                {isSpeaking && (
                  <div className="absolute -inset-4 border-4 border-primary-start/30 rounded-full animate-ping" />
                )}
              </div>

              <div className="space-y-2 w-full">
                <h2 className="text-2xl font-bold text-white">Rohit X Voice</h2>
                <p className="text-white/60 font-medium">{status}</p>
                
                {transcript && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 max-h-32 overflow-y-auto"
                  >
                    <p className="text-sm text-cyan-400 font-medium italic">
                      "{transcript}"
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                <button
                  className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                  onClick={() => {/* Toggle speaker? */}}
                >
                  {isSpeaking ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>
              </div>

              <p className="text-xs text-white/40">
                "Rohit is listening to you. Just talk naturally!"
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
