import { createClient } from '@supabase/supabase-js';
import { Database, Tables, TablesInsert, TablesUpdate } from './database.types';
import { TableData } from '../utils/validation';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type aliases using database.types.ts
export type Party = Tables<'parties'> & {
  status: 'preparing' | 'active' | 'closed';
  current_mode: 'interim' | 'final' | 'closed';
};

export type PartyInsert = TablesInsert<'parties'>;
export type PartyUpdate = TablesUpdate<'parties'>;

export type Participant = Tables<'participants'> & {
  gender: 'male' | 'female';
};

export type ParticipantInsert = TablesInsert<'participants'>;
export type ParticipantUpdate = TablesUpdate<'participants'>;

export type Vote = Tables<'votes'> & {
  vote_type: 'interim' | 'final';
};

export type VoteInsert = TablesInsert<'votes'>;
export type VoteUpdate = TablesUpdate<'votes'>;

export type PartySetting = Tables<'party_settings'> & {
  seating_layout: {
    tableCount: number;
    seatsPerTable: number;
    tables?: TableData[];
  };
  matching_rule: {
    prioritizeMutualMatches: boolean;
    considerVoteRanking: boolean;
    balanceGenderRatio: boolean;
  };
  gender_rules: {
    requireMixedGender: boolean;
    alternateSeating: boolean;
  };
};

export type PartySettingInsert = TablesInsert<'party_settings'>;
export type PartySettingUpdate = TablesUpdate<'party_settings'>;

export type Match = Tables<'matches'> & {
  match_type: 'interim' | 'final';
};

export type MatchInsert = TablesInsert<'matches'>;
export type MatchUpdate = TablesUpdate<'matches'>;

export type SeatingPlan = Tables<'seating_plans'> & {
  plan_type: 'interim' | 'final';
};

export type SeatingPlanInsert = TablesInsert<'seating_plans'>;
export type SeatingPlanUpdate = TablesUpdate<'seating_plans'>;
