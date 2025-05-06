import { GoogleGenAI } from '@google/genai';
import { Party, PartySetting, Match, MatchInsert } from '../db/supabase';
import { Vote } from '../db/supabase';
import { Participant } from '../db/supabase';
import { generateInterimSeatingPlanPrompt } from './prompts/interim-matching';
import { generateFinalMatchingPrompt } from './prompts/final-matching';
import { ulid } from 'ulid';
import { supabase } from '../db/supabase';

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

export const generateFinalMatching = async (
  party: Party,
  participants: Participant[],
  votes: Vote[]
): Promise<{ matches: Match[]; unmatchedParticipants: Participant[] }> => {
  const prompt = generateFinalMatchingPrompt(party, votes, participants);
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: prompt,
  });

  if (!response.text) {
    throw new Error('マッチング結果の生成に失敗しました');
  }

  try {
    // Extract JSON from the response
    const markdownRemoved = response.text.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    const result = JSON.parse(markdownRemoved);

    if (!result.matches || !Array.isArray(result.matches)) {
      throw new Error('マッチング結果のフォーマットが不正です');
    }

    // Create match records
    const now = new Date().toISOString();
    const matches: Match[] = [];

    for (const match of result.matches) {
      const participant1 = participants.find(p => p.id === match.voter_id);
      const participant2 = participants.find(p => p.id === match.voted_id);

      if (!participant1 || !participant2) {
        console.warn('Invalid participant ID in match:', match);
        continue;
      }

      matches.push({
        id: ulid(),
        party_id: party.id,
        match_type: 'final',
        participant1_id: participant1.id,
        participant2_id: participant2.id,
        created_at: now,
        table_number: null,
        seat_positions: null,
      } as Match);
    }

    // Get unmatched participants
    const matchedParticipantIds = new Set(
      matches.flatMap(m => [m.participant1_id, m.participant2_id])
    );
    const unmatchedParticipants = participants.filter(p => !matchedParticipantIds.has(p.id));

    return { matches, unmatchedParticipants };
  } catch (error) {
    console.error('Error processing final matching result:', error);
    throw new Error('マッチング結果の処理に失敗しました');
  }
};
