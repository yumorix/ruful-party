import { GoogleGenAI } from '@google/genai';
import { PartySetting } from '../db/supabase';
import { Vote } from '../db/supabase';
import { Participant } from '../db/supabase';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const generateSeatingPlan = async (
  participants: Participant[],
  votes: Vote[],
  settings: PartySetting
) => {
  const prompt = `
      
  `;
};
