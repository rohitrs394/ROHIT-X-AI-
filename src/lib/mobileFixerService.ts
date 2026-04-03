import { GoogleGenAI, Type } from "@google/genai";

const MOBILE_FIXER_PROMPT = `
Tu ek expert mobile repair technician hai. User ko phone ki problem bata raha hai.
Step-by-step solution de Hindi mein:
1. Problem confirm kar
2. Simple solutions pehle try kar (restart, cache clear)
3. Advanced solutions baad mein
4. Warning de agar kuch risky ho
5. Store/service center jaane ki zaroorat ho toh bata

Response format strictly JSON:
{
  "problem_confirmation": "string",
  "steps": [
    { "step": "string", "description": "string", "is_risky": boolean }
  ],
  "warning": "string",
  "youtube_search_query": "string",
  "final_advice": "string"
}
`;

export const mobileFixerService = {
  async getSolution(problem: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `User problem: ${problem}`,
        config: {
          systemInstruction: MOBILE_FIXER_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              problem_confirmation: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    step: { type: Type.STRING },
                    description: { type: Type.STRING },
                    is_risky: { type: Type.BOOLEAN }
                  },
                  required: ["step", "description", "is_risky"]
                }
              },
              warning: { type: Type.STRING },
              youtube_search_query: { type: Type.STRING },
              final_advice: { type: Type.STRING }
            },
            required: ["problem_confirmation", "steps", "final_advice"]
          }
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Mobile Fixer AI Error:", error);
      throw error;
    }
  }
};
