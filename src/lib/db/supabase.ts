import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export interface Party {
  id: string;
  name: string;
  date: string;
  location: string;
  capacity: number;
  status: 'preparing' | 'active' | 'closed';
  current_mode: 'interim' | 'final' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  party_id: string;
  participant_number: number;
  name: string;
  gender: 'male' | 'female';
  access_token: string | null;
  created_at: string;
}

export interface Vote {
  id: string;
  party_id: string;
  voter_id: string;
  voted_id: string;
  vote_type: 'interim' | 'final';
  rank: number;
  created_at: string;
}

export interface PartySetting {
  id: string;
  party_id: string;
  seating_layout: {
    tableCount: number;
    seatsPerTable: number;
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
  updated_at: string;
}

export interface Match {
  id: string;
  party_id: string;
  match_type: 'interim' | 'final';
  participant1_id: string;
  participant2_id: string;
  table_number: number | null;
  seat_positions: any;
  created_at: string;
}

export interface SeatingPlan {
  id: string;
  party_id: string;
  plan_type: 'interim' | 'final';
  layout_data: any;
  image_url: string | null;
  created_at: string;
}
