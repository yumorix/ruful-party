import { z } from 'zod';

// Party validation
export const partySchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  date: z.string().min(1, '日時は必須です'),
  location: z.string().min(1, '場所は必須です'),
  capacity: z.number().min(2, '定員は2人以上必要です'),
  status: z.enum(['preparing', 'active', 'closed']),
  current_mode: z.enum(['interim', 'final', 'closed'])
});

export type PartyFormData = z.infer<typeof partySchema>;

// Participant validation
export const participantSchema = z.object({
  party_id: z.string().min(1, 'パーティIDは必須です'),
  participant_number: z.number().min(1, '参加者番号は1以上必要です'),
  name: z.string().min(1, '名前は必須です'),
  gender: z.enum(['male', 'female']),
  access_token: z.string().optional()
});

export type ParticipantFormData = z.infer<typeof participantSchema>;

// Vote validation
export const voteSchema = z.object({
  party_id: z.string().min(1, 'パーティIDは必須です'),
  voter_id: z.string().min(1, '投票者IDは必須です'),
  voted_id: z.string().min(1, '投票先IDは必須です'),
  vote_type: z.enum(['interim', 'final']),
  rank: z.number().min(1).max(3)
});

export type VoteFormData = z.infer<typeof voteSchema>;

// Party settings validation
export const partySettingsSchema = z.object({
  party_id: z.string().min(1, 'パーティIDは必須です'),
  seating_layout: z.object({
    tableCount: z.number().min(1, 'テーブル数は1以上必要です'),
    seatsPerTable: z.number().min(2, 'テーブルあたりの席数は2以上必要です')
  }),
  matching_rule: z.object({
    prioritizeMutualMatches: z.boolean(),
    considerVoteRanking: z.boolean(),
    balanceGenderRatio: z.boolean()
  }),
  gender_rules: z.object({
    requireMixedGender: z.boolean(),
    alternateSeating: z.boolean()
  })
});

export type PartySettingsFormData = z.infer<typeof partySettingsSchema>;

// Seating plan validation
export const seatingPlanSchema = z.object({
  party_id: z.string().min(1, 'パーティIDは必須です'),
  plan_type: z.enum(['interim', 'final']),
  layout_data: z.any(),
  image_url: z.string().optional()
});

export type SeatingPlanFormData = z.infer<typeof seatingPlanSchema>;

// Match validation
export const matchSchema = z.object({
  party_id: z.string().min(1, 'パーティIDは必須です'),
  match_type: z.enum(['interim', 'final']),
  participant1_id: z.string().min(1, '参加者1のIDは必須です'),
  participant2_id: z.string().min(1, '参加者2のIDは必須です'),
  table_number: z.number().optional(),
  seat_positions: z.any().optional()
});

export type MatchFormData = z.infer<typeof matchSchema>;
