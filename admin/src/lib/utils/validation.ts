import { z } from 'zod';

// Party validation
export const partySchema = z.object({
  name: z.string(),
  date: z.string().min(1, '日時は必須です'),
  location: z.string().min(1, '場所は必須です'),
  capacity: z.number().min(2, '定員は2人以上必要です'),
  status: z.enum(['preparing', 'active', 'closed']),
  current_mode: z.enum(['pre-voting', 'interim', 'final', 'final-result', 'closed']),
});

// Define the current_mode type for easier reuse
export type PartyCurrentMode = 'pre-voting' | 'interim' | 'final' | 'final-result' | 'closed';

export type PartyFormData = z.infer<typeof partySchema>;

// Participant validation
export const participantSchema = z.object({
  party_id: z.string().min(1, 'パーティIDは必須です'),
  participant_number: z
    .number()
    .min(1, '参加者番号は1以上必要です')
    .int('参加者番号は整数である必要があります'),
  name: z.string(),
  gender: z.enum(['male', 'female']),
  access_token: z.string().optional(),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;

// Vote validation
export const voteSchema = z.object({
  party_id: z.string().min(1, 'パーティIDは必須です'),
  voter_id: z.string().min(1, '投票者IDは必須です'),
  voted_id: z.string().min(1, '投票先IDは必須です'),
  vote_type: z.enum(['interim', 'final']),
  rank: z.number().min(1).max(3),
});

export type VoteFormData = z.infer<typeof voteSchema>;

// Table definition
export const tableSchema = z.object({
  id: z.string(),
  name: z.string(),
  seatCount: z.number().min(2, '席数は2以上必要です').max(12, '席数は12以下にしてください'),
});

export type TableData = z.infer<typeof tableSchema>;

// Party settings validation
export const partySettingsSchema = z.object({
  party_id: z.string().min(1, 'パーティIDは必須です'),
  seating_layout: z.object({
    tableCount: z.number().min(1, 'テーブル数は1以上必要です'),
    seatsPerTable: z.number().min(2, 'テーブルあたりの席数は2以上必要です'),
    tables: z.array(tableSchema).optional(),
  }),
  matching_rule: z.object({
    prioritizeMutualMatches: z.boolean(),
    considerVoteRanking: z.boolean(),
    balanceGenderRatio: z.boolean(),
  }),
  gender_rules: z.object({
    requireMixedGender: z.boolean(),
    alternateSeating: z.boolean(),
  }),
});

export type PartySettingsFormData = z.infer<typeof partySettingsSchema>;

// Seating plan validation
export const seatingPlanSchema = z.object({
  party_id: z.string().min(1, 'パーティIDは必須です'),
  plan_type: z.enum(['interim', 'final']),
  layout_data: z.any(),
  image_url: z.string().optional(),
});

export type SeatingPlanFormData = z.infer<typeof seatingPlanSchema>;

// Match validation
export const matchSchema = z.object({
  party_id: z.string().min(1, 'パーティIDは必須です'),
  match_type: z.enum(['interim', 'final']),
  participant1_id: z.string().min(1, '参加者1のIDは必須です'),
  participant2_id: z.string().min(1, '参加者2のIDは必須です'),
  table_number: z.number().optional(),
  seat_positions: z.any().optional(),
});

export type MatchFormData = z.infer<typeof matchSchema>;
