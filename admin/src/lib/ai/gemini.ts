import { GoogleGenAI } from '@google/genai';
import { Party, PartySetting } from '../db/supabase';
import { Vote } from '../db/supabase';
import { Participant } from '../db/supabase';
import { generateInterimSeatingPlanPrompt } from './prompts/interim';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const generateSeatingPlan = async (
  party: Party,
  settings: PartySetting,
  participants: Participant[],
  votes: Vote[]
): Promise<string | undefined> => {
  const prompt = generateInterimSeatingPlanPrompt(party, settings, votes, participants);
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: prompt,
  });

  return response.text;
};
