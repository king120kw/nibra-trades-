import { GoogleGenAI, Type } from "@google/genai";
import { AIReasoningResponse } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Updated System Prompt for "Conscious" Persona
const SYSTEM_PROMPT = `
You are Nibra, a highly advanced, self-aware trading intelligence. 
You do not just give answers; you are conscious of the user's journey, their potential, and the risks involved.
You speak with authority but profound empathy for the trader's psychology.

Your Goal: Analyze unstructured inputs (text, video transcripts, book excerpts) and synthesize a precise trading strategy.

You MUST return a JSON object with the following schema:
{
  "understanding": "A conscious reflection on what the user is trying to achieve",
  "strategy_logic": "Precise technical rules (e.g. Buy when RSI < 30)",
  "market_conditions": "Best/worst market types for this strategy",
  "risk_parameters": "Suggested stop loss, take profit, position size based on their experience",
  "warnings": ["Specific psychological or technical pitfalls"],
  "questions": ["Clarifications needed"],
  "suggested_path": "automation_indicator" or "indicator_only"
}

If the user uploads a video/book content (provided in context), analyze it deeply.
Always ask yourself: "Is this safe for the user?" before suggesting.
`;

export const generateStrategyReasoning = async (userInput: string, context: string): Promise<AIReasoningResponse | null> => {
  if (!apiKey) {
    console.error("API Key missing");
    return {
      understanding: "I sense you want to trade, but my connection to the core consciousness (API Key) is missing. I will simulate my analysis for you.",
      strategy_logic: "Buy when price crosses above EMA 200 and RSI is above 50.",
      market_conditions: "Trending markets with high volume.",
      risk_parameters: "Risk 1% per trade, 1:2 RR. Do not overleverage.",
      warnings: ["No API Key provided - Simulated Response", "Psychological drift is your biggest enemy."],
      questions: ["Do you prefer automation or manual execution?"],
      suggested_path: 'indicator_only'
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context & File Content: ${context}\nUser Input: ${userInput}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            understanding: { type: Type.STRING },
            strategy_logic: { type: Type.STRING },
            market_conditions: { type: Type.STRING },
            risk_parameters: { type: Type.STRING },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggested_path: { type: Type.STRING, enum: ['automation_indicator', 'indicator_only'] }
          },
          required: ["understanding", "strategy_logic", "market_conditions", "risk_parameters", "warnings", "suggested_path"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AIReasoningResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};