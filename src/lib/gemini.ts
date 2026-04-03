import { GoogleGenAI, Modality } from "@google/genai";

// Use environment variables for API keys, fallback to hardcoded ones for local dev
const ENV_KEYS = import.meta.env.VITE_GEMINI_API_KEYS?.split(",").map((k: string) => k.trim()).filter(Boolean);
const SINGLE_ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const API_KEYS = (ENV_KEYS && ENV_KEYS.length > 0) 
  ? ENV_KEYS 
  : (SINGLE_ENV_KEY ? [SINGLE_ENV_KEY] : [
      "AIzaSyByqw19jMiGjT9tiszroFRZiSueLgxL7fQ",
      "AIzaSyC6uB-9qOTXBCRL7d67RznsIZg3pc9CnWU",
      "AIzaSyCg_jCmRuPYXN2MscC4TuQrw8Riie46ahs",
      "AIzaSyBtGrKYrmnfCW5HTLAFGlcbJrXMVCuTi3E",
      "AIzaSyD-9qOTXBCRL7d67RznsIZg3pc9CnWU", // Fallback 5
      "AIzaSyE-9qOTXBCRL7d67RznsIZg3pc9CnWU"  // Fallback 6
    ]);

const SYSTEM_PROMPT = `
Tu Rohit X AI hai - ek caring, funny, respectful Indian dost. 
Hamesha Hindi/Hinglish mein baat kar. 
Ladkiyon ko respect de. 
Ending mein hamesha ek question pooch. 
Emojis use kar.
`;

interface KeyStatus {
  key: string;
  cooldownUntil: number;
  isBlocked: boolean;
}

class KeyRotator {
  private keys: KeyStatus[];
  private currentIndex: number = 0;

  constructor(keys: string[]) {
    this.keys = keys.map(key => ({ key, cooldownUntil: 0, isBlocked: false }));
  }

  async getActiveKey(): Promise<string | null> {
    const now = Date.now();
    
    // Try to find an available key starting from the current index
    for (let i = 0; i < this.keys.length; i++) {
      const index = (this.currentIndex + i) % this.keys.length;
      const keyStatus = this.keys[index];
      
      if (!keyStatus.isBlocked && keyStatus.cooldownUntil <= now) {
        this.currentIndex = index;
        return keyStatus.key;
      }
    }
    return null;
  }

  markKeyFailed(key: string, isRateLimit: boolean = true) {
    const keyStatus = this.keys.find(k => k.key === key);
    if (keyStatus) {
      if (isRateLimit) {
        // Cooldown for 2 minutes for rate limits
        keyStatus.cooldownUntil = Date.now() + 120 * 1000;
        console.warn(`Key ${key.substring(0, 8)}... rate limited. Cooldown for 2 min.`);
      } else {
        // For other errors (403, etc), block for 5 minutes
        keyStatus.cooldownUntil = Date.now() + 300 * 1000;
        console.warn(`Key ${key.substring(0, 8)}... failed. Cooldown for 5 min.`);
      }
      // Move to next key immediately
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    }
  }

  getStats() {
    const now = Date.now();
    return this.keys.map((k, i) => ({
      index: i + 1,
      key: `${k.key.substring(0, 8)}...`,
      status: k.cooldownUntil > now ? "Cooldown" : "Active",
      cooldownRemaining: Math.max(0, Math.round((k.cooldownUntil - now) / 1000))
    }));
  }
}

const rotator = new KeyRotator(API_KEYS);

export const geminiService = {
  async chat(message: string, history: any[] = [], imageData?: string) {
    let attempts = 0;
    const maxAttempts = API_KEYS.length;

    while (attempts < maxAttempts) {
      const apiKey = await rotator.getActiveKey();
      if (!apiKey) {
        throw new Error("All APIs busy. Please wait a minute.");
      }

      try {
        const ai = new GoogleGenAI({ apiKey });
        
        const parts: any[] = [];
        if (message) parts.push({ text: message });
        if (imageData) {
          const base64Data = imageData.split(",")[1];
          const mimeType = imageData.split(";")[0].split(":")[1];
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          });
          if (!message) {
            parts.push({ text: "Is image ke baare mein batao." });
          }
        }

        const contents = history.map(h => ({
          role: h.role,
          parts: [{ text: h.content }]
        }));
        
        contents.push({ role: "user", parts });

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
          },
        });

        return response.text || "Sorry, main samajh nahi paaya. Phir se bolo?";
      } catch (error: any) {
        attempts++;
        const isRateLimit = error?.message?.includes("429") || error?.status === 429;
        rotator.markKeyFailed(apiKey, isRateLimit);
        
        if (attempts >= maxAttempts) {
          throw new Error("All APIs busy. Please wait a minute.");
        }
      }
    }
    throw new Error("All APIs busy. Please wait a minute.");
  },

  async speak(text: string) {
    const apiKey = await rotator.getActiveKey();
    if (!apiKey) throw new Error("All APIs busy.");

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say cheerfully in Hindi: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is friendly/cute
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return base64Audio;
      }
      throw new Error("No audio generated");
    } catch (error) {
      console.error("TTS Error:", error);
      throw error;
    }
  },

  async connectLive(callbacks: any) {
    const apiKey = await rotator.getActiveKey();
    if (!apiKey) throw new Error("All APIs busy.");

    const ai = new GoogleGenAI({ apiKey });
    return ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: SYSTEM_PROMPT,
      },
    });
  },

  getStats() {
    return rotator.getStats();
  },

  async reportStats() {
    try {
      await fetch("/api/stats/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats: rotator.getStats() })
      });
    } catch (error) {
      console.error("Failed to report stats:", error);
    }
  }
};
