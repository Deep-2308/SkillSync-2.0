import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY!,
});

export { genai };
